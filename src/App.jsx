import { useEffect, useRef, useState } from 'react';
import './App.css';

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 小方块的属性
    const width = 40;
    const height = 40;
    const speed = 5;

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

    const animate = () => {
      // 清除画布
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 从ref获取当前位置
      let newX = positionRef.current.x;
      let newY = positionRef.current.y;

      // 根据按键更新位置
      if (keysRef.current.ArrowUp) newY -= speed;
      if (keysRef.current.ArrowDown) newY += speed;
      if (keysRef.current.ArrowLeft) newX -= speed;
      if (keysRef.current.ArrowRight) newX += speed;

      // 边界检测
      newX = Math.max(0, Math.min(canvas.width - width, newX));
      newY = Math.max(0, Math.min(canvas.height - height, newY));

      // 更新ref中的位置
      positionRef.current = { x: newX, y: newY };

      // 更新state（用于触发重绘）
      setPosition({ x: newX, y: newY });

      // 绘制小方块
      ctx.fillStyle = '#3B82F6';
      ctx.fillRect(newX, newY, width, height);

      animationRef.current = requestAnimationFrame(animate);
    };

    // 开始动画
    animate();

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