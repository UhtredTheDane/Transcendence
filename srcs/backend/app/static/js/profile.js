const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

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

function enableEditing(field){
	document.getElementById('saveButton').style.display = 'inline-block';
	const   textElement = field.previousElementSibling;
    const   inputElement = document.createElement('input');
	inputElement.id = "inputToEnter"
	
    inputElement.value = textElement.innerText || textElement.innerHTML;
    textElement.style.display = 'none';
    field.style.display = 'none';
    textElement.parentNode.insertBefore(inputElement, textElement);
    inputElement.focus();
    inputElement.onblur = function() {
        textElement.innerHTML = inputElement.value;
        inputElement.remove();
        field.style.display = 'inline-block';
        textElement.style.display = 'block';
    }
}

// document
//   .getElementById("inputToEnter")
//   .addEventListener("keydown", function (event) {
//     if (event.key === "Enter") {
// 		saveEdits();
//     }
//   });

function getCSRFToken() {
    return document.cookie.split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
}

function saveEdits() {
    const username = document.getElementById("username").innerText.trim();
    const email = document.getElementById("email").innerText.trim();
	const password = document.getElementById("password")?.innerText.trim() || '********';
    const csrftoken = getCSRFToken();

    // Validate data before sending
    if (!username || !email) {
        alert('Username and email are required');
        return;
    }

    const data = {
        username: username,
        email: email,
        password: password === '********' ? null : password
    };

    // Log data being sent
    console.log('Sending data:', data);

    fetch('/save_profile/', {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Accept": "application/json",
			"X-CSRFToken": csrftoken
		},
		credentials: 'same-origin',
		body: JSON.stringify(data)
	})
	console.log("Data sent")
	document.getElementById('saveButton').style.display = 'none';

}