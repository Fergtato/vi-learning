var io;
let xRotation;
let yRotation;
let moving = false;
let joystick = false;
let joystickX, joystickY;
let sideBarWidth;
let rotateImg;

let gridItems = [];

let planetNames = [
    "Mercury",
    "Venus",
    "Earth",
    "Mars",
    "Jupiter",
    "Saturn",
    "Uranus",
    "Neptune",
    "Pluto"
]

let planetImages = [];

let planetImageNames = [
    "mercury",
    "venus",
    "earth",
    "mars",
    "jupiter",
    "saturn",
    "uranus",
    "neptune",
    "pluto"
]

function setup() {
    createCanvas(window.innerWidth, window.innerHeight);

    joystickX = width/2;
    joystickY = height/2;

    io = io.connect();

    io.emit('controller_connect', window.location.href.split('?id=')[1]);

    io.on('controller_connected', function(connected) {
        if (connected) {
            console.log("Connected");
        } else {
            console.log("Not Connected");
        }
    });

    for (var i = 0; i < planetImageNames.length; i++) {
        planetImages[i] = loadImage("images/icons/" + planetImageNames[i] + ".png");
    }

    rotateImg = loadImage("images/rotate.png");
}

function draw() {


    background(21);

    sideBarWidth = width/3;
    planetGrid();

    if (joystick) {
        joyStick();
    }


    checkOrientation();

}

class GridItem {
    constructor(i, x, y, width, height) {
        this.i = i;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        // this.img = loadImage("images/icons/earth.png");
    }

    display() {
        fill(31);
        stroke(41);
        rectMode(CENTER);
        rect(this.x+this.width/2, this.y+this.height/2, this.height-50, this.height-50);
        fill(0);
        textAlign(CENTER, CENTER);
        fill(255);
        text(planetNames[this.i], this.x+this.width/2, this.y+this.height-40);
        imageMode(CENTER);
        image(planetImages[this.i], this.x+this.width/2, this.y+this.height/2-10, this.height-90, this.height-90);
    }

    clicked() {
        if (mouseX > this.x && mouseX < this.x+this.width && mouseY > this.y && mouseY < this.y+this.height) {
            console.log(this.i);
            io.emit('gridItemClicked', this.i);
        }
    }
}

function planetGrid() {
    let gridWidth = width-sideBarWidth;
    let gridHeight = height;
    let gridItemWidth = gridWidth/3;
    let gridItemHeight = height/3;

    let i = 0;

    for (let y = 0; y < gridHeight; y+=gridItemHeight) {
        for (let x = 0; x < gridWidth; x+=gridItemWidth) {


            gridItems[i] = new GridItem(i,x,y,gridItemWidth,gridItemHeight);
            gridItems[i].display();

            i++;
        }
    }

}

function checkOrientation() {
    if (window.innerWidth < window.innerHeight) {
        rectMode(CORNER);
        fill(21,21,21);
        rect(0,0,width,height);
        image(rotateImg, width/2, height/2, width/2, width/2);
    }
}

function joyStick() {
    rectMode(CORNER);
    fill(242);
    rect(0,0,width, height);
    fill(221);
    stroke(186);
    ellipse(joystickX,joystickY,40,40);

    if (moving) {
        xRotation = (width/2 - mouseX);
        yRotation = (height/2 - mouseY);
        io.emit('xRotate', map(xRotation, 0, width/2, 0, 0.1));
        io.emit('yRotate', map(yRotation, 0, width/2, 0, 0.1));
    }
}

function touchStarted() {
    if (joystick) {
        moving = true;
    } else {
        for (var i = 0; i < gridItems.length; i++) {
            gridItems[i].clicked();
        }
    }

}

function touchMoved() {
    joystickX = mouseX;
    joystickY = mouseY;
}

function touchEnded() {
    moving = false;
    joystickX = width/2;
    joystickY = height/2;

    xRotation = 0;
    io.emit('xRotate', xRotation);
    yRotation = 0;
    io.emit('yRotate', yRotation);
}

function deviceMoved() {
  r = map(accelerationX, -90, 90, 0, 255);
}

function windowResized() {
  resizeCanvas(window.innerWidth, window.innerHeight);
  joystickX = width/2;
  joystickY = height/2;
  // canvas.position(windowWidth/4, windowHeight/4);
}
