import { COLORS } from '@/constants/gameConfig';

export function drawRewards(ctx, rewards) {
  for (const reward of rewards) {
    ctx.fillStyle = COLORS.REWARD;
    ctx.beginPath();
    ctx.arc(
      reward.x + reward.size / 2,
      reward.y + reward.size / 2,
      reward.size / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('+', reward.x + reward.size / 2, reward.y + reward.size / 2);
  }
}
