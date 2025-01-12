# Incognect - Anonymous video chat platform

Incognect is a platform for random, anonymous text and video chats. Prioritizing user privacy, it requires no login or verification—just join and connect instantly. With robust content moderation, Incognect ensures a safe and seamless experience.

## Tools and Technologies Used

-   **Frontend**: React.js, TailwindCSS, WebRTC, Socket.io-client

-   **Backend**: Node.js, Websockets (Socket.io) for signaling, matching and messaging

-   **Content Moderation**: [NSFWJS](https://nsfwjs.com/) ML model to restrict 18+ content (used on client side).

## Features

### 1. **Random Anonymous Video Chat**

-   Connect with random users worldwide for spontaneous video conversations.

-   No account creation or login required—just join and start chatting.

### 2. **Text Messaging**

-   Seamless in-chat text messaging to enhance communication during video calls.

### 3. **Emoji Reactions**

-   Instantly react during video chats with a variety of emojis for better interaction.

### 4. **Content Moderation**

-   Integrated NSFWJS ML model to actively moderate shared content, blocking inappropriate material to ensure a safe environment.

### 5. **Privacy-Focused**

-   Built with WebRTC for direct peer-to-peer communication, ensuring no data is stored on servers. Conversations remain private and secure.

### 6. **Auto Connect**

-   Automatically attempts to connect to a new user when someone skips.

### 7. **Skip Current Connection**

-   Users can skip the current connection and instantly connect with someone new.

### 8. Keyboard Shortcuts

-   `Right Arrow`: For new connection.
-   `Left Arrow`: Leave current connection.

### 9. **Simple and Responsive UI**

-   Designed with a sleek, dark-themed user interface for ease of use and accessibility on various devices.

## Run Locally

1. Clone the repository:

```bash

git clone https://github.com/ramdhankumar1425/incognect.git

```

2. Navigate to the project directory:

```bash

cd incognect

```

3. Install dependencies:

```bash

cd client

npm install

cd ..

cd server

npm install

```

4. Set up environment variables (`.env` file):

```bash

// client

VITE_SERVER_URI = http://localhost:5000



// server

CLIENT_URI = http://localhost:5173

```

5. Run the app

```bash

// client

npm run dev



// server

npm run dev

```

## Contributions

We welcome contributions from the community to enhance Incognect. Feel free to submit issues, feature requests, or pull requests to help us improve!
