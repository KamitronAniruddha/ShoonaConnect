import jsPDF from 'jspdf';
import QRCode from 'qrcode';

export interface InvitationData {
  coupleName: string;
  creatorName: string;
  creatorNickname?: string;
  creatorPhoto?: string;
  pairCode: string;
  appUrl: string;
  anniversaryDate?: string;
  relationshipStatus?: string;
  theme?: string;
  personalMessage?: string;
}

/**
 * Calculates days together from anniversary date
 */
function getDaysCountText(dateStr?: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays >= 0) {
    return `${diffDays.toLocaleString()} Days of Love`;
  }
  return `Counting Down to our Celebration`;
}

/**
 * Generates a high-resolution 2D Canvas containing the luxury couple invitation artwork.
 */
export async function generateInvitationCanvas(
  data: InvitationData,
  style: 'royal_parchment' | 'midnight_obsidian' = 'midnight_obsidian'
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  const width = 1200;
  const height = 1700;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  const isDark = style === 'midnight_obsidian';

  // 1. Generate QR Code image data
  const qrDataUrl = await QRCode.toDataURL(data.appUrl || `https://shoona.love/join?code=${data.pairCode}`, {
    width: 320,
    margin: 1,
    color: {
      dark: isDark ? '#1a0b14' : '#881337',
      light: '#ffffff',
    },
    errorCorrectionLevel: 'H',
  });

  const qrImage = new Image();
  await new Promise<void>((resolve, reject) => {
    qrImage.onload = () => resolve();
    qrImage.onerror = reject;
    qrImage.src = qrDataUrl;
  });

  // 2. Background Rendering
  if (isDark) {
    // Luxury Deep Midnight Obsidian Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#09060b');
    bgGrad.addColorStop(0.3, '#120914');
    bgGrad.addColorStop(0.7, '#180d1a');
    bgGrad.addColorStop(1, '#080509');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle romantic ambient glow orbs
    const glow1 = ctx.createRadialGradient(width * 0.2, height * 0.15, 10, width * 0.2, height * 0.15, 450);
    glow1.addColorStop(0, 'rgba(244, 63, 94, 0.18)');
    glow1.addColorStop(1, 'rgba(244, 63, 94, 0)');
    ctx.fillStyle = glow1;
    ctx.fillRect(0, 0, width, height);

    const glow2 = ctx.createRadialGradient(width * 0.8, height * 0.85, 10, width * 0.8, height * 0.85, 450);
    glow2.addColorStop(0, 'rgba(168, 85, 247, 0.15)');
    glow2.addColorStop(1, 'rgba(168, 85, 247, 0)');
    ctx.fillStyle = glow2;
    ctx.fillRect(0, 0, width, height);
  } else {
    // Luxury Warm Ivory Royal Parchment
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#faf7f2');
    bgGrad.addColorStop(0.5, '#fffaf5');
    bgGrad.addColorStop(1, '#f7f1e6');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    const glow1 = ctx.createRadialGradient(width * 0.5, height * 0.2, 10, width * 0.5, height * 0.2, 500);
    glow1.addColorStop(0, 'rgba(251, 113, 133, 0.12)');
    glow1.addColorStop(1, 'rgba(251, 113, 133, 0)');
    ctx.fillStyle = glow1;
    ctx.fillRect(0, 0, width, height);
  }

  // 3. Double Gold & Rose Foil Filigree Borders
  const pad = 50;
  const innerPad = 65;

  // Outer Border
  ctx.strokeStyle = isDark ? 'rgba(212, 175, 55, 0.45)' : 'rgba(212, 175, 55, 0.6)';
  ctx.lineWidth = 3;
  ctx.strokeRect(pad, pad, width - pad * 2, height - pad * 2);

  // Inner Border with corner embellishments
  ctx.strokeStyle = isDark ? 'rgba(244, 63, 94, 0.5)' : 'rgba(225, 29, 72, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(innerPad, innerPad, width - innerPad * 2, height - innerPad * 2);

  // Corner Diamond Embellishments
  const drawCornerDiamond = (cx: number, cy: number) => {
    ctx.save();
    ctx.fillStyle = isDark ? '#fbbf24' : '#d4af37';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 10);
    ctx.lineTo(cx + 10, cy);
    ctx.lineTo(cx, cy + 10);
    ctx.lineTo(cx - 10, cy);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  drawCornerDiamond(innerPad, innerPad);
  drawCornerDiamond(width - innerPad, innerPad);
  drawCornerDiamond(innerPad, height - innerPad);
  drawCornerDiamond(width - innerPad, height - innerPad);

  // 4. Header Section (Crown & Monogram)
  ctx.textAlign = 'center';

  // Golden Heart Crest Emblem
  const crestY = 160;
  ctx.save();
  ctx.fillStyle = isDark ? '#f43f5e' : '#e11d48';
  ctx.font = '52px serif';
  ctx.fillText('❦', width / 2, crestY);
  ctx.restore();

  // Eyebrow label
  ctx.font = 'bold 20px "Outfit", "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = isDark ? '#fbbf24' : '#b45309';
  ctx.letterSpacing = '6px';
  ctx.fillText('PRIVATE COUPLE SANCTUARY INVITATION', width / 2, crestY + 50);

  // 5. Couple Sanctuary Main Title
  ctx.font = 'italic 700 64px "Fraunces", "Playfair Display", Georgia, serif';
  ctx.fillStyle = isDark ? '#ffffff' : '#1c1917';
  ctx.letterSpacing = '0px';

  const sanctuaryTitle = data.coupleName || "Our Private Sanctuary";
  ctx.fillText(sanctuaryTitle, width / 2, crestY + 130);

  // Subtitle
  ctx.font = '400 24px "Newsreader", Georgia, serif';
  ctx.fillStyle = isDark ? '#fda4af' : '#be123c';
  ctx.fillText('A sacred sanctuary reserved exclusively for two hearts', width / 2, crestY + 175);

  // Divider with heart
  const divY = crestY + 215;
  ctx.strokeStyle = isDark ? 'rgba(212, 175, 55, 0.35)' : 'rgba(212, 175, 55, 0.5)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 200, divY);
  ctx.lineTo(width / 2 - 30, divY);
  ctx.moveTo(width / 2 + 30, divY);
  ctx.lineTo(width / 2 + 200, divY);
  ctx.stroke();

  ctx.fillStyle = isDark ? '#fbbf24' : '#d4af37';
  ctx.font = '22px serif';
  ctx.fillText('❤', width / 2, divY + 7);

  // 6. Sender Identity
  const senderY = divY + 65;
  const senderText = data.creatorNickname
    ? `Created with boundless love by ${data.creatorName} ("${data.creatorNickname}")`
    : `Created with boundless love by ${data.creatorName}`;

  ctx.font = '600 28px "Caveat", cursive, sans-serif';
  ctx.fillStyle = isDark ? '#fbcfe8' : '#831843';
  ctx.fillText(senderText, width / 2, senderY);

  if (data.anniversaryDate) {
    const daysStr = getDaysCountText(data.anniversaryDate);
    ctx.font = '500 20px "Outfit", sans-serif';
    ctx.fillStyle = isDark ? '#94a3b8' : '#64748b';
    ctx.fillText(`Our journey began on ${data.anniversaryDate} • ${daysStr}`, width / 2, senderY + 36);
  }

  // 7. Centerpiece: Golden 4-Digit Code Seal Box
  const sealBoxY = senderY + 80;
  const sealBoxW = 600;
  const sealBoxH = 170;
  const sealBoxX = (width - sealBoxW) / 2;

  // Seal Box Background with Gradient
  const sealGrad = ctx.createLinearGradient(sealBoxX, sealBoxY, sealBoxX + sealBoxW, sealBoxY + sealBoxH);
  if (isDark) {
    sealGrad.addColorStop(0, 'rgba(244, 63, 94, 0.15)');
    sealGrad.addColorStop(0.5, 'rgba(251, 191, 36, 0.2)');
    sealGrad.addColorStop(1, 'rgba(168, 85, 247, 0.15)');
  } else {
    sealGrad.addColorStop(0, 'rgba(254, 226, 226, 0.8)');
    sealGrad.addColorStop(0.5, 'rgba(254, 243, 199, 0.9)');
    sealGrad.addColorStop(1, 'rgba(243, 232, 255, 0.8)');
  }

  ctx.save();
  ctx.fillStyle = sealGrad;
  ctx.roundRect(sealBoxX, sealBoxY, sealBoxW, sealBoxH, 28);
  ctx.fill();

  ctx.strokeStyle = isDark ? '#fbbf24' : '#d4af37';
  ctx.lineWidth = 2.5;
  ctx.roundRect(sealBoxX, sealBoxY, sealBoxW, sealBoxH, 28);
  ctx.stroke();
  ctx.restore();

  // Seal Title
  ctx.font = 'bold 18px "Outfit", sans-serif';
  ctx.fillStyle = isDark ? '#fef08a' : '#854d0e';
  ctx.fillText('YOUR SACRED 4-DIGIT ENTRY PASSCODE', width / 2, sealBoxY + 45);

  // Large 4-digit code
  ctx.font = '900 84px "Outfit", monospace';
  ctx.fillStyle = isDark ? '#ffffff' : '#0f172a';
  ctx.letterSpacing = '18px';
  ctx.fillText(data.pairCode, width / 2 + 9, sealBoxY + 125);
  ctx.letterSpacing = '0px';

  // 8. QR Code Container & Scanning Instructions
  const qrBoxY = sealBoxY + sealBoxH + 45;
  const qrSize = 250;
  const qrX = (width - qrSize) / 2;
  const qrY = qrBoxY + 30;

  // QR Container Card
  const qrCardW = 420;
  const qrCardH = 430;
  const qrCardX = (width - qrCardW) / 2;

  ctx.save();
  ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff';
  ctx.roundRect(qrCardX, qrBoxY, qrCardW, qrCardH, 28);
  ctx.fill();

  ctx.strokeStyle = isDark ? 'rgba(244, 63, 94, 0.3)' : 'rgba(244, 63, 94, 0.2)';
  ctx.lineWidth = 1.5;
  ctx.roundRect(qrCardX, qrBoxY, qrCardW, qrCardH, 28);
  ctx.stroke();
  ctx.restore();

  // Draw QR Image with white padding
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.roundRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20, 16);
  ctx.fill();
  ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);
  ctx.restore();

  // QR label
  ctx.font = 'bold 22px "Fraunces", Georgia, serif';
  ctx.fillStyle = isDark ? '#ffffff' : '#0f172a';
  ctx.fillText('Scan with Camera to Connect', width / 2, qrY + qrSize + 45);

  ctx.font = '400 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = isDark ? '#cbd5e1' : '#64748b';
  ctx.fillText('Instantly opens our couple world on your phone', width / 2, qrY + qrSize + 75);

  // 9. Romantic Oath / Message
  const quoteY = qrBoxY + qrCardH + 55;
  const customQuote = data.personalMessage || '“In a world of eight billion souls, this private space belongs only to us.”';
  
  ctx.font = 'italic 500 24px "Cormorant Garamond", Georgia, serif';
  ctx.fillStyle = isDark ? '#fda4af' : '#9f1239';
  ctx.fillText(customQuote, width / 2, quoteY);

  // 10. Footer Section
  const footerY = height - 85;
  ctx.font = 'bold 15px "Outfit", sans-serif';
  ctx.fillStyle = isDark ? '#64748b' : '#94a3b8';
  ctx.fillText('SHOONACONNECT • ZERO-KNOWLEDGE PRIVATE SANCTUARY', width / 2, footerY);

  ctx.font = '400 14px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = isDark ? '#475569' : '#a8a29e';
  ctx.fillText(data.appUrl || 'https://shoona.love', width / 2, footerY + 22);

  return canvas;
}

/**
 * Downloads a luxury vector-crisp PDF of the sanctuary invitation.
 */
export async function downloadInvitationPdf(
  data: InvitationData,
  style: 'royal_parchment' | 'midnight_obsidian' = 'midnight_obsidian'
): Promise<void> {
  const canvas = await generateInvitationCanvas(data, style);
  const imgData = canvas.toDataURL('image/jpeg', 0.95);

  // Standard A4 portrait in jsPDF
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

  const cleanName = (data.coupleName || 'Couple_Sanctuary')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .toLowerCase();

  pdf.save(`${cleanName}_sanctuary_invitation.pdf`);
}

/**
 * Downloads high-res PNG image for direct sharing on WhatsApp / Instagram
 */
export async function downloadInvitationImage(
  data: InvitationData,
  style: 'royal_parchment' | 'midnight_obsidian' = 'midnight_obsidian'
): Promise<void> {
  const canvas = await generateInvitationCanvas(data, style);
  const dataUrl = canvas.toDataURL('image/png');

  const a = document.createElement('a');
  a.href = dataUrl;
  const cleanName = (data.coupleName || 'Couple_Sanctuary')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .toLowerCase();
  a.download = `${cleanName}_invitation_card.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
