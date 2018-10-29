var express = require('express'),
    http = require('http'),
    app = express(),
    server = http.createServer(app),
    port = 8080;
var game_sockets = {};

server.listen(port);

app

    // Set up index
    .get('/', function(req, res) {

        res.sendFile(__dirname + '/index.html');

    });

// Log that the servers running
console.log("Server running on port: " + port);

var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
    socket.on('game_connect', function() {

        console.log("Game connected");

        game_sockets[socket.id] = {
            socket: socket,
            controller_id: undefined
        };

        socket.emit("game_connected");
    });
});
