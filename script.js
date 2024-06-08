// Initial player setup
let currentPlayer = 1;
const playerColors = { 1: 'red', 2: 'blue' };
const playerMoves = { 1: 0, 2: 0 };
const maxMoves = 3;
let selectedCircle = null; // Keep track of the selected circle for moving
let isPlayingWithSystem = false; // Flag to check if playing with the system
let systemPreviousMove = null; // Track the previous move of the system player

// Select all circle elements
const circles = document.querySelectorAll('.circle');

// Define nearest positions, including diagonals, for each circle
const nearestPositions = {
    'top-left': ['top-center', 'left-center', 'center'],
    'top-right': ['top-center', 'right-center', 'center'],
    'bottom-left': ['bottom-center', 'left-center', 'center'],
    'bottom-right': ['bottom-center', 'right-center', 'center'],
    'top-center': ['top-left', 'top-right', 'center'],
    'right-center': ['top-right', 'bottom-right', 'center'],
    'bottom-center': ['bottom-left', 'bottom-right', 'center'],
    'left-center': ['top-left', 'bottom-left', 'center'],
    'center': ['top-center', 'right-center', 'bottom-center', 'left-center', 'top-left', 'top-right', 'bottom-left', 'bottom-right']
};

// Define winning combinations
const winningCombinations = [
    ['top-left', 'top-center', 'top-right'],
    ['left-center', 'center', 'right-center'],
    ['bottom-left', 'bottom-center', 'bottom-right'],
    ['top-left', 'left-center', 'bottom-left'],
    ['top-center', 'center', 'bottom-center'],
    ['top-right', 'right-center', 'bottom-right'],
    ['top-left', 'center', 'bottom-right'],
    ['top-right', 'center', 'bottom-left']
];

// Add click event listeners to all circle elements
circles.forEach(circle => {
    circle.addEventListener('click', handleCircleClick);
});

// Elements
const gameSelection = document.getElementById('game-selection');
const gameContainer = document.getElementById('game-container');
const playerTurnInfo = document.getElementById('playerTurnInfo');
const restartBtn = document.getElementById('restartBtn');
const playWithFriendBtn = document.getElementById('playWithFriendBtn');
const playWithSystemBtn = document.getElementById('playWithSystemBtn');


// Event listeners
playWithFriendBtn.addEventListener('click', () => startGame(false));
playWithSystemBtn.addEventListener('click', () => startGame(true));
restartBtn.addEventListener('click', restartGame);


// Start game function
function startGame(withSystem) {
    isPlayingWithSystem = withSystem;
    gameSelection.style.display = 'none';
    gameContainer.style.display = 'block';
    updatePlayerTurnInfo();
}

// Update player turn information
function updatePlayerTurnInfo() {
    playerTurnInfo.textContent = `Player ${currentPlayer}'s turn (${playerColors[currentPlayer]})`;
    playerTurnInfo.style.backgroundColor = currentPlayer === 1 ? 'red' : 'blue';
}

// Function to handle circle click events
function handleCircleClick(event) {
    const circle = event.target;
    const circlePos = circle.dataset.pos;

    // Check if the game is in the filling phase
    if (playerMoves[currentPlayer] < maxMoves) {
        // Filling phase
        if (circle.style.backgroundColor === 'white' || circle.style.backgroundColor === '') {
            circle.style.backgroundColor = playerColors[currentPlayer];
            playerMoves[currentPlayer]++;
            if (!checkWinner()) {
                switchPlayer();
            }
        } else {
            alert('Circle already filled! Choose another circle.');
        }
    } else {
        // Moving phase
        if (selectedCircle) {
            // If a circle is already selected for moving
            if (circle === selectedCircle) {
                // If the same circle is clicked again, deselect it
                deselectCircle(selectedCircle);
                selectedCircle = null;
            } else {
                // Try to move to a new circle
                moveCircle(circle);
            }
        } else if (circle.style.backgroundColor === playerColors[currentPlayer]) {
            // If no circle is selected and the current player's circle is clicked
            selectCircle(circle);
        }
    }
}

