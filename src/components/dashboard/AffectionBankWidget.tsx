import React, { useState } from 'react';
import { Heart, Coins, Plus, Sparkles, Check, Gift } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AffectionVoucher {
  id: string;
  title: string;
  emoji: string;
  cost: number;
  redeemedCount: number;
}

const INITIAL_VOUCHERS: AffectionVoucher[] = [
  { id: 'kiss', title: '5 Long Forehead Kisses', emoji: '💋', cost: 1, redeemedCount: 14 },
  { id: 'massage', title: '15-Minute Shoulder / Back Rub', emoji: '💆', cost: 3, redeemedCount: 6 },
  { id: 'breakfast', title: 'Breakfast in Bed & Coffee', emoji: '🥞', cost: 4, redeemedCount: 3 },
  { id: 'nap', title: 'Undisturbed Cozy Spooning Nap', emoji: '🧸', cost: 2, redeemedCount: 8 },
  { id: 'snack', title: 'Late Night Snack Delivery Run', emoji: '🍟', cost: 3, redeemedCount: 5 },
  { id: 'compliment', title: '10 Specific Genuine Compliments', emoji: '💌', cost: 1, redeemedCount: 19 },
];

interface AffectionBankWidgetProps {
  partnerName?: string;
  onSendToChat?: (text: string) => void;
}

export const AffectionBankWidget: React.FC<AffectionBankWidgetProps> = ({
  partnerName = 'Sweetheart',
  onSendToChat,
}) => {
  const [balance, setBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('shoona_affection_balance');
      return saved ? parseInt(saved, 10) : 48;
    } catch {
      return 48;
    }
  });

  const [vouchers, setVouchers] = useState<AffectionVoucher[]>(() => {
    try {
      const saved = localStorage.getItem('shoona_affection_vouchers');
      return saved ? JSON.parse(saved) : INITIAL_VOUCHERS;
    } catch {
      return INITIAL_VOUCHERS;
    }
  });

  const [lastRedeemed, setLastRedeemed] = useState<string | null>(null);

  const handleDeposit = () => {
    const newBal = balance + 5;
    setBalance(newBal);
    try {
      localStorage.setItem('shoona_affection_balance', newBal.toString());
    } catch {
      // ignore
    }

    confetti({
      particleCount: 25,
      spread: 45,
      origin: { y: 0.8 },
      colors: ['#ff4d8d', '#fb7185', '#ec4899'],
    });

    const msg = `🪙 Deposited +5 Love Hearts into our Affection Bank for ${partnerName}! Current Stash: ${newBal} 💕`;
    if (onSendToChat) {
      onSendToChat(msg);
    }
  };

  const handleRedeem = (voucher: AffectionVoucher) => {
    if (balance < voucher.cost) return;

    const newBal = balance - voucher.cost;
    setBalance(newBal);

    const updated = vouchers.map((v) =>
      v.id === voucher.id ? { ...v, redeemedCount: v.redeemedCount + 1 } : v
    );
    setVouchers(updated);

    try {
      localStorage.setItem('shoona_affection_balance', newBal.toString());
      localStorage.setItem('shoona_affection_vouchers', JSON.stringify(updated));
    } catch {
      // ignore
    }

    setLastRedeemed(`Claimed: "${voucher.title}"!`);
    setTimeout(() => setLastRedeemed(null), 3500);

    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.75 },
    });

    const msg = `🎟️ REDEEMED LOVE COUPON: ${voucher.emoji} "${voucher.title}" has been claimed from ${partnerName}! Time to deliver! ❤️`;
    if (onSendToChat) {
      onSendToChat(msg);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-pink-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center font-bold shadow-xs">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
              <span>Affection Vault & "Hugs & Kisses" Bank</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 font-extrabold border border-pink-200 dark:border-pink-900/40">
                {balance} Love Coins
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Shared piggy bank of romantic vouchers, cuddles & redeemable treats
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDeposit}
          className="px-3 py-1.5 rounded-xl bg-pink-50 dark:bg-slate-800 hover:bg-pink-100 dark:hover:bg-slate-700 text-pink-600 dark:text-pink-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Deposit +5 Love Coins</span>
        </button>
      </div>

      {lastRedeemed && (
        <div className="mb-3 p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-2 animate-in zoom-in-95">
          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{lastRedeemed} Sent notification to {partnerName}!</span>
        </div>
      )}

      {/* Vouchers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {vouchers.map((voucher) => {
          const canAfford = balance >= voucher.cost;

          return (
            <div
              key={voucher.id}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 group hover:border-pink-200 dark:hover:border-pink-800 transition-all"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-2xl shrink-0 p-1.5 bg-white dark:bg-slate-700 rounded-xl shadow-2xs">
                  {voucher.emoji}
                </span>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">
                    {voucher.title}
                  </h4>
                  <div className="text-[10px] text-slate-400">
                    Cost: <strong className="text-pink-600 dark:text-pink-400 font-bold">{voucher.cost} Coins</strong> • Redeemed {voucher.redeemedCount}x
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={!canAfford}
                onClick={() => handleRedeem(voucher)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                  canAfford
                    ? 'bg-pink-500 hover:bg-pink-600 text-white shadow-xs active:scale-95'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                }`}
              >
                Claim
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
