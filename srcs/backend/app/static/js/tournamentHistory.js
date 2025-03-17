
    async function fetchPlayerMatches() {
        const tournamentId = 1;  // Hardcoded tournament ID for now
        const playerName = "{{ user_data.username }}";  // Username from template
        const matchesContainer = document.getElementById("matches-container");

        try {
            const response = await fetch(`/getPlayerMatches/${tournamentId}/${playerName}`);

            if (!response.ok) {
                throw new Error(`Failed to fetch matches: ${response.statusText}`);
            }

            const result = await response.json();
            const matches = result.matches; // Extract the matches from the response

            // Clear the "Loading matches..." message
            matchesContainer.innerHTML = "";

            // Check if we got matches and update the UI
            if (matches.length === 0) {
                matchesContainer.innerHTML = "<p class='secondary-font'>No recent matches found.</p>";
            } else {
                matches.forEach((match, index) => {
                    const gameDiv = document.createElement("div");
                    gameDiv.className = "game-display";

                    // Determine if current user is player1 or player2
                    let opponent = match.player1 === playerName ? match.player2 : match.player1;
                    let userScore = match.player1 === playerName ? match.score1 : match.score2;
                    let opponentScore = match.player1 === playerName ? match.score2 : match.score1;

                    // Determine match result (Win, Loss, or Draw)
                    let resultText;
                    if (userScore > opponentScore) {
                        resultText = "Win";
                    } else if (userScore < opponentScore) {
                        resultText = "Loss";
                    } else {
                        resultText = "Draw1";
                    }

                    // Get the match date
                    const matchDate = match.date;

                    // Insert the match result, opponent, scores, and date into the gameDiv
                    gameDiv.innerHTML = `
                        <div class="primary-font ${resultText.toLowerCase()}">
                            ${resultText} (${matchDate}) <!-- Displaying the date here -->
                        </div>
                        <div class="vertical-bar"></div>
                        <div class="secondary-font player-name">
                            ${opponent}
                        </div>
                        <div class="secondary-font score">
                            ${userScore} - ${opponentScore}
                        </div>
                    `;

                    // Append the match data to the container
                    matchesContainer.appendChild(gameDiv);
                });
            }
        } catch (error) {
            console.error('Error fetching matches:', error);
            matchesContainer.innerHTML = "<p class='secondary-font'>Failed to load matches.</p>";
        }
    }