function triggerUpload() {
	document.getElementById('profile-pic-input').click(); // Simule un clic sur l'input
}

function uploadProfilePicture(input) {
    const file = input.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    const csrftoken = document.querySelector('#csrf-form [name=csrfmiddlewaretoken]')?.value;
    if (!csrftoken) return console.error('CSRF token not found');

    formData.append('csrfmiddlewaretoken', csrftoken);

    fetch(updateAvatarUrl, {
        method: 'POST',
        body: formData,
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
