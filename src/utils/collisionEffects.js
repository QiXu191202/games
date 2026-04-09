import { COLORS } from '@/constants/gameConfig';

export class CollisionEffect {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.particles = [];
    this.startTime = Date.now();
    this.duration = 500;

    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const speed = 2 + Math.random() * 2;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        radius: 3 + Math.random() * 3,
        alpha: 1,
        color: Math.random() > 0.5 ? COLORS.REWARD : '#FFD700'
      });
    }
  }

  update() {
    const elapsed = Date.now() - this.startTime;
    const progress = elapsed / this.duration;

    if (progress >= 1) return false;

    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15;
      p.alpha = 1 - progress;
      p.radius *= 0.97;
    }
    return true;
  }

  draw(ctx) {
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}

export class ScorePopup {
  constructor(x, y, score) {
    this.x = x;
    this.y = y;
    this.score = score;
    this.startTime = Date.now();
    this.duration = 800;
    this.alpha = 1;
    this.scale = 0.5;
  }

  update() {
    const elapsed = Date.now() - this.startTime;
    const progress = elapsed / this.duration;

    if (progress >= 1) return false;

    this.y -= 1.5;
    this.alpha = 1 - progress;
    this.scale = 0.5 + progress * 0.5;
    return true;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = '#FFD700';
    ctx.font = `bold ${14 * this.scale}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeText(`+${this.score}`, this.x, this.y);
    ctx.fillText(`+${this.score}`, this.x, this.y);
    ctx.restore();
  }
}
