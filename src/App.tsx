import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ActiveTab, Message } from './types';
import { Navigation } from './components/Navigation';
import { HomeView } from './components/HomeView';
import { ChatView } from './components/ChatView';
import { MomentsView } from './components/MomentsView';
import { DatesView } from './components/DatesView';
import { LettersView } from './components/LettersView';
import { NotesView } from './components/NotesView';
import { VaultView } from './components/VaultView';
import { TimelineView } from './components/TimelineView';
import { DailyAndMoodView } from './components/DailyAndMoodView';
import { BucketListView } from './components/BucketListView';
import { DreamsAndGoalsView } from './components/DreamsAndGoalsView';
import { SettingsView } from './components/SettingsView';
import { AuthModal } from './components/AuthModal';
import { OnboardingView } from './components/OnboardingView';
import { LockScreen } from './components/LockScreen';
import { LandingView } from './components/LandingView';
import { CoupleGamesView } from './components/CoupleGamesView';
import { AchievementsView } from './components/AchievementsView';
import { PeriodTrackerView } from './components/PeriodTrackerView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { DissolutionNoticeModal } from './components/DissolutionNoticeModal';
import { PartnerNotificationToasts } from './components/PartnerNotificationToasts';
import { BreakupDiscussionRoom } from './components/BreakupDiscussionRoom';
import { ForceGenderSetup } from './components/ForceGenderSetup';
import { supabase, createSafeChannel } from './lib/supabase';
import { messageRowToMessage } from './utils/supabaseMappers';
import { Heart, ShieldAlert, Power } from 'lucide-react';
import { WebsiteSuspendedScreen } from './components/WebsiteSuspendedScreen';
import {
  getSystemAccessControl,
  subscribeToSystemAccessControl,
  hasAdminBypass,
  restoreWebsiteOperational,
} from './lib/systemSettings';
import { SystemAccessControl, isAdminEmail } from './types';

