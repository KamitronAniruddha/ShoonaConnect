import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, isSupabaseConfigured, testConnection, createSafeChannel } from '../lib/supabase';
import { UserProfile, Couple } from '../types';
import { purgeAllCoupleData, exportCoupleArchive } from '../lib/couplePurge';
import {
  profileRowToUserProfile,
  userProfileToRow,
  coupleRowToCouple,
  coupleToRow,
} from '../utils/supabaseMappers';
import { parseSupabaseError } from '../utils/supabaseErrors';

export interface CreateCoupleParams {
  customCode?: string;
  coupleName?: string;
  anniversaryDate?: string;
  relationshipStatus?: 'dating' | 'in_relationship' | 'engaged' | 'married' | 'long_distance';
  relationshipStory?: string;
  favoriteSong?: string;
  pinLock?: string | null;
  theme?: 'rose' | 'sunset' | 'midnight' | 'emerald' | 'lavender';
}

// AppUser maintains 100% backward compatibility with Firebase User interface
export interface AppUser {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
}

interface AuthContextType {
  currentUser: AppUser | null;
  userProfile: UserProfile | null;
  couple: Couple | null;
  partnerProfile: UserProfile | null;
  loading: boolean;
  isPasswordRecovery: boolean;
  clearPasswordRecovery: () => void;
  signInWithPassword: (email: string, pass: string) => Promise<void>;
  signUpWithPassword: (email: string, pass: string, username: string, name?: string) => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  createCouple: (params: CreateCoupleParams) => Promise<Couple>;
  findCoupleByCode: (code: string) => Promise<{ couple: Couple; creatorProfile: UserProfile | null }>;
  requestToJoinCouple: (coupleId: string, profileOverride?: Partial<UserProfile>) => Promise<void>;
  approveJoinRequest: (coupleId: string) => Promise<void>;
  declineJoinRequest: (coupleId: string) => Promise<void>;
  cancelJoinRequest: (coupleId?: string) => Promise<void>;
  confirmPairCouple: (coupleId: string) => Promise<void>;
  cancelPendingCouple: () => Promise<void>;
  leaveCouple: () => Promise<void>;
  breakRelationshipAndPurgeData: (reason?: string, onProgress?: (step: string, pct: number) => void) => Promise<void>;
  downloadCoupleArchive: () => Promise<void>;
  clearDissolutionNotice: () => Promise<void>;
  updateCoupleSettings: (updates: Partial<Couple>) => Promise<void>;
  updateUserProfileData: (updates: Partial<UserProfile>) => Promise<void>;
  updatePartnerProfilePhoto: (photoURL: string) => Promise<void>;
  updatePartnerProfileData: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function generate4DigitCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [couple, setCouple] = useState<Couple | null>(null);
  const [partnerProfile, setPartnerProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState<boolean>(false);

  // Test backend connectivity at boot
  useEffect(() => {
    testConnection();
  }, []);

  const clearPasswordRecovery = () => setIsPasswordRecovery(false);

  // Fetch or create profile helper
  const syncUserProfile = async (userId: string, email = '', metadata: any = {}) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.warn('Error fetching profile:', error.message);
      }

