// 导入小车图片
import carGreen from '@/assets/cars/car-green.png';
import carRed from '@/assets/cars/car-red.png';
import carYellow from '@/assets/cars/car-yellow.png';
import carBlue from '@/assets/cars/car-blue.png';

// PNG小车图片
const carImages = [
  carGreen,
  carRed,
  carYellow,
  carBlue
];

const getRandomCar = () => {
  const randomIndex = Math.floor(Math.random() * carImages.length);
  return carImages[randomIndex];
};

export default getRandomCar;