/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   chatScript.js                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ykeciri <ykeciri@student.42.fr>            +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/03/26 13:13:57 by ykeciri           #+#    #+#             */
/*   Updated: 2025/03/27 21:37:58 by ykeciri          ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

window.user = typeof username !== "undefined" ? username : null;
// let user = typeof username !== 'undefined' ? username : null;
window.messages = {};

if (!user) {
  console.error("Username not defined");
}

window.chatSocket = new WebSocket(`wss://${window.location.host}/wss/chatbox/`);

chatSocket.onopen = function (event) {
  console.log("WebSocket is connected.");
};

/* ************************************************************************** */
/*                                 ON MESSAGE                                 */
/* ************************************************************************** */

chatSocket.onmessage = function (event) {
  let data = JSON.parse(event.data);
  console.log(data);
  if (data.type === "message") {
    // ! MESSAGE
    storeMessage(data);
  } else if (data.type === "friend_added") {
    // ! FRIEND ADDED
    if (data.success) {
      if (!messages[data.friend_name]) {
        messages[data.friend_name] = [];
      }
      alert("Friend added successfully!");
      location.reload();
    } else {
      alert("Failed to add friend: " + data.error);
    }
  } else if (data.type === "unfriended") {
    // ! UNFRIENDED
    if (data.success) {
      alert("Contact removed from friends");
      if (messages[selectedContact]) {
        delete messages[selectedContact];
      }
      goBackToContacts();
      location.reload();
    } else {
      alert("Failed to remove contact: " + data.error);
    }
  } else if (data.type === "challenge") {
    // ! CHALLENGE
    storeMessage(data);
  } else if (data.type === "challenge_accepted") {
    // ! CHALLENGE ACCEPTED
    alert(data.message);
  } else if (data.type === "game_created") {
    // ! GAME CREATED
    console.log("Game created, redirecting sender to:", data.game_url);
    window.location.href = data.game_url;
  }
};

chatSocket.onclose = function (event) {
  console.log("WebSocket is closed.");
};

chatSocket.onerror = function (error) {
  console.error("WebSocket error:", error);
};

/* ************************************************************************** */
/*                                                                            */
/* ************************************************************************** */

function toggleChatbox() {
  let chatbox = document.getElementById("chatbox");
  let contactList = document.getElementById("contactList");

  if (chatbox.style.display === "flex") {
    // Hide chatbox and contact list
    chatbox.style.display = "none";
    contactList.style.display = "none";
  } else {
    displayChatBox();
  }
}

function addFriend() {
  const friendName = document.getElementById("floatingInput").value.trim();
  if (friendName) {
    chatSocket.send(
      JSON.stringify({
        type: "add_friend",
        sender: user,
        friend_name: friendName,
      })
    );
    document.getElementById("floatingInput").value = ""; // Clear input

    // Clear any existing messages for this contact
    if (messages[friendName]) {
      delete messages[friendName];
    }
  }
}

function selectContact(contact) {
  selectedContact = contact;
  // Update header with redirection to ProfilePage with user_id
  document.getElementById("chatboxHeader").innerHTML = `
        <img class="back-btn" onclick="goBackToContacts()" src="/static/icons/arrow-left.png" style="height: 24px; width: 24px;">
        <span onclick="window.location.href='/ProfilePage/${contact}'" style="cursor: pointer;">${contact}</span>
        <div>
            <img class="back-btn" onclick="blockContact()" src="/static/icons/bloquer.png" style="height: 24px; width: 24px; margin-left: -15px;">
            <img class="back-btn" onclick="challengeContact()" src="/static/icons/combat.png" style="height: 24px; width: 24px;">
        </div>
    `;
  // Clear chat
  let chatboxBody = document.getElementById("chatboxBody");
  chatboxBody.innerHTML = "";

  // Fetch and display previous messages
  fetch(`/get_messages/${contact}/`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      if (data.messages) {
        data.messages.forEach((msg) => {
          if (msg.content == "I challenge you to a Pong duel!")
            printChallenge(msg);
          else {
            displayMessage(
              msg.sender,
              msg.content,
              msg.sender === user ? "right" : "left"
            );
          }
        });
        chatboxBody.scrollTop = chatboxBody.scrollHeight;
      }
    })
    .catch((error) => {
      console.error("Error fetching messages:", error);
      alert("Failed to load messages. Please try again.");
    });

  // Show/enable input
  document.getElementById("contactList").style.display = "none";
  document.getElementById("messageInput").style.display = "block";
  document.getElementById("sendMessageBtn").style.display = "block";
  document.getElementById("messageInput").disabled = false;
  document.getElementById("sendMessageBtn").disabled = false;
  document.getElementById("messageInput").focus();
}