      if (!data) {
        const username = metadata.username || (email ? email.split('@')[0] : `user_${userId.slice(0, 5)}`);
        const displayName = metadata.full_name || metadata.name || username || 'Soulmate';
        const photoURL = metadata.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${userId}`;
        const newProfileData = {
          id: userId,
          email,
          username,
          display_name: displayName,
          nickname: '',
          occupation: '',
          occupation_type: 'profession',
          photo_url: photoURL,
          couple_id: null,
          pair_code: null,
          onboarding_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { data: upserted, error: upsertErr } = await supabase
          .from('profiles')
          .upsert(newProfileData, { onConflict: 'id' })
          .select()
          .maybeSingle();

        if (upsertErr) {
          // If upsert had any notice/issue, attempt to fetch profile created by SQL trigger
          const { data: refetched } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

          if (refetched) {
            setUserProfile(profileRowToUserProfile(refetched));
          } else {
            setUserProfile(profileRowToUserProfile(newProfileData));
          }
        } else if (upserted) {
          setUserProfile(profileRowToUserProfile(upserted));
        } else {
          setUserProfile(profileRowToUserProfile(newProfileData));
        }
      } else {
        setUserProfile(profileRowToUserProfile(data));
      }
    } catch (err) {
      console.error('Error during profile sync:', err);
    }
  };

  // Auth state listener
  useEffect(() => {
    let mounted = true;

    // Check if recovery link was opened
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      if (urlParams.get('type') === 'recovery' || hashParams.get('type') === 'recovery') {
        setIsPasswordRecovery(true);
      }
    }

    async function initAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && mounted) {
          const u = session.user;
          const appUser: AppUser = {
            id: u.id,
            uid: u.id,
            email: u.email || '',
            displayName: u.user_metadata?.full_name || u.user_metadata?.name || u.user_metadata?.username || u.email?.split('@')[0] || 'Soulmate',
            photoURL: u.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${u.id}`,
          };
          setCurrentUser(appUser);
          await syncUserProfile(u.id, u.email, u.user_metadata);
        } else if (mounted) {
          setCurrentUser(null);
          setUserProfile(null);
          setCouple(null);
          setPartnerProfile(null);
        }
      } catch (err) {
        console.warn('Init auth notice:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
      }
      if (session?.user) {
        const u = session.user;
        const appUser: AppUser = {
          id: u.id,
          uid: u.id,
          email: u.email || '',
          displayName: u.user_metadata?.full_name || u.user_metadata?.name || u.user_metadata?.username || u.email?.split('@')[0] || 'Soulmate',
          photoURL: u.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${u.id}`,
        };
        setCurrentUser(appUser);
        await syncUserProfile(u.id, u.email, u.user_metadata);
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        setCouple(null);
        setPartnerProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Real-time listener for current user profile changes
  useEffect(() => {
    if (!currentUser?.id) return;

    const channel = createSafeChannel(`profile:${currentUser.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${currentUser.id}`,
        },
        (payload) => {
          if (payload.new) {
            setUserProfile(profileRowToUserProfile(payload.new));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id]);

  // Real-time listener for Couple data & Partner profile
  useEffect(() => {
    const coupleId = userProfile?.coupleId;
    if (!coupleId) {
      setCouple(null);
      setPartnerProfile(null);
      return;
    }

    // Initial fetch of couple
    supabase
      .from('couples')
      .select('*')
      .eq('id', coupleId)
      .maybeSingle()
      .then(async ({ data }) => {
        if (data) {
          const coupleObj = coupleRowToCouple(data);
          if (coupleObj.status === 'dissolved') {
            setCouple(null);
            setPartnerProfile(null);
            return;
          }
          setCouple(coupleObj);

          // Partner profile
          const partnerId = coupleObj.userIds?.find((id) => id !== currentUser?.uid) || coupleObj.partnerId;
          if (partnerId) {
            const { data: partnerData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', partnerId)
              .maybeSingle();
            if (partnerData) {
              setPartnerProfile(profileRowToUserProfile(partnerData));
            }
          }
        }
      });

    // Realtime channel for couple updates
    const coupleChannel = createSafeChannel(`couple:${coupleId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'couples',
          filter: `id=eq.${coupleId}`,
        },
        async (payload) => {
          if (payload.eventType === 'DELETE') {
            setCouple(null);
            setPartnerProfile(null);
            if (currentUser?.id) {
              await supabase.from('profiles').update({
                couple_id: null,
                pair_code: null,
                onboarding_completed: false,
                updated_at: new Date().toISOString(),
              }).eq('id', currentUser.id);
              setUserProfile((prev) =>
                prev ? { ...prev, coupleId: null, pairCode: null, onboardingCompleted: false } : null
              );
            }
            return;
          }

          if (payload.new) {
            const coupleObj = coupleRowToCouple(payload.new);
            if (coupleObj.status === 'dissolved') {
              setCouple(null);
              setPartnerProfile(null);
              if (currentUser?.id) {
                await supabase.from('profiles').update({
                  couple_id: null,
                  pair_code: null,
                  onboarding_completed: false,
                  updated_at: new Date().toISOString(),
                }).eq('id', currentUser.id);
                setUserProfile((prev) =>
                  prev ? { ...prev, coupleId: null, pairCode: null, onboardingCompleted: false } : null
                );
              }
              return;
            }

            setCouple(coupleObj);

            const partnerId = coupleObj.userIds?.find((id) => id !== currentUser?.uid) || coupleObj.partnerId;
            if (partnerId) {
              const { data: partnerData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', partnerId)
                .maybeSingle();
              if (partnerData) {
                setPartnerProfile(profileRowToUserProfile(partnerData));
              }
            } else {
              setPartnerProfile(null);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(coupleChannel);
    };
  }, [userProfile?.coupleId, currentUser?.uid, currentUser?.id]);

  // Password sign-in
  const signInWithPassword = async (email: string, pass: string) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase credentials are not configured. Please enter your Supabase Project URL and Anon Key.');
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) throw new Error('Please enter your email address.');
    if (!pass) throw new Error('Please enter your password.');

    const { data, error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password: pass,
    });
    if (error) {
      const parsed = parseSupabaseError(error);
      throw new Error(parsed.message);
    }

    if (data?.user) {
      const u = data.user;
      const appUser: AppUser = {
        id: u.id,
        uid: u.id,
        email: u.email || '',
        displayName: u.user_metadata?.full_name || u.user_metadata?.name || u.user_metadata?.username || u.email?.split('@')[0] || 'Soulmate',
        photoURL: u.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${u.id}`,
      };
      setCurrentUser(appUser);
      await syncUserProfile(u.id, u.email, u.user_metadata);
    }
  };

  // Password sign-up with unique username support and no passwords in public profiles
  const signUpWithPassword = async (email: string, pass: string, username: string, name?: string) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase credentials are not configured. Please enter your Supabase Project URL and Anon Key.');
    }

    const trimmedEmail = email.trim().toLowerCase();
    const cleanUsername = (username || '').trim().toLowerCase().replace(/[^a-zA-Z0-9_.-]/g, '');

    if (!cleanUsername || cleanUsername.length < 3) {
      throw new Error('Username must be at least 3 characters long and contain only letters, numbers, underscores, dashes, or dots.');
    }

    if (cleanUsername.length > 30) {
      throw new Error('Username must be 30 characters or fewer.');
    }

    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      throw new Error('Please enter a valid email address.');
    }

    if (!pass || pass.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    // Check if username already exists in profiles
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .ilike('username', cleanUsername)
      .maybeSingle();

    if (existingUser) {
      throw new Error('This username is already taken. Please pick another one.');
    }

    const displayName = (name || cleanUsername || trimmedEmail.split('@')[0]).trim();

    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password: pass,
      options: {
        data: {
          username: cleanUsername,
          full_name: displayName,
          name: displayName,
        },
      },
    });

    if (error) {
      const parsed = parseSupabaseError(error);
      throw new Error(parsed.message);
    }

    if (data?.user) {
      const u = data.user;
      const appUser: AppUser = {
        id: u.id,
        uid: u.id,
        email: u.email || trimmedEmail,
        displayName: displayName,
        photoURL: `https://api.dicebear.com/7.x/notionists/svg?seed=${u.id}`,
      };
      setCurrentUser(appUser);
      await syncUserProfile(u.id, trimmedEmail, {
        username: cleanUsername,
        full_name: displayName,
        name: displayName,
      });
    }
  };

  // Password reset request
  const resetPasswordForEmail = async (email: string) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase credentials are not configured.');
    }
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      throw new Error('Please enter a valid email address.');
    }
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${window.location.origin}/?type=recovery`,
    });
    if (error) {
      const parsed = parseSupabaseError(error);
      throw new Error(parsed.message);
    }
  };

  // Update password after recovery flow
  const updatePassword = async (newPassword: string) => {
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      const parsed = parseSupabaseError(error);
      throw new Error(parsed.message);
    }
    setIsPasswordRecovery(false);
  };

  // Sign out
  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Sign out notice:', e);
    }
    setCurrentUser(null);
    setUserProfile(null);
    setCouple(null);
    setPartnerProfile(null);
  };

  // Create a new Couple Space
  const createCouple = async (params: CreateCoupleParams): Promise<Couple> => {
    if (!currentUser || !userProfile) throw new Error('Must be signed in to create couple space');

    let pairCode = params.customCode?.trim().toUpperCase();
    if (!pairCode || pairCode.length !== 4) {
      pairCode = generate4DigitCode();
    }

    // Verify code uniqueness if pending
    const { data: existing } = await supabase
      .from('couples')
      .select('id')
      .eq('pair_code', pairCode)
      .eq('status', 'pending');

    if (existing && existing.length > 0) {
      throw new Error(`The code ${pairCode} is currently in use. Please choose another 4-digit code.`);
    }

    const now = new Date().toISOString();
    const newCouplePayload: any = {
      pair_code: pairCode,
      user_ids: [currentUser.uid],
      user_names: {
        [currentUser.uid]: userProfile.nickname || userProfile.displayName || 'Soulmate',
      },
      user_photos: {
        [currentUser.uid]: userProfile.photoURL || '',
      },
      creator_id: currentUser.uid,
      partner_id: null,
      status: 'pending',
      anniversary_date: params.anniversaryDate || now.split('T')[0],
      couple_name: params.coupleName || `${userProfile.displayName}'s Couple Space`,
      relationship_status: params.relationshipStatus || 'in_relationship',
      relationship_story: params.relationshipStory || '',
      favorite_song: params.favoriteSong || '',
      pin_lock: params.pinLock || null,
      theme: params.theme || 'rose',
      created_at: now,
      updated_at: now,
    };

    const { data: inserted, error } = await supabase
      .from('couples')
      .insert(newCouplePayload)
      .select()
      .single();

    if (error) {
      const parsed = parseSupabaseError(error);
      throw new Error(parsed.message);
    }

    const newCouple = coupleRowToCouple(inserted);

    // Link user profile
    await supabase.from('profiles').update({
      couple_id: newCouple.id,
      pair_code: pairCode,
      onboarding_completed: true,
      updated_at: now,
    }).eq('id', currentUser.uid);

    setUserProfile((prev) => (prev ? { ...prev, coupleId: newCouple.id, pairCode, onboardingCompleted: true } : null));
    setCouple(newCouple);
    return newCouple;
  };

  // Cancel pending couple space
  const cancelPendingCouple = async () => {
    if (!currentUser || !couple || couple.status !== 'pending') return;
    const coupleId = couple.id;

    try {
      await supabase.from('couples').delete().eq('id', coupleId);
    } catch (e) {
      console.warn('Could not delete couple during cancel:', e);
    }

    try {
      await supabase.from('profiles').update({
        couple_id: null,
        pair_code: null,
        updated_at: new Date().toISOString(),
      }).eq('id', currentUser.uid);

      setUserProfile((prev) => (prev ? { ...prev, coupleId: null, pairCode: null } : null));
      setCouple(null);
    } catch (err) {
      console.warn('Cancel pending couple notice:', err);
    }
  };

  // Find couple by 4-digit pairing code
  const findCoupleByCode = async (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const { data, error } = await supabase
      .from('couples')
      .select('*')
      .eq('pair_code', cleanCode)
      .eq('status', 'pending');

    if (error) {
      const parsed = parseSupabaseError(error);
      throw new Error(parsed.message);
    }

    if (!data || data.length === 0) {
      throw new Error('No pending space found with this 4-digit code. Please double-check with your partner.');
    }

    const coupleData = coupleRowToCouple(data[0]);

    if (coupleData.creatorId === currentUser?.uid) {
      throw new Error("This is your own code! Send it to your partner so they can join you.");
    }

    let creatorProfile: UserProfile | null = null;
    try {
      const { data: cData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', coupleData.creatorId)
        .maybeSingle();
      if (cData) {
        creatorProfile = profileRowToUserProfile(cData);
      }
    } catch {
      // safe fallback
    }

    return { couple: coupleData, creatorProfile };
  };

  // Request to join a partner's couple space
  const requestToJoinCouple = async (coupleId: string, profileOverride?: Partial<UserProfile>) => {
    if (!currentUser || !userProfile) throw new Error('Sign in required');

    const { data: snap, error: snapErr } = await supabase
      .from('couples')
      .select('*')
      .eq('id', coupleId)
      .maybeSingle();

    if (snapErr || !snap) throw new Error('Couple space not found');

    const coupleData = coupleRowToCouple(snap);
    if (coupleData.status === 'connected' || (coupleData.userIds && coupleData.userIds.length >= 2)) {
      throw new Error('This couple sanctuary is already connected with another partner.');
    }

    if (coupleData.creatorId === currentUser.uid) {
      throw new Error('You cannot request to join your own space.');
    }

    const now = new Date().toISOString();
    const finalName = (profileOverride?.displayName || userProfile.displayName || currentUser.displayName || 'Soulmate').trim();
    const finalNickname = (profileOverride?.nickname || userProfile.nickname || '').trim();
    const finalPhoto =
      profileOverride?.photoURL ||
      userProfile.photoURL ||
      currentUser.photoURL ||
      `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(finalName || 'Partner')}`;

    const joinReq = {
      requesterId: currentUser.uid,
      requesterName: finalName,
      requesterNickname: finalNickname,
      requesterPhoto: finalPhoto,
      requesterPhotoURL: finalPhoto,
      requesterCity: profileOverride?.city || userProfile.city || '',
      requesterOccupation: profileOverride?.occupation || userProfile.occupation || '',
      requesterOccupationType: profileOverride?.occupationType || userProfile.occupationType || 'profession',
      requesterBio: profileOverride?.bio || userProfile.bio || '',
      requesterLoveLanguage: profileOverride?.loveLanguage || userProfile.loveLanguage || 'quality_time',
      requestedAt: now,
      status: 'pending' as const,
    };

    const { error: updateErr } = await supabase
      .from('couples')
      .update({
        pending_join_request: joinReq,
        updated_at: now,
      })
      .eq('id', coupleId);

    if (updateErr) {
      const parsed = parseSupabaseError(updateErr);
      throw new Error(parsed.message);
    }

    await supabase.from('profiles').update({
      couple_id: coupleId,
      pair_code: coupleData.pairCode,
      photo_url: finalPhoto,
      updated_at: now,
    }).eq('id', currentUser.uid);

    setUserProfile((prev) =>
      prev ? { ...prev, coupleId, pairCode: coupleData.pairCode, photoURL: finalPhoto } : null
    );
  };

  // Host approves incoming join request
  const approveJoinRequest = async (coupleId: string) => {
    if (!currentUser || !userProfile) throw new Error('Sign in required');

    const { data: snap } = await supabase
      .from('couples')
      .select('*')
      .eq('id', coupleId)
      .maybeSingle();

    if (!snap) throw new Error('Couple space not found');
    const coupleData = coupleRowToCouple(snap);

    if (!coupleData.pendingJoinRequest || coupleData.pendingJoinRequest.status !== 'pending') {
      throw new Error('No pending request to approve.');
    }

    const requesterId = coupleData.pendingJoinRequest.requesterId;
    const requesterName =
      coupleData.pendingJoinRequest.requesterNickname ||
      coupleData.pendingJoinRequest.requesterName ||
      'Soulmate';
    const requesterPhoto =
      coupleData.pendingJoinRequest.requesterPhoto ||
      coupleData.pendingJoinRequest.requesterPhotoURL ||
      `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(requesterName)}`;
    const now = new Date().toISOString();

    const hostPhoto =
      userProfile.photoURL ||
      currentUser.photoURL ||
      `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(userProfile.displayName || 'Host')}`;

    const userNames = {
      ...(coupleData.userNames || {}),
      [currentUser.uid]: userProfile.nickname || userProfile.displayName || 'Soulmate',
      [requesterId]: requesterName,
    };

    const userPhotos = {
      ...(coupleData.userPhotos || {}),
      [currentUser.uid]: hostPhoto,
      [requesterId]: requesterPhoto,
    };

    const { error: approveErr } = await supabase
      .from('couples')
      .update({
        partner_id: requesterId,
        user_ids: [currentUser.uid, requesterId],
        user_names: userNames,
        user_photos: userPhotos,
        status: 'connected',
        pending_join_request: null,
        updated_at: now,
      })
      .eq('id', coupleId);

    if (approveErr) {
      const parsed = parseSupabaseError(approveErr);
      throw new Error(parsed.message);
    }

    await supabase.from('profiles').update({
      onboarding_completed: true,
      updated_at: now,
    }).eq('id', currentUser.uid);

    try {
      await supabase.from('profiles').update({
        couple_id: coupleId,
        onboarding_completed: true,
        updated_at: now,
      }).eq('id', requesterId);
    } catch (e) {
      console.warn('Requester profile update note:', e);
    }

    // Post warm welcome message to couple chat
    await supabase.from('messages').insert({
      couple_id: coupleId,
      sender_id: 'system',
      sender_name: 'Our Love Story',
      text: `✨ Hearts bound! Welcome to our private couple sanctuary. Today begins our shared chapter together. ❤️`,
      created_at: now,
    });

    setUserProfile((prev) => (prev ? { ...prev, onboardingCompleted: true } : null));
  };

  // Host declines incoming join request
  const declineJoinRequest = async (coupleId: string) => {
    if (!currentUser) throw new Error('Sign in required');

    const { data: snap } = await supabase.from('couples').select('*').eq('id', coupleId).maybeSingle();
    if (!snap) return;

    const coupleData = coupleRowToCouple(snap);
    const now = new Date().toISOString();

    await supabase.from('couples').update({
      pending_join_request: {
        ...(coupleData.pendingJoinRequest || {}),
        status: 'declined',
        declinedAt: now,
      },
      updated_at: now,
    }).eq('id', coupleId);
  };

  // Requester cancels their pending join request
  const cancelJoinRequest = async (coupleId?: string) => {
    if (!currentUser) return;
    const targetCoupleId = coupleId || userProfile?.coupleId;

    if (targetCoupleId) {
      try {
        const { data: snap } = await supabase.from('couples').select('*').eq('id', targetCoupleId).maybeSingle();
        if (snap) {
          const coupleData = coupleRowToCouple(snap);
          if (coupleData.pendingJoinRequest?.requesterId === currentUser.uid) {
            await supabase.from('couples').update({
              pending_join_request: null,
              updated_at: new Date().toISOString(),
            }).eq('id', targetCoupleId);
          }
        }
      } catch (e) {
        console.warn('Notice clearing pendingJoinRequest:', e);
      }
    }

    try {
      await supabase.from('profiles').update({
        couple_id: null,
        pair_code: null,
        updated_at: new Date().toISOString(),
      }).eq('id', currentUser.uid);

      setUserProfile((prev) => (prev ? { ...prev, coupleId: null, pairCode: null } : null));
      setCouple(null);
    } catch (err) {
      console.warn('Could not reset user coupleId:', err);
    }
  };

  // Confirm pair with partner
  const confirmPairCouple = async (coupleId: string) => {
    if (!currentUser || !userProfile) throw new Error('Sign in required');

    const { data: snap } = await supabase.from('couples').select('*').eq('id', coupleId).maybeSingle();
    if (!snap) throw new Error('Couple space not found');

    const coupleData = coupleRowToCouple(snap);
    if (coupleData.userIds.length >= 2) {
      throw new Error('This couple space is already full.');
    }

    const now = new Date().toISOString();
    const userNames = {
      ...(coupleData.userNames || {}),
      [currentUser.uid]: userProfile.nickname || userProfile.displayName,
    };
    const userPhotos = {
      ...(coupleData.userPhotos || {}),
      [currentUser.uid]: userProfile.photoURL || '',
    };

    await supabase.from('couples').update({
      partner_id: currentUser.uid,
      user_ids: [...coupleData.userIds, currentUser.uid],
      user_names: userNames,
      user_photos: userPhotos,
      status: 'connected',
      pending_join_request: null,
      updated_at: now,
    }).eq('id', coupleId);

    await supabase.from('profiles').update({
      couple_id: coupleId,
      onboarding_completed: true,
      updated_at: now,
    }).eq('id', currentUser.uid);

    await supabase.from('messages').insert({
      couple_id: coupleId,
      sender_id: 'system',
      sender_name: 'Our Love Story',
      text: `✨ Welcome to our private couple space! Today begins our shared chapter together. ❤️`,
      created_at: now,
    });

    setUserProfile((prev) => (prev ? { ...prev, coupleId, onboardingCompleted: true } : null));
  };

  // Break relationship and purge all couple data completely
  const breakRelationshipAndPurgeData = async (
    reason?: string,
    onProgress?: (step: string, pct: number) => void
  ) => {
    if (!currentUser || !couple) throw new Error('No active couple space found to break');
    const coupleId = couple.id;
    const partnerId = couple.userIds?.find((id) => id !== currentUser.uid) || couple.partnerId || null;
    const dissolvedByName = userProfile?.nickname || userProfile?.displayName || 'Your partner';

    try {
      await purgeAllCoupleData(
        coupleId,
        partnerId,
        currentUser.uid,
        dissolvedByName,
        reason,
        onProgress
      );

      try {
        sessionStorage.removeItem('shoona_pin_unlocked');
        localStorage.removeItem(`pin_unlocked_${coupleId}`);
      } catch {
        // ignore
      }

      setUserProfile((prev) =>
        prev
          ? {
              ...prev,
              coupleId: null,
              pairCode: null,
              onboardingCompleted: false,
              lastDissolutionNotice: null,
            }
          : null
      );
      setCouple(null);
      setPartnerProfile(null);
    } catch (err) {
      console.error('Error during break relationship purge:', err);
      throw err;
    }
  };

  // Download couple memory archive
  const downloadCoupleArchive = async () => {
    if (!couple) throw new Error('No active couple space to export');
    await exportCoupleArchive(couple.id, couple);
  };

  // Clear dissolution notice for user
  const clearDissolutionNotice = async () => {
    if (!currentUser) return;
    try {
      await supabase.from('profiles').update({
        last_dissolution_notice: null,
        updated_at: new Date().toISOString(),
      }).eq('id', currentUser.uid);
      setUserProfile((prev) => (prev ? { ...prev, lastDissolutionNotice: null } : null));
    } catch (err) {
      console.warn('Notice clearing dissolution notice:', err);
    }
  };

  // Leave couple
  const leaveCouple = async () => {
    if (!currentUser || !userProfile?.coupleId) return;
    await breakRelationshipAndPurgeData('Mutual leave');
  };

  // Update couple settings
  const updateCoupleSettings = async (updates: Partial<Couple>) => {
    if (!userProfile?.coupleId) return;
    const row = coupleToRow(updates);
    const { error } = await supabase
      .from('couples')
      .update(row)
      .eq('id', userProfile.coupleId);

    if (error) {
      const parsed = parseSupabaseError(error);
      throw new Error(parsed.message);
    }
  };

  // Update user profile
  const updateUserProfileData = async (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    const row = userProfileToRow(updates);
    const { error } = await supabase
      .from('profiles')
      .update(row)
      .eq('id', currentUser.uid);

    if (error) {
      const parsed = parseSupabaseError(error);
      throw new Error(parsed.message);
    }

    if (updates.photoURL && userProfile?.coupleId) {
      try {
        const { data: cSnap } = await supabase.from('couples').select('user_photos').eq('id', userProfile.coupleId).maybeSingle();
        if (cSnap) {
          const photos = { ...(cSnap.user_photos || {}), [currentUser.uid]: updates.photoURL };
          await supabase.from('couples').update({ user_photos: photos, updated_at: new Date().toISOString() }).eq('id', userProfile.coupleId);
        }
      } catch {
        // ignore
      }
    }

    setUserProfile((prev) => (prev ? { ...prev, ...updates } : null));
  };

  // Update partner profile photo
  const updatePartnerProfilePhoto = async (photoURL: string) => {
    if (!partnerProfile?.uid) throw new Error('Partner not found');
    const now = new Date().toISOString();

    const { error } = await supabase
      .from('profiles')
      .update({ photo_url: photoURL, updated_at: now })
      .eq('id', partnerProfile.uid);

    if (error) {
      const parsed = parseSupabaseError(error);
      throw new Error(parsed.message);
    }

    if (couple?.id) {
      try {
        const { data: cSnap } = await supabase.from('couples').select('user_photos').eq('id', couple.id).maybeSingle();
        if (cSnap) {
          const photos = { ...(cSnap.user_photos || {}), [partnerProfile.uid]: photoURL };
          await supabase.from('couples').update({ user_photos: photos, updated_at: now }).eq('id', couple.id);
        }
      } catch {
        // ignore
      }
    }

    setPartnerProfile((prev) => (prev ? { ...prev, photoURL } : null));
  };

  // Update partner profile info
  const updatePartnerProfileData = async (updates: Partial<UserProfile>) => {
    if (!partnerProfile?.uid) throw new Error('Partner not found');
    const row = userProfileToRow(updates);
    const { error } = await supabase
      .from('profiles')
      .update(row)
      .eq('id', partnerProfile.uid);

    if (error) {
      const parsed = parseSupabaseError(error);
      throw new Error(parsed.message);
    }

    setPartnerProfile((prev) => (prev ? { ...prev, ...updates } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        couple,
        partnerProfile,
        loading,
        isPasswordRecovery,
        clearPasswordRecovery,
        signInWithPassword,
        signUpWithPassword,
        resetPasswordForEmail,
        updatePassword,
        logout,
        createCouple,
        findCoupleByCode,
        requestToJoinCouple,
        approveJoinRequest,
        declineJoinRequest,
        cancelJoinRequest,
        confirmPairCouple,
        cancelPendingCouple,
        leaveCouple,
        breakRelationshipAndPurgeData,
        downloadCoupleArchive,
        clearDissolutionNotice,
        updateCoupleSettings,
        updateUserProfileData,
        updatePartnerProfilePhoto,
        updatePartnerProfileData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
