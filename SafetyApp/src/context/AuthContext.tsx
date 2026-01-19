import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { AuthContextType, AuthState, User } from '../types';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialState: AuthState = {
  isLoading: true,
  isSignout: false,
  userToken: null,
  user: null,
};

type AuthAction =
  | { type: 'RESTORE_TOKEN'; payload: string | null }
  | { type: 'SIGN_IN_SUCCESS'; payload: { token: string; user: User } }
  | { type: 'SIGN_UP_SUCCESS'; payload: { token: string; user: User } }
  | { type: 'SIGN_OUT' }
  | { type: 'UPDATE_USER'; payload: User };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'RESTORE_TOKEN':
      return {
        ...state,
        userToken: action.payload,
        isLoading: false,
      };
    case 'SIGN_IN_SUCCESS':
      return {
        ...state,
        isSignout: false,
        userToken: action.payload.token,
        user: action.payload.user,
        isLoading: false,
      };
    case 'SIGN_UP_SUCCESS':
      return {
        ...state,
        isSignout: false,
        userToken: action.payload.token,
        user: action.payload.user,
        isLoading: false,
      };
    case 'SIGN_OUT':
      return {
        ...state,
        isSignout: true,
        userToken: null,
        user: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Helper function to ensure user record exists
  const ensureUserRecord = useCallback(async (userId: string, email: string, firstName?: string, lastName?: string) => {
    try {
      console.log('[ensureUserRecord] Starting for userId:', userId, 'email:', email);
      
      // First check if user already exists
      const { data: existingUser, error: selectError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      console.log('[ensureUserRecord] Select check - existing user:', existingUser, 'error:', selectError);

      if (existingUser) {
        console.log('[ensureUserRecord] User already exists, skipping insert');
        return;
      }

      // If user doesn't exist, try to insert
      console.log('[ensureUserRecord] User does not exist, attempting insert...');
      const { data: insertData, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            id: userId,
            email: email,
            first_name: firstName || '',
            last_name: lastName || '',
          },
        ])
        .select()
        .single();

      if (insertError) {
        console.error('[ensureUserRecord] Insert error:', insertError);
        throw insertError;
      }

      console.log('[ensureUserRecord] User record inserted successfully:', insertData);
    } catch (err) {
      console.error('[ensureUserRecord] Failed to ensure user record:', err);
      throw err;
    }
  }, []);

  // Bootstrap async data on mount
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        // Restore token on startup
        const token = await SecureStore.getItemAsync('userToken');
        if (token) {
          // Verify token is still valid
          const { data: { user }, error } = await supabase.auth.getUser(token);
          if (!error && user) {
            // Load user data from users table (has latest profile updates)
            const { data: tableUserData, error: tableError } = await supabase
              .from('users')
              .select('*')
              .eq('id', user.id)
              .maybeSingle();

            if (tableError) {
              console.error('Error fetching user from users table:', tableError);
            }

            // Use users table data if available, fall back to auth metadata
            const userData: User = {
              id: user.id,
              email: user.email || '',
              firstName: tableUserData?.first_name || user.user_metadata?.first_name || '',
              lastName: tableUserData?.last_name || user.user_metadata?.last_name || '',
              phone: tableUserData?.phone || user.user_metadata?.phone || '',
              createdAt: user.created_at || new Date().toISOString(),
              updatedAt: user.updated_at || new Date().toISOString(),
            };
            dispatch({
              type: 'RESTORE_TOKEN',
              payload: token,
            });
            dispatch({
              type: 'UPDATE_USER',
              payload: userData,
            });
          } else {
            await SecureStore.deleteItemAsync('userToken');
            dispatch({ type: 'RESTORE_TOKEN', payload: null });
          }
        } else {
          dispatch({ type: 'RESTORE_TOKEN', payload: null });
        }
      } catch (e) {
        console.error('Error restoring token:', e);
        dispatch({ type: 'RESTORE_TOKEN', payload: null });
      }
    };

    bootstrapAsync();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session && data.user) {
        await SecureStore.setItemAsync('userToken', data.session.access_token);
        
        // Ensure user record exists in users table
        await ensureUserRecord(
          data.user.id,
          data.user.email || '',
          data.user.user_metadata?.first_name,
          data.user.user_metadata?.last_name
        );

        // Load user data from users table (this has the latest profile updates)
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        if (userError) {
          console.error('Error fetching user data from users table:', userError);
        }

        // Use users table data if available, fall back to auth metadata
        const user: User = {
          id: data.user.id,
          email: data.user.email || '',
          firstName: userData?.first_name || data.user.user_metadata?.first_name || '',
          lastName: userData?.last_name || data.user.user_metadata?.last_name || '',
          phone: userData?.phone || data.user.user_metadata?.phone || '',
          createdAt: data.user.created_at || new Date().toISOString(),
          updatedAt: data.user.updated_at || new Date().toISOString(),
        };
        
        dispatch({
          type: 'SIGN_IN_SUCCESS',
          payload: { token: data.session.access_token, user },
        });
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }, [ensureUserRecord]);

  const signUp = useCallback(async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName || '',
            last_name: lastName || '',
          },
        },
      });

      if (error) throw error;

      if (data.session && data.user) {
        // Create user record in users table
        await ensureUserRecord(
          data.user.id,
          data.user.email || '',
          firstName,
          lastName
        );

        await SecureStore.setItemAsync('userToken', data.session.access_token);
        const userData: User = {
          id: data.user.id,
          email: data.user.email || '',
          firstName: firstName,
          lastName: lastName,
          createdAt: data.user.created_at || new Date().toISOString(),
          updatedAt: data.user.updated_at || new Date().toISOString(),
        };
        dispatch({
          type: 'SIGN_UP_SUCCESS',
          payload: { token: data.session.access_token, user: userData },
        });
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }, [ensureUserRecord]);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      await SecureStore.deleteItemAsync('userToken');
      dispatch({ type: 'SIGN_OUT' });
    } catch (error) {
      throw error;
    }
  }, []);

  const updateUser = useCallback((user: User) => {
    dispatch({ type: 'UPDATE_USER', payload: user });
  }, []);

  const value: AuthContextType = {
    state,
    signIn,
    signUp,
    signOut,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
