import React, { useState } from 'react';
import Game from './Game.tsx';
import './global.css';

function App() {
  const [difficulty, setDifficulty] = useState(0);

  const handleDifficultyChange = (newDifficulty: number) => {
    setDifficulty(newDifficulty);
  };

  return (
    <div className="container bg-black min-w-full min-h-screen">
      <header className="text-center">
        <p className="text-xl text-white p-4">Minesweeper by halhoff</p>
        <div className="text-white">
          <button onClick={() => handleDifficultyChange(0)}>Easy</button>
          <button className="px-4 py-2" onClick={() => handleDifficultyChange(1)}>Medium</button>
          <button onClick={() => handleDifficultyChange(2)}>Hard</button>
        </div>
      </header>
      <Game key={difficulty} difficulty={difficulty} />
    </div>
  );
}

export default App;
