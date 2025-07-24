document.addEventListener('DOMContentLoaded', () => {
  const puzzles = [
    '530070000600195000098000060800060003400803001700020006060000280000419005000080079',
    '200080300060070084030500209000105408000000000402706000301000702040090060080400015',
    '300000000000005000000002800000090006000000200008000000000700000060004000000008300'
  ];
  const solutionKeys = [
    '534678912672195348198342567859761423426853791713924856961537284287419635345286179',
    '245981376661273984834546219973125468518694732492736581381459627754892163169317845',
    '381476529624835971597192834215398746746251983938647152153729468862514397479683215'
  ];

  let puzzle, solution;

  function loadPuzzle() {
    const idx = Math.floor(Math.random() * puzzles.length);
    puzzle = puzzles[idx];
    solution = solutionKeys[idx];
    const inputs = document.querySelectorAll('.sudoku-cell input');
    inputs.forEach((inp, i) => {
      if (puzzle[i] !== '0') {
        inp.value = puzzle[i];
        inp.disabled = true;
        inp.classList.add('clue');
      } else {
        inp.value = '';
        inp.disabled = false;
        inp.classList.remove('clue', 'wrong', 'hinted');
      }
    });
    document.getElementById('sudoku-message').textContent = '';
  }

  document.getElementById('check-btn').addEventListener('click', () => {
    const inputs = document.querySelectorAll('.sudoku-cell input');
    let correct = true;
    inputs.forEach((inp, i) => {
      if (puzzle[i] === '0') {
        if (inp.value !== solution[i]) {
          inp.classList.add('wrong');
          correct = false;
        } else {
          inp.classList.remove('wrong');
        }
      }
    });
    document.getElementById('sudoku-message').textContent =
      correct ? 'All correct! 🎉' : 'Some entries are wrong.';
    if (correct) {
      fetch('/record_result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'game=sudoku&result=win'
      });
    }
  });

  document.getElementById('hint-btn').addEventListener('click', () => {
    const inputs = document.querySelectorAll('.sudoku-cell input');
    const emptyCells = [];
    inputs.forEach((inp, i) => {
      if (puzzle[i] === '0' && inp.value === '') {
        emptyCells.push(i);
      }
    });
    if (emptyCells.length > 0) {
      const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      inputs[randomIndex].value = solution[randomIndex];
      inputs[randomIndex].classList.add('hinted');
      inputs[randomIndex].classList.remove('wrong');
    }
  });

  document.getElementById('reset-btn').addEventListener('click', loadPuzzle);

  loadPuzzle();
});
