import { type AttachmentStyle, type ResultProfile, resultProfiles } from './quizData';

const styleOrder: AttachmentStyle[] = ['secure', 'anxious', 'avoidant', 'disorganized'];

export async function generateSocialCard(
  scores: Record<AttachmentStyle, number>,
  winningStyle: AttachmentStyle,
  profile: ResultProfile
): Promise<Blob> {
  const W = 1080;
  const H = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, '#0D1F0F');
  grad.addColorStop(1, '#1A3A1A');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Gold decorative circle
  ctx.strokeStyle = '#8B691440';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(W / 2, 320, 180, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = '#8B691430';
  ctx.beginPath();
  ctx.arc(W / 2, 320, 200, 0, Math.PI * 2);
  ctx.stroke();

  // Brand
  ctx.fillStyle = '#8B6914';
  ctx.font = '600 14px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SOUL MAPS', W / 2, 90);

  // Style emoji/icon based on type
  const emojis: Record<AttachmentStyle, string> = {
    secure: '🌿',
    anxious: '🌊',
    avoidant: '🏔️',
    disorganized: '🌀',
  };
  ctx.font = '72px system-ui';
  ctx.fillText(emojis[winningStyle], W / 2, 310);

  // Title
  ctx.fillStyle = '#F2F1EE';
  ctx.font = '600 48px Georgia, serif';
  ctx.fillText(profile.title, W / 2, 430);

  // Subtitle
  ctx.fillStyle = '#8B6914';
  ctx.font = 'italic 22px Georgia, serif';
  ctx.fillText(`"${profile.subtitle}"`, W / 2, 475);

  // Score bars
  const barStartY = 540;
  const barMargin = 120;
  const barWidth = W - barMargin * 2 - 180;

  for (let i = 0; i < styleOrder.length; i++) {
    const style = styleOrder[i];
    const score = scores[style];
    const y = barStartY + i * 55;

    ctx.fillStyle = '#F2F1EE88';
    ctx.font = '14px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(resultProfiles[style].title, barMargin, y);

    ctx.textAlign = 'right';
    ctx.fillText(`${score}%`, W - barMargin, y);

    // Bar bg
    ctx.textAlign = 'left';
    const barY = y + 8;
    ctx.fillStyle = '#FFFFFF15';
    roundRect(ctx, barMargin + 150, barY, barWidth, 10, 5);
    ctx.fill();

    // Bar fill
    ctx.fillStyle = style === winningStyle ? '#8B6914' : '#FFFFFF30';
    if (score > 0) {
      roundRect(ctx, barMargin + 150, barY, (barWidth * score) / 100, 10, 5);
      ctx.fill();
    }
  }

  // Divider
  ctx.strokeStyle = '#8B691440';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(barMargin, 790);
  ctx.lineTo(W - barMargin, 790);
  ctx.stroke();

  // CTA
  ctx.fillStyle = '#F2F1EE88';
  ctx.font = '16px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Discover yours at', W / 2, 840);

  ctx.fillStyle = '#8B6914';
  ctx.font = '600 18px system-ui, sans-serif';
  ctx.fillText('makefriendsandsocialize.com/soul-maps', W / 2, 870);

  // Brand footer
  ctx.fillStyle = '#FFFFFF40';
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillText('MAKE FRIENDS & SOCIALIZE', W / 2, 1040);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/png', 1);
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
