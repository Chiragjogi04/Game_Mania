document.addEventListener('DOMContentLoaded', () => {
  const cells = Array.from(document.querySelectorAll('.ttt-cell'));
  const status = document.getElementById('ttt-status');
  const modeSelect = document.getElementById('ttt-mode');
  const difficultySelect = document.getElementById('ttt-difficulty');
  const difficultyLabel = document.getElementById('difficulty-label');

  const modal = document.getElementById('ttt-result-modal');
  const modalMessage = document.getElementById('ttt-modal-message');
  const modalRestart = document.getElementById('ttt-modal-restart');

  let board = Array(9).fill(null);
  let turn = 'X';
  let running = true;

  const winLines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  function checkWin() {
    for (let [a,b,c] of winLines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
    }
    return board.every(v => v) ? 'draw' : null;
  }

  function easyCpuMove() {
    const empty = board.map((v,i) => v ? null : i).filter(v => v !== null);
    if (empty.length) board[empty[Math.floor(Math.random() * empty.length)]] = 'O';
  }

  function mediumCpuMove() {
    for (let [a,b,c] of winLines) {
      const line = [board[a], board[b], board[c]];
      if (line.filter(v => v === 'O').length === 2 && line.includes(null)) {
        let idx = [a,b,c][line.indexOf(null)];
        board[idx] = 'O'; return;
      }
    }
    for (let [a,b,c] of winLines) {
      const line = [board[a], board[b], board[c]];
      if (line.filter(v => v === 'X').length === 2 && line.includes(null)) {
        let idx = [a,b,c][line.indexOf(null)];
        board[idx] = 'O'; return;
      }
    }
    easyCpuMove();
  }

  function hardCpuMove() {
    const bestMove = minimax(board, 'O').index;
    board[bestMove] = 'O';
  }

  function minimax(newBoard, player) {
    const availSpots = newBoard.map((v,i) => v ? null : i).filter(v => v !== null);

    if (checkWinner(newBoard, 'X')) return {score: -10};
    if (checkWinner(newBoard, 'O')) return {score: 10};
    if (availSpots.length === 0) return {score: 0};

    const moves = [];
    for (let i = 0; i < availSpots.length; i++) {
      const idx = availSpots[i];
      const move = { index: idx };
      newBoard[idx] = player;

      if (player === 'O') {
        const result = minimax(newBoard, 'X');
        move.score = result.score;
      } else {
        const result = minimax(newBoard, 'O');
        move.score = result.score;
      }

      newBoard[idx] = null;
      moves.push(move);
    }

    let bestMove, bestScore;
    if (player === 'O') {
      bestScore = -Infinity;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score > bestScore) {
          bestScore = moves[i].score; bestMove = i;
        }
      }
    } else {
      bestScore = Infinity;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score < bestScore) {
          bestScore = moves[i].score; bestMove = i;
        }
      }
    }
    return moves[bestMove];
  }

  function checkWinner(board, player) {
    return winLines.some(([a, bIndex, c]) =>
      board[a] === player && board[bIndex] === player && board[c] === player
    );
  }

  function updateBoard() {
    cells.forEach((cell,i) => {
      cell.textContent = board[i] || '';
    });

    const result = checkWin();
    if (result && running) {
      running = false;
      const text = result === 'draw' ? "It's a draw!" : `${result} wins!`;
      status.textContent = text;
      showResultModal(text);
    } else if (running) {
      status.textContent = `Turn: ${turn}`;
    }
  }

  function cpuMove() {
    const diff = difficultySelect.value;
    if (diff === 'easy') easyCpuMove();
    else if (diff === 'medium') mediumCpuMove();
    else hardCpuMove();
  }

  cells.forEach((cell,i) => {
    cell.addEventListener('click', () => {
      if (!running || board[i]) return;

      board[i] = turn;

      if (modeSelect.value === 'cpu' && turn === 'X') {
        turn = 'O'; updateBoard();
        if (running) {
          setTimeout(() => {
            cpuMove();
            turn = 'X'; updateBoard();
          }, 300);
        }
      } else {
        turn = turn === 'X' ? 'O' : 'X';
        updateBoard();
      }
    });
  });

  document.getElementById('reset-btn').addEventListener('click', reset);
  modalRestart.addEventListener('click', reset);

  function reset() {
    board = Array(9).fill(null);
    turn = 'X';
    running = true;
    status.textContent = '';
    modal.style.display = 'none';
    modal.classList.remove('winner-glow');
    updateBoard();
  }

  modeSelect.addEventListener('change', () => {
    difficultySelect.style.display = modeSelect.value === 'cpu' ? 'inline' : 'none';
    difficultyLabel.style.display = modeSelect.value === 'cpu' ? 'inline' : 'none';
    reset();
  });

  function launchConfetti() {
    const container = document.getElementById('confetti-container');
    for (let i = 0; i < 50; i++) {
      const piece = document.createElement('div');
      piece.classList.add('confetti-piece');
      piece.style.left = Math.random() * 100 + 'vw';
      piece.style.background = `hsl(${Math.random() * 360}, 100%, 50%)`;
      piece.style.animationDuration = 2 + Math.random() * 3 + 's';
      piece.style.width = piece.style.height = Math.random() * 8 + 4 + 'px';
      container.appendChild(piece);
      setTimeout(() => piece.remove(), 3000);
    }
  }

  function showResultModal(result) {
    modalMessage.textContent = result;
    modal.style.display = 'flex';
    modal.classList.add('winner-glow');

    if (result.includes('wins')) launchConfetti();

    fetch('/record_result', {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: `game=tic_tac_toe&result=${
        result === "It's a draw!" ? 'draw' :
        result.includes('X') ? 'win' : 'lose'
      }`
    });
  }

  reset();
});
