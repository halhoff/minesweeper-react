import React, { useState, useEffect, useCallback } from 'react';
import clsx from 'clsx';

const numMines = [10, 40, 99];

function generateBoard(size_x: number, size_y: number, value: number, difficulty: number) {
  let board: number[][] = [];
  for (let j = 0; j < size_x; ++j) {
    let new_x: number[] = [];
    for (let i = 0; i < size_y; ++i) {
      new_x.push(0);
    }
    board.push(new_x);
  }
  const init_x = Math.floor(value / size_y);
  const init_y = value % size_y;
  board[init_x][init_y] = 0;
  if (init_x > 0) { board[init_x - 1][init_y] = 0; }
  if (init_x < size_x - 1) { board[init_x + 1][init_y] = 0; }
  if (init_y > 0) { board[init_x][init_y - 1] = 0; }
  if (init_y < size_y - 1) { board[init_x][init_y + 1] = 0; }
  if (init_x > 0 && init_y > 0) { board[init_x - 1][init_y - 1] = 0; }
  if (init_x > 0 && init_y < size_y - 1) { board[init_x - 1][init_y + 1] = 0; }
  if (init_x < size_x - 1 && init_y > 0) { board[init_x + 1][init_y - 1] = 0; }
  if (init_x < size_x - 1 && init_y < size_y - 1) { board[init_x + 1][init_y + 1] = 0; }
  for (let i = 0; i < numMines[difficulty]; ++i) {
    let mine_x = Math.floor(Math.random() * size_x);
    let mine_y = Math.floor(Math.random() * size_y);
    if (board[mine_x][mine_y] === -1 || (-1 <= init_x - mine_x && init_x - mine_x <= 1 && -1 <= init_y - mine_y && init_y - mine_y <= 1)) {
      --i;
    }
    else {
      board[mine_x][mine_y] = -1;
    }
  }
  for (let j = 0; j < size_x; ++j) {
    for (let i = 0; i < size_y; ++i) {
      if (board[j][i] === -1) {
        if (j > 0 && board[j - 1][i] !== -1) { board[j - 1][i] += 1; }
        if (j < size_x - 1 && board[j + 1][i] !== -1) { board[j + 1][i] += 1; }
        if (i > 0 && board[j][i - 1] !== -1) { board[j][i - 1] += 1; }
        if (i < size_y - 1 && board[j][i + 1] !== -1) { board[j][i + 1] += 1; }
        if (j > 0 && i > 0 && board[j - 1][i - 1] !== -1) { board[j - 1][i - 1] += 1; }
        if (j > 0 && i < size_y - 1 && board[j - 1][i + 1] !== -1) { board[j - 1][i + 1] += 1; }
        if (j < size_x - 1 && i > 0 && board[j + 1][i - 1] !== -1) { board[j + 1][i - 1] += 1; }
        if (j < size_x - 1 && i < size_y - 1 && board[j + 1][i + 1] !== -1) { board[j + 1][i + 1] += 1; }
      }
    }
  }
  return board;
}

function Tile({
  value,
  isLastInRow,
  isLastInCol,
  board,
  size_x,
  size_y,
  handleLeftClick,
  revealed,
  flaggedTiles,
  setFlaggedTiles,
  updateClicked,
  changeClickCoords,
  gameEndToggle,
  setNumFlagsLeft,
}: {
  value: number, 
  isLastInRow: boolean,
  isLastInCol: boolean,
  board: number[][],
  size_x: number,
  size_y: number,
  handleLeftClick: (value: number, isMine: boolean) => void,
  revealed: boolean[][],
  flaggedTiles: boolean[][],
  setFlaggedTiles: React.Dispatch<React.SetStateAction<boolean[][]>>,
  updateClicked: (x: number, y: number) => void,
  changeClickCoords: (value: number) => void,
  gameEndToggle: boolean,
  setNumFlagsLeft: React.Dispatch<React.SetStateAction<number>>,
}) {

  const x = Math.floor(value / size_y);
  const y = value % size_y;
  const [isMine, setIsMine] = useState(false);
  const [minesAdjacent, setMinesAdjacent] = useState(0);
  const [isFlagged, setIsFlagged] = useState(false);

  useEffect(() => {
    if (board.length > 0) {
      if (board[x][y] === -1) setIsMine(true);
      else setIsMine(false);
      if (board[x][y] >= 0) setMinesAdjacent(board[x][y]);
    }
    else {
      setIsMine(false);
      setMinesAdjacent(0);
    }
  }, [board, x, y]);

  useEffect(() => {
    setIsFlagged(flaggedTiles[x][y]);
  }, [flaggedTiles, x, y]);

  const renderTile = () => {
    updateClicked(x, y);
  }

  const handleRightClick = (event) => {
    event.preventDefault();
    if (!gameEndToggle) {
      const newFlaggedState = [...flaggedTiles];
      if (!isFlagged && !revealed[x][y]) {
        setNumFlagsLeft(prev => prev - 1);
      }
      else if (isFlagged && !revealed[x][y]) {
        setNumFlagsLeft(prev => prev + 1);
      }
      newFlaggedState[x][y] = !isFlagged;
      setFlaggedTiles(newFlaggedState);
    }
  };

  return (
    <button
      className={clsx(
        'container aspect-[1/1] text-white border-2 border-gray-600',
        revealed[x][y] && isMine ? 'bg-red-900' : 
        (revealed[x][y] && !isMine ? 'bg-blue-900' : 'bg-darkblue'),
        !isLastInRow ? 'border-b-0' : '',
        !isLastInCol ? 'border-r-0' : ''
      )}
      onClick={() => {
        if (!gameEndToggle && !isFlagged) {
          renderTile();
          handleLeftClick(value, isMine);
          changeClickCoords(value); 
        }
      }}
      onContextMenu={handleRightClick}
    >
      <div className="flex justify-center items-center w-full h-full">
        <span 
          className={clsx({
            'text-blue-500': minesAdjacent === 1,
            'text-green-500': minesAdjacent === 2,
            'text-red-500': minesAdjacent === 3,
            'text-purple-500': minesAdjacent === 4,
            'text-yellow-500': minesAdjacent === 5,
            'text-teal-500': minesAdjacent === 6,
            'text-gray-900': minesAdjacent === 7,
            'text-gray-800': minesAdjacent === 8,
            'text-red-900': isFlagged && !revealed[x][y],
          })}
          style={{
            fontSize: ((window.innerHeight - 100) / size_x) / 2 + 'px'
          }}
        >
          {revealed[x][y]
            ? isMine
              ? 'O'
              : minesAdjacent > 0
              ? minesAdjacent : null
            : isFlagged
            ? 'F' : null}
        </span>
      </div>
    </button>
  );
}

