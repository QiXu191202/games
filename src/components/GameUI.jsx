import { GAME_CONFIG } from '@/constants/gameConfig';

export function GameCanvas({ canvasRef }) {
  return (
    <canvas
      ref={canvasRef}
      id="game"
      width={GAME_CONFIG.WIDTH}
      height={GAME_CONFIG.HEIGHT}
    />
  );
}

export function GameUI({
  score,
  formattedTime,
  gameState
}) {
  return (
    <div className="score-display">
      <span>分数: {score}</span>
      <span className="time-display">{formattedTime}</span>
      {gameState === 'gameover' && <span className="game-over">游戏结束</span>}
    </div>
  );
}

export function GameControls({
  gameState,
  onStart,
  onPause,
  onResume,
  onReset,
  onLeftBtn,
  onRightBtn
}) {
  return (
    <div className="game-controls">
      <div className="button-row">
        {gameState === 'idle' && (
          <button className="start-btn" onClick={onStart}>开始</button>
        )}
        {gameState === 'playing' && (
          <button className="pause-btn" onClick={onPause}>暂停</button>
        )}
        {gameState === 'paused' && (
          <button className="resume-btn" onClick={onResume}>继续</button>
        )}
        {gameState !== 'idle' && (
          <button className="restart-btn" onClick={onReset}>重新开始</button>
        )}
      </div>
      <div className="mobile-controls">
        <button
          className="mobile-btn left-btn"
          onMouseDown={() => onLeftBtn?.(true)}
          onMouseUp={() => onLeftBtn?.(false)}
          onMouseLeave={() => onLeftBtn?.(false)}
          onTouchStart={(e) => { e.preventDefault(); onLeftBtn?.(true); }}
          onTouchEnd={(e) => { e.preventDefault(); onLeftBtn?.(false); }}
        >
          ◀
        </button>
        <button
          className="mobile-btn right-btn"
          onMouseDown={() => onRightBtn?.(true)}
          onMouseUp={() => onRightBtn?.(false)}
          onMouseLeave={() => onRightBtn?.(false)}
          onTouchStart={(e) => { e.preventDefault(); onRightBtn?.(true); }}
          onTouchEnd={(e) => { e.preventDefault(); onRightBtn?.(false); }}
        >
          ▶
        </button>
      </div>
      <div className="controls-hint">
        方向键/WASD 移动 | 触摸滑动控制
      </div>
    </div>
  );
}
