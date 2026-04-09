import { COLORS, ROAD_DASH } from '@/constants/gameConfig';

export function drawRoad(ctx, width, height, offset) {
  ctx.fillStyle = COLORS.SHOULDER;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = COLORS.ROAD;
  ctx.fillRect(10, 0, width - 20, height);

  ctx.fillStyle = COLORS.SHOULDER_EDGE;
  ctx.fillRect(12, 0, 4, height);
  ctx.fillRect(width - 16, 0, 4, height);

  const { DASH_LENGTH, GAP_LENGTH } = ROAD_DASH;
  const totalLength = DASH_LENGTH + GAP_LENGTH;
  const startY = (offset % totalLength + totalLength) % totalLength - DASH_LENGTH;

  ctx.strokeStyle = COLORS.LANE_LINE;
  ctx.lineWidth = 3;
  ctx.setLineDash([DASH_LENGTH, GAP_LENGTH]);
  ctx.beginPath();
  for (let y = startY; y < height; y += totalLength) {
    ctx.moveTo(width / 2, y);
    ctx.lineTo(width / 2, Math.min(y + DASH_LENGTH, height));
  }
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = COLORS.SHOULDER;
  for (let i = 0; i < 20; i++) {
    const x = (i * 67 + offset * 0.5) % width;
    const y = (i * 89 + offset * 0.3) % height;
    ctx.beginPath();
    ctx.arc(x, y, 1, 0, Math.PI * 2);
    ctx.fill();
  }
}
