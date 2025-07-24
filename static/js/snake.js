document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('snake-canvas');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const highScoreEl = document.getElementById('high-score');

  const modal = document.getElementById('snake-result-modal');
  const modalMessage = document.getElementById('snake-modal-message');
  const modalRestart = document.getElementById('snake-modal-restart');

  const gridSize = 20;
  const tileCount = canvas.width / gridSize;

  let snake;
  let food;
  let dx, dy;
  let score;
  let speed;
  let intervalId;

  function initGame() {
    snake = [{ x: 10, y: 10 }];
    dx = 0;
    dy = 0;
    food = randomFood();
    score = 0;
    speed = 200;
    scoreEl.textContent = score;

    clearInterval(intervalId);
    modal.classList.remove('show');
    draw();
  }

  function randomFood() {
    return {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount)
    };
  }

  function draw() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Snake
    ctx.fillStyle = '#00FF00';
    snake.forEach(segment => {
      ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    });

    // Food
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
  }

  function update() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    if (dx === 0 && dy === 0) return;

    if (
      head.x < 0 || head.x >= tileCount ||
      head.y < 0 || head.y >= tileCount ||
      snake.some(segment => segment.x === head.x && segment.y === head.y)
    ) {
      showGameOver();
      return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      score += 10;
      scoreEl.textContent = score;
      food = randomFood();

      if (score % 50 === 0) {
        speed = Math.max(50, speed - 10);
        clearInterval(intervalId);
        intervalId = setInterval(() => {
          update();
          draw();
        }, speed);
      }
    } else {
      snake.pop();
    }

    draw();
  }

  function showGameOver() {
    modalMessage.textContent = `Game Over! Score: ${score}`;
    modal.classList.add('show');
    sendScore();
    clearInterval(intervalId);
    intervalId = null;
    }

    function sendScore() {
    fetch('/update_snake_score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: score })
    }).then(() => {
        if (score > parseInt(highScoreEl.textContent)) {
        highScoreEl.textContent = score;
        }
    });

    fetch('/record_result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `game=snake&result=${score}`
    });
    }



  document.addEventListener('keydown', e => {
    switch (e.key) {
      case 'ArrowUp':
        if (dy === 0) { dx = 0; dy = -1; startGameLoop(); }
        break;
      case 'ArrowDown':
        if (dy === 0) { dx = 0; dy = 1; startGameLoop(); }
        break;
      case 'ArrowLeft':
        if (dx === 0) { dx = -1; dy = 0; startGameLoop(); }
        break;
      case 'ArrowRight':
        if (dx === 0) { dx = 1; dy = 0; startGameLoop(); }
        break;
    }
  });

  modalRestart.addEventListener('click', () => {
    initGame();
  });

  function startGameLoop() {
    if (!intervalId) {
      intervalId = setInterval(() => {
        update();
        draw();
      }, speed);
    }
  }

  initGame();
});
