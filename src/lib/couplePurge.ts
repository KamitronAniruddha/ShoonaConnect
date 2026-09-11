import { supabase } from './supabase';
import { Couple } from '../types';

export interface PurgeProgressCallback {
  (step: string, percent: number): void;
}

/**
 * Permanently deletes all couple data across all tables,
 * deletes the couple record itself (cascading across foreign keys),
 * and safely unlinks both partners' profile records in Supabase.
 */
export async function purgeAllCoupleData(
  coupleId: string,
  partnerId: string | null,
  currentUserId: string,
  dissolvedByName: string,
  reason?: string,
  onProgress?: PurgeProgressCallback
): Promise<void> {
  const now = new Date().toISOString();

  // Step 1: Immediately mark couple as dissolved so real-time listeners trigger
  onProgress?.('Severing mutual connection...', 15);
  try {
    await supabase.from('couples').update({
      status: 'dissolved',
      dissolved_by: currentUserId,
      dissolved_by_name: dissolvedByName,
      dissolution_reason: reason || 'Mutual closure',
      dissolved_at: now,
      updated_at: now,
    }).eq('id', coupleId);
  } catch (err) {
    console.warn('Notice marking couple dissolved before purge:', err);
  }

  // Step 2: Delete child tables explicitly if cascade is pending
  onProgress?.('Erasing messages and memories...', 35);
  try {
    await supabase.from('messages').delete().eq('couple_id', coupleId);
    await supabase.from('memories').delete().eq('couple_id', coupleId);
  } catch (e) {
    console.warn('Purge child step 1 notice:', e);
  }

  onProgress?.('Erasing letters and milestones...', 60);
  try {
    await supabase.from('love_letters').delete().eq('couple_id', coupleId);
    await supabase.from('important_dates').delete().eq('couple_id', coupleId);
    await supabase.from('shared_notes').delete().eq('couple_id', coupleId);
    await supabase.from('bucket_list').delete().eq('couple_id', coupleId);
    await supabase.from('moods').delete().eq('couple_id', coupleId);
    await supabase.from('daily_answers').delete().eq('couple_id', coupleId);
    await supabase.from('tictactoe_games').delete().eq('couple_id', coupleId);
    await supabase.from('chess_games').delete().eq('couple_id', coupleId);
  } catch (e) {
    console.warn('Purge child step 2 notice:', e);
  }

  // Step 3: Delete the couple record itself
  onProgress?.('Erasing couple sanctuary record...', 80);
  try {
    await supabase.from('couples').delete().eq('id', coupleId);
  } catch (err) {
    console.warn('Notice deleting couple document:', err);
  }

  // Step 4: Unlink partner's profile with dissolution notice
  onProgress?.("Resetting partner's connection status...", 90);
  if (partnerId && partnerId !== currentUserId) {
    try {
      await supabase.from('profiles').update({
        couple_id: null,
        pair_code: null,
        onboarding_completed: false,
        last_dissolution_notice: {
          dissolvedByName,
          dissolvedAt: now,
          reason: reason?.trim() || undefined,
        },
        updated_at: now,
      }).eq('id', partnerId);
    } catch (err) {
      console.warn("Could not directly update partner's user document:", err);
    }
  }

  // Step 5: Unlink current user's profile
  onProgress?.('Finalizing your fresh start...', 95);
  try {
    await supabase.from('profiles').update({
      couple_id: null,
      pair_code: null,
      onboarding_completed: false,
      last_dissolution_notice: null,
      updated_at: now,
    }).eq('id', currentUserId);
  } catch (err) {
    console.error('Error updating current user profile on purge:', err);
    throw err;
  }

  onProgress?.('Connection severed and all data wiped.', 100);
}

/**
 * Exports all couple memories, letters, notes, and story
 * into a downloadable JSON file before deletion.
 */
export async function exportCoupleArchive(coupleId: string, couple: Couple) {
  const archive: Record<string, any> = {
    exportedAt: new Date().toISOString(),
    coupleInfo: {
      coupleName: couple.coupleName,
      anniversaryDate: couple.anniversaryDate,
      relationshipStatus: couple.relationshipStatus,
      relationshipStory: couple.relationshipStory,
      favoriteSong: couple.favoriteSong,
      createdAt: couple.createdAt,
    },
    messages: [],
    memories: [],
    letters: [],
    importantDates: [],
    bucketList: [],
    notes: [],
  };

  try {
    const [msgs, mems, ltrs, dts, bck, nts] = await Promise.all([
      supabase.from('messages').select('*').eq('couple_id', coupleId),
      supabase.from('memories').select('*').eq('couple_id', coupleId),
      supabase.from('love_letters').select('*').eq('couple_id', coupleId),
      supabase.from('important_dates').select('*').eq('couple_id', coupleId),
      supabase.from('bucket_list').select('*').eq('couple_id', coupleId),
      supabase.from('shared_notes').select('*').eq('couple_id', coupleId),
    ]);

    archive.messages = msgs.data || [];
    archive.memories = mems.data || [];
    archive.letters = ltrs.data || [];
    archive.importantDates = dts.data || [];
    archive.bucketList = bck.data || [];
    archive.notes = nts.data || [];
  } catch (err) {
    console.warn('Notice during archive export:', err);
  }

  // Trigger file download in browser
  const blob = new Blob([JSON.stringify(archive, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `shoonaconnect-memory-archive-${couple.coupleName || 'couple'}-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return archive;
}
