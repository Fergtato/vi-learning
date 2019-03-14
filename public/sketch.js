var io;
let xRotation;
let yRotation;
let zoomAmount;
let moving = false;
let zooming = false;
let joystick = false;
let joystickX, joystickY;
let zoomY;
let sideBarWidth;
let rotateImg;
let planetInfoID = 0;
let planetInfoShow = false;

let gridItems = [];
let options = [];

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

showOrbitTracks = true;

function setup() {
    createCanvas(window.innerWidth, window.innerHeight);

    joystickX = width/2;
    joystickY = height/2;
    zoomY = height/2;

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

    if (planetInfoShow) {
        planetInfo();
    }

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
            planetInfoShow = true;
            planetInfoID = this.i;
        }
    }

    update(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
}

class Option {
    constructor(i, text, call) {
        this.i = i;
        this.text = text;
        this.call = call;
    }

    display() {
        fill(41);
        stroke(51);
        rectMode(CORNER);
        rect(width-sideBarWidth + 20,80+(this.i*70),sideBarWidth-40,50);

        textAlign(CENTER, CENTER);
        fill(255);
        noStroke();
        textSize(18);
        text(this.text, width-(sideBarWidth/2), 80+(this.i*70)+25);
    }

    clicked() {
        if (mouseX > width-sideBarWidth + 20 && mouseX < width-20 && mouseY > 80+(this.i*70) && mouseY < 80+(this.i*70)+50) {
            this.call();
        }
    }
}

function planetGrid() {

    for (let i = 0; i < 9; i++) {
        gridItems[i].display();
    }

}

function planetInfo() {
    rectMode(CORNER);
    fill(35);
    rect(0,0,width-sideBarWidth,height);

    textAlign(CENTER, CENTER);
    fill(255);
    textSize(35);
    text(planetNames[planetInfoID], (width-sideBarWidth)/2, 100);

    image(planetImages[planetInfoID], (width-sideBarWidth)/2, height/2, width/3.5,width/3.5);

    rectMode(CENTER);
    fill(41);
    stroke(51);
    rect((width-sideBarWidth)/2, height-100, 400, 80);
    textAlign(CENTER, CENTER);
    fill(255);
    textSize(22);
    text("SHOW UNIVERSE", (width-sideBarWidth)/2, height-100);
}

function sideBar() {
    rectMode(CORNER);
    fill(31);
    rect(width-sideBarWidth, 0, sideBarWidth, height);

    textAlign(CENTER, CENTER);
    fill(255);
    textSize(14);
    text("Options", width-(sideBarWidth/2), 40);

    options[0] = new Option(0, "Orbit Rings - " + showOrbitTracks, function() {
        showOrbitTracks = !showOrbitTracks;
        io.emit('toggleOrbitTracks', showOrbitTracks);
        console.log("OrbitRings: " + showOrbitTracks);
    });
    options[1] = new Option(1, "Toggle Thing", function() {
        console.log("option1");
    });
    options[2] = new Option(2, "Toggle Thing", function() {
        console.log("option2");
    });

    for (var i = 0; i < options.length; i++) {
        options[i].display();
    }

    let joystickButtonHeight = height/6;
    fill(41);
    stroke(51);
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

    fill(51);
    rect(20, 20, 40, height-40);
    rectMode(CENTER);
    fill(41);
    let limitedZoomy = constrain(zoomY, 40, height-40);
    rect(40, limitedZoomy, 40, 40);

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
    } else if (zooming) {
        let zoomAmount = dist(0, height/2, 0, mouseY);
        if (mouseY < height/2) {
            io.emit('zoom', zoomAmount);
        } else {
            io.emit('zoom', -zoomAmount);
        }
    }
}

function touchStarted() {
    if (joystick) {

        if (!moving && mouseX > width-40 && mouseX < width-15 && mouseY > 15 && mouseY < 40) {
            joystick = false;
        }

    } else {
        if (!planetInfoShow) {
            for (let i = 0; i < gridItems.length; i++) {
                gridItems[i].clicked();
            }
        } else {
            if (mouseX > ((width-sideBarWidth)/2)-200 && mouseX < ((width-sideBarWidth)/2)+200 && mouseY > (height-100)-40 && mouseY < (height-100)+40) {
                planetInfoShow = false;
                io.emit('closePlanetInfo');
                for (let i = 0; i < gridItems.length; i++) {
                }
            }

            rect((width-sideBarWidth)/2, height-100, 400, 80);
        }

        if (mouseX > width-sideBarWidth+20 && mouseX < width-20 && mouseY > height-height/6 && mouseY < height-20) {
            joystick = true;
        }

        for (let i = 0; i < options.length; i++) {
            options[i].clicked();
        }
    }



}

function touchMoved() {
    if (mouseX > 100) {
        zooming = false;
        moving = true;
        joystickX = mouseX;
        joystickY = mouseY;
    } else {
        moving = false;
        zooming = true;
        zoomY = mouseY;
    }

}

function touchEnded() {
    moving = false;
    joystickX = width/2;
    joystickY = height/2;
    zooming = false;
    zoomY = height/2;

    xRotation = 0;
    io.emit('xRotate', xRotation);
    yRotation = 0;
    io.emit('yRotate', yRotation);
    zoomAmount = 0;
    io.emit('zoom', zoomAmount);
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
