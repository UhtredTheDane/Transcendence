const gameBoard = document.getElementById('gameBoard');
const gameSocket = new WebSocket(`wss://${window.location.host}/ws/TicTacToeMode/${gameId}/`);

console.log("Player role:", playerRole);
console.log("Current username:", currentUsername);

let board = Array(9).fill(' ');
let currentTurn = null;

// 📡 Connexion WebSocket
gameSocket.onopen = function() {
    console.log("✅ WebSocket connected.");
};

gameSocket.onmessage = function(event) {
    const data = JSON.parse(event.data);
    console.log("🚀 Data received:", data);

    if (data.type === "game_update") {
        board = data.board.split('');
        currentTurn = data.current_turn;
        console.log("🔄 New board received:", board);
        console.log("🎯 Current turn:", currentTurn);
        updateBoard();
    }

    if (data.winner) {
        alert(`${data.winner} wins!`);
        gameSocket.close();
    }
};

gameSocket.onclose = function() {
    console.log("❌ WebSocket closed.");
};

// Création de la grille
for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.index = i;
    cell.addEventListener('click', handleCellClick);
    gameBoard.appendChild(cell);
}

// 🖱 Gestion du clic sur une cellule
function handleCellClick(event) {
    const index = parseInt(event.target.dataset.index, 10);
    console.log(`🖱️ Cell clicked: ${index}, Current turn: ${currentTurn}, Username: ${currentUsername}`);

    if (currentTurn !== currentUsername || board[index] !== ' ') {
        console.log(`❌ Action denied: Not your turn (turn of ${currentTurn}) or cell already taken.`);
        return;
    }

    console.log("📤 Sending move to server...");
    gameSocket.send(JSON.stringify({
        type: "move",
        index: index,
		currentTurn: currentTurn,
    }));
}

// 🔄 Mise à jour visuelle de la grille
function updateBoard() {
    console.log("🛠️ Updating board in UI");
    const cells = document.querySelectorAll('.cell');
    cells.forEach((cell, i) => {
        console.log(`🔢 Cell ${i}: ${board[i]}`);
        cell.textContent = board[i] === ' ' ? '' : board[i];
        cell.classList.toggle('taken', board[i] !== ' ');
    });
}
