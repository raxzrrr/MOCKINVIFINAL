import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth as useClerkAuth, useUser, useClerk } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { generateConsistentUUID, getOrCreateUserProfile } from '@/utils/userUtils';

type UserRole = 'student' | 'admin' | null;

type UserProfile = {
  id: string;
  full_name: string;
  avatar_url?: string;
  email?: string;
  role: UserRole;
} | null;

interface AuthContextType {
  user: any;
  session: any;
  profile: UserProfile;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: () => boolean;
  isStudent: () => boolean;
  logout: () => Promise<void>;
  getSupabaseUserId: () => string | null;
  ensureSupabaseSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const ClerkAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoaded, userId, sessionId, getToken } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const clerk = useClerk();
  const [profile, setProfile] = useState<UserProfile>(null);
  const [loading, setLoading] = useState(true);
  const [supabaseSession, setSupabaseSession] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { toast } = useToast();

  // Check for temporary admin access
  const isTempAdmin = localStorage.getItem('tempAdmin') === 'true';

  // Function to get consistent Supabase user ID
  const getSupabaseUserId = () => {
    if (isTempAdmin) {
      return 'temp-admin-id';
    }
    if (!userId) {
      console.log('getSupabaseUserId: No userId available');
      return null;
    }
    // For now, use the local generation as fallback
    // In the future, this could be enhanced to use the database function
    const supabaseId = generateConsistentUUID(userId);
    console.log('getSupabaseUserId: Generated Supabase ID:', { clerkId: userId, supabaseId });
    return supabaseId; // Return only the UUID string, not an object
  };

  // Set up Supabase session with Clerk token
  const setupSupabaseSession = async () => {
    if (isTempAdmin) {
      // For temp admin, create a mock session
      setSupabaseSession({
        user: { id: 'temp-admin-id', email: 'admin@interview.ai' },
        access_token: 'temp-admin-token'
      });
      setIsAuthenticated(true);
      return;
    }

    if (!userId || !clerkUser) {
      console.log('No user found, clearing Supabase session');
      await supabase.auth.signOut();
      setSupabaseSession(null);
      setIsAuthenticated(false);
      return;
    }

    try {
      console.log('Setting up Supabase session for user:', userId);

      // Try Clerk JWT template first, then fall back to plain token + IdP sign-in
      let token: string | null = null;
      try {
        // Try to get JWT template for Supabase
        token = await getToken({ template: 'supabase' });
        console.log('Successfully got Supabase JWT template token');
      } catch (e) {
        console.warn('Clerk JWT template "supabase" not found, falling back to IdP sign-in');
        // Fallback: try to get a regular token
        try {
          token = await getToken();
          console.log('Got regular Clerk token as fallback');
        } catch (tokenError) {
          console.warn('Failed to get any Clerk token:', tokenError);
        }
      }

      if (token) {
        try {
          // First try JWT template approach
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'clerk',
            token
          });

          if (data?.session) {
            console.log('Supabase session established via Clerk JWT template');
            setSupabaseSession(data.session);
            setIsAuthenticated(true);
            return;
          } else if (error) {
            console.warn('JWT template sign-in failed, trying IdP approach:', error);
          }
        } catch (jwtError) {
          console.warn('JWT template approach failed, trying IdP:', jwtError);
        }

        // Fallback: try IdP sign-in
        try {
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'clerk',
            token
          });

          if (data?.session) {
            console.log('Supabase session established via Clerk IdP');
            setSupabaseSession(data.session);
            setIsAuthenticated(true);
          } else if (error) {
            console.error('Failed to sign in to Supabase with Clerk token:', error);
            // Still authenticate via Clerk even if Supabase fails
            setIsAuthenticated(true);
          } else {
            console.error('Unknown error establishing Supabase session');
            setIsAuthenticated(true);
          }
        } catch (idpError) {
          console.error('IdP sign-in also failed:', idpError);
          // Still authenticate via Clerk
          setIsAuthenticated(true);
        }
      } else {
        console.error('No token received from Clerk');
        // Still authenticate via Clerk
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error setting up Supabase session:', error);
      // Still authenticate via Clerk
      setIsAuthenticated(true);
    }
  };

  // Ensure Supabase session is active; if missing, try to establish it via Clerk
  const ensureSupabaseSession = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session) return;
    } catch (_) {
      // ignore and attempt to set up a session
    }
    await setupSupabaseSession();
  };

  useEffect(() => {
    if (isTempAdmin) {
      // Set up temporary admin profile
      setProfile({
        id: 'temp-admin-id',
        full_name: 'Admin User',
        avatar_url: undefined,
        email: 'admin@interview.ai',
        role: 'admin'
      });
      setIsAuthenticated(true);
      setLoading(false);
      return;
    }

    if (!isLoaded) {
      console.log('Clerk not loaded yet');
      return;
    }

    console.log('Clerk loaded, userId:', userId, 'clerkUser:', !!clerkUser);

    // Check if we have a valid user state
    if (userId && clerkUser) {
      console.log('User authenticated, setting up profile and session');
      
      // User is authenticated
      const userEmail = clerkUser.primaryEmailAddress?.emailAddress || '';
      const userName = clerkUser.firstName && clerkUser.lastName
        ? `${clerkUser.firstName} ${clerkUser.lastName}`
        : clerkUser.username || userEmail.split('@')[0];
      
      // Set role based on email for now
      const role: UserRole = userEmail === 'admin@interview.ai' ? 'admin' : 'student';
      
      setProfile({
        id: userId,
        full_name: userName,
        avatar_url: clerkUser.imageUrl,
        email: userEmail,
        role: role
      });

      // Set authenticated to true immediately when we have a Clerk user
      setIsAuthenticated(true);

      // Set up Supabase session (this can fail but shouldn't affect authentication state)
      setupSupabaseSession();

      // Sync with supabase for data consistency
      syncUserWithSupabase(userId, userName, userEmail, role);
    } else if (clerkUser && !userId) {
      // Edge case: we have clerkUser but no userId - this shouldn't happen but let's handle it
      console.warn('Clerk user exists but userId is null - this is unexpected');
      const userEmail = clerkUser.primaryEmailAddress?.emailAddress || '';
      const userName = clerkUser.firstName && clerkUser.lastName
        ? `${clerkUser.firstName} ${clerkUser.lastName}`
        : clerkUser.username || userEmail.split('@')[0];
      
      const role: UserRole = userEmail === 'admin@interview.ai' ? 'admin' : 'student';
      
      setProfile({
        id: clerkUser.id, // Use clerkUser.id as fallback
        full_name: userName,
        avatar_url: clerkUser.imageUrl,
        email: userEmail,
        role: role
      });

      setIsAuthenticated(true);
      setupSupabaseSession();
      syncUserWithSupabase(clerkUser.id, userName, userEmail, role);
    } else {
      console.log('No user found, clearing all state');
      setProfile(null);
      setSupabaseSession(null);
      setIsAuthenticated(false);
      supabase.auth.signOut();
    }
    
    setLoading(false);
  }, [isLoaded, userId, clerkUser, sessionId, isTempAdmin]);

  const syncUserWithSupabase = async (userId: string, fullName: string, email: string, role: UserRole) => {
    try {
      console.log('Syncing user with Supabase:', { userId, fullName, email, role });
      
      // Use the new database function to ensure user profile exists
      const supabaseUserId = await getOrCreateUserProfile(userId, fullName, email, role || 'student');
      console.log('User profile synced with ID:', supabaseUserId);
      
      // Verify the profile was actually created
      const { data: verifyProfile, error: verifyError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('id', supabaseUserId)
        .maybeSingle();
      
      if (verifyProfile) {
        console.log('✅ Profile verified in database:', verifyProfile);
      } else {
        console.error('❌ Profile NOT found in database after creation attempt!', verifyError);
      }
    } catch (error) {
      console.error('Error syncing user with Supabase:', error);
      // Don't show error to user, just log it
      // The website can still work without Supabase sync
    }
  };

  const isAdmin = () => profile?.role === 'admin';
  const isStudent = () => profile?.role === 'student';
  
  const logout = async () => {
    console.log("Logout function called");
    try {
      // Clear temporary admin access
      localStorage.removeItem('tempAdmin');
      
      await supabase.auth.signOut();
      if (clerkUser) {
        await clerk.signOut();
      }
      setProfile(null);
      setSupabaseSession(null);
      setIsAuthenticated(false);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
      return Promise.resolve();
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Logout Failed",
        description: "An error occurred during logout. Please try again.",
        variant: "destructive"
      });
      return Promise.reject(error);
    }
  };

  // Create a session object that includes both Clerk and Supabase session details
  const sessionObject = isAuthenticated ? {
    id: sessionId || 'temp-admin-session',
    user: {
      id: getSupabaseUserId(),
      email: isTempAdmin ? 'admin@interview.ai' : clerkUser?.primaryEmailAddress?.emailAddress
    },
    supabaseSession,
    isActive: true
  } : null;

  console.log('Auth context state:', {
    isLoaded,
    userId,
    isAuthenticated,
    hasProfile: !!profile,
    hasSession: !!sessionObject,
    supabaseUserId: getSupabaseUserId(),
    isTempAdmin,
    profileEmail: profile?.email,
    clerkUserId: clerkUser?.id
  });

  return (
    <AuthContext.Provider value={{ 
      user: isTempAdmin ? { primaryEmailAddress: { emailAddress: 'admin@interview.ai' } } : clerkUser,
      session: sessionObject,
      profile,
      loading, 
      isAuthenticated,
      isAdmin,
      isStudent,
      logout,
      getSupabaseUserId,
      ensureSupabaseSession
    }}>
      {children}
    </AuthContext.Provider>
  );
};
