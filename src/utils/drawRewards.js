import { REWARD_LEVELS, REWARD_TYPES } from '@/constants/gameConfig';

export function drawRewards(ctx, rewards, images) {
  const { rewardImage, speedUpImage, speedDownImage } = images || {};

  for (const reward of rewards) {
    const level = REWARD_LEVELS[reward.level] || REWARD_LEVELS[0];

    ctx.save();

    let img = null;
    if (level.type === REWARD_TYPES.SPEED_UP && speedUpImage) {
      img = speedUpImage;
    } else if (level.type === REWARD_TYPES.SPEED_DOWN && speedDownImage) {
      img = speedDownImage;
    } else if (rewardImage) {
      img = rewardImage;
    }

    if (img && img.complete) {
      const drawSize = reward.size;
      ctx.drawImage(
        img,
        reward.x,
        reward.y,
        drawSize,
        drawSize
      );
    } else {
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
    }

    ctx.restore();
  }
}