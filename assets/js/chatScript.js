const socket = new WebSocket(`ws://${window.location.host}`);


socket.onopen = () => {
	console.log("Connecté au WebSocket du jeu");
	isSocketOpen = true;
};

socket.onerror = (error) => {
	console.error("WebSocket Erreur :", error);
};

socket.onclose = () => {
	console.log("WebSocket fermé");
	isSocketOpen = false;
};

socket.onmessage = function(event) {
	const data = JSON.parse(event.data);
	


}


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
        let messageContainer = document.createElement('div');
        
        let senderName = document.createElement('p');
        senderName.classList.add('sender-name');
		let timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        senderName.textContent = `You (${timestamp})`;
		senderName.style.textAlign = 'right';
		senderName.style.fontSize = '10px'; // Override
		senderName.style.marginBottom = '0';
        
        let messageContent = document.createElement('p');
        messageContent.classList.add('sender-message');
		messageContent.style.textAlign = 'right';
		messageContent.style.marginTop = '0';
		messageContent.style.fontSize = '16px'; // Override
        messageContent.textContent = messageText;
        
        messageContainer.appendChild(senderName);
        messageContainer.appendChild(messageContent);
        
        chatboxBody.appendChild(messageContainer);
        messageInput.value = ''; // Clear input field
        chatboxBody.scrollTop = chatboxBody.scrollHeight; // Auto-scroll to latest message
    }
	socket.send(JSON.stringify({ type: "message", sender: "player1", receiver: "player2", content: `${messageText}` }));

}

document.getElementById('messageInput').addEventListener('keydown', function (event) {
	if (event.key === 'Enter') {
		sendMessage();
	}
});

// Add event listener for Send button click
document.getElementById('sendMessageBtn').addEventListener('click', sendMessage);

function setGameMode(mode) {
	document.getElementById("selectedMode").textContent = "Current Mode: " + mode;
}

function redirectToProfile() {
	window.location.href = "ProfilePage.html";
}

function setGameMode(mode) {
	document.getElementById('selectedMode').textContent = "Current Mode: " + mode;
	
	if (mode === 'AI') {
		window.location.href = 'AIMode.html';
	} else if (mode === 'Unranked') {
		window.location.href = 'UnrankedMode.html';
	} else if (mode === 'Ranked') {
		window.location.href = 'RankedMode.html';
	} else if (mode === 'Tournament') {
		// Open Tournament Modal for options
		new bootstrap.Modal(document.getElementById('tournamentModal')).show();
	} else if (mode === 'Custom') {
		// Open Custom Mode Modal for options
		new bootstrap.Modal(document.getElementById('customModal')).show();
	}
}