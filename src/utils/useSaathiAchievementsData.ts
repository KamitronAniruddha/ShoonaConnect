import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { calculateDaysTogether } from './coupleData';
import { SaathiMetrics } from './achievements';

export function useSaathiAchievementsData() {
  const { couple, userProfile, partnerProfile } = useAuth();

  const [metrics, setMetrics] = useState<SaathiMetrics>({
    daysTogether: 1,
    yearsTogether: 0,
    loveLettersCount: 0,
    timelockedLettersCount: 0,
    openedLettersCount: 0,
    longLettersCount: 0,
    memoriesCount: 0,
    favoriteMemoriesCount: 0,
    taggedMemoriesCount: 0,
    photosCount: 0,
    datesCount: 0,
    dateNightCount: 0,
    bothBirthdaysSet: false,
    anniversariesCelebrated: 0,
    zodiacChecked: true,
    moodCount: 0,
    dailyAnswersCount: 0,
    bucketCount: 0,
    completedBucketCount: 0,
    travelBucketCount: 0,
    gamesPlayedCount: 0,
    gamesWonCount: 0,
    gameReactionsCount: 0,
    gameDrawOrRematch: false,
    hasPinLock: false,
    customThemeSet: false,
    notesCount: 0,
    storySet: false,
    chatMessagesCount: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!couple?.id) {
      setLoading(false);
      return;
    }

    const coupleId = couple.id;
    const days = Math.max(1, calculateDaysTogether(couple.anniversaryDate || couple.datingStartDate || couple.createdAt));
    const years = Math.floor(days / 365);

    const hasBothBirthdays = Boolean(
      (userProfile?.birthday || couple.partner1Birthday || couple.birthdays?.[userProfile?.uid || '']) &&
      (partnerProfile?.birthday || couple.partner2Birthday || couple.birthdays?.['partner'])
    );

    const isCustomTheme = Boolean(couple.theme && couple.theme !== 'rose');
    const isPinActive = Boolean(couple.pinLock && couple.pinLock.length === 4);
    const hasStory = Boolean(couple.relationshipStory && couple.relationshipStory.trim().length > 10);

    // Initial sync
    setMetrics((prev) => ({
      ...prev,
      daysTogether: days,
      yearsTogether: years,
      bothBirthdaysSet: hasBothBirthdays,
      hasPinLock: isPinActive,
      customThemeSet: isCustomTheme,
      storySet: hasStory,
      anniversariesCelebrated: years >= 1 ? years : couple.anniversaryDate ? 1 : 0,
      zodiacChecked: true,
    }));

    const fetchAllMetrics = async () => {
      try {
        const [
          memoriesRes,
          lettersRes,
          datesRes,
          dailyRes,
          moodsRes,
          bucketRes,
          notesRes,
          gamesRes,
        ] = await Promise.all([
          supabase.from('memories').select('is_favorite, location, tags, media_urls').eq('couple_id', coupleId),
          supabase.from('love_letters').select('open_at, unlock_date, is_opened, is_read, content, metadata').eq('couple_id', coupleId),
          supabase.from('important_dates').select('category').eq('couple_id', coupleId),
          supabase.from('daily_answers').select('id', { count: 'exact', head: true }).eq('couple_id', coupleId),
          supabase.from('moods').select('id', { count: 'exact', head: true }).eq('couple_id', coupleId),
          supabase.from('bucket_list').select('is_completed, status, category').eq('couple_id', coupleId),
          supabase.from('shared_notes').select('id', { count: 'exact', head: true }).eq('couple_id', coupleId),
          supabase.from('games').select('winner, rematch_requested_by').eq('couple_id', coupleId),
        ]);

        let favCount = 0;
        let taggedCount = 0;
        let photoSum = 0;
        if (memoriesRes.data) {
          memoriesRes.data.forEach((data) => {
            if (data.is_favorite) favCount++;
            if (data.location || (data.tags && data.tags.length > 0)) taggedCount++;
            if (Array.isArray(data.media_urls)) photoSum += data.media_urls.length;
          });
        }

        let timelocked = 0;
        let opened = 0;
        let longLetters = 0;
        if (lettersRes.data) {
          lettersRes.data.forEach((data) => {
            if (data.open_at || data.unlock_date) timelocked++;
            if (data.is_opened || data.is_read) opened++;
            if (data.content && data.content.length >= 500) longLetters++;
          });
        }

        let dateNights = 0;
        if (datesRes.data) {
          datesRes.data.forEach((data) => {
            if (data.category === 'date_night') dateNights++;
          });
        }

        let completed = 0;
        let travel = 0;
        if (bucketRes.data) {
          bucketRes.data.forEach((data) => {
            if (data.is_completed || data.status === 'completed') completed++;
            if (data.category === 'travel' || data.category === 'adventure') travel++;
          });
        }

        let wins = 0;
        let draws = false;
        if (gamesRes.data) {
          gamesRes.data.forEach((data) => {
            if (data.winner && data.winner !== 'draw') wins++;
            if (data.winner === 'draw' || (data.rematch_requested_by && data.rematch_requested_by.length > 0)) {
              draws = true;
            }
          });
        }

        setMetrics((prev) => ({
          ...prev,
          memoriesCount: memoriesRes.data?.length || 0,
          favoriteMemoriesCount: favCount,
          taggedMemoriesCount: taggedCount,
          photosCount: photoSum,
          loveLettersCount: lettersRes.data?.length || 0,
          timelockedLettersCount: timelocked,
          openedLettersCount: opened,
          longLettersCount: longLetters,
          datesCount: datesRes.data?.length || 0,
          dateNightCount: dateNights,
          dailyAnswersCount: dailyRes.count || 0,
          moodCount: moodsRes.count || 0,
          bucketCount: bucketRes.data?.length || 0,
          completedBucketCount: completed,
          travelBucketCount: travel,
          notesCount: notesRes.count || 0,
          gamesPlayedCount: gamesRes.data?.length || 0,
          gamesWonCount: wins,
          gameDrawOrRematch: draws,
          gameReactionsCount: Math.max(1, gamesRes.data?.length || 0),
        }));
      } catch (err) {
        console.warn('Error fetching achievements metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllMetrics();

    const channel = supabase
      .channel(`achievements:${coupleId}`)
      .on('postgres_changes', { event: '*', schema: 'public', filter: `couple_id=eq.${coupleId}` }, () => {
        fetchAllMetrics();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [couple, userProfile, partnerProfile]);

  return { metrics, loading };
}
