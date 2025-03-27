function redirectToProfile() {
	window.location.href = "/ProfilePage";
}

function getUrl() {
    return window.location.href;
}

function loadTemplate() {
    const templates = [
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
                    element.innerHTML = data;
                } /* else { */
                //     console.error(`Element with ID ${template.elementId} not found`);
                // }
            })
            // .catch(error => {
            //     console.error(`Error loading ${template.url}:`, error);
            // });
    });
}
