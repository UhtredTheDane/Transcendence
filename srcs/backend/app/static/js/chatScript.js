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
		document.getElementById('chatboxHeader').innerHTML = `<div class="chatbox-header"">
		Chat
			<div class="dropup">
				<button class="btn " type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
					<img src="/static/icons/plus.svg">
				</button>
				<div class="dropdown-menu form-floating" aria-labelledby="dropdownMenuButton" style="
				align-items: center;
				padding: 15px 10px;
				translate: 30px 10px;
				width: 350px;
				height: 100px;
				
				">
					<div class="form-floating mb-3">
						<input type="email" class="form-control" id="floatingInput" placeholder="name@example.com">
						<label for="floatingInput">Friend's Name</label>
					</div>
				</div>
			</div>
		</div>
		`; // Set the title to "Chat"
	}
}

function selectContact(contact) {
	selectedContact = contact;
	document.getElementById('chatboxHeader').innerHTML = `
		<img class="back-btn" onclick="goBackToContacts()" src="/static/icons/arrow-left.png" style="height 24px; width: 24px;" >${contact}
		<div>
			<img class="back-btn" onclick="blockContact()" src="/static/icons/bloquer.png" style="height 24px; width: 24px; margin-left: -15px;" >
			<img class="back-btn" onclick="challengeContact()" src="/static/icons/combat.png" style="height 24px; width: 24px;" >
		</div>
		`;
	document.getElementById('contactList').style.display = 'none'; // Hide contact list
	document.getElementById('chatboxBody').innerHTML = ''; // Clear chat
	document.getElementById('messageInput').style.display = 'block'; // Show input field
	document.getElementById('sendMessageBtn').style.display = 'block'; // Show send button
	document.getElementById('messageInput').disabled = false; // Enable input field
	document.getElementById('sendMessageBtn').disabled = false; // Enable send button
	document.getElementById('messageInput').focus(); // Auto-focus input when a contact is selected
}

function goBackToContacts() {
	chatbox.style.display = 'flex';
		contactList.style.display = 'flex';
		document.getElementById('chatboxBody').innerHTML = ''; // Clear chat
		document.getElementById('messageInput').style.display = 'none'; // Hide input field initially
		document.getElementById('sendMessageBtn').style.display = 'none'; // Hide send button initially
		document.getElementById('messageInput').disabled = true; // Disable input field
		document.getElementById('sendMessageBtn').disabled = true; // Disable send button
		document.getElementById('chatboxHeader').innerHTML = `<div class="chatbox-header"">
		Chat
		<img src="/static/icons/plus.svg">
		</div>
		`;
}

function sendMessage() {
	let messageInput = document.getElementById('messageInput');
	let messageText = messageInput.value.trim();

	if (messageInput == null) {
        messageInput = "";
    }
	
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

document.getElementById('sendMessageBtn').addEventListener('click', sendMessage);

function deletePlayer(button) {
	const   playerDiv = button.parentElement;
	playerDiv.remove();
}

function blockContact() {
	alert("Contact blocked");
}

function challengeContact() {
	alert("Challenge sent!");
}