function goBackToContacts() {
  chatbox.style.display = "flex";
  contactList.style.display = "flex";
  document.getElementById("chatboxBody").innerHTML = ""; // Clear chat
  document.getElementById("messageInput").style.display = "none"; // Hide input field initially
  document.getElementById("sendMessageBtn").style.display = "none"; // Hide send button initially
  document.getElementById("messageInput").disabled = true; // Disable input field
  document.getElementById("sendMessageBtn").disabled = true; // Disable send button
  document.getElementById(
    "chatboxHeader"
  ).innerHTML = `<div class="chatbox-header"">
		Chat
		<img src="/static/icons/plus.svg">
		</div>
		`;
  selectedContact = null;
}

function sendMessage() {
  let messageInput = document.getElementById("messageInput");
  let messageText = messageInput.value.trim();

  if (messageText !== "") {
    // Store outgoing message
    if (!messages[selectedContact]) {
      messages[selectedContact] = [];
    }
    messages[selectedContact].push({
      sender: user,
      content: messageText,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });

    // Display
    displayMessage(user, messageText, "right");

    // Send message
    chatSocket.send(
      JSON.stringify({
        type: "message",
        sender: user,
        receiver: selectedContact,
        content: messageText,
      })
    );
    messageInput.value = "";
  }
}

document
  .getElementById("messageInput")
  .addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      sendMessage();
    }
  });

document
  .getElementById("sendMessageBtn")
  .addEventListener("click", sendMessage);

function deletePlayer(button) {
  const playerDiv = button.parentElement;
  playerDiv.remove();
}

function blockContact() {
  if (selectedContact) {
    chatSocket.send(
      JSON.stringify({
        type: "unfriend",
        sender: user,
        contact_name: selectedContact,
      })
    );
    if (messages[selectedContact]) {
      delete messages[selectedContact];
    }
  }
}

