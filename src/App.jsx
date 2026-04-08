import { useEffect, useRef, useState, useCallback } from 'react';
import './App.css';
import getRandomCar from '@/hooks/randomCar';

const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;
const CAR_SIZE = 40;
const SPEED = 5;
const OBSTACLE_COLOR = '#EF4444';
const REWARD_COLOR = '#22C55E';

function generateObstacles(count, excludeArea) {
  const obstacles = [];
  const padding = 20;
  const minSize = 40;
  const maxSize = 80;

  for (let i = 0; i < count; i++) {
    let attempts = 0;
    let newObstacle;

    do {
      const width = minSize + Math.random() * (maxSize - minSize);
      const height = minSize + Math.random() * (maxSize - minSize);
      newObstacle = {
        x: padding + Math.random() * (GAME_WIDTH - width - padding * 2),
        y: padding + Math.random() * (GAME_HEIGHT - height - padding * 2),
        width,
        height,
        id: `obstacle-${i}-${Date.now()}`
      };
      attempts++;
    } while (
      attempts < 50 &&
      (isOverlapping(newObstacle, excludeArea) || obstacles.some(o => isOverlapping(newObstacle, o)))
    );

    if (attempts < 50) {
      obstacles.push(newObstacle);
    }
  }

  return obstacles;
}

function generateRewards(count, obstacles, excludeArea) {
  const rewards = [];
  const rewardSize = 30;
  const padding = 20;

  for (let i = 0; i < count; i++) {
    let attempts = 0;
    let newReward;

    do {
      newReward = {
        x: padding + Math.random() * (GAME_WIDTH - rewardSize - padding * 2),
        y: padding + Math.random() * (GAME_HEIGHT - rewardSize - padding * 2),
        size: rewardSize,
        id: `reward-${i}-${Date.now()}`
      };
      attempts++;
    } while (
      attempts < 50 &&
      (isOverlapping(newReward, excludeArea) ||
       obstacles.some(o => isOverlapping(newReward, o)) ||
       rewards.some(r => isOverlapping(newReward, r)))
    );

    if (attempts < 50) {
      rewards.push(newReward);
    }
  }

  return rewards;
}

function isOverlapping(a, b) {
  return !(
    a.x + (a.width || a.size) < b.x ||
    b.x + b.width < a.x ||
    a.y + (a.height || a.size) < b.y ||
    b.y + b.height < a.y
  );
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
    x: 180,
    y: 500,
    width: CAR_SIZE,
    height: CAR_SIZE
  });

  const keysRef = useRef({
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
  });

  const obstaclesRef = useRef([]);
  const rewardsRef = useRef([]);
  const backgroundOffsetRef = useRef({ x: 0, y: 0 });
  const collectedRewardsRef = useRef(new Set());
  const gameStateRef = useRef('playing');
  const scoreRef = useRef(0);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  const resetGame = useCallback(() => {
    const car = { x: 180, y: 500, width: CAR_SIZE, height: CAR_SIZE };
    carRef.current = car;
    backgroundOffsetRef.current = { x: 0, y: 0 };
    collectedRewardsRef.current = new Set();
    scoreRef.current = 0;
    setScore(0);

    const obstacles = generateObstacles(8, { x: car.x, y: car.y, width: car.width, height: car.height });
    const rewards = generateRewards(5, obstacles, { x: car.x, y: car.y, width: car.width, height: car.height });
    obstaclesRef.current = obstacles;
    rewardsRef.current = rewards;
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
      if (Object.hasOwn(keysRef.current, e.key)) {
        keysRef.current[e.key] = true;
        e.preventDefault();
      }
    };

    const handleKeyUp = (e) => {
      if (Object.hasOwn(keysRef.current, e.key)) {
        keysRef.current[e.key] = false;
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

      const threshold = 10;
      keysRef.current.ArrowRight = deltaX > threshold;
      keysRef.current.ArrowLeft = deltaX < -threshold;
      keysRef.current.ArrowDown = deltaY > threshold;
      keysRef.current.ArrowUp = deltaY < -threshold;

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

      if (keysRef.current.ArrowUp) backgroundOffsetRef.current.y -= SPEED;
      if (keysRef.current.ArrowDown) backgroundOffsetRef.current.y += SPEED;
      if (keysRef.current.ArrowLeft) backgroundOffsetRef.current.x -= SPEED;
      if (keysRef.current.ArrowRight) backgroundOffsetRef.current.x += SPEED;

      const car = carRef.current;

      obstaclesRef.current.forEach(obstacle => {
        const adjustedX = obstacle.x - backgroundOffsetRef.current.x;
        const adjustedY = obstacle.y - backgroundOffsetRef.current.y;

        if (adjustedX > -obstacle.width && adjustedX < canvas.width &&
            adjustedY > -obstacle.height && adjustedY < canvas.height) {
          ctx.fillStyle = OBSTACLE_COLOR;
          ctx.fillRect(adjustedX, adjustedY, obstacle.width, obstacle.height);
        }

        const carScreenX = car.x;
        const carScreenY = car.y;

        if (checkRectCollision(
          { x: carScreenX, y: carScreenY, width: car.width, height: car.height },
          { x: adjustedX, y: adjustedY, width: obstacle.width, height: obstacle.height }
        )) {
          gameStateRef.current = 'gameover';
          setGameState('gameover');
        }
      });

      rewardsRef.current.forEach(reward => {
        if (collectedRewardsRef.current.has(reward.id)) return;

        const adjustedX = reward.x - backgroundOffsetRef.current.x;
        const adjustedY = reward.y - backgroundOffsetRef.current.y;

        if (adjustedX > -reward.size && adjustedX < canvas.width &&
            adjustedY > -reward.size && adjustedY < canvas.height) {
          ctx.fillStyle = REWARD_COLOR;
          ctx.beginPath();
          ctx.arc(adjustedX + reward.size / 2, adjustedY + reward.size / 2, reward.size / 2, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 16px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('+', adjustedX + reward.size / 2, adjustedY + reward.size / 2);
        }

        const carScreenX = car.x;
        const carScreenY = car.y;

        if (checkRectCollision(
          { x: carScreenX, y: carScreenY, width: car.width, height: car.height },
          { x: adjustedX, y: adjustedY, width: reward.size, height: reward.size }
        )) {
          collectedRewardsRef.current.add(reward.id);
          scoreRef.current += 10;
          setScore(scoreRef.current);
        }
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
