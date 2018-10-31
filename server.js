var express = require('express'),
    http = require('http'),
    app = express(),
    server = http.createServer(app),
    port = 8080;
var game_sockets = {};
var controller_sockets = {};

server.listen(port);

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

// Log that the servers running
console.log("Server running on port: " + port);

var io = require('socket.io').listen(server);

io.sockets.on('connection', function(socket) {

    socket.on('game_connect', function() {

        console.log("Game connected");

        game_sockets[socket.id] = {
            socket: socket,
            controller_id: undefined
        };

        socket.emit("game_connected");
    });

    socket.on('controller_connect', function(game_socket_id){
        if (game_sockets[game_socket_id] && !game_sockets[game_socket_id].controller_id) {

            console.log("Controller Connected");

            controller_sockets[socket.id] = {
                socket: socket,
                game_id: game_socket_id
            };

            game_sockets[game_socket_id].controller_id = socket.id;
            game_sockets[game_socket_id].socket.emit("controller_connected", true);
            socket.emit("controller_connected", true);

        } else {

            console.log("Controller Connection Failed");

            socket.emit("controller_connected", false);

        }
    })

});
