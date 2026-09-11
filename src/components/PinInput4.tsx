import React, { useRef, useEffect } from 'react';

interface PinInput4Props {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (code: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  variant?: 'rose' | 'purple' | 'amber';
}

export const PinInput4: React.FC<PinInput4Props> = ({
  value,
  onChange,
  onComplete,
  disabled = false,
  autoFocus = true,
  className = '',
  variant = 'rose',
}) => {
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const digits = [
    value[0] || '',
    value[1] || '',
    value[2] || '',
    value[3] || '',
  ];

  useEffect(() => {
    if (autoFocus && inputRefs[0].current) {
      inputRefs[0].current.focus();
    }
  }, [autoFocus]);

  const handleChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '');
    if (!clean) {
      // Emptying this digit
      const newDigits = [...digits];
      newDigits[index] = '';
      const newVal = newDigits.join('').slice(0, 4);
      onChange(newVal);
      return;
    }

    if (clean.length > 1) {
      // Pasted multiple digits
      handlePasteString(clean);
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = clean[0];
    const newVal = newDigits.join('').slice(0, 4);
    onChange(newVal);

    if (index < 3 && clean[0]) {
      inputRefs[index + 1].current?.focus();
    }

    if (newVal.length === 4 && onComplete) {
      onComplete(newVal);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs[index - 1].current?.focus();
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        onChange(newDigits.join(''));
      } else {
        const newDigits = [...digits];
        newDigits[index] = '';
        onChange(newDigits.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs[index - 1].current?.focus();
    } else if (e.key === 'ArrowRight' && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handlePasteString = (pasted: string) => {
    const clean = pasted.replace(/\D/g, '').slice(0, 4);
    if (!clean) return;
    onChange(clean);
    const nextFocusIndex = Math.min(clean.length, 3);
    inputRefs[nextFocusIndex].current?.focus();
    if (clean.length === 4 && onComplete) {
      onComplete(clean);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    handlePasteString(pasted);
  };

  const activeRing =
    variant === 'purple'
      ? 'focus:border-purple-500 focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-900/40 text-purple-600 dark:text-purple-300'
      : variant === 'amber'
      ? 'focus:border-amber-500 focus:ring-4 focus:ring-amber-200 dark:focus:ring-amber-900/40 text-amber-600 dark:text-amber-300'
      : 'focus:border-rose-500 focus:ring-4 focus:ring-rose-200 dark:focus:ring-rose-900/40 text-rose-600 dark:text-rose-300';

  return (
    <div className={`flex items-center justify-center gap-2.5 sm:gap-3.5 ${className}`}>
      {[0, 1, 2, 3].map((idx) => (
        <input
          key={idx}
          ref={inputRefs[idx]}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          disabled={disabled}
          value={digits[idx]}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl sm:text-3xl font-extrabold font-mono rounded-2xl border-2 transition-all outline-none bg-white dark:bg-slate-800 ${
            digits[idx]
              ? 'border-slate-400 dark:border-slate-500 shadow-sm'
              : 'border-slate-200 dark:border-slate-700'
          } ${activeRing}`}
          aria-label={`Digit ${idx + 1}`}
        />
      ))}
    </div>
  );
};
