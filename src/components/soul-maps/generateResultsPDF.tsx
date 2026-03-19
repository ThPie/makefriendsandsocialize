import { type AttachmentStyle, type ResultProfile, resultProfiles } from './quizData';

const styleOrder: AttachmentStyle[] = ['secure', 'anxious', 'avoidant', 'disorganized'];

const COLORS = {
  bg: '#0D1F0F',
  gold: '#8B6914',
  cream: '#F2F1EE',
  muted: '#999999',
  white: '#FFFFFF',
  bar: '#2A3F2A',
};

export async function generateResultsPDF(
  scores: Record<AttachmentStyle, number>,
  winningStyle: AttachmentStyle,
  profile: ResultProfile
): Promise<Blob> {
  const W = 612; // US Letter width in points
  const H = 792;
  const canvas = document.createElement('canvas');
  canvas.width = W * 2;
  canvas.height = H * 2;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(2, 2);

  // Background
  ctx.fillStyle = COLORS.cream;
  ctx.fillRect(0, 0, W, H);

  // Top banner
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, W, 140);

  // Brand name
  ctx.fillStyle = COLORS.gold;
  ctx.font = '600 10px system-ui, sans-serif';
  ctx.letterSpacing = '3px';
  ctx.textAlign = 'center';
  ctx.fillText('MAKE FRIENDS & SOCIALIZE — SOUL MAPS', W / 2, 35);

  // Title
  ctx.fillStyle = COLORS.white;
  ctx.font = '600 28px Georgia, serif';
  ctx.fillText(profile.title, W / 2, 75);

  // Subtitle
  ctx.fillStyle = COLORS.gold;
  ctx.font = 'italic 14px Georgia, serif';
  ctx.fillText(`"${profile.subtitle}"`, W / 2, 100);

  // Date
  ctx.fillStyle = '#FFFFFF88';
  ctx.font = '10px system-ui, sans-serif';
  ctx.fillText(new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), W / 2, 125);

  // Description
  ctx.textAlign = 'left';
  const margin = 50;
  let y = 170;

  ctx.fillStyle = '#333333';
  ctx.font = '11px system-ui, sans-serif';
  y = wrapText(ctx, profile.description, margin, y, W - margin * 2, 16);

  // Traits
  y += 20;
  ctx.fillStyle = COLORS.gold;
  ctx.font = '600 9px system-ui, sans-serif';
  ctx.fillText('YOUR TRAITS', margin, y);
  y += 18;

  ctx.fillStyle = '#333333';
  ctx.font = '11px system-ui, sans-serif';
  for (const trait of profile.traits) {
    ctx.fillStyle = COLORS.gold;
    ctx.beginPath();
    ctx.arc(margin + 5, y - 3, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#333333';
    ctx.fillText(trait, margin + 16, y);
    y += 18;
  }

  // Growth Edge
  y += 15;
  ctx.fillStyle = COLORS.gold;
  ctx.font = '600 9px system-ui, sans-serif';
  ctx.fillText('GROWTH EDGE', margin, y);
  y += 16;
  ctx.fillStyle = '#555555';
  ctx.font = 'italic 11px system-ui, sans-serif';
  y = wrapText(ctx, profile.growthEdge, margin, y, W - margin * 2, 15);

  // Score Bars
  y += 25;
  ctx.fillStyle = COLORS.gold;
  ctx.font = '600 9px system-ui, sans-serif';
  ctx.fillText('SCORE BREAKDOWN', margin, y);
  y += 18;

  const barWidth = W - margin * 2 - 140;
  for (const style of styleOrder) {
    const label = resultProfiles[style].title;
    const score = scores[style];

    ctx.fillStyle = '#333333';
    ctx.font = '10px system-ui, sans-serif';
    ctx.fillText(label, margin, y);

    ctx.fillStyle = '#AAAAAA';
    ctx.textAlign = 'right';
    ctx.fillText(`${score}%`, W - margin, y);
    ctx.textAlign = 'left';

    // Bar background
    y += 6;
    ctx.fillStyle = '#DDDDDD';
    roundRect(ctx, margin + 130, y - 8, barWidth, 8, 4);
    ctx.fill();

    // Bar fill
    ctx.fillStyle = style === winningStyle ? COLORS.gold : '#BBBBBB';
    if (score > 0) {
      roundRect(ctx, margin + 130, y - 8, (barWidth * score) / 100, 8, 4);
      ctx.fill();
    }

    y += 20;
  }

  // Footer
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, H - 50, W, 50);
  ctx.fillStyle = '#FFFFFF88';
  ctx.font = '9px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('makefriendsandsocialize.com/soul-maps', W / 2, H - 22);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/png', 1);
  });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
  const words = text.split(' ');
  let line = '';
  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      line = word;
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
  return y + lineHeight;
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
