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

// Build a clean row for insert: only defined values, empty string -> null for optional fields
function cleanInsertRow<T extends Record<string, unknown>>(
  row: T,
  requiredKeys: (keyof T)[],
  optionalKeys: (keyof T)[]
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of requiredKeys) {
    const v = row[k];
    if (v === undefined || v === null || v === '') {
      out[k as string] = null;
    } else {
      out[k as string] = v;
    }
  }
  for (const k of optionalKeys) {
    if (!(k in row)) continue;
    const v = row[k];
    if (v === undefined || v === '') {
      out[k as string] = null;
    } else {
      out[k as string] = v;
    }
  }
  return out;
}

// Sign up a new user with email and password
export async function signUp({ email, password, role, profileData }: SignUpData): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
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
      const row = cleanInsertRow(
        { ...profileData, email: email.trim(), auth_id: authId } as Record<string, unknown>,
        ['name', 'email', 'auth_id', 'farm_name'],
        ['phone', 'farm_size', 'location_address', 'certifications', 'description']
      );
      const { data, error } = await supabase
        .from('farmers')
        .insert([row])
        .select()
        .single();

      if (error) {
        await supabase.auth.admin?.deleteUser(authId);
        return { user: null, error: error.message };
      }
      profile = data as Farmer;
    } else if (role === 'market') {
      const row = cleanInsertRow(
        { ...profileData, email: email.trim(), auth_id: authId } as Record<string, unknown>,
        ['business_name', 'business_type', 'email', 'auth_id'],
        ['phone', 'contact_person', 'location_address', 'delivery_preferences', 'order_volume', 'description']
      );
      const { data, error } = await supabase
        .from('markets')
        .insert([row])
        .select()
        .single();

      if (error) {
        return { user: null, error: error.message };
      }
      profile = data as Market;
    } else if (role === 'transporter') {
      const row = cleanInsertRow(
        {
          ...profileData,
          email: email.trim(),
          auth_id: authId,
          is_available: (profileData as Record<string, unknown>).is_available ?? true,
          rating: (profileData as Record<string, unknown>).rating ?? 0,
          total_deliveries: (profileData as Record<string, unknown>).total_deliveries ?? 0,
        } as Record<string, unknown>,
        ['company_name', 'owner_name', 'email', 'auth_id', 'vehicle_type', 'has_refrigeration', 'base_rate', 'per_km_rate', 'refrigeration_premium', 'is_available', 'rating', 'total_deliveries'],
        ['phone', 'vehicle_capacity', 'license_plate', 'insurance_number', 'location_address']
      );
      const { data, error } = await supabase
        .from('transporters')
        .insert([row])
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
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error
        ? err.message
        : typeof err === 'object' && err !== null && 'message' in err
        ? String((err as { message?: unknown }).message)
        : 'An unexpected error occurred';
    return { user: null, error: errorMessage };
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
      .maybeSingle();

    if (farmerData) {
      profile = farmerData as Farmer;
      role = 'farmer';
    } else {
      // Check markets table
      const { data: marketData } = await supabase
        .from('markets')
        .select('*')
        .eq('auth_id', authId)
        .maybeSingle();

      if (marketData) {
        profile = marketData as Market;
        role = 'market';
      } else {
        // Check transporters table
        const { data: transporterData } = await supabase
          .from('transporters')
          .select('*')
          .eq('auth_id', authId)
          .maybeSingle();

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
        .maybeSingle();

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
          .maybeSingle();

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
            .maybeSingle();

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
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { user: null, error: err.message || 'An unexpected error occurred' };
    }
    return { user: null, error: 'An unexpected error occurred' };
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
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { error: err.message || 'An unexpected error occurred' };
    }
    return { error: 'An unexpected error occurred' };
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
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { error: err.message || 'An unexpected error occurred' };
    }
    return { error: 'An unexpected error occurred' };
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
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { error: err.message || 'An unexpected error occurred' };
    }
    return { error: 'An unexpected error occurred' };
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
      .maybeSingle();

    if (farmerData) {
      profile = farmerData as Farmer;
      role = 'farmer';
    } else {
      // Check markets table
      const { data: marketData } = await supabase
        .from('markets')
        .select('*')
        .eq('auth_id', authId)
        .maybeSingle();

      if (marketData) {
        profile = marketData as Market;
        role = 'market';
      } else {
        // Check transporters table
        const { data: transporterData } = await supabase
          .from('transporters')
          .select('*')
          .eq('auth_id', authId)
          .maybeSingle();

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
  } catch (err: unknown) {
    if (err instanceof Error) {
      return { user: null, error: err.message };
    }
    return { user: null, error: 'An unexpected error occurred' };
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
