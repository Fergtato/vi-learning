var io;
var message;
var yRotation;
var moving = false;
var rectPosX, rectPosY;

function setup() {
    createCanvas(window.innerWidth, window.innerHeight);
    rectMode(CENTER);

    rectPosX = width/2;
    rectPosY = height/2;

    io = io.connect();

    io.emit('controller_connect', window.location.href.split('?id=')[1]);

    io.on('controller_connected', function(connected) {
        if (connected) {
            console.log("Connected");
        } else {
            console.log("Not Connected");
        }
    });
}

function draw() {
    background(0);
    fill(255,255,0);
    rect(rectPosX,rectPosY,20,20);

    // console.log(width/2 - mouseX);
    // console.log(moving);

    if (moving) {
        message = (width/2 - mouseX);
        yRotation = (height/2 - mouseY);
        io.emit('click', map(message, 0, width/2, 0, 0.1));
        io.emit('yRotate', map(yRotation, 0, width/2, 0, 0.1));
    }
}

function touchStarted() {
    moving = true;
}

function touchMoved() {
    rectPosX = mouseX;
    rectPosY = mouseY;
    // message = map(mouseX, 0, width, -0.5, 0.5);

}

function touchEnded() {
    moving = false;
    rectPosX = width/2;
    rectPosY = height/2;

    message = 0;
    io.emit('click', message);
    yRotation = 0;
    io.emit('yRotate', yRotation);
}

// var io = io.connect();
//
// io.on('connect', function() {
//
//
//         io.emit('controller_connect', window.location.href.split('?id=')[1]);
//
//         io.on('controller_connected', function(connected) {
//             if (connected) {
//                 alert("Connected");
//             } else {
//                 alert("Not Connected");
//             }
//
//         });
//
//
//
// });
