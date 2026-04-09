import { COLORS } from '@/constants/gameConfig';

export function drawCar(ctx, car, carImage) {
  if (carImage.complete && carImage.naturalWidth > 0) {
    ctx.drawImage(carImage, car.x, car.y, car.width, car.height);
  } else {
    ctx.fillStyle = COLORS.CAR_FALLBACK;
    ctx.fillRect(car.x, car.y, car.width, car.height);
  }
}
