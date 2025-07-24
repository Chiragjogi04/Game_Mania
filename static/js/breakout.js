document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('breakout-canvas');
  const ctx = canvas.getContext('2d');

  const scoreEl = document.getElementById('score');
  const highScoreEl = document.getElementById('high-score');

  const modal = document.getElementById('breakout-result-modal');
  const modalMessage = document.getElementById('breakout-modal-message');
  const modalRestart = document.getElementById('breakout-modal-restart');

  const paddleHeight = 12;
  const paddleWidth = 100;
  let paddleX = (canvas.width - paddleWidth) / 2;

  const ballRadius = 10;
  let x = canvas.width / 2;
  let y = canvas.height - 40;
  let dx = 3;
  let dy = -3;

  let rightPressed = false;
  let leftPressed = false;

  // 🟢 Better layout
  const brickRowCount = 6;
  const brickColumnCount = 8;
  const brickPadding = 10;
  const brickOffsetTop = 40;
  const brickOffsetLeft = 40;

  // Auto calc brick size
  const brickWidth = (canvas.width - brickOffsetLeft * 2 - brickPadding * (brickColumnCount - 1)) / brickColumnCount;
  const brickHeight = 25;

  let bricks = [];
  for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
      bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
  }

  let score = 0;

  function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.closePath();
  }

  function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight - 5, paddleWidth, paddleHeight);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.closePath();
  }

  function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        if (bricks[c][r].status == 1) {
          const brickX = brickOffsetLeft + c * (brickWidth + brickPadding);
          const brickY = brickOffsetTop + r * (brickHeight + brickPadding);
          bricks[c][r].x = brickX;
          bricks[c][r].y = brickY;
          ctx.beginPath();
          ctx.rect(brickX, brickY, brickWidth, brickHeight);
          ctx.fillStyle = "#00FF00";
          ctx.fill();
          ctx.closePath();
        }
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    collisionDetection();

    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
      dx = -dx;
    }
    if (y + dy < ballRadius) {
      dy = -dy;
    } else if (y + dy > canvas.height - ballRadius) {
      if (x > paddleX && x < paddleX + paddleWidth) {
        dy = -dy;
      } else {
        showGameOver();
        return;
      }
    }

    if (rightPressed && paddleX < canvas.width - paddleWidth) {
      paddleX += 7;
    } else if (leftPressed && paddleX > 0) {
      paddleX -= 7;
    }

    x += dx;
    y += dy;
    requestAnimationFrame(draw);
  }

  function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < brickRowCount; r++) {
        const b = bricks[c][r];
        if (b.status == 1) {
          if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
            dy = -dy;
            b.status = 0;
            score += 10;
            scoreEl.textContent = score;

            if (score % 100 === 0) {
              dx *= 1.1;
              dy *= 1.1;
            }

            if (score == brickRowCount * brickColumnCount * 10) {
              showGameOver(true);
            }
          }
        }
      }
    }
  }

  function showGameOver(won = false) {
    modalMessage.textContent = won ? `You Won! Score: ${score}` : `Game Over! Score: ${score}`;
    modal.classList.add('show');
    sendScore();
  }

  function sendScore() {
    const currentHigh = parseInt(highScoreEl.textContent);
    if (score > currentHigh) {
      fetch('/update_breakout_score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ high_score: score })
      }).then(() => {
        highScoreEl.textContent = score;
      });
    }

    fetch('/record_result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `game=breakout&result=${score}`
    });
  }

  document.addEventListener('keydown', e => {
    if (e.key == "Right" || e.key == "ArrowRight") {
      rightPressed = true;
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
      leftPressed = true;
    }
  });

  document.addEventListener('keyup', e => {
    if (e.key == "Right" || e.key == "ArrowRight") {
      rightPressed = false;
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
      leftPressed = false;
    }
  });

  modalRestart.addEventListener('click', () => {
    document.location.reload();
  });

  draw();
});
