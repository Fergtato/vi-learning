# Visual Interactive Learning

Cool 3D space app B-)

## Setup

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
node server.js
```

Go to localhost:8080

### Using the app

Make sure your phone is on the same network as the device running the server.

Scan the QR code with your phone and go to the link given.
(If you're not bothered to scan the code i've logged the link in the javascript console in the browser)

Use the yellow dot as a joystick on your phone to control the camera

### Temporary testing keys

[F] Animates the camera back to starting position

[T] Animates camera to zoom in

[H] Hides the planets
