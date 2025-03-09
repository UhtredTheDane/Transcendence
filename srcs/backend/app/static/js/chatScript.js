let selectedContact = null;

function toggleChatbox() {
	let chatbox = document.getElementById('chatbox');
	let contactList = document.getElementById('contactList');

	if (chatbox.style.display === 'flex') {
		// Hide chatbox and contact list
		chatbox.style.display = 'none';
		contactList.style.display = 'none';
	} else {
		// Show chatbox and reset state
		chatbox.style.display = 'flex';
		contactList.style.display = 'flex';
		document.getElementById('chatboxBody').innerHTML = ''; // Clear chat
		document.getElementById('messageInput').style.display = 'none'; // Hide input field initially
		document.getElementById('sendMessageBtn').style.display = 'none'; // Hide send button initially
		document.getElementById('messageInput').disabled = true; // Disable input field
		document.getElementById('sendMessageBtn').disabled = true; // Disable send button
		document.getElementById('chatboxHeader').innerHTML = 'Chat'; // Set the title to "Chat"
	}
}

function selectContact(contact) {
	selectedContact = contact;
	document.getElementById('chatboxHeader').innerHTML = `<button class="back-btn" onclick="goBackToContacts()">&#8592;</button> ${contact}`;
	document.getElementById('contactList').style.display = 'none'; // Hide contact list
	document.getElementById('chatboxBody').innerHTML = ''; // Clear chat
	document.getElementById('messageInput').style.display = 'block'; // Show input field
	document.getElementById('sendMessageBtn').style.display = 'block'; // Show send button
	document.getElementById('messageInput').disabled = false; // Enable input field
	document.getElementById('sendMessageBtn').disabled = false; // Enable send button
	document.getElementById('messageInput').focus(); // Auto-focus input when a contact is selected
}

function goBackToContacts() {
	document.getElementById('contactList').style.display = 'flex'; // Show contact list
	document.getElementById('chatboxBody').innerHTML = ''; // Clear chat
	document.getElementById('messageInput').style.display = 'none'; // Hide input field
	document.getElementById('sendMessageBtn').style.display = 'none'; // Hide send button
	document.getElementById('messageInput').disabled = true; // Disable input field
	document.getElementById('sendMessageBtn').disabled = true; // Disable send button
	document.getElementById('chatboxHeader').innerHTML = "Chat"; // Set header back to "Chat"
}

function sendMessage() {
	let messageInput = document.getElementById('messageInput');
	let messageText = messageInput.value.trim();

	if (messageText !== '') {
	let chatboxBody = document.getElementById('chatboxBody');
	let messageElement = document.createElement('div');
	messageElement.classList.add('message'); // Add class for styling
	messageElement.textContent = messageText;
	chatboxBody.appendChild(messageElement);

	messageInput.value = ''; // Clear input field
	chatboxBody.scrollTop = chatboxBody.scrollHeight; // Auto-scroll to latest message
	}
}

document.getElementById('messageInput').addEventListener('keydown', function (event) {
	if (event.key === 'Enter') {
		sendMessage();
	}
});