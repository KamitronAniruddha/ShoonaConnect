import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { AdminCoupleRecord } from '../../types';
import {
  Mail,
  Lock,
  Unlock,
  Heart,
  Calendar,
  Search,
  RefreshCw,
  Eye,
  CheckCircle2,
} from 'lucide-react';

interface AdminLettersVaultProps {
  couples: AdminCoupleRecord[];
  onOpenDeepDive: (couple: AdminCoupleRecord) => void;
}

export const AdminLettersVault: React.FC<AdminLettersVaultProps> = ({
  couples,
  onOpenDeepDive,
}) => {
  const [letters, setLetters] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchAllLetters = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('letters')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        setLetters(data);
      } else {
        setLetters([
          {
            id: 'l1',
            couple_id: couples[0]?.id || 'c1',
            couple_name: couples[0]?.coupleName || 'Shoona & Babu',
            sender_name: 'Shoona',
            title: 'For my soulmate on our 500th day together',
            content: 'Every heartbeat belongs to you. No matter what changes in the world, my love for you will remain eternal and unwavering.',
            wax_seal: 'gold_rose',
            is_sealed: true,
            unlock_at: new Date(Date.now() + 4 * 3600000).toISOString(),
            is_read: false,
            created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
          },
          {
            id: 'l2',
            couple_id: couples[0]?.id || 'c1',
            couple_name: couples[0]?.coupleName || 'Shoona & Babu',
            sender_name: 'Babu',
            title: 'When you are having a tough day and need a reminder',
            content: 'You are the most resilient, kind, and brilliant person I know. I am so lucky to walk beside you in this life. Take a deep breath, my darling.',
            wax_seal: 'ruby_heart',
            is_sealed: false,
            unlock_at: new Date(Date.now() - 86400000).toISOString(),
            is_read: true,
            created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
          },
          {
            id: 'l3',
            couple_id: couples[1]?.id || 'c2',
            couple_name: couples[1]?.coupleName || 'Alex & Maya',
            title: 'Promise for our upcoming wedding anniversary',
            content: 'I promise to laugh with you, cry with you, support your wildest dreams, and always share the last slice of cheesecake with you.',
            wax_seal: 'emerald_crest',
            is_sealed: false,
            unlock_at: new Date(Date.now() - 172800000).toISOString(),
            is_read: true,
            created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
          },
        ]);
      }
    } catch (err) {
      console.error('Error fetching letters:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllLetters();
  }, []);

  const filtered = letters.filter(
    (l) =>
      !search ||
      l.title?.toLowerCase().includes(search.toLowerCase()) ||
      l.content?.toLowerCase().includes(search.toLowerCase()) ||
      l.sender_name?.toLowerCase().includes(search.toLowerCase()) ||
      l.couple_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white font-fraunces flex items-center gap-2">
            <Mail className="w-5 h-5 text-purple-400" />
            <span>Global Wax-Sealed Love Letters &amp; Time Capsules</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            View sealed and opened letters, wax seal varieties, unlock countdowns, and heartfelt messages between lovers.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search letter titles, authors..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>
          <button
            onClick={fetchAllLetters}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-rose-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grid of Letters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((letItem) => {
          const matchedCouple = couples.find((c) => c.id === letItem.couple_id);
          const isSealed = Boolean(letItem.is_sealed);
          return (
            <div
              key={letItem.id}
              className="p-5 rounded-3xl bg-slate-900 border border-purple-500/20 space-y-4 hover:border-purple-500/40 transition-all shadow-xl flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">💌</span>
                    <div>
                      <span className="text-xs font-bold text-white block">From: {letItem.sender_name}</span>
                      <span className="text-[10px] text-rose-400 font-bold">
                        {letItem.couple_name || matchedCouple?.coupleName || 'Couple'}
                      </span>
                    </div>
                  </div>

                  {isSealed ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold flex items-center gap-1 border border-amber-500/30">
                      <Lock className="w-3 h-3" /> Sealed
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold flex items-center gap-1 border border-emerald-500/30">
                      <Unlock className="w-3 h-3" /> Unlocked
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-rose-300 text-sm font-fraunces">{letItem.title}</h4>
                  <p className="text-xs text-slate-300 mt-2 line-clamp-4 leading-relaxed bg-slate-950/60 p-3 rounded-2xl border border-slate-800 font-serif italic">
                    "{letItem.content}"
                  </p>
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                <span className="capitalize text-amber-300 font-mono">Seal: {letItem.wax_seal?.replace(/_/g, ' ')}</span>
                {matchedCouple && (
                  <button
                    onClick={() => onOpenDeepDive(matchedCouple)}
                    className="text-rose-400 hover:text-rose-300 font-bold cursor-pointer"
                  >
                    Inspect Couple →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
