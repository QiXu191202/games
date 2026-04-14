import { useRef, useCallback } from 'react';
import { GAME_CONFIG, OBSTACLE_CONFIG, REWARD_CONFIG, REWARD_LEVELS } from '@/constants/gameConfig';

const ROAD_LEFT = 15;
const ROAD_RIGHT = GAME_CONFIG.WIDTH - 15;

const divideRoadIntoLanes = () => {
  const roadWidth = ROAD_RIGHT - ROAD_LEFT;
  const laneWidth = roadWidth / 3;
  return {
    left: { start: ROAD_LEFT, end: ROAD_LEFT + laneWidth, center: ROAD_LEFT + laneWidth / 2 },
    middle: { start: ROAD_LEFT + laneWidth, end: ROAD_LEFT + laneWidth * 2, center: ROAD_LEFT + laneWidth * 1.5 },
    right: { start: ROAD_LEFT + laneWidth * 2, end: ROAD_RIGHT, center: ROAD_LEFT + laneWidth * 2.5 },
    laneWidth
  };
};

const getObstacleWidth = () => {
  return OBSTACLE_CONFIG.MIN_WIDTH + 
    Math.random() * (OBSTACLE_CONFIG.MAX_WIDTH - OBSTACLE_CONFIG.MIN_WIDTH);
};

export function generateObstacle(isMovingObstacle = false) {
  const lanes = divideRoadIntoLanes();
  const carSize = GAME_CONFIG.CAR_SIZE;
  const minPassageWidth = carSize + 20;

  const pattern = Math.random();
  
  if (pattern < 0.25) {
    const middleLane = lanes.middle;
    const width = getObstacleWidth();
    const maxWidth = Math.min(width, middleLane.end - middleLane.start - minPassageWidth);
    return {
      x: middleLane.start + (middleLane.end - middleLane.start - maxWidth) / 2,
      y: -OBSTACLE_CONFIG.HEIGHT - 20,
      width: maxWidth,
      height: OBSTACLE_CONFIG.HEIGHT,
      id: `obstacle-${Date.now()}-${Math.random()}`
    };
  }
  
  if (pattern < 0.5) {
    const leftWidth = getObstacleWidth();
    const rightWidth = getObstacleWidth();
    const passageWidth = lanes.middle.end - lanes.middle.start;
    
    if (passageWidth >= minPassageWidth) {
      return {
        x: ROAD_LEFT,
        y: -OBSTACLE_CONFIG.HEIGHT - 20,
        width: leftWidth,
        height: OBSTACLE_CONFIG.HEIGHT,
        id: `obstacle-${Date.now()}-${Math.random()}`,
        pairedObstacle: {
          x: ROAD_RIGHT - rightWidth,
          width: rightWidth,
          height: OBSTACLE_CONFIG.HEIGHT
        }
      };
    }
  }
  
  if (pattern < 0.75) {
    const leftLane = lanes.left;
    const rightLane = lanes.right;
    const width = lanes.laneWidth * 0.8;
    
    const leftX = leftLane.start + (lanes.laneWidth - width) / 2;
    const rightX = rightLane.start + (lanes.laneWidth - width) / 2;
    
    return {
      x: leftX,
      y: -OBSTACLE_CONFIG.HEIGHT - 20,
      width,
      height: OBSTACLE_CONFIG.HEIGHT,
      id: `obstacle-${Date.now()}-${Math.random()}`,
      pairedObstacle: {
        x: rightX,
        width,
        height: OBSTACLE_CONFIG.HEIGHT
      }
    };
  }
  
  const middleWidth = getObstacleWidth() * 0.7;
  const sideWidth = getObstacleWidth() * 0.5;
  
  const leftObstacle = {
    x: lanes.left.start + (lanes.laneWidth - sideWidth) / 2,
    width: sideWidth,
    height: OBSTACLE_CONFIG.HEIGHT
  };
  
  const middleObstacle = {
    x: lanes.middle.start + (lanes.laneWidth - middleWidth) / 2,
    width: middleWidth,
    height: OBSTACLE_CONFIG.HEIGHT
  };
  
  const rightObstacle = {
    x: lanes.right.start + (lanes.laneWidth - sideWidth) / 2,
    width: sideWidth,
    height: OBSTACLE_CONFIG.HEIGHT
  };
  
  const config = Math.random();
  if (config < 0.5) {
    return {
      x: leftObstacle.x,
      y: -OBSTACLE_CONFIG.HEIGHT - 20,
      width: leftObstacle.width,
      height: OBSTACLE_CONFIG.HEIGHT,
      id: `obstacle-${Date.now()}-${Math.random()}`,
      pairedObstacle: middleObstacle
    };
  } else {
    return {
      x: middleObstacle.x,
      y: -OBSTACLE_CONFIG.HEIGHT - 20,
      width: middleObstacle.width,
      height: OBSTACLE_CONFIG.HEIGHT,
      id: `obstacle-${Date.now()}-${Math.random()}`,
      pairedObstacle: rightObstacle
    };
  }
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
  const obstacleCountRef = useRef(0);

  const reset = useCallback(() => {
    obstaclesRef.current = [];
    rewardsRef.current = [];
    collectedRewardsRef.current = new Set();
    spawnTimerRef.current = 0;
    rewardSpawnTimerRef.current = 0;
    obstacleCountRef.current = 0;
  }, []);

  const update = useCallback((scrollSpeed, onCollectReward) => {
    spawnTimerRef.current++;
    if (spawnTimerRef.current >= OBSTACLE_CONFIG.SPAWN_INTERVAL) {
      obstacleCountRef.current++;
      const isMovingObstacle = obstacleCountRef.current % 10 === 0;
      const obstacle = generateObstacle(isMovingObstacle);
      
      if (isMovingObstacle && obstacle) {
        obstacle.moving = true;
        obstacle.moveRange = 30 + Math.random() * 20;
        obstacle.moveSpeed = 1.5 + Math.random() * 1;
        obstacle.movePhase = 0;
        obstacle.initialX = obstacle.x;
      }
      
      obstaclesRef.current.push(obstacle);
      if (obstacle.pairedObstacle) {
        const paired = {
          ...obstacle.pairedObstacle,
          x: obstacle.pairedObstacle.x,
          y: obstacle.y,
          id: `obstacle-${Date.now()}-${Math.random()}`
        };
        if (isMovingObstacle) {
          paired.moving = true;
          paired.moveRange = 30 + Math.random() * 20;
          paired.moveSpeed = 1.5 + Math.random() * 1;
          paired.movePhase = Math.PI;
          paired.initialX = paired.x;
        }
        obstaclesRef.current.push(paired);
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
      if (obstacle.moving) {
        obstacle.movePhase += obstacle.moveSpeed * 0.05;
        const offset = Math.sin(obstacle.movePhase) * obstacle.moveRange;
        obstacle.x = Math.max(ROAD_LEFT, Math.min(ROAD_RIGHT - obstacle.width, obstacle.initialX + offset));
      }
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
