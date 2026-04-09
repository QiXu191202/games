import { useEffect, useRef, useCallback } from 'react';
import { useGameObjects } from '@/hooks/useGameObjects';
import { useGameTimer } from '@/hooks/useGameTimer';
import { useKeyboardControls, useTouchControls } from '@/hooks/useKeyboardControls';
import { drawRoad } from '@/utils/drawRoad';
import { createBrickWallDrawer } from '@/utils/drawBrickWall';
import { drawCar } from '@/utils/drawCar';
import { drawRewards } from '@/utils/drawRewards';
import { checkRectCollision } from '@/hooks/useCollisionDetection';
import { GAME_CONFIG, CAR_BOUNDARY, OBSTACLE_CONFIG, REWARD_CONFIG } from '@/constants/gameConfig';
import getRandomCar from '@/hooks/randomCar';
import wallImage from '@/assets/wall-item.png';

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
  const wallImageRef = useRef(null);
  const carImageRef = useRef(null);

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
    gameActiveRef.current = false;
  }, [resetTimer, resetObjects]);

  const handleCollectReward = useCallback((reward) => {
    const car = carRef.current;
    if (checkRectCollision(
      { x: car.x, y: car.y, width: car.width, height: car.height },
      { x: reward.x, y: reward.y, width: reward.size, height: reward.size }
    )) {
      addScore(REWARD_CONFIG.SCORE_VALUE);
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

      if (gameActiveRef.current) {
        roadOffsetRef.current += GAME_CONFIG.SCROLL_SPEED;
      }
      drawRoad(ctx, canvas.width, canvas.height, roadOffsetRef.current);

      const car = carRef.current;
      const move = moveStateRef.current;

      if (gameActiveRef.current) {
        if (move.up) car.y = Math.max(CAR_BOUNDARY.VERTICAL_MARGIN, car.y - GAME_CONFIG.CAR_SPEED);
        if (move.down) car.y = Math.min(canvas.height - car.height - CAR_BOUNDARY.VERTICAL_MARGIN, car.y + GAME_CONFIG.CAR_SPEED);
        if (move.left) car.x = Math.max(CAR_BOUNDARY.HORIZONTAL_MARGIN, car.x - GAME_CONFIG.CAR_SPEED);
        if (move.right) car.x = Math.min(canvas.width - car.width - CAR_BOUNDARY.HORIZONTAL_MARGIN, car.x + GAME_CONFIG.CAR_SPEED);

        const { obstacles, rewards } = updateObjects(GAME_CONFIG.SCROLL_SPEED, handleCollectReward);

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

        drawRewards(ctx, rewards);
      }

      drawCar(ctx, car, carImage);

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
    handleReset
  };
}
