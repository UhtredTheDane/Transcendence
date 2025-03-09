document.getElementById('sendMessageBtn').addEventListener('click', sendMessage);

        function setGameMode(mode) {
            document.getElementById("selectedMode").textContent = "Current Mode: " + mode;
        }

        function redirectToProfile() {
            window.location.href = "/ProfilePage";
        }

        function setGameMode(mode) {
            document.getElementById('selectedMode').textContent = "Current Mode: " + mode;

            if (mode === 'AI') {
                window.location.href = '/AIMode/';
            } else if (mode === 'Unranked') {
                window.location.href = '/UnrankedMode/';
            } else if (mode === 'Ranked') {
                window.location.href = '/RankedMode/';
            } else if (mode === 'Tournament') {
                // Open Tournament Modal for options
                new bootstrap.Modal(document.getElementById('tournamentModal')).show();
            } else if (mode === 'Custom') {
                // Open Custom Mode Modal for options
                new bootstrap.Modal(document.getElementById('customModal')).show();
            }
        }