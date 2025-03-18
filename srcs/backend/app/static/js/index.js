function redirectToProfile() {
	window.location.href = "/ProfilePage";
}

function showLeaderboard() {
	console.log("showLeaderboard");
	console.log(top_players);
	document.getElementById("leaderboardPopup").classList.add("show");
}

function closeLeaderboard() {
	document.getElementById("leaderboardPopup").classList.remove("show");
}

function getUrl() {
    return window.location.href;
}

function loadTemplate() {
    const templates = [
        { url: '/leaderboard/', elementId: 'leaderboard-popup' },
        { url: '/navbar/', elementId: 'navbar-container' }
    ];

    templates.forEach(template => {
        fetch(template.url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${template.url}: ${response.statusText}`);
                }
                return response.text();
            })
            .then(data => {
                const element = document.getElementById(template.elementId);
                if (element) {
                    console.log(`Inserting content into #${template.elementId}`);
                    element.innerHTML = data;

                    // Réexécuter les scripts après injection du leaderboard
                    // if (template.elementId === "leaderboard-popup") {
                    //     reinitializeLeaderboard();
                    // }
                } else {
                    console.error(`Element with ID ${template.elementId} not found`);
                }
            })
            .catch(error => {
                console.error(`Error loading ${template.url}:`, error);
            });
    });
}

// Fonction qui récupère les données après le chargement du leaderboard
// function reinitializeLeaderboard() {
//     console.log("Leaderboard loaded dynamically");

//     // Récupérer les données après chargement
//     fetch('/leaderboard/')
//         .then(response => response.json())
//         .then(data => {
//             console.log("Leaderboard Data:", data);
//             updateLeaderboard(data);
//         })
//         .catch(error => console.error("Error fetching leaderboard data:", error));
// }

// Mettre à jour la pop-up du leaderboard
function updateLeaderboard(players) {
    const leaderboardTable = document.querySelector("#leaderboardPopup tbody");
    leaderboardTable.innerHTML = "";  // Reset la liste

    if (players.length === 0) {
        leaderboardTable.innerHTML = `<tr><td colspan="3" style="text-align: center;">No players found</td></tr>`;
        return;
    }

    players.forEach((player, index) => {
        let row = `
            <tr>
                <th scope="row">${index + 1}</th>
                <td>${player.username}</td>
                <td style="text-align: right;">${player.elo_rating}</td>
            </tr>`;
        leaderboardTable.innerHTML += row;
    });
}
