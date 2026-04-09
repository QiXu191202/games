import { useRef, useCallback } from 'react';

const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;

export function generateObstacle() {
  const minWidth = 60;
  const maxWidth = 120;
  const height = 25;
  const width = minWidth + Math.random() * (maxWidth - minWidth);

  return {
    x: 15 + Math.random() * (GAME_WIDTH - width - 30),
    y: -height - 20,
    width,
    height,
    id: `obstacle-${Date.now()}-${Math.random()}`
  };
}

export function generateReward() {
  const size = 25;

  return {
    x: 30 + Math.random() * (GAME_WIDTH - size - 60),
    y: -size - 20,
    size,
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
    if (spawnTimerRef.current >= 50) {
      obstaclesRef.current.push(generateObstacle());
      spawnTimerRef.current = 0;
    }

    rewardSpawnTimerRef.current++;
    if (rewardSpawnTimerRef.current >= 70) {
      rewardsRef.current.push(generateReward());
      rewardSpawnTimerRef.current = 0;
    }

    obstaclesRef.current = obstaclesRef.current.filter(obstacle => {
      obstacle.y += scrollSpeed;
      return obstacle.y <= GAME_HEIGHT;
    });

    let collectedId = null;
    rewardsRef.current = rewardsRef.current.filter(reward => {
      reward.y += scrollSpeed;
      if (reward.y > GAME_HEIGHT) return false;
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
