
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/ClerkAuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Subscription {
  id: string;
  user_id: string;
  plan_type: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, getSupabaseUserId, isAuthenticated } = useAuth();

  const fetchSubscription = useCallback(async (supabaseUserId: string, retryCount = 0) => {
    console.log('useSubscription - Fetch started:', {
      hasUser: !!user,
      isAuthenticated,
      supabaseUserId,
      userEmail: user?.primaryEmailAddress?.emailAddress,
      retryCount
    });

    try {
      console.log('useSubscription - Querying database for user:', supabaseUserId);
      
      // First try with status filter
      let { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', supabaseUserId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);

      // If no active subscription found, try without status filter to see all subscriptions
      if ((!data || data.length === 0) && retryCount === 0) {
        console.log('useSubscription - No active subscription found, checking all subscriptions...');
        const { data: allData, error: allError } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', supabaseUserId)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (!allError && allData && allData.length > 0) {
          console.log('useSubscription - Found subscription with different status:', allData[0]);
        }
      }

      if (error) {
        console.error('useSubscription - Database error:', error);
        setSubscription(null);
        setLoading(false);
        return;
      }

      console.log('useSubscription - Database response:', {
        data,
        dataLength: data?.length || 0,
        firstItem: data?.[0] || null
      });

      if (data && data.length > 0) {
        const sub = data[0];
        setSubscription(sub);
        setLoading(false);
        console.log('useSubscription - Found subscription:', {
          id: sub.id,
          userId: sub.user_id,
          planType: sub.plan_type,
          status: sub.status,
          periodStart: sub.current_period_start,
          periodEnd: sub.current_period_end,
          isExpired: new Date(sub.current_period_end) <= new Date()
        });
      } else {
        console.log('useSubscription - No active subscription found');
        setSubscription(null);
        setLoading(false);
        
        // Retry once after 2 seconds if subscription not found (in case of timing issues)
        if (retryCount === 0) {
          console.log('useSubscription - Retrying fetch after 2 seconds...');
          setTimeout(() => fetchSubscription(supabaseUserId, 1), 2000);
        }
      }
    } catch (error) {
      console.error('useSubscription - Fetch error:', error);
      setSubscription(null);
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    const supabaseUserId = getSupabaseUserId();
    
    if (!isAuthenticated || !user || !supabaseUserId) {
      console.log('useSubscription - Missing user or supabaseUserId:', { 
        user: !!user, 
        supabaseUserId,
        isAuthenticated 
      });
      setSubscription(null);
      setLoading(false);
      return;
    }

    // Initial fetch with a small delay to ensure user context is ready
    const timer = setTimeout(() => {
      fetchSubscription(supabaseUserId);
    }, 100);

    // Set up realtime subscription to listen for changes
    const channel = supabase
      .channel(`user-subscription-${supabaseUserId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_subscriptions',
          filter: `user_id=eq.${supabaseUserId}`
        },
        (payload) => {
          console.log('useSubscription - Realtime update received:', payload);
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newSub = payload.new as Subscription;
            // Only update if status is active
            if (newSub.status === 'active') {
              setSubscription(newSub);
              setLoading(false);
              console.log('useSubscription - Subscription updated via realtime:', newSub);
            } else {
              // If status changed to inactive, refetch to get latest state
              fetchSubscription(supabaseUserId);
            }
          } else if (payload.eventType === 'DELETE') {
            // If subscription is deleted, refetch to get latest state
            fetchSubscription(supabaseUserId);
          }
        }
      )
      .subscribe();

    return () => {
      clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [user, getSupabaseUserId, isAuthenticated, fetchSubscription]);

  const hasActivePlan = (planType: string) => {
    if (!subscription) return false;
    
    const isActive = subscription.status === 'active';
    const isNotExpired = new Date(subscription.current_period_end) > new Date();
    
    return isActive && isNotExpired && subscription.plan_type === planType;
  };

  const hasAnyActivePlan = () => {
    if (!subscription) return false;
    
    const isActive = subscription.status === 'active';
    const isNotExpired = new Date(subscription.current_period_end) > new Date();
    
    return isActive && isNotExpired;
  };

  const hasProPlan = () => {
    if (!subscription) {
      console.log('hasProPlan - No subscription found');
      return false;
    }
    
    const isActive = subscription.status === 'active';
    const isNotExpired = new Date(subscription.current_period_end) > new Date();
    const isProPlan = subscription.plan_type === 'pro' || subscription.plan_type === 'enterprise';
    
    console.log('hasProPlan - Detailed check:', {
      hasSubscription: !!subscription,
      subscriptionId: subscription.id,
      userId: subscription.user_id,
      status: subscription.status,
      planType: subscription.plan_type,
      isActive,
      currentDate: new Date().toISOString(),
      periodEnd: subscription.current_period_end,
      isNotExpired,
      isProPlan,
      finalResult: isActive && isNotExpired && isProPlan
    });
    
    return isActive && isNotExpired && isProPlan;
  };

  const refetch = useCallback(() => {
    const supabaseUserId = getSupabaseUserId();
    if (supabaseUserId) {
      setLoading(true);
      fetchSubscription(supabaseUserId);
    }
  }, [getSupabaseUserId, fetchSubscription]);

  return {
    subscription,
    loading,
    hasActivePlan,
    hasAnyActivePlan,
    hasProPlan,
    refetch,
  };
};
