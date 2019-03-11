var express = require('express'),
    http = require('http'),
    app = express(),
    server = http.createServer(app),
    port = process.env.PORT || 8080;
var game_sockets = {};
var controller_sockets = {};

app.use(express.static('public'));

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

    socket.on('controller_connect', function(game_socket_id) {
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
    });

    socket.on('disconnect', function() {

        // Game
        if (game_sockets[socket.id]) {

            console.log("Game Disconnected");

            if (controller_sockets[game_sockets[socket.id].controller_id]) {

                controller_sockets[game_sockets[socket.id].controller_id].socket.emit("controller_connected", false);
                controller_sockets[game_sockets[socket.id].controller_id].game_id = undefined;
            }

            delete game_sockets[socket.id];
        }

        // Controller
        if (controller_sockets[socket.id]) {

            console.log("Controller Disconnected");

            if (game_sockets[controller_sockets[socket.id].game_id]) {

                game_sockets[controller_sockets[socket.id].game_id].socket.emit("controller_connected", false);
                game_sockets[controller_sockets[socket.id].game_id].controller_id = undefined;
            }

            delete controller_sockets[socket.id];
        }
    });

    socket.on('xRotate', function(xRotation) {
        socket.broadcast.emit("xRotating", xRotation);
    });

    socket.on('yRotate', function(yRotation) {
        socket.broadcast.emit("yRotating", yRotation);
    });

    socket.on('gridItemClicked', function(id) {
        socket.broadcast.emit("showBigPlanet", id);
    });

});
