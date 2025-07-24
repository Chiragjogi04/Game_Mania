document.addEventListener('DOMContentLoaded', () => {
  const words = [
    'APPLE', 'BANJO', 'CRANE', 'DREAM', 'EAGLE', 'FAITH', 'GHOST', 'HONEY', 'INPUT', 'JELLY',
    'KNIFE', 'LEMON', 'MANGO', 'NINJA', 'OCEAN', 'PIZZA', 'QUACK', 'ROBIN', 'SUGAR', 'TIGER',
    'ULTRA', 'VIVID', 'WORMS', 'XENON', 'YACHT', 'ZEBRA', 'ALERT', 'BLAZE', 'CLOUD', 'DELTA',
    'EARTH', 'FLAME', 'GRACE', 'HOUSE', 'ICING', 'JOKER', 'KITES', 'LIGHT', 'MUSIC', 'NOBLE',
    'OPERA', 'PRIZE', 'QUEST', 'RAISE', 'SHINE', 'TRUST', 'UNITY', 'VIRUS', 'WAGON', 'XEROX',
    'YOUTH', 'ZAPPY', 'ANGEL', 'BERRY', 'CHEST', 'DAIRY', 'ELITE', 'FORCE', 'GLASS', 'HUMAN',
    'ISSUE', 'JUICE', 'KNOCK', 'LUNCH', 'MAGIC', 'NORTH', 'OUTER', 'PLANE', 'QUILT', 'ROUTE',
    'STONE', 'TRAIN', 'UNDER', 'VIDEO', 'WHEEL', 'XRAYS', 'YOURS', 'ZONED', 'AMONG', 'BRAVE',
    'CROWN', 'DANCE', 'EVENT', 'FROST', 'GRILL', 'HEART', 'IDEAL', 'JUDGE', 'KOALA', 'LUCKY',
    'MIRTH', 'NURSE', 'ORBIT', 'PEACH', 'QUOTE', 'REACT', 'SHARE', 'TREND', 'URBAN', 'VITAL',
    'BLINK', 'CABLE', 'DRIVE', 'ENJOY', 'FANCY', 'GIANT', 'HUMID', 'INNER', 'JUMBO', 'KNACK',
    'LAYER', 'MIGHT', 'NIGHT', 'OASIS', 'POWER', 'QUICK', 'RIVER', 'SPOKE', 'THORN', 'UNCLE',
    'VOICE', 'WISER', 'YEAST', 'ZESTY', 'BREAD', 'CATCH', 'DRIFT', 'FLOOD', 'GRIND', 'SPLIT'
  ];

  let word = '';
  let attempts = [];

  const grid = document.getElementById('wordle-grid');
  const input = document.getElementById('wordle-input');
  const submitBtn = document.getElementById('wordle-submit');
  const nextBtn = document.getElementById('wordle-next');
  const message = document.getElementById('wordle-message');

  function pickNewWord() {
    word = words[Math.floor(Math.random() * words.length)];
    attempts = [];
    grid.innerHTML = '';
    input.value = '';
    message.textContent = '';
    nextBtn.style.display = 'none';
    input.disabled = false;
    submitBtn.disabled = false;
  }

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

  submitBtn.addEventListener('click', () => {
    const guess = input.value.toUpperCase();
    if (guess.length !== 5) {
      message.textContent = 'Word must be 5 letters.';
      return;
    }

    const row = document.createElement('div');
    row.className = 'wordle-row';

    for (let i = 0; i < 5; i++) {
      const tile = document.createElement('span');
      tile.className = 'wordle-tile';

      if (guess[i] === word[i]) {
        tile.classList.add('correct');
      } else if (word.includes(guess[i])) {
        tile.classList.add('present');
      } else {
        tile.classList.add('absent');
      }

      tile.textContent = guess[i];
      row.appendChild(tile);
    }

    grid.appendChild(row);
    attempts.push(guess);

    if (guess === word) {
      message.textContent = 'Congratulations! 🎉';
      nextBtn.style.display = 'inline-block';

      launchConfetti();

      fetch('/record_result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'game=wordle&result=win'
      }).then(() => {
        input.disabled = true;
        submitBtn.disabled = true;
      });

    } else if (attempts.length >= 5) {
      message.textContent = `Out of attempts! The word was ${word}.`;
      nextBtn.style.display = 'inline-block';
      input.disabled = true;
      submitBtn.disabled = true;

      fetch('/record_result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'game=wordle&result=lose'
      });
    }

    input.value = '';
  });

  nextBtn.addEventListener('click', pickNewWord);

  pickNewWord();
});
