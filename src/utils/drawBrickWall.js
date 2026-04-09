import { COLORS } from '@/constants/gameConfig';

export function drawBrickWallFallback(ctx, obstacle) {
  ctx.fillStyle = COLORS.OBSTACLE_FILL;
  ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
  ctx.strokeStyle = COLORS.OBSTACLE_STROKE;
  ctx.lineWidth = 3;
  ctx.strokeRect(
    obstacle.x + 1.5,
    obstacle.y + 1.5,
    obstacle.width - 3,
    obstacle.height - 3
  );
  ctx.fillStyle = COLORS.OBSTACLE_ACCENT;
  const brickWidth = 24;
  for (let x = 0; x <= obstacle.width; x += brickWidth) {
    ctx.beginPath();
    ctx.moveTo(x, obstacle.y);
    ctx.lineTo(x, obstacle.y + obstacle.height);
    ctx.stroke();
  }
  ctx.fillStyle = COLORS.OBSTACLE_OVERLAY;
  ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
}

export function createBrickWallDrawer(wallImageRef) {
  return function drawBrickWall(ctx, obstacle) {
    const wallImg = wallImageRef.current;
    if (wallImg && wallImg.complete && wallImg.naturalWidth > 0) {
      const pattern = ctx.createPattern(wallImg, 'repeat');
      if (pattern) {
        ctx.save();
        ctx.translate(obstacle.x, obstacle.y);
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, obstacle.width, obstacle.height);
        ctx.strokeStyle = COLORS.OBSTACLE_STROKE;
        ctx.lineWidth = 3;
        ctx.strokeRect(0, 0, obstacle.width, obstacle.height);
        ctx.fillStyle = 'rgba(255, 107, 53, 0.3)';
        ctx.fillRect(0, 0, obstacle.width, obstacle.height);
        ctx.restore();
        return;
      }
    }
    drawBrickWallFallback(ctx, obstacle);
  };
}