const MainApp: React.FC = () => {
  const { userProfile, couple, loading, isPasswordRecovery } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [isLocked, setIsLocked] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // System access control & admin bypass state
  const [accessControl, setAccessControl] = useState<SystemAccessControl>(getSystemAccessControl());
  const [adminBypassActive, setAdminBypassActive] = useState<boolean>(hasAdminBypass());

  // Listen to system access control real-time broadcasts
  useEffect(() => {
    const unsub = subscribeToSystemAccessControl((newSettings) => {
      setAccessControl(newSettings);
    });
    return unsub;
  }, []);

  // Check if PIN lock is set on couple profile on start
  useEffect(() => {
    if (couple?.pinLock) {
      setIsLocked(true);
    }
  }, [couple?.pinLock]);

  // Listen to unread messages for this user in this couple
  useEffect(() => {
    if (!couple?.id || !userProfile?.uid) return;

    const fetchUnread = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('couple_id', couple.id);

      if (!error && data) {
        let unread = 0;
        data.forEach((row) => {
          const msg = messageRowToMessage(row);
          if (msg.senderId !== userProfile.uid && (!msg.readBy || !msg.readBy.includes(userProfile.uid))) {
            unread++;
          }
        });
        setUnreadCount(unread);
      }
    };

    fetchUnread();

    const channel = createSafeChannel(`app_unread_messages:${couple.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages', filter: `couple_id=eq.${couple.id}` },
        () => {
          fetchUnread();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [couple?.id, userProfile?.uid]);

  // Administrative Check
  const isAniruddha = isAdminEmail(userProfile?.email);
  const isSiteSuspended = accessControl.siteStatus === 'suspended';

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-rose-50/50 dark:bg-slate-950 flex flex-col items-center justify-center space-y-4 text-slate-800 dark:text-slate-100 transition-colors">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center animate-pulse">
            <Heart className="w-8 h-8 fill-rose-500 text-rose-500 animate-bounce" />
          </div>
        </div>
        <p className="text-xs font-semibold text-rose-700 dark:text-rose-400 tracking-wide font-display">
          Connecting to our couple space...
        </p>
      </div>
    );
  }

  // 🚨 SUSPENSION SCREEN GUARD:
  // If the website is suspended by Aniruddha, block all regular visitors and users
  // unless user is Aniruddha (admin email) or entered the admin emergency bypass passkey
  if (isSiteSuspended && !isAniruddha && !adminBypassActive) {
    return (
      <WebsiteSuspendedScreen
        accessControl={accessControl}
        onAdminBypassSuccess={() => setAdminBypassActive(true)}
        onWebsiteRestored={() => {
          setAccessControl(getSystemAccessControl());
        }}
      />
    );
  }

  // Not signed in -> Show rich feature landing home page OR AuthModal
  if (!userProfile) {
    if (showAuthModal || isPasswordRecovery) {
      return <AuthModal onBackToLanding={() => setShowAuthModal(false)} />;
    }
    return <LandingView onEnterApp={() => setShowAuthModal(true)} setActiveTab={setActiveTab} />;
  }

  // Allow Super Admin to navigate to Admin Dashboard even if uncoupled
  if (isAniruddha && activeTab === 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <AdminDashboardView setActiveTab={setActiveTab} />
      </div>
    );
  }

  // Signed in, but couple not yet connected or onboarding questionnaire needed
  if (!couple || couple.status !== 'connected') {
    return (
      <>
        <DissolutionNoticeModal />
        <OnboardingView />
      </>
    );
  }

  // Force gender selection if missing
  const needsGender = !userProfile.gender || userProfile.gender === 'prefer_not_to_say';

  // Locked with passcode
  if (isLocked && couple.pinLock && !needsGender) {
    return (
      <>
        <DissolutionNoticeModal />
        <LockScreen correctPin={couple.pinLock} onUnlock={() => setIsLocked(false)} />
      </>
    );
  }

  // Mutual breakup proposal discussion mode
  if ((couple.relationshipStatus as string) === 'breakup_pending') {
    return (
      <>
        <DissolutionNoticeModal />
        <BreakupDiscussionRoom />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/40 via-slate-50 to-pink-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <DissolutionNoticeModal />
      {needsGender && <ForceGenderSetup />}
      
      {/* Admin Warning Banner when Site is Suspended to Public */}
      {isSiteSuspended && (
        <div className="sticky top-0 z-50 bg-gradient-to-r from-red-950 via-rose-950 to-red-950 text-white px-4 py-2 border-b border-red-800 shadow-xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />
            <span className="font-semibold">
              ⚠️ Sanctuary Publicly Suspended: "{accessControl.noticeTitle}". You are viewing via Administrator Bypass.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                await restoreWebsiteOperational();
                setAccessControl(getSystemAccessControl());
              }}
              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Power className="w-3.5 h-3.5" />
              <span>Turn Website Back On Now</span>
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
            >
              Lockdown Controls
            </button>
          </div>
        </div>
      )}

      {/* Navigation Header & Mobile Bottom Bar */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadCount={activeTab === 'chat' ? 0 : unreadCount}
        onLockApp={couple.pinLock ? () => setIsLocked(true) : undefined}
      />

      {/* Main Tab Render Container */}
      <main className={
        activeTab === 'chat'
          ? 'h-[calc(100dvh-4rem)] pb-[3.8rem] md:pb-0 overflow-hidden'
          : 'min-h-[calc(100vh-4rem)] pb-20 md:pb-8'
      }>
        {activeTab === 'home' && <HomeView setActiveTab={setActiveTab} />}
        {activeTab === 'chat' && <ChatView setActiveTab={setActiveTab} />}
        {activeTab === 'moments' && <MomentsView />}
        {activeTab === 'dates' && <DatesView />}
        {activeTab === 'letters' && <LettersView />}
        {activeTab === 'notes' && <NotesView />}
        {activeTab === 'vault' && <VaultView />}
        {activeTab === 'timeline' && <TimelineView />}
        {activeTab === 'daily' && <DailyAndMoodView />}
        {activeTab === 'games' && <CoupleGamesView />}
        {activeTab === 'achievements' && <AchievementsView />}
        {activeTab === 'bucket' && <BucketListView />}
        {activeTab === 'dreams' && <DreamsAndGoalsView />}
        {activeTab === 'features' && <LandingView isInsideApp setActiveTab={setActiveTab} />}
        {activeTab === 'period' && <PeriodTrackerView />}
        {activeTab === 'admin' && <AdminDashboardView setActiveTab={setActiveTab} />}
        {activeTab === 'settings' && (
          <SettingsView onSetLockPin={() => setIsLocked(false)} setActiveTab={setActiveTab} />
        )}
      </main>

      {/* Real-time Bottom-Right Toast Notifications for Partner Messages & Game Challenges */}
      <PartnerNotificationToasts
        setActiveTab={setActiveTab}
        onOpenGame={(gameType, gameId) => {
          localStorage.setItem('shoona_active_game_select', gameType);
          if (gameId) {
            localStorage.setItem('shoona_active_game_id', gameId);
          }
          setActiveTab('games');
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
