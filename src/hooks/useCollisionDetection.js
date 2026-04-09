export function checkRectCollision(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

export function checkCollision(position, newPosition, obstacle, size) {
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

  return newRect.left < obstacleRect.right &&
         newRect.right > obstacleRect.left &&
         newRect.top < obstacleRect.bottom &&
         newRect.bottom > obstacleRect.top;
}

export function getSafePosition(position, obstacle, size, direction) {
  const safePosition = { ...position };

  const obstacleLeft = obstacle.x;
  const obstacleRight = obstacle.x + obstacle.width;
  const obstacleTop = obstacle.y;
  const obstacleBottom = obstacle.y + obstacle.height;

  switch (direction) {
    case 'up':
      if (safePosition.y < obstacleBottom && safePosition.y + size.height > obstacleTop) {
        safePosition.y = obstacleTop - size.height;
      }
      break;
    case 'down':
      if (safePosition.y < obstacleBottom && safePosition.y + size.height > obstacleTop) {
        safePosition.y = obstacleBottom;
      }
      break;
    case 'left':
      if (safePosition.x < obstacleRight && safePosition.x + size.width > obstacleLeft) {
        safePosition.x = obstacleLeft - size.width;
      }
      break;
    case 'right':
      if (safePosition.x < obstacleRight && safePosition.x + size.width > obstacleLeft) {
        safePosition.x = obstacleRight;
      }
      break;
  }

  return safePosition;
}

export function willOverlap(position, obstacle, size) {
  return position.x < obstacle.x + obstacle.width &&
         position.x + size.width > obstacle.x &&
         position.y < obstacle.y + obstacle.height &&
         position.y + size.height > obstacle.y;
}
