const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const app = express();

app.set("public", path.join(__dirname, "/"));
app.use(express.static(app.get("public")));
// Initialize a simple http server
const server = http.createServer(app);

// Initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    // Connection is up, let's add a simple event
    ws.on('message', (data) => {
        console.log('Received:', data.toString());
        let message;
        try {
            message = JSON.parse(data);

        } catch (e) {
            console.log('Wrong format');
            return;
        }

        if (message.type === 'BROADCAST') {
            // Broadcast the message to all connected clients
            wss.clients.forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    var newmessage = {
                        "type": "BROADCAST",
                        "payload": {
                            "author": "Server",
                            "message": message.payload.message
                        }
                    }
                    client.send(JSON.stringify(newmessage));
                }
            });
        }
        if (message.type === 'SENDTOSERVER') {
            var respond = {
                "type": "SERVER_MESSAGE",
                "payload": {
                    "author": "Server",
                    "message": "I received your message:<<" + message.payload.message + ">>"
                }
            }
            ws.send(JSON.stringify(respond));
        }
    });

    // Send a welcome message to the new connection
    var message = { type: "SERVER_MESSAGE", payload: { message: "Hello client You just connected!" } }
    ws.send(JSON.stringify(message));

});

// sendFile will go here
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/index.html'));
});

// Start the server on port 8080
server.listen(8080, () => {
    console.log('Server is listening on port 8080');
});