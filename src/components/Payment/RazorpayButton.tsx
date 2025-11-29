
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/ClerkAuthContext';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { usePaymentSettings } from '@/hooks/usePaymentSettings';
import { Loader2 } from 'lucide-react';

interface RazorpayButtonProps {
  amount: number;
  planType: string;
  planName: string;
  buttonText: string;
  variant?: "default" | "outline";
  disabled?: boolean;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RazorpayButton: React.FC<RazorpayButtonProps> = ({
  amount,
  planType,
  planName,
  buttonText,
  variant = "default",
  disabled = false
}) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { getToken } = useClerkAuth();
  const { toast } = useToast();
  const { settings: paymentSettings, loading: settingsLoading } = usePaymentSettings();

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      // Check if script is already loaded
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase a plan",
        variant: "destructive",
      });
      return;
    }

    if (!paymentSettings?.razorpay_key_id) {
      toast({
        title: "Payment Setup Required",
        description: "Payment system is not configured. Please contact support.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      // Create order
      console.log('Creating Razorpay order for:', { amount, planType, planName });
      
      const { data: orderData, error: orderError } = await supabase.functions.invoke('razorpay-payment', {
        body: {
          action: 'create_order',
          amount,
          receipt: `receipt_${Date.now()}`,
        },
      });

      if (orderError) {
        console.error('Order creation failed:', orderError);
        throw new Error(`Failed to create order: ${orderError.message}`);
      }

      if (!orderData || !orderData.id) {
        throw new Error('Invalid order response from server');
      }

      console.log('Order created successfully:', orderData);

      const options = {
        key: paymentSettings.razorpay_key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'MockInvi',
        description: `${planName} Plan Subscription`,
        order_id: orderData.id,
        handler: async (response: any) => {
          try {
            console.log('=== PAYMENT SUCCESS HANDLER START ===');
            console.log('Razorpay response:', response);
            
            // Show processing message
            toast({
              title: "Processing Payment",
              description: "Verifying your payment...",
            });
            
            console.log('Proceeding with payment verification using user data from payload');

            console.log('Sending payment verification with data:', {
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
              plan_type: planType,
              amount,
              currency: orderData.currency
            });

            const { data, error: verifyError } = await supabase.functions.invoke('razorpay-payment', {
              body: {
                action: 'verify_payment',
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan_type: planType,
                amount,
                currency: orderData.currency,
                user_email: user.primaryEmailAddress?.emailAddress,
                user_id: user.id,
              },
            });
            
            console.log('Payment verification response:', { data, error: verifyError });

            if (verifyError) {
              console.log('Payment verification failed:', verifyError);
              throw verifyError;
            }

            console.log('=== PAYMENT VERIFICATION SUCCESS ===');
            
            // Wait a bit longer to ensure database transaction is committed
            toast({
              title: "Payment Successful!",
              description: `Welcome to ${planName} plan! Your subscription is being activated...`,
            });

            // Give more time for database to commit and then reload
            setTimeout(() => {
              console.log('Reloading page to refresh subscription status...');
              window.location.reload();
            }, 3000);
          } catch (error) {
            console.error('=== PAYMENT VERIFICATION ERROR ===', error);
            
            // Provide more specific error messages
            let errorMessage = "Payment verification failed. Please contact support if amount was deducted.";
            
            if (error.message) {
              if (error.message.includes('profile')) {
                errorMessage = "User profile creation failed. Please try again or contact support.";
              } else if (error.message.includes('subscription')) {
                errorMessage = "Subscription creation failed. Please contact support.";
              } else if (error.message.includes('signature')) {
                errorMessage = "Payment signature verification failed. Please contact support.";
              }
            }
            
            toast({
              title: "Payment Verification Failed",
              description: errorMessage,
              variant: "destructive",
            });
          }
        },
        prefill: {
          name: user.fullName || '',
          email: user.primaryEmailAddress?.emailAddress || '',
        },
        theme: {
          color: '#8B5CF6',
        },
        modal: {
          ondismiss: () => {
            console.log('Payment modal dismissed');
            setLoading(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      
      let errorMessage = "Unable to process payment. Please try again.";
      
      if (error.message) {
        if (error.message.includes('load Razorpay SDK')) {
          errorMessage = "Payment system failed to load. Please check your internet connection and try again.";
        } else if (error.message.includes('create order')) {
          errorMessage = "Failed to create payment order. Please try again or contact support.";
        } else if (error.message.includes('Invalid order response')) {
          errorMessage = "Payment system error. Please contact support.";
        }
      }
      
      toast({
        title: "Payment Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      className={`w-full ${variant === "default" ? 'bg-brand-purple hover:bg-brand-lightPurple' : ''}`}
      onClick={handlePayment}
      disabled={disabled || loading || settingsLoading || !paymentSettings?.razorpay_key_id}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        buttonText
      )}
    </Button>
  );
};

export default RazorpayButton;
