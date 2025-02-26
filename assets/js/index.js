function isUserLoggedIn() {
	return localStorage.getItem("userLoggedIn") === "true"; 
}

function redirectToProfile() {
	if (isUserLoggedIn()) {
		window.location.href = "/profilepage.html";
	} else {
		window.location.href = "/SignIn.html";
	}
}

function showLeaderboard() {
	document.getElementById("leaderboardPopup").classList.add("show");
}

function closeLeaderboard() {
	document.getElementById("leaderboardPopup").classList.remove("show");
}

function loadTemplate() {
	const templates = [
		{ url: 'assets/templates/leaderboard.html', elementId: 'leaderboard-popup' },
		{ url: 'assets/templates/navbar.html', elementId: 'navbar-container' }
	];

    const fetchPromises = templates.map(template =>
        fetch(template.url).then(response => response.text())
    );

    Promise.all(fetchPromises)
        .then(dataArray => {
            dataArray.forEach((data, index) => {
                document.getElementById(templates[index].elementId).innerHTML = data;
            });
        })
        .catch(error => {
            console.error('Error loading templates:', error);
        });
}
