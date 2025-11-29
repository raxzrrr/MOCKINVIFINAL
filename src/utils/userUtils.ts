
import { supabase } from '@/integrations/supabase/client';

// Fixed namespace UUID for consistent generation
const NAMESPACE_UUID = '1b671a64-40d5-491e-99b0-da01ff1f3341';

export const generateConsistentUUID = (userId: string): string => {
  try {
    // Simple hash function to create deterministic UUID (matches server logic)
    let hash = 0;
    const input = userId + NAMESPACE_UUID;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Convert hash to hex and pad to create UUID format
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `${hex.slice(0, 8)}-${hex.slice(0, 4)}-4${hex.slice(1, 4)}-a${hex.slice(0, 3)}-${hex.slice(0, 12).padEnd(12, '0')}`;
  } catch (error) {
    console.error("Error generating consistent UUID:", error);
    // Fallback to a random UUID
    return crypto.randomUUID();
  }
};

// Workaround: Skip broken database function, just return UUID
// The payment edge function will create the profile when needed
export const getOrCreateUserProfile = async (
  clerkUserId: string,
  fullName: string,
  userEmail: string,
  userRole: string = 'student'
): Promise<string> => {
  const supabaseUserId = generateConsistentUUID(clerkUserId);
  
  // Check if profile already exists
  try {
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', supabaseUserId)
      .maybeSingle();

    if (existingProfile) {
      console.log('Profile already exists:', existingProfile.id);
      return existingProfile.id;
    }

    // Also check by email
    const { data: emailProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', userEmail)
      .maybeSingle();

    if (emailProfile) {
      console.log('Found profile by email:', emailProfile.id);
      return emailProfile.id;
    }
  } catch (error) {
    console.warn('Error checking for existing profile:', error);
  }

  // Skip the broken database function - just return the UUID
  // The payment edge function will create the profile when payment is made
  // This prevents the app from crashing
  console.log('Skipping broken database function, returning UUID. Profile will be created by payment edge function if needed.');
  return supabaseUserId;
};

export const validateUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};
