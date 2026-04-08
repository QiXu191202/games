import { useEffect, useRef, useState, useCallback } from 'react';
import './App.css';
import getRandomCar from '@/hooks/randomCar';

const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;
const CAR_SIZE = 40;
const CAR_SPEED = 4;
const SCROLL_SPEED = 3;
const OBSTACLE_COLOR = '#EF4444';
const REWARD_COLOR = '#22C55E';

function generateObstacle() {
  const minSize = 40;
  const maxSize = 60;
  const width = minSize + Math.random() * (maxSize - minSize);
  const height = minSize + Math.random() * (maxSize - minSize);

  return {
    x: 20 + Math.random() * (GAME_WIDTH - width - 40),
    y: -height - 20,
    width,
    height,
    id: `obstacle-${Date.now()}-${Math.random()}`
  };
}

function generateReward() {
  const size = 25;

  return {
    x: 30 + Math.random() * (GAME_WIDTH - size - 60),
    y: -size - 20,
    size,
    id: `reward-${Date.now()}-${Math.random()}`
  };
}

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
  const touchStartRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('playing');

  const carRef = useRef({
    x: (GAME_WIDTH - CAR_SIZE) / 2,
    y: GAME_HEIGHT - CAR_SIZE - 80,
    width: CAR_SIZE,
    height: CAR_SIZE
  });

  const keysRef = useRef({
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    KeyW: false,
    KeyS: false,
    KeyA: false,
    KeyD: false
  });

  const obstaclesRef = useRef([]);
  const rewardsRef = useRef([]);
  const collectedRewardsRef = useRef(new Set());
  const gameStateRef = useRef('playing');
  const scoreRef = useRef(0);
  const spawnTimerRef = useRef(0);
  const rewardSpawnTimerRef = useRef(0);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  const resetGame = useCallback(() => {
    carRef.current = {
      x: (GAME_WIDTH - CAR_SIZE) / 2,
      y: GAME_HEIGHT - CAR_SIZE - 80,
      width: CAR_SIZE,
      height: CAR_SIZE
    };
    obstaclesRef.current = [];
    rewardsRef.current = [];
    collectedRewardsRef.current = new Set();
    scoreRef.current = 0;
    spawnTimerRef.current = 0;
    rewardSpawnTimerRef.current = 0;
    setScore(0);
    gameStateRef.current = 'playing';
    setGameState('playing');
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const carImagePath = getRandomCar();
    const carImage = new Image();
    carImage.src = carImagePath;

    const handleKeyDown = (e) => {
      if (Object.hasOwn(keysRef.current, e.code)) {
        keysRef.current[e.code] = true;
        e.preventDefault();
      }
    };

    const handleKeyUp = (e) => {
      if (Object.hasOwn(keysRef.current, e.code)) {
        keysRef.current[e.code] = false;
        e.preventDefault();
      }
    };

    const handleTouchStart = (e) => {
      if (gameStateRef.current !== 'playing') {
        resetGame();
        return;
      }
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      if (!touchStartRef.current || gameStateRef.current !== 'playing') return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;

      const threshold = 5;
      keysRef.current.ArrowLeft = deltaX < -threshold;
      keysRef.current.ArrowRight = deltaX > threshold;
      keysRef.current.ArrowUp = deltaY < -threshold;
      keysRef.current.ArrowDown = deltaY > threshold;

      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchEnd = () => {
      keysRef.current.ArrowUp = false;
      keysRef.current.ArrowDown = false;
      keysRef.current.ArrowLeft = false;
      keysRef.current.ArrowRight = false;
      touchStartRef.current = null;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);

    const animate = () => {
      if (gameStateRef.current === 'gameover') {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

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

      const upPressed = keysRef.current.ArrowUp || keysRef.current.KeyW;
      const downPressed = keysRef.current.ArrowDown || keysRef.current.KeyS;
      const leftPressed = keysRef.current.ArrowLeft || keysRef.current.KeyA;
      const rightPressed = keysRef.current.ArrowRight || keysRef.current.KeyD;

      if (upPressed) car.y = Math.max(0, car.y - CAR_SPEED);
      if (downPressed) car.y = Math.min(canvas.height - car.height, car.y + CAR_SPEED);
      if (leftPressed) car.x = Math.max(0, car.x - CAR_SPEED);
      if (rightPressed) car.x = Math.min(canvas.width - car.width, car.x + CAR_SPEED);

      spawnTimerRef.current++;
      if (spawnTimerRef.current >= 60) {
        obstaclesRef.current.push(generateObstacle());
        spawnTimerRef.current = 0;
      }

      rewardSpawnTimerRef.current++;
      if (rewardSpawnTimerRef.current >= 90) {
        rewardsRef.current.push(generateReward());
        rewardSpawnTimerRef.current = 0;
      }

      obstaclesRef.current = obstaclesRef.current.filter(obstacle => {
        obstacle.y += SCROLL_SPEED;

        if (obstacle.y > canvas.height) return false;

        ctx.fillStyle = OBSTACLE_COLOR;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

        if (checkRectCollision(
          { x: car.x, y: car.y, width: car.width, height: car.height },
          { x: obstacle.x, y: obstacle.y, width: obstacle.width, height: obstacle.height }
        )) {
          gameStateRef.current = 'gameover';
          setGameState('gameover');
        }

        return true;
      });

      rewardsRef.current = rewardsRef.current.filter(reward => {
        reward.y += SCROLL_SPEED;

        if (reward.y > canvas.height) return false;
        if (collectedRewardsRef.current.has(reward.id)) return true;

        ctx.fillStyle = REWARD_COLOR;
        ctx.beginPath();
        ctx.arc(reward.x + reward.size / 2, reward.y + reward.size / 2, reward.size / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('+', reward.x + reward.size / 2, reward.y + reward.size / 2);

        if (checkRectCollision(
          { x: car.x, y: car.y, width: car.width, height: car.height },
          { x: reward.x, y: reward.y, width: reward.size, height: reward.size }
        )) {
          collectedRewardsRef.current.add(reward.id);
          scoreRef.current += 10;
          setScore(scoreRef.current);
          return false;
        }

        return true;
      });

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
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [resetGame]);

  return (
    <>
      <section id='center'>
        <div className="score-display">
          <span>分数: {score}</span>
          {gameState === 'gameover' && <span className="game-over">游戏结束</span>}
        </div>
        <canvas
          ref={canvasRef}
          id="game"
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
        />
        {gameState === 'gameover' && (
          <button className="restart-btn" onClick={resetGame}>
            重新开始
          </button>
        )}
        <div className="controls-hint">
          方向键/WASD 移动 | 触摸滑动控制
        </div>
      </section>
    </>
  );
}

export default App;
