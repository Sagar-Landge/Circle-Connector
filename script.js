        // Initial player setup
        let currentPlayer = 1;
        const playerColors = { 1: 'red', 2: 'blue' }; // Define player colors
        const playerMoves = { 1: 0, 2: 0 }; // Track moves for each player
        const maxMoves = 3; // Maximum moves per player in the filling phase

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

        // Add click event listeners to all circle elements
        circles.forEach(circle => {
            circle.addEventListener('click', handleCircleClick);
        });

        // Function to handle circle click events
        function handleCircleClick(event) {
            const circle = event.target; // Get the clicked circle
            const circlePos = circle.dataset.pos; // Get the position of the clicked circle

            // Check if the game is in the filling phase
            if (playerMoves[1] < maxMoves || playerMoves[2] < maxMoves) {
                // Filling phase
                if (circle.style.backgroundColor === 'white' || circle.style.backgroundColor === '') {
                    // If the circle is empty, fill it with the current player's color
                    circle.style.backgroundColor = playerColors[currentPlayer];
                    playerMoves[currentPlayer]++; // Increment the current player's move count
                    switchPlayer(); // Switch to the other player
                } else {
                    alert('Circle already filled! Choose another circle.'); // Alert if the circle is already filled
                }
            } else {
                 // Moving phase
                 if (circle.style.backgroundColor === playerColors[currentPlayer]) {
                    // Select the circle to move if it belongs to the current player
                    circle.style.borderColor = 'green'; // Highlight the selected circle
                    const nearestCircles = nearestPositions[circlePos]; // Get nearest positions for the selected circle
                    nearestCircles.forEach(pos => {
                        const targetCircle = document.querySelector(`.circle[data-pos="${pos}"]`);
                        if (targetCircle.style.backgroundColor === 'white' || targetCircle.style.backgroundColor === '') {
                            // Check the current player and set the blinking border color accordingly
                            targetCircle.classList.add(currentPlayer === 1 ? 'blink-red' : 'blink-blue'); // Highlight the target circles
                            targetCircle.addEventListener('click', moveCircle, { once: true }); // Add event listener for moving the circle
                        }
                    });

                    // Function to handle the movement of a circle
                    function moveCircle(event) {
                        const targetCircle = event.target; // Get the target circle
                        targetCircle.style.backgroundColor = playerColors[currentPlayer]; // Fill the target circle with the current player's color
                        circle.style.backgroundColor = 'white'; // Empty the original circle
                        circle.style.borderColor = 'black'; // Reset border color of the original circle
                        nearestCircles.forEach(pos => {
                            const resetCircle = document.querySelector(`.circle[data-pos="${pos}"]`);
                            resetCircle.classList.remove('blink-red', 'blink-blue'); // Remove the blinking border
                            resetCircle.style.borderColor = 'black'; // Reset the border color

                            resetCircle.removeEventListener('click', moveCircle);
                        });
                        switchPlayer();
 
                    }
                }
            }
        }

        // Function to switch the current player
        function switchPlayer() {
            currentPlayer = currentPlayer === 1 ? 2 : 1; // Switch between player 1 and player 2
            if (playerMoves[1] === maxMoves && playerMoves[2] === maxMoves) {
            }
        }
        function restartGame() {
        // Reset player moves
        playerMoves[1] = 0;
        playerMoves[2] = 0;

        // Reset circle colors
        circles.forEach(circle => {
            circle.style.backgroundColor = 'white';
            circle.style.borderColor = 'black';
        });

        // Set current player to 1
        currentPlayer = 1;

        // Inform players to start filling again
        alert("Restarted! Start filling circles again.");

        // Additional logic to reset any other game state if needed
    }

    // Add event listener to restart button
    document.getElementById('restartBtn').addEventListener('click', restartGame);