// Function to select a circle for moving
function selectCircle(circle) {
    selectedCircle = circle;
    circle.style.borderColor = 'green';
    const nearestCircles = nearestPositions[circle.dataset.pos];
    nearestCircles.forEach(pos => {
        const targetCircle = document.querySelector(`.circle[data-pos="${pos}"]`);
        if (targetCircle.style.backgroundColor === 'white' || targetCircle.style.backgroundColor === '') {
            targetCircle.classList.add(currentPlayer === 1 ? 'blink-red' : 'blink-blue');
            targetCircle.addEventListener('click', moveCircleListener, { once: true });
        }
    });
}

// Function to deselect a circle
function deselectCircle(circle) {
    circle.style.borderColor = 'black';
    const nearestCircles = nearestPositions[circle.dataset.pos];
    nearestCircles.forEach(pos => {
        const targetCircle = document.querySelector(`.circle[data-pos="${pos}"]`);
        targetCircle.classList.remove('blink-red', 'blink-blue');
        targetCircle.style.borderColor = 'black';
        targetCircle.removeEventListener('click', moveCircleListener);
    });
}

// Function to move a circle to a new position
function moveCircle(targetCircle) {
    if (targetCircle.classList.contains('blink-red') || targetCircle.classList.contains('blink-blue')) {
        targetCircle.style.backgroundColor = playerColors[currentPlayer];
        selectedCircle.style.backgroundColor = 'white';
        deselectCircle(selectedCircle);
        selectedCircle = null;
        setTimeout(() => {
            if (!checkWinner()) {
                switchPlayer();
            }
        }, 500); // Ensure the move is visually completed before checking the winner
    }
}

// Function to switch the current player
function switchPlayer() {
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    updatePlayerTurnInfo();

    if (isPlayingWithSystem && currentPlayer === 2) {
        setTimeout(systemMove, 1000); // System makes a move after a short delay
    }
}

// System move logic
function systemMove() {
    let moved = false;

    // Check if the system needs to move circles
    if (playerMoves[2] >= maxMoves) {
        // System moves circles
        moved = moveSystemCircles();
    } else {
        // Check if the system can win in the next move
        moved = checkSystemWin();
        
        // If not, check if the system needs to block the opponent from winning
        if (!moved) {
            moved = checkOpponentWin();
        }
        
        // If neither winning nor blocking is necessary, make a strategic move
        if (!moved) {
            makeStrategicMove();
        }
    }

    // Switch to the next player after the system's move
    setTimeout(() => {
        if (!checkWinner()) {
            switchPlayer();
        }
    }, 500); // Ensure the move is visually completed before checking the winner
}

// Function to check if the system can win in the next move
function checkSystemWin() {
    for (const combination of winningCombinations) {
        let emptyPosition = null;
        let systemCount = 0;
        let opponentCount = 0;
        for (const pos of combination) {
            const circle = document.querySelector(`.circle[data-pos="${pos}"]`);
            const color = circle.style.backgroundColor;
            if (color === playerColors[2]) {
                systemCount++;
            } else if (color === 'white' || color === '') {
                emptyPosition = circle;
            } else {
                opponentCount++;
            }
        }
        if (systemCount === 2 && opponentCount === 0 && emptyPosition !== null) {
            emptyPosition.style.backgroundColor = playerColors[2];
            playerMoves[2]++;
            return true;
        }
    }
    return false;
}

