import { useEffect, useRef, useCallback } from 'react';
import { useGameObjects } from '@/hooks/useGameObjects';
import { useGameTimer } from '@/hooks/useGameTimer';
import { useKeyboardControls, useTouchControls } from '@/hooks/useKeyboardControls';
import { drawRoad } from '@/utils/drawRoad';
import { createBrickWallDrawer } from '@/utils/drawBrickWall';
import { drawCar } from '@/utils/drawCar';
import { drawRewards } from '@/utils/drawRewards';
import { CollisionEffect, ScorePopup, ScreenShake, soundManager } from '@/utils/collisionEffects';
import { checkRectCollision } from '@/hooks/useCollisionDetection';
import { GAME_CONFIG, CAR_BOUNDARY, OBSTACLE_CONFIG, REWARD_LEVELS, REWARD_TYPES } from '@/constants/gameConfig';
import getRandomCar from '@/hooks/randomCar';
import wallImage from '@/assets/wall-item.png';
import rewardImage from '@/assets/jiangli.png';
import speedUpImage from '@/assets/jiasu.png';
import speedDownImage from '@/assets/jiansu.png';

export function useGameController(onGameOver) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const carRef = useRef({
    x: (GAME_CONFIG.WIDTH - GAME_CONFIG.CAR_SIZE) / 2,
    y: GAME_CONFIG.HEIGHT - GAME_CONFIG.CAR_SIZE - GAME_CONFIG.INITIAL_CAR_Y_OFFSET,
    width: GAME_CONFIG.CAR_SIZE,
    height: GAME_CONFIG.CAR_SIZE
  });
  const moveStateRef = useRef({ up: false, down: false, left: false, right: false });
  const gameActiveRef = useRef(false);
  const roadOffsetRef = useRef(0);
  const scrollSpeedRef = useRef(GAME_CONFIG.SCROLL_SPEED);
  const wallImageRef = useRef(null);
  const carImageRef = useRef(null);
  const rewardImageRef = useRef(null);
  const speedUpImageRef = useRef(null);
  const speedDownImageRef = useRef(null);
  const effectsRef = useRef([]);

  const { reset: resetObjects, update: updateObjects } = useGameObjects();
  const { start, pause, resume, reset: resetTimer, addScore, triggerGameOver, score, formattedTime } = useGameTimer(onGameOver);

  const drawBrickWall = useCallback(
    (ctx, obstacle) => createBrickWallDrawer(wallImageRef)(ctx, obstacle),
    []
  );

  const handleMove = useCallback((state) => {
    moveStateRef.current = state;
  }, []);

  const handleDirection = useCallback((direction) => {
    moveStateRef.current = direction;
  }, []);

  const handleMobileLeft = useCallback((pressed) => {
    moveStateRef.current = { ...moveStateRef.current, left: pressed, mobileSpeed: pressed ? GAME_CONFIG.CAR_MOBILE_SPEED : 0 };
  }, []);

  const handleMobileRight = useCallback((pressed) => {
    moveStateRef.current = { ...moveStateRef.current, right: pressed, mobileSpeed: pressed ? GAME_CONFIG.CAR_MOBILE_SPEED : 0 };
  }, []);

  const handleStart = useCallback(() => {
    start();
    gameActiveRef.current = true;
  }, [start]);

  const handlePause = useCallback(() => {
    pause();
    gameActiveRef.current = false;
  }, [pause]);

  const handleResume = useCallback(() => {
    resume();
    gameActiveRef.current = true;
  }, [resume]);

  const handleReset = useCallback(() => {
    resetTimer();
    resetObjects();
    carRef.current = {
      x: (GAME_CONFIG.WIDTH - GAME_CONFIG.CAR_SIZE) / 2,
      y: GAME_CONFIG.HEIGHT - GAME_CONFIG.CAR_SIZE - GAME_CONFIG.INITIAL_CAR_Y_OFFSET,
      width: GAME_CONFIG.CAR_SIZE,
      height: GAME_CONFIG.CAR_SIZE
    };
    roadOffsetRef.current = 0;
    scrollSpeedRef.current = GAME_CONFIG.SCROLL_SPEED;
    gameActiveRef.current = false;
    effectsRef.current = [];
  }, [resetTimer, resetObjects]);

  const handleCollectReward = useCallback((reward) => {
    const car = carRef.current;
    if (checkRectCollision(
      { x: car.x, y: car.y, width: car.width, height: car.height },
      { x: reward.x, y: reward.y, width: reward.size, height: reward.size }
    )) {
      const levelConfig = REWARD_LEVELS[reward.level] || REWARD_LEVELS[0];
      
      if (levelConfig.type === REWARD_TYPES.SCORE) {
        addScore(levelConfig.score);
        effectsRef.current.push(
          new ScorePopup(
            reward.x + reward.size / 2,
            reward.y,
            levelConfig.score
          )
        );
      } else if (levelConfig.type === REWARD_TYPES.SPEED_UP) {
        scrollSpeedRef.current = Math.min(scrollSpeedRef.current + levelConfig.speedChange, 10);
        effectsRef.current.push(
          new ScorePopup(
            reward.x + reward.size / 2,
            reward.y,
            'UP'
          )
        );
      } else if (levelConfig.type === REWARD_TYPES.SPEED_DOWN) {
        scrollSpeedRef.current = Math.max(scrollSpeedRef.current + levelConfig.speedChange, 1);
        effectsRef.current.push(
          new ScorePopup(
            reward.x + reward.size / 2,
            reward.y,
            'DOWN'
          )
        );
      }
      
      effectsRef.current.push(
        new CollisionEffect(
          reward.x + reward.size / 2,
          reward.y + reward.size / 2,
          reward.level
        )
      );
      
      if (levelConfig.shakeIntensity > 0) {
        effectsRef.current.push(new ScreenShake(levelConfig.shakeIntensity));
      }
      
      if (levelConfig.sound) {
        soundManager.init();
        soundManager.playCollectSound(reward.level);
      }
      
      if (levelConfig.vibrate) {
        soundManager.vibrate([50, 30, 50]);
      }
      
      return true;
    }
    return false;
  }, [addScore]);

  useEffect(() => {
    const wallImg = new Image();
    wallImg.src = wallImage;
    wallImg.onload = () => {
      wallImageRef.current = wallImg;
    };
  }, []);

  useEffect(() => {
    const rewardImg = new Image();
    rewardImg.src = rewardImage;
    rewardImg.onload = () => {
      rewardImageRef.current = rewardImg;
    };
  }, []);

  useEffect(() => {
    const speedUpImg = new Image();
    speedUpImg.src = speedUpImage;
    speedUpImg.onload = () => {
      speedUpImageRef.current = speedUpImg;
    };
  }, []);

  useEffect(() => {
    const speedDownImg = new Image();
    speedDownImg.src = speedDownImage;
    speedDownImg.onload = () => {
      speedDownImageRef.current = speedDownImg;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let carImage = carImageRef.current;
    if (!carImage) {
      const carImagePath = getRandomCar();
      carImage = new Image();
      carImage.src = carImagePath;
      carImageRef.current = carImage;
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      let shakeOffset = { x: 0, y: 0 };
      for (const effect of effectsRef.current) {
        if (effect instanceof ScreenShake) {
          shakeOffset = effect.getOffset();
          break;
        }
      }
      
      ctx.save();
      ctx.translate(shakeOffset.x, shakeOffset.y);

      if (gameActiveRef.current) {
        roadOffsetRef.current += scrollSpeedRef.current;
      }
      drawRoad(ctx, canvas.width, canvas.height, roadOffsetRef.current);

      const car = carRef.current;
      const move = moveStateRef.current;

      if (gameActiveRef.current) {
        const speed = move.mobileSpeed || GAME_CONFIG.CAR_SPEED;
        if (move.up) car.y = Math.max(CAR_BOUNDARY.VERTICAL_MARGIN, car.y - speed);
        if (move.down) car.y = Math.min(canvas.height - car.height - CAR_BOUNDARY.VERTICAL_MARGIN, car.y + speed);
        if (move.left) car.x = Math.max(CAR_BOUNDARY.HORIZONTAL_MARGIN, car.x - speed);
        if (move.right) car.x = Math.min(canvas.width - car.width - CAR_BOUNDARY.HORIZONTAL_MARGIN, car.x + speed);

        const { obstacles, rewards } = updateObjects(scrollSpeedRef.current, handleCollectReward);

        for (const obstacle of obstacles) {
          drawBrickWall(ctx, obstacle);

          if (checkRectCollision(
            { x: car.x, y: car.y, width: car.width, height: car.height },
            {
              x: obstacle.x + OBSTACLE_CONFIG.COLLISION_PADDING,
              y: obstacle.y + OBSTACLE_CONFIG.COLLISION_PADDING,
              width: obstacle.width - OBSTACLE_CONFIG.COLLISION_PADDING * 2,
              height: obstacle.height - OBSTACLE_CONFIG.COLLISION_PADDING * 2
            }
          )) {
            gameActiveRef.current = false;
            triggerGameOver();
            break;
          }
        }

        drawRewards(ctx, rewards, {
          rewardImage: rewardImageRef.current,
          speedUpImage: speedUpImageRef.current,
          speedDownImage: speedDownImageRef.current
        });
      }

      drawCar(ctx, car, carImage);

      ctx.restore();

      for (let i = effectsRef.current.length - 1; i >= 0; i--) {
        if (!effectsRef.current[i].update()) {
          effectsRef.current.splice(i, 1);
        } else {
          effectsRef.current[i].draw(ctx);
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    carImage.onload = () => animate();
    carImage.onerror = () => animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [drawBrickWall, updateObjects, handleCollectReward, triggerGameOver]);

  useKeyboardControls(handleMove);
  useTouchControls(handleDirection);

  return {
    canvasRef,
    score,
    formattedTime,
    gameActiveRef,
    handleStart,
    handlePause,
    handleResume,
    handleReset,
    handleMobileLeft,
    handleMobileRight
  };
}