function Game({difficulty}: {difficulty: number}) {
  const [board, setBoard] = useState<number[][]>([]);
  const [started, setStarted] = useState(false);
  const [clickCoords, setClickCoords] = useState<number[]>([]);
  const [gameOverMessage, setGameEndMessage] = useState("");
  const [gameEndToggle, setGameEndToggle] = useState(false);
  const [numFlagsLeft, setNumFlagsLeft] = useState(numMines[difficulty]);

  let tiles: number[] = [];
  let size_x = -1;
  let size_y = -1;
  if (difficulty === 0) {
    tiles = Array.from({ length: 81 }, (_, index) => index);
    size_x = 9;
    size_y = 9;
  }
  else if (difficulty === 1) {
    tiles = Array.from({ length: 256 }, (_, index) => index);
    size_x = 16;
    size_y = 16;
  }
  else if (difficulty === 2) {
    tiles = Array.from({ length: 480 }, (_, index) => index);
    size_x = 16;
    size_y = 30;
  }
  
  const [revealed, setRevealed] = useState<boolean[][]>(() => {
    return Array.from({ length: size_x }, () => Array(size_y).fill(false));
  });

  const [revealedCount, setRevealedCount] = useState(0);

  const [flaggedTiles, setFlaggedTiles] = useState<boolean[][]>(() => {
    return Array.from({ length: size_x }, () => Array(size_y).fill(false));
  });

  let visited = Array.from({ length: size_x }, () => Array(size_y).fill(false));

  function handleLeftClick(value: number, isMine: boolean) {
    if (!started) {
      const newBoard = generateBoard(size_x, size_y, value, difficulty);
      setBoard(newBoard);
    }
    if (isMine) {
      setGameEndMessage('Game Over<br />Press ENTER to restart');
      setGameEndToggle(true);
      setRevealed(Array.from({ length: size_x }, () => Array(size_y).fill(true)));
    }
  }

  useEffect(() => {
    if (revealedCount === size_x * size_y - numMines[difficulty]) {
      setGameEndMessage('You won<br />Press ENTER to restart');
    }
  }, [revealedCount, difficulty, size_x, size_y])

  const floodFill = useCallback((x: number, y: number, flooded: number[]) => {
    if (!visited[x][y] && board[x][y] >= 0) {
      visited[x][y] = true;
      setRevealedCount(prevRevealedCount => prevRevealedCount + 1);
      flooded.push(x * size_y + y);
      if (board[x][y] === 0) {
        if (x > 0 && !visited[x - 1][y]) { floodFill(x - 1, y, flooded); }
        if (x < size_x - 1 && !visited[x + 1][y]) { floodFill(x + 1, y, flooded); }
        if (y > 0 && !visited[x][y - 1]) { floodFill(x, y - 1, flooded); }
        if (y < size_y - 1 && !visited[x][y + 1]) { floodFill(x, y + 1, flooded); }
        if (x > 0 && y > 0 && !visited[x - 1][y - 1]) { floodFill(x - 1, y - 1, flooded); }
        if (x > 0 && y < size_y - 1 && !visited[x - 1][y + 1]) { floodFill(x - 1, y + 1, flooded); }
        if (x < size_x - 1 && y > 0 && !visited[x + 1][y - 1]) { floodFill(x + 1, y - 1, flooded); }
        if (x < size_x - 1 && y < size_y - 1 && !visited[x + 1][y + 1]) { floodFill(x + 1, y + 1, flooded); }
      }
    }
    return flooded;
  }, [board, size_x, size_y]);
  
  useEffect(() => {
    if (clickCoords.length > 0 && board.length > 0 && !visited[clickCoords[0]][clickCoords[1]]) {
      let toFlood = floodFill(clickCoords[0], clickCoords[1], []);
      for (let i = 0; i < toFlood.length; ++i) {
        const flood_x = Math.floor(toFlood[i] / size_y);
        const flood_y = toFlood[i] % size_y;
        updateClicked(flood_x, flood_y);
      }
      setStarted(true);
    }
  }, [clickCoords, board, floodFill, size_y]);

  function updateClicked(x: number, y: number) {
    setRevealed(prev => {
      const newRevealed = prev.map(row => row.slice());
      newRevealed[x][y] = true;
      if (flaggedTiles[x][y]) {
        setNumFlagsLeft(prev => prev + 1);
        const newFlaggedState = [...flaggedTiles];
        newFlaggedState[x][y] = !flaggedTiles[x][y];
        setFlaggedTiles(newFlaggedState);
      }
      return newRevealed;
    });
  }

  function changeClickCoords(value: number) {
    setClickCoords([Math.floor(value / size_y), value % size_y]);
  }

  const handleReset = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      reset();
    }
  }

  function reset() {
    if (difficulty === 0) {
      tiles = Array.from({ length: 81 }, (_, index) => index);
      size_x = 9;
      size_y = 9;
    }
    else if (difficulty === 1) {
      tiles = Array.from({ length: 256 }, (_, index) => index);
      size_x = 16;
      size_y = 16;
    }
    else if (difficulty === 2) {
      tiles = Array.from({ length: 480 }, (_, index) => index);
      size_x = 16;
      size_y = 30;
    }
    setStarted(false);
    setBoard([]);
    setRevealed(Array.from({ length: size_x }, () => Array(size_y).fill(false)));
    setFlaggedTiles(Array.from({ length: size_x }, () => Array(size_y).fill(false)));
    setGameEndMessage("")
    setGameEndToggle(false);
    visited = Array.from({ length: size_x }, () => Array(size_y).fill(false));
    setClickCoords([]);
    setRevealedCount(0);
    setNumFlagsLeft(numMines[difficulty]);
  }

  useEffect(() => {
    window.addEventListener('keydown', handleReset);
    return () => {
      window.removeEventListener('keydown', handleReset);
    };
  }, []);

  useEffect(() => {
    reset();
  }, [difficulty]);

  return (
    <div>
      <div className="text-white left-1/2 transform -translate-x-1/2 absolute mt-4"
        style={{ fontSize: ((window.innerHeight - 250) / size_x) / 2 + 'px' }}>
        Flags left: {numFlagsLeft}
      </div>
      <div
        className={clsx(
          'justify-center border-2 border-black grid', {
            'grid-cols-9 grid-rows-9': difficulty === 0,
            'grid-cols-16 grid-rows-16': difficulty === 1,
            'grid-cols-30 grid-rows-16': difficulty === 2,
          })}
          style={{
            gridTemplateColumns: `repeat(${size_y}, ${(window.innerHeight - 300) / size_x}px`,
            gridTemplateRows: `repeat(${size_x}, ${(window.innerHeight - 300) / size_x}px)`,
            paddingTop: (window.innerHeight - 200) / size_x,
          }}
      >
        {tiles.map((tile, index) => {
          const row = Math.floor(index / size_y);
          const col = index % size_y;
          const isLastInRow = row === size_x - 1;
          const isLastInCol = col === size_y - 1;
          return (
            <Tile
              key={tile}
              value={tile}
              isLastInRow={isLastInRow}
              isLastInCol={isLastInCol}
              board={board}
              size_x={size_x}
              size_y={size_y}
              handleLeftClick={handleLeftClick}
              revealed={revealed}
              flaggedTiles={flaggedTiles}
              setFlaggedTiles={setFlaggedTiles}
              updateClicked={updateClicked}
              changeClickCoords={changeClickCoords}
              gameEndToggle={gameEndToggle}
              setNumFlagsLeft={setNumFlagsLeft}
            />
          )})}
      </div>
      {
        <div
        className="text-white text-center absolute top-[25%] left-1/2 transform -translate-x-1/2 font-bold text-outline"
        style={{
          fontSize: ((window.innerHeight - 100) / size_x) + 'px', 
        }}
        dangerouslySetInnerHTML={{ __html: gameOverMessage }}
      />
      
      }
    </div>  
  );
}

export default Game;
