import React from 'react';
import Game from './Game.tsx';
import './global.css';

function App() {
  return (
    <div className="container bg-black min-w-full min-h-screen">
      <header className="text-center">
        <p className="text-xl text-white p-4">Minesweeper by halhoff</p>
        <Game difficulty={0} />
      </header>
    </div>
  );
}

export default App;