function challengeContact() {
  if (selectedContact) {
    const challengeMessage = "I challenge you to a Pong duel!";

    const data = {
      sender: user,
      content: challengeMessage,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    // Store outgoing message
    storeMessage(data);

    displayMessage(user, challengeMessage, "right");

    // chatSocket.send(
    //   JSON.stringify({
    //     type: "challenge",
    //     sender: user,
    //     receiver: selectedContact,
    //     content: challengeMessage,
    //   })
    // );
    chatSocket.send(
      JSON.stringify({
        type: "message",
        sender: user,
        receiver: selectedContact,
        content: challengeMessage,
      })
    );
  }
}

function displayMessage(sender, content, align) {
  let chatboxBody = document.getElementById("chatboxBody");
  let messageContainer = document.createElement("div");
  let senderName = document.createElement("p");
  senderName.classList.add("sender-name");
  let timestamp = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  senderName.textContent = `${sender === user ? "You" : sender} (${timestamp})`;
  senderName.style.textAlign = align;
  senderName.style.fontSize = "10px";
  senderName.style.marginBottom = "0";

  let messageContent = document.createElement("p");
  messageContent.classList.add("sender-message");
  messageContent.style.textAlign = align;
  messageContent.style.marginTop = "0";
  messageContent.style.fontSize = "16px";
  messageContent.textContent = content;

  messageContainer.appendChild(senderName);
  messageContainer.appendChild(messageContent);
  chatboxBody.appendChild(messageContainer);
  chatboxBody.scrollTop = chatboxBody.scrollHeight;
}

function printChallenge(data) {
  // Create challenge message with accept button
  let chatboxBody = document.getElementById("chatboxBody");
  let messageContainer = document.createElement("div");

  // Add sender info
  let senderName = document.createElement("p");
  senderName.classList.add("sender-name");
  let timestamp = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  senderName.textContent = `${data.sender} (${timestamp})`;
  senderName.style.textAlign = data.sender === user ? "right" : "left";
  senderName.style.fontSize = "10px";
  senderName.style.marginBottom = "0";

  // Add challenge message
  let messageContent = document.createElement("p");
  messageContent.classList.add("sender-message");
  messageContent.style.textAlign = data.sender === user ? "right" : "left";
  messageContent.style.marginTop = "0";
  messageContent.style.fontSize = "16px";
  messageContent.textContent = data.content;

  // Add accept button
  let acceptButton = document.createElement("button");
  acceptButton.textContent = "Accept Challenge";
  acceptButton.classList.add("btn", "small-first-btn", "primary-font");
  acceptButton.onclick = function () {
	data.content = "Game Already played!";
    chatSocket.send(
      JSON.stringify({
        type: "challenge_accepted",
        sender: data.sender,
        receiver: user,
      })
    );
  };

  messageContainer.appendChild(senderName);
  messageContainer.appendChild(messageContent);
  if (data.sender !== user)
	messageContainer.appendChild(acceptButton);
  chatboxBody.appendChild(messageContainer);
  chatboxBody.scrollTop = chatboxBody.scrollHeight;

  // Store the challenge message
}

function storeMessage(data) {
  // Store incoming message
  if (!messages[data.sender]) {
    messages[data.sender] = [];
  }
  messages[data.sender].push({
    sender: data.sender,
    content: data.content,
    timestamp: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    game_url: data.game_url || null,
    receiver_id: data.receiver_id || null,
    sender_id: data.sender_id || null,
  });

  if (data.sender === selectedContact) {
    if (data.content == "I challenge you to a Pong duel!") printChallenge(data);
    else displayMessage(data.sender, data.content, "left");
  }
  console.log("Message have been saved to the db");
}

function displayChatBox() {
  chatbox.style.display = "flex";
  contactList.style.display = "flex";
  document.getElementById("chatboxBody").innerHTML = ""; // Clear chat
  document.getElementById("messageInput").style.display = "none"; // Hide input field initially
  document.getElementById("sendMessageBtn").style.display = "none"; // Hide send button initially
  document.getElementById("messageInput").disabled = true; // Disable input field
  document.getElementById("sendMessageBtn").disabled = true; // Disable send button
  document.getElementById(
    "chatboxHeader"
  ).innerHTML = `<div class="chatbox-header"">
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
		`;
}

function addTournament() {
    const friendName = "tournament";
	
    if (friendName) {
		if (messages[friendName]) {
            // alert(`${friendName} is already in your contacts.`);
            return; // Prevent adding the same friend again
        }
        chatSocket.send(JSON.stringify({
            type: "add_friend",
            sender: user,
            friend_name: friendName
        }));
        
        // Clear any existing messages for this contact
        if (messages[friendName]) {
            delete messages[friendName];
        }
    }
}

function sendMessageTournament(messageText) {
    
        // Store outgoing message
        if (!messages[user]) {
            messages[user] = [];
        }
        messages[user].push({
            sender: "tournament",
            content: messageText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        // Display message
        displayMessage("tournament", messageText, 'right');

        // Send message
		console.log("---------------");
		console.log(user);
		console.log(selectedContact);
		console.log("---------------");
        chatSocket.send(JSON.stringify({
            type: "message",
            sender: "tournament",
            receiver: user,
            content: messageText
        }));
}

