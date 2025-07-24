document.addEventListener('DOMContentLoaded', () => {
  const gridContainer = document.getElementById('grid-container');
  const scoreDisplay = document.getElementById('score');
  const restartBtn = document.getElementById('restart-btn');

  const modal = document.getElementById('game-over-modal');
  const closeModal = document.getElementById('close-modal');

  const size = 4;
  let cells = [];
  let score = 0;

  function init() {
    gridContainer.innerHTML = '';
    cells = [];
    score = 0;
    updateScore(0);

    modal.classList.remove('show');

    for (let i = 0; i < size * size; i++) {
      const cell = document.createElement('div');
      cell.classList.add('tile');
      gridContainer.appendChild(cell);
      cells.push(cell);
    }

    generate();
    generate();
    update();
  }

  function generate() {
    const emptyCells = [];
    for (let i = 0; i < cells.length; i++) {
      if (!cells[i].textContent) emptyCells.push(i);
    }

    if (emptyCells.length === 0) {
      if (checkGameOver()) handleGameOver();
      return;
    }

    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    cells[randomCell].textContent = Math.random() < 0.9 ? 2 : 4;
  }

  function update() {
    for (let i = 0; i < cells.length; i++) {
      const val = parseInt(cells[i].textContent) || 0;
      cells[i].className = 'tile';
      if (val) cells[i].classList.add(`tile-${val}`);
    }
  }

  function slide(row) {
    let arr = row.filter(num => num);
    while (arr.length < size) arr.unshift(0);
    return arr;
  }

  function combine(row) {
    for (let i = size - 1; i > 0; i--) {
      if (row[i] === row[i - 1] && row[i] !== 0) {
        row[i] *= 2;
        score += row[i];
        row[i - 1] = 0;
      }
    }
    return row;
  }

  function move(direction) {
    let moved = false;

    for (let i = 0; i < size; i++) {
      let row = [];
      for (let j = 0; j < size; j++) {
        let index = (direction === 'left' || direction === 'right')
          ? i * size + j
          : j * size + i;

        let val = parseInt(cells[index].textContent) || 0;
        row.push(val);
      }

      if (direction === 'left' || direction === 'up') row.reverse();

      const original = row.join('');
      row = slide(row);
      row = combine(row);
      row = slide(row);

      if (original !== row.join('')) moved = true;

      if (direction === 'left' || direction === 'up') row.reverse();

      for (let j = 0; j < size; j++) {
        let index = (direction === 'left' || direction === 'right')
          ? i * size + j
          : j * size + i;

        cells[index].textContent = row[j] === 0 ? '' : row[j];
      }
    }

    if (moved) {
      updateScore(score);
      generate();
      update();
    } else if (checkGameOver()) {
      handleGameOver();
    }
  }

  function checkGameOver() {
    for (let i = 0; i < size * size; i++) {
      if (!cells[i].textContent) return false;

      const row = Math.floor(i / size);
      const col = i % size;

      if (col < size - 1 && cells[i].textContent === cells[i + 1].textContent) return false;
      if (row < size - 1 && cells[i].textContent === cells[i + size].textContent) return false;
    }
    return true;
  }

  function handleGameOver() {
    modal.classList.add('show');

    fetch('/record_result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'game=2048&result=lose'
    });
  }

  window.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') move('right');
    if (e.key === 'ArrowLeft') move('left');
    if (e.key === 'ArrowUp') move('up');
    if (e.key === 'ArrowDown') move('down');
  });

  restartBtn.addEventListener('click', init);
  closeModal.addEventListener('click', init);

  init();
});
