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

export const getSafePosition = (position, obstacle, size, direction) => {
  const safePosition = { ...position };

  // 计算障碍物的边界
  const obstacleLeft = obstacle.x;
  const obstacleRight = obstacle.x + obstacle.width;
  const obstacleTop = obstacle.y;
  const obstacleBottom = obstacle.y + obstacle.height;

  switch (direction) {
    case 'up':
      // 向上移动时，确保小车底部不超过障碍物顶部
      if (safePosition.y < obstacleBottom && safePosition.y + size.height > obstacleTop) {
        safePosition.y = obstacleTop - size.height;
      }
      break;
    case 'down':
      // 向下移动时，确保小车顶部不小于障碍物底部
      if (safePosition.y < obstacleBottom && safePosition.y + size.height > obstacleTop) {
        safePosition.y = obstacleBottom;
      }
      break;
    case 'left':
      // 向左移动时，确保小车右边缘不超过障碍物左边缘
      if (safePosition.x < obstacleRight && safePosition.x + size.width > obstacleLeft) {
        safePosition.x = obstacleLeft - size.width;
      }
      break;
    case 'right':
      // 向右移动时，确保小车左边缘不小于障碍物右边缘
      if (safePosition.x < obstacleRight && safePosition.x + size.width > obstacleLeft) {
        safePosition.x = obstacleRight;
      }
      break;
  }

  return safePosition;
};

export const willOverlap = (position, obstacle, size) => {
  // 检查当前位置是否与障碍物重叠
  return position.x < obstacle.x + obstacle.width &&
         position.x + size.width > obstacle.x &&
         position.y < obstacle.y + obstacle.height &&
         position.y + size.height > obstacle.y;
};