// Function to check if the opponent can win in the next move and block them
function checkOpponentWin() {
    for (const combination of winningCombinations) {
        let emptyPosition = null;
        let systemCount = 0;
        let opponentCount = 0;
        for (const pos of combination) {
            const circle = document.querySelector(`.circle[data-pos="${pos}"]`);
            const color = circle.style.backgroundColor;
            if (color === playerColors[1]) {
                opponentCount++;
            } else if (color === 'white' || color === '') {
                emptyPosition = circle;
            } else {
                systemCount++;
            }
        }
        if (opponentCount === 2 && systemCount === 0 && emptyPosition !== null) {
            emptyPosition.style.backgroundColor = playerColors[2];
            playerMoves[2]++;
            return true;
        }
    }
    return false;
}

// Function to make a strategic move
function makeStrategicMove() {
    // Try to place in the center if available
    const centerCircle = document.querySelector('.circle[data-pos="center"]');
    if (centerCircle.style.backgroundColor === 'white' || centerCircle.style.backgroundColor === '') {
        centerCircle.style.backgroundColor = playerColors[2];
        playerMoves[2]++;
        return true;
    }

    // Try to place in corners if available
    const corners = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
    for (const corner of corners) {
        const cornerCircle = document.querySelector(`.circle[data-pos="${corner}"]`);
        if (cornerCircle.style.backgroundColor === 'white' || cornerCircle.style.backgroundColor === '') {
            cornerCircle.style.backgroundColor = playerColors[2];
            playerMoves[2]++;
            return true;
        }
    }

    // Place in any random empty circle as a last resort
    makeRandomMove();
}

// Function to make a random move if no strategic move is possible
function makeRandomMove() {
    let emptyCircles = Array.from(circles).filter(circle => circle.style.backgroundColor === 'white' || circle.style.backgroundColor === '');
    if (emptyCircles.length > 0) {
        const randomEmptyCircle = emptyCircles[Math.floor(Math.random() * emptyCircles.length)];
        randomEmptyCircle.style.backgroundColor = playerColors[2];
        playerMoves[2]++;
        return true;
    }
    return false;
}

// Function to move system circles
function moveSystemCircles() {
    const systemCircles = Array.from(circles).filter(circle => circle.style.backgroundColor === playerColors[2]);
    for (const circle of systemCircles) {
        const nearestCircles = nearestPositions[circle.dataset.pos];
        for (const pos of nearestCircles) {
            const targetCircle = document.querySelector(`.circle[data-pos="${pos}"]`);
            if ((targetCircle.style.backgroundColor === 'white' || targetCircle.style.backgroundColor === '') && targetCircle !== systemPreviousMove) {
                targetCircle.style.backgroundColor = playerColors[2];
                systemPreviousMove = circle;
                circle.style.backgroundColor = 'white';
                return true;
            }
        }
    }
    return false;
}

// Function to restart the game
function restartGame() {
   // alert('Do you want to Restart Game');
    playerMoves[1] = 0;
    playerMoves[2] = 0;
    circles.forEach(circle => {
        circle.style.backgroundColor = 'white';
        circle.style.borderColor = 'black';
    });
    currentPlayer = 1;
    selectedCircle = null;
    systemPreviousMove = null;
    updatePlayerTurnInfo();
}

// Function to check for a winner
function checkWinner() {
    const winner = winningCombinations.some(combination => {
        const [a, b, c] = combination;
        const colorA = document.querySelector(`.circle[data-pos="${a}"]`).style.backgroundColor;
        const colorB = document.querySelector(`.circle[data-pos="${b}"]`).style.backgroundColor;
        const colorC = document.querySelector(`.circle[data-pos="${c}"]`).style.backgroundColor;
        return colorA === colorB && colorB === colorC && colorA !== 'white' && colorA !== '';
    });

    if (winner) {
        const winningPlayer = currentPlayer === 1 ? 1 : 2; // Correctly identify the winning player
        setTimeout(() => { 
            alert(`Player ${winningPlayer} wins! (${playerColors[winningPlayer]})`);
        }, 100);
        restartGame();
        return true;
    }
    return false;
}

// Listener function for moving circle
function moveCircleListener(event) {
    const targetCircle = event.target;
    moveCircle(targetCircle);
}
