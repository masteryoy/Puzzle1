const BOARD_SIZE = 8;
const COLORS = [
  "#f43f5e",
  "#fb7185",
  "#f59e0b",
  "#22c55e",
  "#0ea5e9",
  "#a855f7"
];
const GOAL = 2500;

const boardEl = document.getElementById("board");
const scoreEl = document.getElementById("score");
const movesEl = document.getElementById("moves");
const goalEl = document.getElementById("goal");
const restartBtn = document.getElementById("restartBtn");
const statusEl = document.getElementById("status");

let board = [];
let selectedIndex = null;
let score = 0;
let moves = 0;
let isResolving = false;

goalEl.textContent = String(GOAL);

function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function indexToRowCol(index) {
  return [Math.floor(index / BOARD_SIZE), index % BOARD_SIZE];
}

function areAdjacent(i1, i2) {
  const [r1, c1] = indexToRowCol(i1);
  const [r2, c2] = indexToRowCol(i2);
  return Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
}

function swapTiles(i1, i2) {
  [board[i1], board[i2]] = [board[i2], board[i1]];
}

function updateHud() {
  scoreEl.textContent = String(score);
  movesEl.textContent = String(moves);
}

function setStatus(message) {
  statusEl.textContent = message;
}

function createInitialBoard() {
  board = Array.from({ length: BOARD_SIZE * BOARD_SIZE }, randomColor);

  while (findMatches(board).size > 0) {
    board = board.map((value, index) => (findMatches(board).has(index) ? randomColor() : value));
  }
}

function findMatches(grid) {
  const matched = new Set();

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    let streak = 1;
    for (let col = 1; col <= BOARD_SIZE; col += 1) {
      const curr = row * BOARD_SIZE + col;
      const prev = row * BOARD_SIZE + (col - 1);
      if (col < BOARD_SIZE && grid[curr] === grid[prev]) {
        streak += 1;
      } else {
        if (streak >= 3) {
          for (let k = 0; k < streak; k += 1) {
            matched.add(row * BOARD_SIZE + (col - 1 - k));
          }
        }
        streak = 1;
      }
    }
  }

  for (let col = 0; col < BOARD_SIZE; col += 1) {
    let streak = 1;
    for (let row = 1; row <= BOARD_SIZE; row += 1) {
      const curr = row * BOARD_SIZE + col;
      const prev = (row - 1) * BOARD_SIZE + col;
      if (row < BOARD_SIZE && grid[curr] === grid[prev]) {
        streak += 1;
      } else {
        if (streak >= 3) {
          for (let k = 0; k < streak; k += 1) {
            matched.add((row - 1 - k) * BOARD_SIZE + col);
          }
        }
        streak = 1;
      }
    }
  }

  return matched;
}

function collapseBoard() {
  for (let col = 0; col < BOARD_SIZE; col += 1) {
    const remaining = [];
    for (let row = BOARD_SIZE - 1; row >= 0; row -= 1) {
      const idx = row * BOARD_SIZE + col;
      if (board[idx]) {
        remaining.push(board[idx]);
      }
    }

    for (let row = BOARD_SIZE - 1; row >= 0; row -= 1) {
      const idx = row * BOARD_SIZE + col;
      board[idx] = remaining[BOARD_SIZE - 1 - row] || randomColor();
    }
  }
}

function drawBoard(animatedMatches = new Set()) {
  boardEl.innerHTML = "";

  board.forEach((color, index) => {
    const tile = document.createElement("button");
    tile.className = "tile";
    tile.style.background = color;
    tile.dataset.index = String(index);
    tile.setAttribute("aria-label", `Bloque ${index + 1}`);

    if (selectedIndex === index) {
      tile.classList.add("selected");
    }

    if (animatedMatches.has(index)) {
      tile.classList.add("removing");
    }

    tile.addEventListener("click", () => handleTileClick(index));
    boardEl.appendChild(tile);
  });
}

function hasPossibleMoves() {
  for (let i = 0; i < board.length; i += 1) {
    const neighbors = [i + 1, i + BOARD_SIZE];
    for (const n of neighbors) {
      if (n >= board.length || !areAdjacent(i, n)) {
        continue;
      }
      const copy = [...board];
      [copy[i], copy[n]] = [copy[n], copy[i]];
      if (findMatches(copy).size > 0) {
        return true;
      }
    }
  }
  return false;
}

async function resolveMatches() {
  isResolving = true;
  let chain = 0;

  while (true) {
    const matches = findMatches(board);
    if (matches.size === 0) {
      break;
    }

    chain += 1;
    drawBoard(matches);
    await new Promise((resolve) => setTimeout(resolve, 220));

    matches.forEach((idx) => {
      board[idx] = null;
    });

    score += matches.size * 50 * chain;
    updateHud();
    collapseBoard();
    drawBoard();
    await new Promise((resolve) => setTimeout(resolve, 120));
  }

  if (!hasPossibleMoves()) {
    setStatus("Sin movimientos disponibles. Se mezcló el tablero.");
    createInitialBoard();
    drawBoard();
  } else if (score >= GOAL) {
    setStatus("¡Meta alcanzada! Puedes seguir jugando para mejorar tu puntuación.");
  } else {
    setStatus("Buen movimiento. Sigue combinando bloques.");
  }

  isResolving = false;
}

async function handleTileClick(index) {
  if (isResolving) {
    return;
  }

  if (selectedIndex === null) {
    selectedIndex = index;
    drawBoard();
    return;
  }

  if (selectedIndex === index) {
    selectedIndex = null;
    drawBoard();
    return;
  }

  if (!areAdjacent(selectedIndex, index)) {
    selectedIndex = index;
    drawBoard();
    setStatus("Selecciona un bloque adyacente para intercambiar.");
    return;
  }

  swapTiles(selectedIndex, index);
  drawBoard();

  const matches = findMatches(board);
  if (matches.size === 0) {
    swapTiles(selectedIndex, index);
    setStatus("Ese intercambio no crea combinación.");
    selectedIndex = null;
    drawBoard();
    return;
  }

  moves += 1;
  updateHud();
  selectedIndex = null;
  await resolveMatches();
}

function resetGame() {
  score = 0;
  moves = 0;
  selectedIndex = null;
  createInitialBoard();
  updateHud();
  drawBoard();
  setStatus("Nueva partida iniciada.");
}

restartBtn.addEventListener("click", resetGame);

resetGame();
