import { REWARD_LEVELS } from '@/constants/gameConfig';

export function drawRewards(ctx, rewards) {
  for (const reward of rewards) {
    const level = REWARD_LEVELS[reward.level] || REWARD_LEVELS[2];
    
    ctx.save();
    
    if (reward.level >= 3) {
      ctx.shadowColor = level.color;
      ctx.shadowBlur = 15;
    }
    
    ctx.fillStyle = level.color;
    ctx.beginPath();
    ctx.arc(
      reward.x + reward.size / 2,
      reward.y + reward.size / 2,
      reward.size / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
    
    ctx.shadowBlur = 0;
    
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = Math.max(1, reward.size / 12);
    ctx.beginPath();
    ctx.arc(
      reward.x + reward.size / 2,
      reward.y + reward.size / 2,
      reward.size / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.stroke();
    
    ctx.fillStyle = '#FFFFFF';
    const fontSize = Math.max(10, reward.size * 0.4);
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('+', reward.x + reward.size / 2, reward.y + reward.size / 2);
    
    ctx.restore();
  }
}
