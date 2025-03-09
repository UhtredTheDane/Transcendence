function redirectToProfile() {
	window.location.href = "/ProfilePage";
}

function showLeaderboard() {
	document.getElementById("leaderboardPopup").classList.add("show");
}

function closeLeaderboard() {
	document.getElementById("leaderboardPopup").classList.remove("show");
}

function getUrl() {
    return window.location.href;
}

function loadTemplate() {
    console.log(getUrl())
    const templates = [
        { url: '/leaderboard/', elementId: 'leaderboard-popup' },
        { url: '/navbar/', elementId: 'navbar-container' }
    ];

    const fetchPromises = templates.map(template =>
        fetch(template.url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${template.url}: ${response.statusText}`);
                }
                return response.text();
            })
    );

    Promise.all(fetchPromises)
        .then(dataArray => {
            dataArray.forEach((data, index) => {
                const element = document.getElementById(templates[index].elementId);
                if (element) {
                    console.log(`Inserting content into #${templates[index].elementId}`);
                    element.innerHTML = data;
                } else {
                    console.error(`Element with ID ${templates[index].elementId} not found`);
                }
            });
        })
        .catch(error => {
            console.error('Error loading templates:', error);
        });
}