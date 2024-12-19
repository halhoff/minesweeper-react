import React, { useState, useEffect } from 'react';
import clsx from 'clsx';

const numMines = [10, 40, 99];

let visited: boolean[][];

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
  onClick,
  started,
  floodFill,
  clicked,
  updateClicked,
  changeStarted,
}: {
  value: number, 
  isLastInRow: boolean,
  isLastInCol: boolean,
  board: number[][],
  size_x: number,
  size_y: number,
  onClick: (value: number) => void,
  started: boolean,
  floodFill: (init_x: number, init_y: number, flooded: number[], visited: boolean[][]) => number[],
  clicked: boolean[][],
  updateClicked: (x: number, y: number) => void,
  changeStarted: (value: number) => void,
}) {
  const x = Math.floor(value / size_y);
  const y = value % size_y;
  const [isMine, setIsMine] = useState(false);
  const [minesAdjacent, setMinesAdjacent] = useState(0);
  const [isFlagged, setIsFlagged] = useState(false);
  useEffect(() => {
    if (board.length > 0 && board[x][y] === -1) {
      setIsMine(true);
    }
    else if (board.length > 0 && board[x][y] > 0) {
      setMinesAdjacent(board[x][y]);
    }
  }, [x, y, board]);
  const renderTile = () => {
    updateClicked(x, y);
  }
  const handleRightClick = (event) => {
    event.preventDefault();
    setIsFlagged(!isFlagged);
  }
  return (
    <button
      className={clsx(
        'container aspect-[1/1] p-4 text-white border-2 border-gray-300 w-16 h-16',
        clicked[x][y] ? 'bg-white' : 'bg-black',
        !isLastInRow ? 'border-b-0' : '',
        !isLastInCol ? 'border-r-0' : '',
      )}
      onClick={() => {
        renderTile();
        onClick(value);
        changeStarted(value);
      }}
      onContextMenu={handleRightClick}
    >
      {isMine && clicked[x][y] && (
        <div className="flex justify-center items-center w-full h-full">
          <span className="text-red-500 text-5xl">O</span>
        </div>
      )}
      {minesAdjacent > 0 && clicked[x][y] && (
        <div className="flex justify-center items-center w-full h-full">
          <span className="text-red-500 text-5xl">{minesAdjacent}</span>
        </div>
      )}
      {isFlagged && !clicked[x][y] && (
        <div className="flex justify-center items-center w-full h-full">
          <span className="text-red-500 text-5xl">F</span>
        </div>
      )}
    </button>
  );
}

function Game({difficulty}: {difficulty: number}) {
  const [board, setBoard] = useState<number[][]>([]);
  const [started, setStarted] = useState(false);
  const [clickCoords, setClickCoords] = useState<number[]>([]);
  if (difficulty < 0 || difficulty > 2) {
    throw new Error("Supported difficulties are 0, 1, and 2");
  }
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

  const [clicked, setClicked] = useState<boolean[][]>(() => {
    return Array.from({ length: size_x }, () => Array(size_y).fill(false));
  });
  visited = Array.from({ length: size_x }, () => Array(size_y).fill(false));

  function handleClick(value: number) {
    if (!started) {
      const newBoard = generateBoard(size_x, size_y, value, difficulty);
      setBoard(newBoard);
    }
  }
  
  useEffect(() => {
    if (board.length > 0) {
      let toFlood = floodFill(clickCoords[0], clickCoords[1], []);
      for (let i = 0; i < toFlood.length; ++i) {
        const flood_x = Math.floor(toFlood[i] / size_y);
        const flood_y = toFlood[i] % size_y;
        updateClicked(flood_x, flood_y);
      }
      setStarted(true);
    }
  }, [clickCoords]);

  function floodFill(init_x: number, init_y: number, flooded: number[]) {
    if (!visited[init_x][init_y] && board[init_x][init_y] >= 0) {
      visited[init_x][init_y] = true;
      flooded.push(init_x * size_y + init_y);
      if (board[init_x][init_y] === 0) {
        if (init_x > 0 && !visited[init_x - 1][init_y]) { floodFill(init_x - 1, init_y, flooded); }
        if (init_x < size_x - 1 && !visited[init_x + 1][init_y]) { floodFill(init_x + 1, init_y, flooded); }
        if (init_y > 0 && !visited[init_x][init_y - 1]) { floodFill(init_x, init_y - 1, flooded); }
        if (init_y < size_y - 1 && !visited[init_x][init_y + 1]) { floodFill(init_x, init_y + 1, flooded); }
        if (init_x > 0 && init_y > 0 && !visited[init_x - 1][init_y - 1]) { floodFill(init_x - 1, init_y - 1, flooded); }
        if (init_x > 0 && init_y < size_y - 1 && !visited[init_x - 1][init_y + 1]) { floodFill(init_x - 1, init_y + 1, flooded); }
        if (init_x < size_x - 1 && init_y > 0 && !visited[init_x + 1][init_y - 1]) { floodFill(init_x + 1, init_y - 1, flooded); }
        if (init_x < size_x - 1 && init_y < size_y - 1 && !visited[init_x + 1][init_y + 1]) { floodFill(init_x + 1, init_y + 1, flooded); }
      }
    }
    return flooded;
  }

  function updateClicked(x: number, y: number) {
    setClicked(prev => {
      const newClicked = prev.map(row => row.slice());
      newClicked[x][y] = true;
      return newClicked;
    });
  }

  function changeClickCoords(value: number) {
    setClickCoords([Math.floor(value / size_y), value % size_y]);
  }

  return (
    <div
      className={clsx(
        'justify-self-center border-2 border-black grid', {
          'grid-cols-9 grid-rows-9': difficulty === 0,
          'grid-cols-16 grid-rows-16': difficulty === 1,
          'grid-cols-30 grid-rows-16': difficulty === 2,
        })}
        style={{
          gridTemplateColumns: `repeat(${size_y}, 1fr)`,
          gridTemplateRows: `repeat(${size_x}, 1fr)`,
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
            onClick={handleClick}
            started={started}
            floodFill={floodFill}
            clicked={clicked}
            updateClicked={updateClicked}
            changeStarted={changeClickCoords}
          />
        )})}
    </div>
  );
}

export default Game;
