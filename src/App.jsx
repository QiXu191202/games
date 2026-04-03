import { useEffect, useRef, useState } from 'react';
import './App.css';
import { checkCollision, getSafePosition, willOverlap } from '@/hooks/useCollisionDetection';
import getRandomCar from '@/hooks/randomCar';

function App() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [position, setPosition] = useState({ x: 180, y: 500 });
  const keysRef = useRef({
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
  });
  const positionRef = useRef({ x: 180, y: 500 });

  // 障碍物状态
  const obstacleRef = useRef({
    x: 150,
    y: 300,
    width: 100,
    height: 30
  });

  // 背景偏移量
  const backgroundOffsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 小车图片
    const carImagePath = getRandomCar();
    const width = 40;
    const height = 40;
    const speed = 3; // 减小移动速度

    // 创建图片对象
    const carImage = new Image();
    carImage.src = carImagePath;

    // 碰撞提示标志
    let collisionAlerted = false;

    // 键盘事件监听
    const handleKeyDown = (e) => {
      if (keysRef.current.hasOwnProperty(e.key)) {
        keysRef.current[e.key] = true;
        e.preventDefault();
      }
    };

    const handleKeyUp = (e) => {
      if (keysRef.current.hasOwnProperty(e.key)) {
        keysRef.current[e.key] = false;
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // 等待图片加载完成后再开始动画
    carImage.onload = () => {
      animate();
    };

    carImage.onerror = () => {
      console.error('小车图片加载失败，使用备用方案');
      // 如果图片加载失败，使用简单的矩形作为备用
      animate();
    };

    const animate = () => {
      // 清除画布
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 绘制道路背景
      ctx.fillStyle = '#6B7280';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 绘制道路标线
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);

      // 从ref获取当前位置
      let newX = positionRef.current.x;
      let newY = positionRef.current.y;

      // 保存当前的背景偏移
      const oldBackgroundOffset = { ...backgroundOffsetRef.current };
      
      // 根据按键更新背景偏移量（方向相反）
      if (keysRef.current.ArrowUp) backgroundOffsetRef.current.y -= speed; // 上键现在是向下移动
      if (keysRef.current.ArrowDown) backgroundOffsetRef.current.y += speed; // 下键现在是向上移动
      if (keysRef.current.ArrowLeft) backgroundOffsetRef.current.x -= speed; // 左键现在是向右移动
      if (keysRef.current.ArrowRight) backgroundOffsetRef.current.x += speed; // 右键现在是向左移动

      // 边界检测
      newX = Math.max(0, Math.min(canvas.width - width, newX));
      newY = Math.max(0, Math.min(canvas.height - height, newY));

      // 碰撞检测和阻挡
      const obstacle = obstacleRef.current;
      const size = { width, height };

      // 考虑背景偏移的障碍物位置
      const adjustedObstacle = {
        ...obstacle,
        x: obstacle.x - backgroundOffsetRef.current.x,
        y: obstacle.y - backgroundOffsetRef.current.y
      };

      // 检查是否会碰撞
      const willCollide = checkCollision(
        positionRef.current,
        { x: newX, y: newY },
        adjustedObstacle,
        size
      );

      // 如果会碰撞，恢复背景偏移并阻止移动
      if (willCollide) {
        // 恢复背景偏移
        backgroundOffsetRef.current = oldBackgroundOffset;
        
        if (!collisionAlerted) {
          console.log('方块碰到了障碍物！');
          collisionAlerted = true;
        }
      } else {
        collisionAlerted = false; // 重置提示标志
        // 更新ref中的位置
        positionRef.current = { x: newX, y: newY };
        // 更新state（用于触发重绘）
        setPosition({ x: newX, y: newY });
      }

      // 绘制障碍物（考虑背景偏移）
      ctx.fillStyle = '#EF4444';
      ctx.fillRect(
        obstacle.x - backgroundOffsetRef.current.x,
        obstacle.y - backgroundOffsetRef.current.y,
        obstacle.width,
        obstacle.height
      );

      // 绘制小车
      if (carImage.complete && carImage.naturalWidth > 0) {
        ctx.drawImage(carImage, positionRef.current.x, positionRef.current.y, width, height);
      } else {
        // 备用方案：绘制简单的矩形小车
        ctx.fillStyle = '#3B82F6';
        ctx.fillRect(positionRef.current.x, positionRef.current.y, width, height);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    // 清理函数
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []); // 空依赖数组，只运行一次

  return (
    <>
      <section id='center'>
        <canvas
          ref={canvasRef}
          id="game"
          width="400"
          height="600"
        ></canvas>
      </section>
    </>
  );
}

export default App;