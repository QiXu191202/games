import { COLORS, REWARD_LEVELS } from '@/constants/gameConfig';

class SoundManager {
  constructor() {
    this.audioContext = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
    } catch {
      console.warn('Web Audio API not supported');
    }
  }

  playCollectSound(level) {
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    const baseFreq = 400 + level * 100;
    const duration = 0.15 + level * 0.05;
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.type = level >= 4 ? 'sine' : 'triangle';
    oscillator.frequency.setValueAtTime(baseFreq, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, this.audioContext.currentTime + duration / 2);
    oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 0.8, this.audioContext.currentTime + duration);
    
    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  vibrate(pattern) {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }
}

export const soundManager = new SoundManager();

export class ScreenShake {
  constructor(intensity = 5) {
    this.intensity = intensity;
    this.offsetX = 0;
    this.offsetY = 0;
    this.startTime = Date.now();
    this.duration = 200;
    this.decay = 0.9;
  }

  update() {
    const elapsed = Date.now() - this.startTime;
    const progress = elapsed / this.duration;

    if (progress >= 1) {
      this.offsetX = 0;
      this.offsetY = 0;
      return false;
    }

    const currentIntensity = this.intensity * (1 - progress) * this.decay;
    this.offsetX = (Math.random() - 0.5) * 2 * currentIntensity;
    this.offsetY = (Math.random() - 0.5) * 2 * currentIntensity;
    return true;
  }

  getOffset() {
    return { x: this.offsetX, y: this.offsetY };
  }
}

export class CollisionEffect {
  constructor(x, y, level = 2) {
    this.x = x;
    this.y = y;
    this.particles = [];
    this.startTime = Date.now();
    this.duration = 500;
    
    const levelConfig = REWARD_LEVELS[level] || REWARD_LEVELS[2];
    const particleCount = levelConfig.particleCount;
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.3;
      const speed = 2 + Math.random() * 3 + level * 0.5;
      const colors = [levelConfig.color, '#FFD700', '#FFFFFF', COLORS.REWARD];
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        radius: 3 + Math.random() * 4 + level * 0.5,
        alpha: 1,
        color: colors[Math.floor(Math.random() * colors.length)]
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
