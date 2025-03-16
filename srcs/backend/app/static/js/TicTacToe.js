const gameBoard = document.getElementById('gameBoard');
const player1 = 'X';
const player2 = 'O';
let currentPlayer = player1;
let board = ['', '', '', '', '', '', '', '', ''];
let gameOver = false;

for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.index = i;
    cell.addEventListener('click', handleCellClick);
    gameBoard.appendChild(cell);
}

// function handleCellClick(event) {
//     const cell = event.target;
//     const index = cell.dataset.index;

//     // If the cell is already taken or the game is over, do nothing
//     if (board[index] || gameOver) return;

//     // Mark the cell with the current player's symbol
//     board[index] = currentPlayer;
//     cell.textContent = currentPlayer;
//     cell.classList.add('taken');

//     // Check for a winner
//     if (checkWinner()) {
//         alert(`${currentPlayer} wins!`);
//         gameOver = true;
//         return;
//     }

//     // Switch to the next player
//     currentPlayer = currentPlayer === player1 ? player2 : player1;
// }

function handleCellClick(event) {
const cell = event.target;
const index = cell.dataset.index;

// If the cell is already taken or the game is over, do nothing
if (board[index] || gameOver) return;

// Mark the cell with the current player's symbol
board[index] = currentPlayer;
const img = document.createElement('img');
img.src = currentPlayer === player1 ? '{% static "images/cross.svg" %}' : '{% static "images/circle.svg" %}';
img.classList.add('symbol');
cell.appendChild(img);
cell.classList.add('taken');

// Check for a winner
if (checkWinner()) {
    alert(`${currentPlayer} wins!`);
    gameOver = true;
    return;
}

// Switch to the next player
currentPlayer = currentPlayer === player1 ? player2 : player1;
}


function checkWinner() {
    const winningCombinations = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    return winningCombinations.some(combination => {
        const [a, b, c] = combination;
        return board[a] && board[a] === board[b] && board[a] === board[c];
    });
}

function restartGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = player1;
    gameOver = false;

    // Reset game board UI
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('taken');
    });
}