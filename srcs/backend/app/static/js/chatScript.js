let selectedContact = null;
let user = typeof username !== 'undefined' ? username : null;
let messages = {};

if (!user) {
    console.error('Username not defined');
}

const socket = new WebSocket(`ws://${window.location.host}/ws/chatbox/`);


socket.onopen = function(event) {
	console.log('WebSocket is connected.');
};

socket.onmessage = function(event) {
	let data = JSON.parse(event.data);
    if (data.type === 'message') {
        // Store incoming message
        if (!messages[data.sender]) {
            messages[data.sender] = [];
        }
        messages[data.sender].push({
            sender: data.sender,
            content: data.content,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        if (data.sender === selectedContact) {
            displayMessage(data.sender, data.content, 'left');
        }
    }
	else if (data.type === 'friend_added') {
        if (data.success) {
            // Initialize messages array for new friend
            if (!messages[data.friend_name]) {
                messages[data.friend_name] = [];
            }
            alert('Friend added successfully!');
            location.reload();
        } else {
            alert('Failed to add friend: ' + data.error);
        }
    }
	else if (data.type === 'unfriended') {
        if (data.success) {
            alert('Contact removed from friends');
            // Clear messages when unfriended
            if (messages[selectedContact]) {
                delete messages[selectedContact];
            }
            goBackToContacts();
            location.reload();
        } else {
            alert('Failed to remove contact: ' + data.error);
        }
    }
	else if (data.type === 'challenge') {
        // Create challenge message with accept button
        let chatboxBody = document.getElementById('chatboxBody');
        let messageContainer = document.createElement('div');
        
        // Add sender info
        let senderName = document.createElement('p');
        senderName.classList.add('sender-name');
        let timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        senderName.textContent = `${data.sender} (${timestamp})`;
        senderName.style.textAlign = 'left';
        senderName.style.fontSize = '10px';
        senderName.style.marginBottom = '0';
        
        // Add challenge message
        let messageContent = document.createElement('p');
        messageContent.classList.add('sender-message');
        messageContent.style.textAlign = 'left';
        messageContent.style.marginTop = '0';
        messageContent.style.fontSize = '16px';
        messageContent.textContent = data.content;
        
        // Add accept button
        let acceptButton = document.createElement('button');
        acceptButton.textContent = 'Accept Challenge';
        acceptButton.classList.add('btn', 'btn-primary', 'mt-2');
        acceptButton.onclick = function() {
            window.location.href = `/RankedMode/${data.sender}`;
        };
        
        messageContainer.appendChild(senderName);
        messageContainer.appendChild(messageContent);
        messageContainer.appendChild(acceptButton);
        chatboxBody.appendChild(messageContainer);
        chatboxBody.scrollTop = chatboxBody.scrollHeight;

        // Store the challenge message
        if (!messages[data.sender]) {
            messages[data.sender] = [];
        }
        messages[data.sender].push({
            sender: data.sender,
            content: data.content,
            timestamp: timestamp
        });
    }
};

socket.onclose = function(event) {
	console.log('WebSocket is closed.');
};

socket.onerror = function(error) {
	console.error('WebSocket error:', error);
};

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
                        <input type="text" class="form-control" id="floatingInput" placeholder="MyfriendsName">
                        <label for="floatingInput">Friend's Name</label>
                        <button class="btn btn-primary" onclick="addFriend()">Add Friend</button>
                    </div>
				</div>
			</div>
		</div>
		`; // Set the title to "Chat"
	}
}

function addFriend() {
    const friendName = document.getElementById('floatingInput').value.trim();
    if (friendName) {
        socket.send(JSON.stringify({
            type: "add_friend",
            sender: user,
            friend_name: friendName
        }));
        document.getElementById('floatingInput').value = ''; // Clear input
        
        // Clear any existing messages for this contact
        if (messages[friendName]) {
            delete messages[friendName];
        }
    }
}

function selectContact(contact) {
    selectedContact = contact;
    // Update header with redirection to ProfilePage with user_id
    document.getElementById('chatboxHeader').innerHTML = `
        <img class="back-btn" onclick="goBackToContacts()" src="/static/icons/arrow-left.png" style="height: 24px; width: 24px;">
        <span onclick="window.location.href='/ProfilePage/${contact}'" style="cursor: pointer;">${contact}</span>
        <div>
            <img class="back-btn" onclick="blockContact()" src="/static/icons/bloquer.png" style="height: 24px; width: 24px; margin-left: -15px;">
            <img class="back-btn" onclick="challengeContact()" src="/static/icons/combat.png" style="height: 24px; width: 24px;">
        </div>
    `;
    // Clear chat
    let chatboxBody = document.getElementById('chatboxBody');
    chatboxBody.innerHTML = '';
    
    // Fetch and display previous messages
	fetch(`/get_messages/${contact}/`)
	.then(response => {
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		return response.json();
	})
	.then(data => {
		if (data.messages) {
			data.messages.forEach(msg => {
				displayMessage(msg.sender, msg.content, msg.sender === user ? 'right' : 'left');
			});
			chatboxBody.scrollTop = chatboxBody.scrollHeight;
		}
	})
	.catch(error => {
		console.error('Error fetching messages:', error);
		alert('Failed to load messages. Please try again.');
	});


    // Show/enable input
    document.getElementById('contactList').style.display = 'none';
    document.getElementById('messageInput').style.display = 'block';
    document.getElementById('sendMessageBtn').style.display = 'block';
    document.getElementById('messageInput').disabled = false;
    document.getElementById('sendMessageBtn').disabled = false;
    document.getElementById('messageInput').focus();
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
	selectedContact = null;
}

function sendMessage() {
    let messageInput = document.getElementById('messageInput');
    let messageText = messageInput.value.trim();

    if (messageText !== '') {
        // Store outgoing message
        if (!messages[selectedContact]) {
            messages[selectedContact] = [];
        }
        messages[selectedContact].push({
            sender: user,
            content: messageText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        // Display message
        displayMessage(user, messageText, 'right');

        // Send message
        socket.send(JSON.stringify({
            type: "message",
            sender: user,
            receiver: selectedContact,
            content: messageText
        }));
        
        messageInput.value = '';
    }
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
    if (selectedContact) {
        socket.send(JSON.stringify({
            type: "unfriend",
            sender: user,
            contact_name: selectedContact
        }));
        
        // Clear messages for unfriended contact
        if (messages[selectedContact]) {
            delete messages[selectedContact];
        }
    }
}

function challengeContact() {
    if (selectedContact) {
        const challengeMessage = "I challenge you to a Pong duel!";
        
        // Store challenge message
        if (!messages[selectedContact]) {
            messages[selectedContact] = [];
        }
        messages[selectedContact].push({
            sender: user,
            content: challengeMessage,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        // Display challenge message
        displayMessage(user, challengeMessage, 'right');

        // Send challenge through websocket
        socket.send(JSON.stringify({
            type: "challenge",
            sender: user,
            receiver: selectedContact,
            content: challengeMessage
        }));
    }
}

function displayMessage(sender, content, align) {
    let chatboxBody = document.getElementById('chatboxBody');
    let messageContainer = document.createElement('div');
    
    let senderName = document.createElement('p');
    senderName.classList.add('sender-name');
    let timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    senderName.textContent = `${sender === user ? 'You' : sender} (${timestamp})`;
    senderName.style.textAlign = align;
    senderName.style.fontSize = '10px';
    senderName.style.marginBottom = '0';
    
    let messageContent = document.createElement('p');
    messageContent.classList.add('sender-message');
    messageContent.style.textAlign = align;
    messageContent.style.marginTop = '0';
    messageContent.style.fontSize = '16px';
    messageContent.textContent = content;
    
    messageContainer.appendChild(senderName);
    messageContainer.appendChild(messageContent);
    chatboxBody.appendChild(messageContainer);
    chatboxBody.scrollTop = chatboxBody.scrollHeight;
}