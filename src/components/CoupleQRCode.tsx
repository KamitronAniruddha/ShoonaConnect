import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Loader2 } from 'lucide-react';

interface CoupleQRCodeProps {
  value: string;
  size?: number;
  colorDark?: string;
  colorLight?: string;
  className?: string;
}

export const CoupleQRCode: React.FC<CoupleQRCodeProps> = ({
  value,
  size = 200,
  colorDark = '#e11d48',
  colorLight = '#ffffff',
  className = '',
}) => {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    QRCode.toDataURL(value, {
      width: size,
      margin: 1,
      color: {
        dark: colorDark,
        light: colorLight,
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (isMounted) {
          setDataUrl(url);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to generate QR Code:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [value, size, colorDark, colorLight]);

  if (loading || !dataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex items-center justify-center bg-rose-50/50 dark:bg-slate-800 rounded-2xl border border-rose-100 dark:border-slate-700 ${className}`}
      >
        <Loader2 className="w-6 h-6 text-rose-500 animate-spin" />
      </div>
    );
  }

  return (
    <img
      src={dataUrl}
      alt="Couple Pairing QR Code"
      style={{ width: size, height: size }}
      className={`rounded-2xl shadow-sm border border-rose-100 dark:border-slate-700 p-2 bg-white ${className}`}
    />
  );
};
