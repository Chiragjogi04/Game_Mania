document.addEventListener('DOMContentLoaded', () => {
  const board = document.getElementById('connect-four-board');
  const modal = document.getElementById('result-modal');
  const modalMessage = document.getElementById('modal-message');
  const modalRestart = document.getElementById('modal-restart');

  const vsPlayerBtn = document.getElementById('vs-player');
  const vsComputerBtn = document.getElementById('vs-computer');
  const difficultySelect = document.getElementById('difficulty-select');
  const difficultyWrapper = document.getElementById('difficulty-wrapper');

  const rows = 6;
  const cols = 7;
  let grid = [];
  let currentPlayer = 1;
  let gameOver = false;
  let vsComputer = false;

  function initBoard() {
    board.innerHTML = '';
    grid = Array(rows).fill().map(() => Array(cols).fill(0));
    gameOver = false;
    currentPlayer = 1;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.row = r;
        cell.dataset.col = c;
        cell.addEventListener('click', handleCellClick);
        board.appendChild(cell);
      }
    }
  }

  function handleCellClick(e) {
    if (gameOver) return;

    const col = parseInt(e.target.dataset.col);

    for (let r = rows - 1; r >= 0; r--) {
      if (grid[r][col] === 0) {
        grid[r][col] = currentPlayer;
        const index = r * cols + col;
        board.children[index].classList.add(currentPlayer === 1 ? 'player1' : 'player2');

        if (checkWin(r, col)) {
          const winner = vsComputer && currentPlayer === 2 ? 'Computer' : `Player ${currentPlayer}`;
          showResultPopup(`${winner} wins! 🎉`);
          recordConnectFourResult(currentPlayer === 1 ? 'win' : 'lose');
          gameOver = true;
          return;
        } else if (grid.flat().every(cell => cell !== 0)) {
          showResultPopup(`It's a draw!`);
          recordConnectFourResult('draw');
          gameOver = true;
          return;
        }

        currentPlayer = currentPlayer === 1 ? 2 : 1;

        if (vsComputer && currentPlayer === 2 && !gameOver) {
          setTimeout(computerMove, 300);
        }

        return;
      }
    }
  }

  function computerMove() {
    const difficulty = difficultySelect.value;

    let col;
    if (difficulty === 'easy') {
      col = randomColumn();
    } else if (difficulty === 'medium') {
      col = blockOrRandom();
    } else {
      col = minimaxMove(3);
    }

    for (let r = rows - 1; r >= 0; r--) {
      if (grid[r][col] === 0) {
        grid[r][col] = currentPlayer;
        const index = r * cols + col;
        board.children[index].classList.add('player2');

        if (checkWin(r, col)) {
          showResultPopup(`Computer wins! 🤖`);
          recordConnectFourResult('lose');
          gameOver = true;
          return;
        } else if (grid.flat().every(cell => cell !== 0)) {
          showResultPopup(`It's a draw!`);
          recordConnectFourResult('draw');
          gameOver = true;
          return;
        }

        currentPlayer = 1;
        return;
      }
    }
  }

  function randomColumn() {
    let validCols = [];
    for (let c = 0; c < cols; c++) {
      if (grid[0][c] === 0) validCols.push(c);
    }
    return validCols[Math.floor(Math.random() * validCols.length)];
  }

  function blockOrRandom() {
    for (let c = 0; c < cols; c++) {
      for (let r = rows - 1; r >= 0; r--) {
        if (grid[r][c] === 0) {
          grid[r][c] = 2;
          if (checkWin(r, c)) { grid[r][c] = 0; return c; }
          grid[r][c] = 0;
          break;
        }
      }
    }
    for (let c = 0; c < cols; c++) {
      for (let r = rows - 1; r >= 0; r--) {
        if (grid[r][c] === 0) {
          grid[r][c] = 1;
          if (checkWin(r, c)) { grid[r][c] = 0; return c; }
          grid[r][c] = 0;
          break;
        }
      }
    }
    return randomColumn();
  }

  function minimaxMove(depth) {
    let validCols = [];
    for (let c = 0; c < cols; c++) {
      if (grid[0][c] === 0) validCols.push(c);
    }
    let bestScore = -Infinity;
    let bestCol = validCols[0];
    for (let col of validCols) {
      const tempGrid = JSON.parse(JSON.stringify(grid));
      for (let r = rows - 1; r >= 0; r--) {
        if (tempGrid[r][col] === 0) {
          tempGrid[r][col] = 2;
          const score = minimax(tempGrid, depth - 1, false);
          if (score > bestScore) {
            bestScore = score;
            bestCol = col;
          }
          break;
        }
      }
    }
    return bestCol;
  }

  function minimax(tempGrid, depth, isMaximizing) {
    if (depth === 0) return 0;
    if (checkWinInGrid(tempGrid, 2)) return 100;
    if (checkWinInGrid(tempGrid, 1)) return -100;

    let validCols = [];
    for (let c = 0; c < cols; c++) {
      if (tempGrid[0][c] === 0) validCols.push(c);
    }

    if (validCols.length === 0) return 0;

    if (isMaximizing) {
      let best = -Infinity;
      for (let col of validCols) {
        const newGrid = JSON.parse(JSON.stringify(tempGrid));
        for (let r = rows - 1; r >= 0; r--) {
          if (newGrid[r][col] === 0) {
            newGrid[r][col] = 2;
            const score = minimax(newGrid, depth - 1, false);
            best = Math.max(best, score);
            break;
          }
        }
      }
      return best;
    } else {
      let best = Infinity;
      for (let col of validCols) {
        const newGrid = JSON.parse(JSON.stringify(tempGrid));
        for (let r = rows - 1; r >= 0; r--) {
          if (newGrid[r][col] === 0) {
            newGrid[r][col] = 1;
            const score = minimax(newGrid, depth - 1, true);
            best = Math.min(best, score);
            break;
          }
        }
      }
      return best;
    }
  }

  function checkWinInGrid(tempGrid, player) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (tempGrid[r][c] === player) {
          if (checkDirectionInGrid(tempGrid, r, c, 1, 0, player) ||
              checkDirectionInGrid(tempGrid, r, c, 0, 1, player) ||
              checkDirectionInGrid(tempGrid, r, c, 1, 1, player) ||
              checkDirectionInGrid(tempGrid, r, c, 1, -1, player)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  function checkDirectionInGrid(tempGrid, row, col, dr, dc, player) {
    let count = 1;
    count += countInDirectionInGrid(tempGrid, row, col, dr, dc, player);
    count += countInDirectionInGrid(tempGrid, row, col, -dr, -dc, player);
    return count >= 4;
  }

  function countInDirectionInGrid(tempGrid, row, col, dr, dc, player) {
    let r = row + dr;
    let c = col + dc;
    let count = 0;
    while (r >= 0 && r < rows && c >= 0 && c < cols && tempGrid[r][c] === player) {
      count++;
      r += dr;
      c += dc;
    }
    return count;
  }

  function checkWin(row, col) {
    return checkDirection(row, col, 1, 0) || 
           checkDirection(row, col, 0, 1) || 
           checkDirection(row, col, 1, 1) || 
           checkDirection(row, col, 1, -1);
  }

  function checkDirection(row, col, dr, dc) {
    let count = 1;
    count += countInDirection(row, col, dr, dc);
    count += countInDirection(row, col, -dr, -dc);
    return count >= 4;
  }

  function countInDirection(row, col, dr, dc) {
    let r = row + dr;
    let c = col + dc;
    let count = 0;
    while (r >= 0 && r < rows && c >= 0 && c < cols && grid[r][c] === currentPlayer) {
      count++;
      r += dr;
      c += dc;
    }
    return count;
  }

  function showResultPopup(text) {
    modalMessage.textContent = text;
    modal.classList.add('show');
  }

  modalRestart.addEventListener('click', () => {
    modal.classList.remove('show');
    initBoard();
  });

  vsPlayerBtn.addEventListener('click', () => {
    vsComputer = false;
    difficultyWrapper.style.display = 'none';
    initBoard();
  });

  vsComputerBtn.addEventListener('click', () => {
    vsComputer = true;
    difficultyWrapper.style.display = 'block';
    initBoard();
  });

  function recordConnectFourResult(result) {
    fetch('/record_result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `game=connect_four&result=${result}`
    });
  }
});
