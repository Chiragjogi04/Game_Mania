document.addEventListener('DOMContentLoaded', () => {
  const choices = document.querySelectorAll('.rps-choices img');
  let playerChoice = null;
  const resultP = document.getElementById('rps-result');
  const gameContainer = document.getElementById('game-container');

  choices.forEach(img => {
    img.addEventListener('click', () => {
      choices.forEach(i => i.classList.remove('selected'));
      img.classList.add('selected');
      playerChoice = img.getAttribute('data-choice');
    });
  });

  document.getElementById('play-btn').addEventListener('click', () => {
    if (!playerChoice) return alert('Pick rock, paper, or scissors first!');
    const options = ['rock','paper','scissors'];
    const cpu = options[Math.floor(Math.random() * 3)];

    let result;
    if (playerChoice === cpu) result = 'draw';
    else if (
      (playerChoice === 'rock' && cpu === 'scissors') ||
      (playerChoice === 'paper' && cpu === 'rock') ||
      (playerChoice === 'scissors' && cpu === 'paper')
    ) result = 'win';
    else result = 'lose';

    resultP.textContent = `CPU chose ${cpu}. You ${result}!`;

    // 🔥 ANIMATIONS 🔥
    if (result === 'win') {
      fireConfetti();
    } else if (result === 'lose') {
      shakeScreen();
    }

    // record
    fetch('/record_result', {
      method: 'POST',
      headers: {'Content-Type':'application/x-www-form-urlencoded'},
      body: `game=rock_paper_scissors&result=${result}`
    });
  });

  function fireConfetti() {
    confetti({
      particleCount: 200,
      spread: 70,
      origin: { y: 0.6 }
    });
  }

  function shakeScreen() {
    gameContainer.classList.add('shake');
    setTimeout(() => {
      gameContainer.classList.remove('shake');
    }, 500);
  }
});
