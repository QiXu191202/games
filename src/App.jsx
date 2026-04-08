import { useEffect, useRef, useCallback, useState } from 'react';
import './App.css';
import getRandomCar from '@/hooks/randomCar';
import { useKeyboardControls, useTouchControls } from '@/hooks/useKeyboardControls';
import { useGameObjects } from '@/hooks/useGameObjects';
import { useGameTimer } from '@/hooks/useGameTimer';

const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;
const CAR_SIZE = 40;
const CAR_SPEED = 4;
const SCROLL_SPEED = 3;
const OBSTACLE_COLOR = '#EF4444';
const REWARD_COLOR = '#22C55E';

function checkRectCollision(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
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

  const { reset: resetObjects, update: updateObjects } = useGameObjects();
  const { score, start, pause, resume, reset: resetTimer, addScore, triggerGameOver, formattedTime } = useGameTimer();

  const [gameState, setGameState] = useState('idle');

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
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const carImagePath = getRandomCar();
    const carImage = new Image();
    carImage.src = carImagePath;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#6B7280';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);

      const car = carRef.current;
      const move = moveStateRef.current;

      if (gameActiveRef.current) {
        if (move.up) car.y = Math.max(0, car.y - CAR_SPEED);
        if (move.down) car.y = Math.min(canvas.height - car.height, car.y + CAR_SPEED);
        if (move.left) car.x = Math.max(0, car.x - CAR_SPEED);
        if (move.right) car.x = Math.min(canvas.width - car.width, car.x + CAR_SPEED);

        const { obstacles, rewards } = updateObjects(SCROLL_SPEED, handleCollectReward);

        for (const obstacle of obstacles) {
          ctx.fillStyle = OBSTACLE_COLOR;
          ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

          if (checkRectCollision(
            { x: car.x, y: car.y, width: car.width, height: car.height },
            { x: obstacle.x, y: obstacle.y, width: obstacle.width, height: obstacle.height }
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
  }, [updateObjects, handleCollectReward, triggerGameOver]);

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
