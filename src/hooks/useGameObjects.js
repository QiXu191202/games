import { useRef, useCallback } from 'react';
import { GAME_CONFIG, OBSTACLE_CONFIG, REWARD_CONFIG, REWARD_LEVELS } from '@/constants/gameConfig';

export function generateObstacle() {
  const width = OBSTACLE_CONFIG.MIN_WIDTH +
    Math.random() * (OBSTACLE_CONFIG.MAX_WIDTH - OBSTACLE_CONFIG.MIN_WIDTH);

  return {
    x: 15 + Math.random() * (GAME_CONFIG.WIDTH - width - 30),
    y: -OBSTACLE_CONFIG.HEIGHT - 20,
    width,
    height: OBSTACLE_CONFIG.HEIGHT,
    id: `obstacle-${Date.now()}-${Math.random()}`
  };
}

export function generateReward() {
  const levelIndex = Math.floor(Math.random() * REWARD_LEVELS.length);
  const level = REWARD_LEVELS[levelIndex];

  return {
    x: 30 + Math.random() * (GAME_CONFIG.WIDTH - level.size - 60),
    y: -level.size - 20,
    size: level.size,
    score: level.score,
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
      obstaclesRef.current.push(generateObstacle());
      spawnTimerRef.current = 0;
    }

    rewardSpawnTimerRef.current++;
    if (rewardSpawnTimerRef.current >= REWARD_CONFIG.SPAWN_INTERVAL) {
      rewardsRef.current.push(generateReward());
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
