import { supabase } from './supabase';
import { Farmer, Market, Transporter, UserRole } from '@/types';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  profile: Farmer | Market | Transporter | null;
}

export interface SignUpData {
  email: string;
  password: string;
  role: UserRole;
  profileData: Partial<Farmer> | Partial<Market> | Partial<Transporter>;
}

export interface SignInData {
  email: string;
  password: string;
}

// Sign up a new user with email and password
export async function signUp({ email, password, role, profileData }: SignUpData): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
        },
      },
    });

    if (authError) {
      return { user: null, error: authError.message };
    }

    if (!authData.user) {
      return { user: null, error: 'Failed to create user account' };
    }

    // Create profile in the appropriate table
    let profile: Farmer | Market | Transporter | null = null;
    const authId = authData.user.id;

    if (role === 'farmer') {
      const { data, error } = await supabase
        .from('farmers')
        .insert([{ ...profileData, email, auth_id: authId }])
        .select()
        .single();

      if (error) {
        // Rollback: delete auth user if profile creation fails
        await supabase.auth.admin?.deleteUser(authId);
        return { user: null, error: error.message };
      }
      profile = data as Farmer;
    } else if (role === 'market') {
      const { data, error } = await supabase
        .from('markets')
        .insert([{ ...profileData, email, auth_id: authId }])
        .select()
        .single();

      if (error) {
        return { user: null, error: error.message };
      }
      profile = data as Market;
    } else if (role === 'transporter') {
      const { data, error } = await supabase
        .from('transporters')
        .insert([{ ...profileData, email, auth_id: authId }])
        .select()
        .single();

      if (error) {
        return { user: null, error: error.message };
      }
      profile = data as Transporter;
    }

    return {
      user: {
        id: authId,
        email,
        role,
        profile,
      },
      error: null,
    };
  } catch (err: any) {
    return { user: null, error: err.message || 'An unexpected error occurred' };
  }
}

// Sign in an existing user
export async function signIn({ email, password }: SignInData): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return { user: null, error: authError.message };
    }

    if (!authData.user) {
      return { user: null, error: 'Failed to sign in' };
    }

    // Get user profile
    const authId = authData.user.id;
    const userRole = authData.user.user_metadata?.role as UserRole;

    // Try to find profile in each table
    let profile: Farmer | Market | Transporter | null = null;
    let role: UserRole = userRole;

    // Check farmers table
    const { data: farmerData } = await supabase
      .from('farmers')
      .select('*')
      .eq('auth_id', authId)
      .single();

    if (farmerData) {
      profile = farmerData as Farmer;
      role = 'farmer';
    } else {
      // Check markets table
      const { data: marketData } = await supabase
        .from('markets')
        .select('*')
        .eq('auth_id', authId)
        .single();

      if (marketData) {
        profile = marketData as Market;
        role = 'market';
      } else {
        // Check transporters table
        const { data: transporterData } = await supabase
          .from('transporters')
          .select('*')
          .eq('auth_id', authId)
          .single();

        if (transporterData) {
          profile = transporterData as Transporter;
          role = 'transporter';
        }
      }
    }

    // If no profile found, try to find by email (for legacy users)
    if (!profile) {
      const { data: farmerByEmail } = await supabase
        .from('farmers')
        .select('*')
        .eq('email', email)
        .single();

      if (farmerByEmail) {
        // Update with auth_id
        await supabase
          .from('farmers')
          .update({ auth_id: authId })
          .eq('id', farmerByEmail.id);
        profile = farmerByEmail as Farmer;
        role = 'farmer';
      } else {
        const { data: marketByEmail } = await supabase
          .from('markets')
          .select('*')
          .eq('email', email)
          .single();

        if (marketByEmail) {
          await supabase
            .from('markets')
            .update({ auth_id: authId })
            .eq('id', marketByEmail.id);
          profile = marketByEmail as Market;
          role = 'market';
        } else {
          const { data: transporterByEmail } = await supabase
            .from('transporters')
            .select('*')
            .eq('email', email)
            .single();

          if (transporterByEmail) {
            await supabase
              .from('transporters')
              .update({ auth_id: authId })
              .eq('id', transporterByEmail.id);
            profile = transporterByEmail as Transporter;
            role = 'transporter';
          }
        }
      }
    }

    return {
      user: {
        id: authId,
        email,
        role,
        profile,
      },
      error: null,
    };
  } catch (err: any) {
    return { user: null, error: err.message || 'An unexpected error occurred' };
  }
}

// Sign out the current user
export async function signOut(): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { error: error.message };
    }
    return { error: null };
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred' };
  }
}

// Send password reset email
export async function resetPassword(email: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      return { error: error.message };
    }
    return { error: null };
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred' };
  }
}

// Update password (after reset)
export async function updatePassword(newPassword: string): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { error: error.message };
    }
    return { error: null };
  } catch (err: any) {
    return { error: err.message || 'An unexpected error occurred' };
  }
}

// Get current session
export async function getSession(): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      return { user: null, error: error.message };
    }

    if (!session?.user) {
      return { user: null, error: null };
    }

    const authId = session.user.id;
    const email = session.user.email || '';

    // Get user profile
    let profile: Farmer | Market | Transporter | null = null;
    let role: UserRole = session.user.user_metadata?.role as UserRole;

    // Check farmers table
    const { data: farmerData } = await supabase
      .from('farmers')
      .select('*')
      .eq('auth_id', authId)
      .single();

    if (farmerData) {
      profile = farmerData as Farmer;
      role = 'farmer';
    } else {
      // Check markets table
      const { data: marketData } = await supabase
        .from('markets')
        .select('*')
        .eq('auth_id', authId)
        .single();

      if (marketData) {
        profile = marketData as Market;
        role = 'market';
      } else {
        // Check transporters table
        const { data: transporterData } = await supabase
          .from('transporters')
          .select('*')
          .eq('auth_id', authId)
          .single();

        if (transporterData) {
          profile = transporterData as Transporter;
          role = 'transporter';
        }
      }
    }

    return {
      user: {
        id: authId,
        email,
        role,
        profile,
      },
      error: null,
    };
  } catch (err: any) {
    return { user: null, error: err.message || 'An unexpected error occurred' };
  }
}

// Listen for auth state changes
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_OUT' || !session?.user) {
      callback(null);
      return;
    }

    const { user } = await getSession();
    callback(user);
  });
}
