import { useState, useCallback } from 'react';
import './App.css';
import { useGameController } from '@/components/Game';
import { GameCanvas, GameUI, GameControls } from '@/components/GameUI';

function App() {
  const [gameState, setGameState] = useState('idle');

  const handleGameOver = useCallback(() => {
    setGameState('gameover');
  }, []);

  const {
    canvasRef,
    score,
    formattedTime,
    handleStart,
    handlePause,
    handleResume,
    handleReset,
    handleMobileLeft,
    handleMobileRight
  } = useGameController(handleGameOver);

  const onStart = useCallback(() => {
    handleStart();
    setGameState('playing');
  }, [handleStart]);

  const onPause = useCallback(() => {
    handlePause();
    setGameState('paused');
  }, [handlePause]);

  const onResume = useCallback(() => {
    handleResume();
    setGameState('playing');
  }, [handleResume]);

  const onReset = useCallback(() => {
    handleReset();
    setGameState('idle');
  }, [handleReset]);

  return (
    <section id='center'>
      <GameUI
        score={score}
        formattedTime={formattedTime}
        gameState={gameState}
      />
      <GameCanvas canvasRef={canvasRef} />
      <GameControls
        gameState={gameState}
        onStart={onStart}
        onPause={onPause}
        onResume={onResume}
        onReset={onReset}
        onLeftBtn={handleMobileLeft}
        onRightBtn={handleMobileRight}
      />
    </section>
  );
}

export default App;
