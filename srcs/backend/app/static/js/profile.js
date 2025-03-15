function triggerUpload() {
	document.getElementById('profile-pic-input').click(); // Simule un clic sur l'input
}

function getCSRFToken() {
    return document.cookie.split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
}

function uploadProfilePicture(input) {
    const file = input.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    const csrftoken = getCSRFToken();
    if (!csrftoken) return console.error('CSRF token not found');

    fetch(updateAvatarUrl, {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRFToken': csrftoken
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            const profilePicture = document.getElementById('profile-picture-box');
            profilePicture.style.backgroundImage = `url('${data.image_url}')`;

            const navAvatar = document.getElementById('navAvatar');
            if (navAvatar) {
                navAvatar.style.backgroundImage = `url('${data.image_url}')`;
            }
        } else {
            alert('Error uploading image: ' + (data.errors || data.message));
        }
    })
    .catch(error => console.error('Error:', error));
}
