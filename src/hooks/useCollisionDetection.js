export const checkCollision = (position, newPosition, obstacle, size) => {
  // 计算新位置和障碍物的矩形边界
  const newRect = {
    left: newPosition.x,
    right: newPosition.x + size.width,
    top: newPosition.y,
    bottom: newPosition.y + size.height
  };

  const obstacleRect = {
    left: obstacle.x,
    right: obstacle.x + obstacle.width,
    top: obstacle.y,
    bottom: obstacle.y + obstacle.height
  };

  // 检查两个矩形是否重叠
  return newRect.left < obstacleRect.right &&
         newRect.right > obstacleRect.left &&
         newRect.top < obstacleRect.bottom &&
         newRect.bottom > obstacleRect.top;
};