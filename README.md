# Visual Interactive Learning

A 3D visual learning app created for my 4th Creative Computing Project

[LIVE DEMO](http://vi-learning.herokuapp.com/)

## Setup

Clone the project
```
git clone https://github.com/Fergtato/vi-learning.git
```

Navigate into the folder
```
cd vi-learning
```

Install dependencies
```
npm install
```

Edit IP address in public/solarsystem.js to your IP address in the 'game_connected' function
```
var url = "http://[Your IPv4 Address]:8080/controller.html?id=" + io.id;
```

Start server
```
npm start
```

Go to localhost:8080

### Using the app's controller

Make sure your device is on the same network as the device running the server.

The controller works best on an iPad.

Scan the QR code with your phone and go to the link given.
(The link to the controller is also logged in the javascript console of the browser)
