import { useEffect, useRef, useCallback, useState } from 'react';
import './App.css';
import getRandomCar from '@/hooks/randomCar';
import { useKeyboardControls, useTouchControls } from '@/hooks/useKeyboardControls';
import { useGameObjects } from '@/hooks/useGameObjects';
import { useGameTimer } from '@/hooks/useGameTimer';
import wallImage from '@/assets/wall-item.png';

const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;
const CAR_SIZE = 40;
const CAR_SPEED = 4;
const SCROLL_SPEED = 3;
const REWARD_COLOR = '#22C55E';
const ROAD_COLOR = '#3D3D3D';
const LANE_LINE_COLOR = '#F5F5DC';
const SHOULDER_COLOR = '#4A4A4A';

function checkRectCollision(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

function drawRoad(ctx, width, height, offset) {
  ctx.fillStyle = SHOULDER_COLOR;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = ROAD_COLOR;
  ctx.fillRect(10, 0, width - 20, height);

  ctx.fillStyle = '#2A2A2A';
  ctx.fillRect(12, 0, 4, height);
  ctx.fillRect(width - 16, 0, 4, height);

  const dashLength = 30;
  const gapLength = 20;
  const totalLength = dashLength + gapLength;
  const startY = (offset % totalLength + totalLength) % totalLength - dashLength;

  ctx.strokeStyle = LANE_LINE_COLOR;
  ctx.lineWidth = 3;
  ctx.setLineDash([dashLength, gapLength]);
  ctx.beginPath();
  ctx.moveTo(width / 2, startY);
  for (let y = startY; y < height; y += totalLength) {
    ctx.moveTo(width / 2, y);
    ctx.lineTo(width / 2, Math.min(y + dashLength, height));
  }
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#4A4A4A';
  for (let i = 0; i < 20; i++) {
    const x = (i * 67 + offset * 0.5) % width;
    const y = (i * 89 + offset * 0.3) % height;
    ctx.beginPath();
    ctx.arc(x, y, 1, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBrickWallFallback(ctx, obstacle) {
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
  ctx.strokeStyle = '#6B3510';
  ctx.lineWidth = 1;
  const brickWidth = 24;
  const brickHeight = obstacle.height;
  for (let x = 0; x <= obstacle.width; x += brickWidth) {
    ctx.beginPath();
    ctx.moveTo(x, obstacle.y);
    ctx.lineTo(x, obstacle.y + brickHeight);
    ctx.stroke();
  }
}

function App() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const carRef = useRef({
    x: (GAME_WIDTH - CAR_SIZE) / 2,
    y: GAME_HEIGHT - CAR_SIZE - 80,
    width: CAR_SIZE,
    height: CAR_SIZE
  });
  const moveStateRef = useRef({ up: false, down: false, left: false, right: false });
  const gameActiveRef = useRef(false);
  const roadOffsetRef = useRef(0);
  const wallImageRef = useRef(null);

  const { reset: resetObjects, update: updateObjects } = useGameObjects();
  const { score, start, pause, resume, reset: resetTimer, addScore, triggerGameOver, formattedTime } = useGameTimer();

  const [gameState, setGameState] = useState('idle');

  const drawBrickWall = useCallback((ctx, obstacle) => {
    const wallImg = wallImageRef.current;
    if (wallImg && wallImg.complete && wallImg.naturalWidth > 0) {
      const pattern = ctx.createPattern(wallImg, 'repeat');
      if (pattern) {
        ctx.save();
        ctx.translate(obstacle.x, obstacle.y);
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, obstacle.width, obstacle.height);
        ctx.strokeStyle = '#8B7355';
        ctx.lineWidth = 1;
        const brickWidth = 24;
        const brickHeight = obstacle.height;
        for (let x = 0; x <= obstacle.width; x += brickWidth) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, brickHeight);
          ctx.stroke();
        }
        ctx.restore();
        return;
      }
    }
    drawBrickWallFallback(ctx, obstacle);
  }, []);

  const handleMove = useCallback((state) => {
    moveStateRef.current = state;
  }, []);

  const handleDirection = useCallback((direction) => {
    moveStateRef.current = direction;
  }, []);

  useKeyboardControls(handleMove);
  useTouchControls(handleDirection);

  const handleStart = useCallback(() => {
    start();
    setGameState('playing');
    gameActiveRef.current = true;
  }, [start]);

  const handlePause = useCallback(() => {
    pause();
    setGameState('paused');
    gameActiveRef.current = false;
  }, [pause]);

  const handleResume = useCallback(() => {
    resume();
    setGameState('playing');
    gameActiveRef.current = true;
  }, [resume]);

  const handleReset = useCallback(() => {
    resetTimer();
    resetObjects();
    carRef.current = {
      x: (GAME_WIDTH - CAR_SIZE) / 2,
      y: GAME_HEIGHT - CAR_SIZE - 80,
      width: CAR_SIZE,
      height: CAR_SIZE
    };
    roadOffsetRef.current = 0;
    setGameState('idle');
    gameActiveRef.current = false;
  }, [resetTimer, resetObjects]);

  const handleCollectReward = useCallback((reward) => {
    const car = carRef.current;
    if (checkRectCollision(
      { x: car.x, y: car.y, width: car.width, height: car.height },
      { x: reward.x, y: reward.y, width: reward.size, height: reward.size }
    )) {
      addScore(10);
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

    const carImagePath = getRandomCar();
    const carImage = new Image();
    carImage.src = carImagePath;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (gameActiveRef.current) {
        roadOffsetRef.current += SCROLL_SPEED;
      }
      drawRoad(ctx, canvas.width, canvas.height, roadOffsetRef.current);

      const car = carRef.current;
      const move = moveStateRef.current;

      if (gameActiveRef.current) {
        if (move.up) car.y = Math.max(10, car.y - CAR_SPEED);
        if (move.down) car.y = Math.min(canvas.height - car.height - 10, car.y + CAR_SPEED);
        if (move.left) car.x = Math.max(15, car.x - CAR_SPEED);
        if (move.right) car.x = Math.min(canvas.width - car.width - 15, car.x + CAR_SPEED);

        const { obstacles, rewards } = updateObjects(SCROLL_SPEED, handleCollectReward);

        for (const obstacle of obstacles) {
          drawBrickWall(ctx, obstacle);

          if (checkRectCollision(
            { x: car.x, y: car.y, width: car.width, height: car.height },
            { x: obstacle.x + 2, y: obstacle.y + 2, width: obstacle.width - 4, height: obstacle.height - 4 }
          )) {
            gameActiveRef.current = false;
            setGameState('gameover');
            triggerGameOver();
            break;
          }
        }

        for (const reward of rewards) {
          ctx.fillStyle = REWARD_COLOR;
          ctx.beginPath();
          ctx.arc(reward.x + reward.size / 2, reward.y + reward.size / 2, reward.size / 2, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 14px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('+', reward.x + reward.size / 2, reward.y + reward.size / 2);
        }
      }

      if (carImage.complete && carImage.naturalWidth > 0) {
        ctx.drawImage(carImage, car.x, car.y, car.width, car.height);
      } else {
        ctx.fillStyle = '#3B82F6';
        ctx.fillRect(car.x, car.y, car.width, car.height);
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

  return (
    <>
      <section id='center'>
        <div className="score-display">
          <span>分数: {score}</span>
          <span className="time-display">{formattedTime}</span>
          {gameState === 'gameover' && <span className="game-over">游戏结束</span>}
        </div>
        <canvas
          ref={canvasRef}
          id="game"
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
        />
        <div className="button-row">
          {gameState === 'idle' && (
            <button className="start-btn" onClick={handleStart}>开始</button>
          )}
          {gameState === 'playing' && (
            <button className="pause-btn" onClick={handlePause}>暂停</button>
          )}
          {gameState === 'paused' && (
            <button className="resume-btn" onClick={handleResume}>继续</button>
          )}
          {gameState !== 'idle' && (
            <button className="restart-btn" onClick={handleReset}>重新开始</button>
          )}
        </div>
        <div className="controls-hint">
          方向键/WASD 移动 | 触摸滑动控制
        </div>
      </section>
    </>
  );
}

export default App;
