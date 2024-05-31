// Initial player setup
let currentPlayer = 1;
const playerColors = { 1: 'red', 2: 'blue' };
const playerMoves = { 1: 0, 2: 0 };
const maxMoves = 3;
let selectedCircle = null; // Keep track of the selected circle for moving

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
            switchPlayer();
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
        switchPlayer();
    }
}

// Function to switch the current player
function switchPlayer() {
    currentPlayer = currentPlayer === 1 ? 2 : 1;
}

// Function to restart the game
function restartGame() {
    playerMoves[1] = 0;
    playerMoves[2] = 0;
    circles.forEach(circle => {
        circle.style.backgroundColor = 'white';
        circle.style.borderColor = 'black';
    });
    currentPlayer = 1;
    selectedCircle = null;
    alert("Restarted! Start filling circles again.");
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
        alert(`Player ${currentPlayer === 1 ? 2 : 1} wins!`);
        restartGame();
    } else {
        alert("No winner yet! Keep playing.");
    }
}

// Add event listener to check winner button
document.getElementById('checkWinnerBtn').addEventListener('click', checkWinner);

// Add event listener to restart button
document.getElementById('restartBtn').addEventListener('click', restartGame);

// Listener function for moving circle
function moveCircleListener(event) {
    const targetCircle = event.target;
    moveCircle(targetCircle);
}


