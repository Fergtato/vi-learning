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
];

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
];

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

    for (let i = 0; i < planetImageNames.length; i++) {
        planetImages[i] = loadImage("images/icons/" + planetImageNames[i] + ".png");
    }

    rotateImg = loadImage("images/rotate.png");

    sideBarWidth = width/3;

    let gridWidth = width-sideBarWidth;
    let gridHeight = height;
    let gridItemWidth = gridWidth/3;
    let gridItemHeight = height/3;

    let index = 0;

    for (let y = 0; y < gridHeight; y+=gridItemHeight) {
        for (let x = 0; x < gridWidth; x+=gridItemWidth) {


            gridItems[index] = new GridItem(index,x,y,gridItemWidth,gridItemHeight);

            index++;
        }
    }
}


function draw() {

    background(21);

    planetGrid();

    sideBar();

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
        this.background = 31;
    }

    display() {
        fill(this.background);
        stroke(41);
        rectMode(CENTER);
        rect(this.x+this.width/2, this.y+this.height/2, this.height-50, this.height-50);
        fill(0);
        textAlign(CENTER, CENTER);
        textSize(12);
        fill(255);
        text(planetNames[this.i], this.x+this.width/2, this.y+this.height-40);
        imageMode(CENTER);
        image(planetImages[this.i], this.x+this.width/2, this.y+this.height/2-10, this.height-100, this.height-100);
    }

    clicked() {
        this.background = 31;
        if (mouseX > this.x && mouseX < this.x+this.width && mouseY > this.y && mouseY < this.y+this.height) {
            console.log(this.i);
            io.emit('gridItemClicked', this.i);
            this.background = 51;
        }
    }

    update(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}

function planetGrid() {

    for (let i = 0; i < 9; i++) {
        gridItems[i].display();
    }

}

function sideBar() {
    rectMode(CORNER);
    fill(31);
    rect(width-sideBarWidth, 0, sideBarWidth, height);

    let joystickButtonHeight = height/6;
    fill(41);
    rect(width-sideBarWidth + 20, height - joystickButtonHeight, sideBarWidth-40, joystickButtonHeight-20);
    textAlign(CENTER, CENTER);
    fill(255);
    textSize(22);
    text("JOYSTICK", width-(sideBarWidth/2), height-joystickButtonHeight/2-10);
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
    fill(31);
    rect(0,0,width, height);

    stroke(91);
    line(width-40,40,width-15,15);
    line(width-40,15,width-15,40);

    noFill();
    stroke(51);
    ellipse(joystickX,joystickY,80,80);
    fill(61);
    stroke(51);
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

        if (!moving && mouseX > width-40 && mouseX < width-15 && mouseY > 15 && mouseY < 40) {
            joystick = false;
        }

    } else {
        for (let i = 0; i < gridItems.length; i++) {
            gridItems[i].clicked();
        }

        if (mouseX > width-sideBarWidth+20 && mouseX < width-20 && mouseY > height-height/6 && mouseY < height-20) {
            joystick = true;
        }
    }



}

function touchMoved() {
    moving = true;
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

  sideBarWidth = width/3;

  let gridWidth = width-sideBarWidth;
  let gridHeight = height;
  let gridItemWidth = gridWidth/3;
  let gridItemHeight = height/3;

  let index = 0;

  for (let y = 0; y < gridHeight; y+=gridItemHeight) {
      for (let x = 0; x < gridWidth; x+=gridItemWidth) {


          gridItems[index].update(x,y,gridItemWidth,gridItemHeight);

          index++;
      }
  }
}
