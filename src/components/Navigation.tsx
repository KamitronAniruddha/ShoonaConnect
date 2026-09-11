import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ActiveTab } from '../types';
import { calculateDaysTogether, THEMES } from '../utils/coupleData';
import {
  Heart,
  MessageCircleHeart,
  Camera,
  Calendar,
  MoreHorizontal,
  Mail,
  FileText,
  Clock,
  Sparkles,
  Smile,
  Settings,
  Image as ImageIcon,
  LogOut,
  ChevronDown,
  Lock,
  Sun,
  Moon,
  Gamepad2,
  UserCheck,
  Award,
} from 'lucide-react';
import { PartnerProfileModal } from './PartnerProfileModal';

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  unreadCount?: number;
  onLockApp?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  unreadCount = 0,
  onLockApp,
}) => {
  const { userProfile, couple, partnerProfile, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showPartnerModal, setShowPartnerModal] = useState(false);

  const daysTogether = calculateDaysTogether(couple?.anniversaryDate);
  const themeKey = couple?.theme || 'rose';
  const theme = THEMES[themeKey] || THEMES.rose;

  const mainTabs = [
    { id: 'home', label: 'Home', icon: Heart },
    { id: 'chat', label: 'Messages 💕', icon: MessageCircleHeart, badge: unreadCount },
    { id: 'moments', label: 'Moments', icon: Camera },
    { id: 'dates', label: 'Dates', icon: Calendar },
  ];

  const moreTabs = [
    { id: 'achievements', label: 'Saathi Achievements', icon: Award, desc: '69 couple badges & milestones' },
    { id: 'letters', label: 'Love Letters', icon: Mail, desc: 'Timelocked & sealed letters' },
    { id: 'notes', label: 'Shared Notes', icon: FileText, desc: 'Collaborative lists & plans' },
    { id: 'vault', label: 'Media Vault', icon: ImageIcon, desc: 'Shared photos & memories' },
    { id: 'daily', label: 'Daily & Mood', icon: Smile, desc: 'Couple question & mood check-in' },
    { id: 'games', label: 'Couple Games & Pet', icon: Gamepad2, desc: '7 games, 1000+ questions & digital pet' },
    { id: 'bucket', label: 'Bucket List', icon: Sparkles, desc: 'Couple dreams & adventures' },
    { id: 'timeline', label: 'Relationship Timeline', icon: Clock, desc: 'Our love story journey' },
    { id: 'features', label: 'Feature Showcase & Guide', icon: Sparkles, desc: 'Depict all features, images & encryption' },
    { id: 'settings', label: 'Settings', icon: Settings, desc: 'Couple & profile preferences' },
  ];

  const handleTabSelect = (tab: ActiveTab) => {
    setActiveTab(tab);
    setShowMoreMenu(false);
  };

  return (
    <>
      {/* Top Desktop/Tablet Header */}
      <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-rose-100/80 dark:border-slate-800 shadow-xs transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Couple Logo & Avatars */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="relative flex items-center -space-x-2">
              <img
                src={userProfile?.photoURL || `https://api.dicebear.com/7.x/notionists/svg?seed=user`}
                alt={userProfile?.displayName}
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full border-2 border-white dark:border-slate-800 shadow-xs object-cover bg-rose-50 hover:scale-105 transition-transform"
              />
              <img
                src={partnerProfile?.photoURL || `https://api.dicebear.com/7.x/notionists/svg?seed=partner`}
                alt={partnerProfile?.displayName || 'Partner'}
                referrerPolicy="no-referrer"
                onClick={(e) => {
                  if (partnerProfile) {
                    e.stopPropagation();
                    setShowPartnerModal(true);
                  }
                }}
                title={partnerProfile ? "Click to view partner's full profile & picture" : undefined}
                className="w-9 h-9 rounded-full border-2 border-white dark:border-slate-800 shadow-xs object-cover bg-pink-50 hover:scale-105 transition-transform"
              />
              <span className="absolute -bottom-1 left-3.5 bg-rose-500 text-white rounded-full p-0.5 shadow-xs">
                <Heart className="w-2.5 h-2.5 fill-white" />
              </span>
            </div>

            <div>
              <h1 className="text-sm font-bold text-slate-800 dark:text-white tracking-tight leading-tight font-display">
                {couple?.coupleName || `${userProfile?.displayName || 'You'} & ${partnerProfile?.displayName || 'Partner'}`}
              </h1>
              <p className="text-[11px] font-medium text-rose-500 dark:text-rose-400 flex items-center gap-1">
                <span>Day {daysTogether} of Us</span>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <span className="text-slate-400 dark:text-slate-500">Private Space</span>
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {mainTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-desktop-${tab.id}`}
                  onClick={() => handleTabSelect(tab.id as ActiveTab)}
                  className={`relative px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-rose-500 text-white shadow-xs shadow-rose-200 dark:shadow-none'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'fill-white' : ''}`} />
                  {tab.label}
                  {tab.badge && tab.badge > 0 ? (
                    <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] flex items-center justify-center font-bold">
                      {tab.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}

            {/* More Dropdown for Desktop */}
            <div className="relative">
              <button
                id="nav-desktop-more"
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  moreTabs.some((t) => t.id === activeTab)
                    ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
                More
                <ChevronDown className="w-3 h-3 ml-0.5" />
              </button>

              {showMoreMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95">
                  {moreTabs.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        id={`nav-desktop-sub-${item.id}`}
                        onClick={() => handleTabSelect(item.id as ActiveTab)}
                        className={`w-full text-left p-2 rounded-xl flex items-center gap-3 transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-300'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${isActive ? 'bg-rose-100 dark:bg-rose-900 text-rose-600 dark:text-rose-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold">{item.label}</div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500">{item.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Quick Controls: Dark/Light Mode, Lock & Settings */}
          <div className="flex items-center gap-1.5">
            {/* Theme Toggle Button */}
            <button
              id="btn-nav-theme-toggle"
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 rounded-full text-slate-500 dark:text-slate-300 hover:text-rose-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {onLockApp && (
              <button
                id="btn-lock-app"
                onClick={onLockApp}
                title="Lock Sanctuary with Passcode"
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Lock className="w-4 h-4" />
              </button>
            )}

            <button
              id="btn-nav-settings"
              onClick={() => setActiveTab('settings')}
              className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-rose-100 dark:border-slate-800 px-3 py-1.5 flex items-center justify-around shadow-lg transition-colors duration-300">
        {mainTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-mobile-${tab.id}`}
              onClick={() => handleTabSelect(tab.id as ActiveTab)}
              className={`relative flex flex-col items-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
                isActive ? 'text-rose-500 dark:text-rose-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'fill-rose-500 dark:fill-rose-400' : ''}`} />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center font-bold">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] font-semibold mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}

        {/* More Button */}
        <button
          id="nav-mobile-more"
          onClick={() => setShowMoreMenu(!showMoreMenu)}
          className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
            moreTabs.some((t) => t.id === activeTab) || showMoreMenu ? 'text-rose-500 dark:text-rose-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
          }`}
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5 tracking-tight">More</span>
        </button>
      </nav>

      {/* Mobile "More" Drawer Modal */}
      {showMoreMenu && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex flex-col justify-end animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-t-3xl p-5 shadow-2xl max-h-[80vh] overflow-y-auto border-t border-slate-100 dark:border-slate-800">
            <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-4" />
            
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white font-display">
                Our Private Space
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleTheme}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1 text-xs"
                >
                  {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-rose-500" />}
                  <span>{isDark ? 'Light' : 'Dark'}</span>
                </button>
                <button
                  onClick={() => setShowMoreMenu(false)}
                  className="text-xs font-semibold text-rose-500 cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mb-4">
              {moreTabs.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-drawer-${item.id}`}
                    onClick={() => handleTabSelect(item.id as ActiveTab)}
                    className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                      isActive
                        ? 'border-rose-300 dark:border-rose-800 bg-rose-50/80 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 shadow-xs'
                        : 'border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${isActive ? 'bg-rose-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-xs'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold leading-tight">{item.label}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1">{item.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
              <span>Private to 2 People</span>
              <button onClick={logout} className="text-red-500 font-medium hover:underline flex items-center gap-1 cursor-pointer">
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Partner Profile Modal */}
      <PartnerProfileModal
        isOpen={showPartnerModal}
        onClose={() => setShowPartnerModal(false)}
        setActiveTab={setActiveTab}
      />
    </>
  );
};
