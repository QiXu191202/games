import { useRef, useCallback } from 'react';
import { GAME_CONFIG, OBSTACLE_CONFIG, REWARD_CONFIG, REWARD_LEVELS } from '@/constants/gameConfig';

export function generateObstacle() {
  const minGap = GAME_CONFIG.CAR_SIZE + 10;
  const roadWidth = GAME_CONFIG.WIDTH - 30;
  const maxObstacleWidth = roadWidth - minGap;

  if (maxObstacleWidth <= OBSTACLE_CONFIG.MIN_WIDTH) {
    const width = OBSTACLE_CONFIG.MIN_WIDTH;
    return {
      x: 15 + Math.random() * (roadWidth - width),
      y: -OBSTACLE_CONFIG.HEIGHT - 20,
      width,
      height: OBSTACLE_CONFIG.HEIGHT,
      id: `obstacle-${Date.now()}-${Math.random()}`
    };
  }

  const useDoubleObstacle = Math.random() < 0.3;
  
  if (useDoubleObstacle) {
    const leftWidth = OBSTACLE_CONFIG.MIN_WIDTH + 
      Math.random() * (OBSTACLE_CONFIG.MAX_WIDTH - OBSTACLE_CONFIG.MIN_WIDTH);
    const rightWidth = OBSTACLE_CONFIG.MIN_WIDTH + 
      Math.random() * (OBSTACLE_CONFIG.MAX_WIDTH - OBSTACLE_CONFIG.MIN_WIDTH);
    
    const totalWidth = leftWidth + rightWidth;
    const maxTotalWidth = roadWidth - minGap;
    const scale = Math.min(1, maxTotalWidth / totalWidth);
    
    const scaledLeftWidth = leftWidth * scale;
    const scaledRightWidth = rightWidth * scale;
    
    return {
      x: 15,
      y: -OBSTACLE_CONFIG.HEIGHT - 20,
      width: scaledLeftWidth,
      height: OBSTACLE_CONFIG.HEIGHT,
      id: `obstacle-${Date.now()}-${Math.random()}`,
      pairedObstacle: {
        x: GAME_CONFIG.WIDTH - 15 - scaledRightWidth,
        width: scaledRightWidth,
        height: OBSTACLE_CONFIG.HEIGHT
      }
    };
  }

  const side = Math.random() < 0.5 ? 'left' : 'right';
  const maxSingleWidth = Math.min(OBSTACLE_CONFIG.MAX_WIDTH, maxObstacleWidth);
  const width = OBSTACLE_CONFIG.MIN_WIDTH + 
    Math.random() * (maxSingleWidth - OBSTACLE_CONFIG.MIN_WIDTH);

  const x = side === 'left' 
    ? 15 
    : GAME_CONFIG.WIDTH - 15 - width;

  return {
    x,
    y: -OBSTACLE_CONFIG.HEIGHT - 20,
    width,
    height: OBSTACLE_CONFIG.HEIGHT,
    id: `obstacle-${Date.now()}-${Math.random()}`
  };
}

export function generateReward(obstacles = []) {
  const levelIndex = Math.floor(Math.random() * REWARD_LEVELS.length);
  const level = REWARD_LEVELS[levelIndex];
  const padding = 10;
  const minX = 30;
  const maxX = GAME_CONFIG.WIDTH - level.size - 30;
  
  const checkOverlap = (x, y) => {
    const rewardRect = {
      left: x,
      right: x + level.size,
      top: y,
      bottom: y + level.size
    };
    
    for (const obstacle of obstacles) {
      const obstacleRect = {
        left: obstacle.x - padding,
        right: obstacle.x + obstacle.width + padding,
        top: obstacle.y - padding,
        bottom: obstacle.y + obstacle.height + padding
      };
      
      if (rewardRect.left < obstacleRect.right &&
          rewardRect.right > obstacleRect.left &&
          rewardRect.top < obstacleRect.bottom &&
          rewardRect.bottom > obstacleRect.top) {
        return true;
      }
    }
    return false;
  };
  
  let x = minX + Math.random() * (maxX - minX);
  const y = -level.size - 20;
  
  for (let attempt = 0; attempt < 10; attempt++) {
    if (!checkOverlap(x, y)) {
      break;
    }
    x = minX + Math.random() * (maxX - minX);
  }
  
  return {
    x,
    y,
    size: level.size,
    score: level.score || 0,
    speedChange: level.speedChange || 0,
    type: level.type,
    level: levelIndex,
    id: `reward-${Date.now()}-${Math.random()}`
  };
}

export function useGameObjects() {
  const obstaclesRef = useRef([]);
  const rewardsRef = useRef([]);
  const collectedRewardsRef = useRef(new Set());
  const spawnTimerRef = useRef(0);
  const rewardSpawnTimerRef = useRef(0);

  const reset = useCallback(() => {
    obstaclesRef.current = [];
    rewardsRef.current = [];
    collectedRewardsRef.current = new Set();
    spawnTimerRef.current = 0;
    rewardSpawnTimerRef.current = 0;
  }, []);

  const update = useCallback((scrollSpeed, onCollectReward) => {
    spawnTimerRef.current++;
    if (spawnTimerRef.current >= OBSTACLE_CONFIG.SPAWN_INTERVAL) {
      const obstacle = generateObstacle();
      obstaclesRef.current.push(obstacle);
      if (obstacle.pairedObstacle) {
        obstaclesRef.current.push({
          ...obstacle.pairedObstacle,
          x: obstacle.pairedObstacle.x,
          y: obstacle.y,
          id: `obstacle-${Date.now()}-${Math.random()}`
        });
      }
      spawnTimerRef.current = 0;
    }

    rewardSpawnTimerRef.current++;
    if (rewardSpawnTimerRef.current >= REWARD_CONFIG.SPAWN_INTERVAL) {
      rewardsRef.current.push(generateReward(obstaclesRef.current));
      rewardSpawnTimerRef.current = 0;
    }

    obstaclesRef.current = obstaclesRef.current.filter(obstacle => {
      obstacle.y += scrollSpeed;
      return obstacle.y <= GAME_CONFIG.HEIGHT;
    });

    let collectedId = null;
    rewardsRef.current = rewardsRef.current.filter(reward => {
      reward.y += scrollSpeed;
      if (reward.y > GAME_CONFIG.HEIGHT) return false;
      if (collectedRewardsRef.current.has(reward.id)) return true;

      if (onCollectReward) {
        const collected = onCollectReward(reward);
        if (collected) {
          collectedId = reward.id;
          return false;
        }
      }
      return true;
    });

    if (collectedId) {
      collectedRewardsRef.current.add(collectedId);
    }

    return {
      obstacles: obstaclesRef.current,
      rewards: rewardsRef.current.filter(r => !collectedRewardsRef.current.has(r.id))
    };
  }, []);

  return {
    obstaclesRef,
    rewardsRef,
    collectedRewardsRef,
    reset,
    update
  };
}
