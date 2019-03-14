var io = io.connect();
// const Planet = require('./planet.js').default;

io.on('connect', function() {

    // emit to the server that the game has connected
    io.emit('game_connect');

    // get the div for inserting the QR code
    var qr = document.getElementById('qr');

    var game_connected = function() {
        // controller url for pushing to Heroku server
        // var url = "https://vi-learning.herokuapp.com/controller.html?id=" + io.id;

        // controller url for running on localhost
        // change the IP address your computer's IPv4 address for the controller to work on localhost
        // e.g.  var url = "http://[YOUR LOCAL IP ADDRESS]:8080/controller.html?id=" + io.id;
        var url = "http://192.168.1.15:8080/controller.html?id=" + io.id;

        console.log("Controller: " + url);
        // create QR using generated url
        var qr_code = new QRCode("qr");
        qr_code.makeCode(url);
        io.removeListener('game_connected', game_connected);
    };

    // -------------
    // THREE JS CODE
    // -------------

    var camera, scene, renderer, controls;
    var planets = [];
    var bigPlanets = [];
    var sun;
    showOrbitTracks = true;


    init();
    animate();

    function init() {
        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
        controls = new THREE.OrbitControls( camera );
        // set starting camera position
        camera.position.set(0, 2, 50);
        controls.update();
        // camera.lookAt(scene.position);

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);


        // VR - Used to enable VR headset functionality (partially finished)
        // renderer.vr.enabled = true;
        //


        // create an AudioListener and add it to the camera
        var listener = new THREE.AudioListener();
        camera.add( listener );

        // create a global audio source
        var sound = new THREE.Audio( listener );

        // load a sound and set it as the Audio object's buffer
        var audioLoader = new THREE.AudioLoader();
        audioLoader.load( 'sounds/spaceoddity.mp3', function( buffer ) {
        	sound.setBuffer( buffer );
        	sound.setLoop( true );
        	sound.setVolume( 0.5 );
        	// sound.play();
        })

        // texture loader
        var loader = new THREE.TextureLoader();



        // SUN CLASS START
        class Sun {
            constructor(name, radius, widthSegments, heightSegments, loader, textureImg, distance) {
                this.name = name;
                this.geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
                this.texture = loader.load( textureImg );
                this.material = new THREE.MeshBasicMaterial( { map: this.texture } );
                this.material.transparent = true;
                this.mesh = new THREE.Mesh(this.geometry, this.material);
                this.mesh.position.x = distance;
                this.pivot = new THREE.Object3D();
            }

            addToScene() {
                scene.add(this.mesh);
            }
        }
        // SUN CLASS END



        // PLANET CLASS START
        class Planet {
            constructor(name, radius, widthSegments, heightSegments, loader, textureImg, distance, showRings, pivotSpeed) {
                // create planet object with geometry, material and image texture
                this.name = name;
                this.geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
                this.texture = loader.load( textureImg );
                this.material = new THREE.MeshLambertMaterial( { map: this.texture } );
                this.material.transparent = true;
                this.mesh = new THREE.Mesh(this.geometry, this.material);
                this.mesh.position.x = distance;
                // create pivot point for planet to rotate around
                this.pivot = new THREE.Object3D();
                this.spinSpeed = -0.1;
                this.pivotSpeed = pivotSpeed;

                // create planets visual orbit ring around the sun
                this.trackMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff } );
                this.trackMaterial.transparent = true;
                this.trackGeom = new THREE.TorusGeometry( distance, 0.1, 16, 100 );
                this.trackMesh = new THREE.Mesh( this.trackGeom, this.trackMaterial );
                this.trackMesh.rotation.x = Math.PI / 2;

                // show planets rings (only for saturn)
                this.showRings = showRings;
                if (this.showRings) {
                    this.ringsPivot = new THREE.Object3D();
                    this.mesh.add( this.ringsPivot );
                    this.ringsGeometry = new THREE.CircleGeometry( 9, 32 );
                    this.ringsTexture = loader.load( 'images/saturn_ring_alpha.png' );
                    this.ringsMaterial = new THREE.MeshLambertMaterial( { map: this.ringsTexture,
                    side: THREE.DoubleSide } );
                    this.ringsMaterial.transparent = true;
                    this.rings = new THREE.Mesh( this.ringsGeometry, this.ringsMaterial );
                    this.rings.rotation.x = 5;
                    this.ringsPivot.add( this.rings );
                }
            }

            addToPivot(pivotPoint) {
                // pass object in that you want the planet to orbit around (sun) as the object to add the pivot point to
                // add the pivot point to the passed in object
                pivotPoint.mesh.add( this.pivot );
                // add the planet to the pivot
                this.pivot.add(this.mesh);
                // add planets orbit track to the scene
                scene.add( this.trackMesh );
            }

            rotateOnAxis() {
                // rotate on curant axis
                this.mesh.rotateY(this.spinSpeed);
            }

            rotateOnPivot() {
                // increase planet's pivot rotation
                this.pivot.rotation.y += this.pivotSpeed;
            }

            // set planets opacity
            setOpacity(opacity) {
                this.material.opacity = opacity;
                if (showOrbitTracks) {
                    this.trackMaterial.opacity = opacity;
                }
                if (this.showRings) {
                    this.ringsMaterial.opacity = opacity;
                }
            }

            // show or hide planet and related parts
            visible(boolean) {
                this.mesh.visible = boolean;
                if (showOrbitTracks) {
                    this.trackMesh.visible = boolean;
                }

            }

        }
        // PLANET CLASS END




        // BIG PLANET CLASS START - used to display each planet in detailed mode
        class BigPlanet {
            constructor(name, radius, widthSegments, heightSegments, loader, textureImg, cloudTexture) {
                this.name = name;
                this.radius = radius;
                this.geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
                this.texture = loader.load( textureImg );
                this.material = new THREE.MeshLambertMaterial( { map: this.texture } );
                this.material.transparent = true;
                this.material.opacity = 0;
                this.mesh = new THREE.Mesh(this.geometry, this.material);
                this.mesh.visible = false;

                // create planet's clouds
                this.cloudGeometry = new THREE.SphereGeometry(radius+0.1, widthSegments, heightSegments);
                this.cloudTexture = loader.load( cloudTexture );
                this.cloudMaterial = new THREE.MeshLambertMaterial( { map: this.cloudTexture } );
                this.cloudMaterial.transparent = true;
                this.cloudMaterial.opacity = 0;
                this.cloudMesh = new THREE.Mesh(this.cloudGeometry, this.cloudMaterial);
                this.cloudMesh.visible = false;

                // accent light for planet
                this.bigPlanetLight = new THREE.PointLight( 0xffffff, 0, 200 );
                this.bigPlanetLight.position.set( this.radius*2, 20, 0 );
                this.bigPlanetLight.visible = false;

                // create saturn's rings
                if (this.name == "saturn") {
                    this.ringsPivot = new THREE.Object3D();
                    this.mesh.add( this.ringsPivot );
                    this.ringsGeometry = new THREE.CircleGeometry( this.radius*2, 128 );
                    this.ringsTexture = loader.load( 'images/saturn_ring_alpha.png' );
                    this.ringsMaterial = new THREE.MeshLambertMaterial( { map: this.ringsTexture,
                    side: THREE.DoubleSide } );
                    this.ringsMaterial.transparent = true;
                    this.rings = new THREE.Mesh( this.ringsGeometry, this.ringsMaterial );
                    this.rings.rotation.x = 5;
                    this.ringsPivot.add( this.rings );
                }
            }

            // methods similar to planet class
            addToScene() {
                scene.add(this.mesh);
                scene.add(this.cloudMesh);
                scene.add(this.bigPlanetLight);
            }

            rotateOnAxis(speed) {
                this.mesh.rotateY(speed);
                this.cloudMesh.rotateY(-speed);
            }

            setOpacity(opacity) {
                this.material.opacity = opacity;
                this.cloudMaterial.opacity = opacity;
                this.bigPlanetLight.intensity = opacity;
                if (this.name == "saturn2") {
                    this.ringsMaterial.opacity = opacity;
                }
            }

            visible(boolean) {
                this.mesh.visible = boolean;
                this.cloudMesh.visible = boolean;
                this.bigPlanetLight.visible = boolean;
            }
        }
        // BIG PLANET CLASS END




        // create sun
        // name, radius, widthSegments, heightSegments, textureloader, textureImg, distance
        sun = new Sun("sun", 10, 32, 32, loader, 'images/sun.jpg', 0);
        sun.addToScene();

        // create planets
        // name, radius, widthSegments, heightSegments, textureloader, textureImg, distance, showRings (for saturn), pivotSpeed
        planets[0] = new Planet("mercury", 2, 32, 32, loader, 'images/mercury.jpg', 20, false, 0.0047);
        planets[0].addToPivot(sun);

        planets[1] = new Planet("venus", 2, 32, 32, loader, 'images/venus.jpg', 30, false, 0.0035);
        planets[1].addToPivot(sun);

        planets[2] = new Planet("earth", 3, 64, 64, loader, 'images/earth.jpg', 40, false, 0.0029);
        planets[2].addToPivot(sun);

        planets[3] = new Planet("moon", 0.7, 32, 32, loader, 'images/moon.jpg', 5, false, 0.3);
        planets[3].addToPivot(planets[2]);

        planets[4] = new Planet("mars", 1.5, 32, 32, loader, 'images/mars.jpg', 50, false, 0.0024);
        planets[4].addToPivot(sun);

        planets[5] = new Planet("jupiter", 5, 32, 32, loader, 'images/jupiter.jpg', 60, false, 0.002);
        planets[5].addToPivot(sun);

        planets[6] = new Planet("saturn", 4, 32, 32, loader, 'images/saturn.jpg', 70, true, 0.0014);
        planets[6].addToPivot(sun);

        planets[7] = new Planet("uranus", 3, 32, 32, loader, 'images/uranus.jpg', 80, false, 0.0022);
        planets[7].addToPivot(sun);

        planets[8] = new Planet("neptune", 3, 32, 32, loader, 'images/neptune.jpg', 90, false, 0.001);
        planets[8].addToPivot(sun);

        planets[9] = new Planet("pluto", 1, 32, 32, loader, 'images/pluto.jpg', 100, false, 0.0013);
        planets[9].addToPivot(sun);



        // create big Planets
        // name, radius, widthSegments, heightSegments, textureloader, textureImg, cloudTexture
        bigPlanets[0] = new BigPlanet("mercury", 10, 64, 64, loader, 'images/mercury.jpg', 'images/earth_clouds.png');
        bigPlanets[0].addToScene();

        bigPlanets[1] = new BigPlanet("venus", 13, 64, 64, loader, 'images/venus.jpg', 'images/earth_clouds.png');
        bigPlanets[1].addToScene();

        bigPlanets[2] = new BigPlanet("earth", 20, 64, 64, loader, 'images/earth.jpg', 'images/earth_clouds.png');
        bigPlanets[2].addToScene();

        bigPlanets[3] = new BigPlanet("mars", 15, 64, 64, loader, 'images/mars.jpg', 'images/earth_clouds.png');
        bigPlanets[3].addToScene();

        bigPlanets[4] = new BigPlanet("jupiter", 60, 64, 64, loader, 'images/jupiter.jpg', 'images/earth_clouds.png');
        bigPlanets[4].addToScene();

        bigPlanets[5] = new BigPlanet("saturn", 40, 64, 64, loader, 'images/saturn.jpg', 'images/earth_clouds.png');
        bigPlanets[5].addToScene();

        bigPlanets[6] = new BigPlanet("uranus", 25, 64, 64, loader, 'images/uranus.jpg', 'images/earth_clouds.png');
        bigPlanets[6].addToScene();

        bigPlanets[7] = new BigPlanet("neptune", 30, 64, 64, loader, 'images/neptune.jpg', 'images/earth_clouds.png');
        bigPlanets[7].addToScene();

        bigPlanets[8] = new BigPlanet("pluto", 5, 64, 64, loader, 'images/pluto.jpg', 'images/earth_clouds.png');
        bigPlanets[8].addToScene();



        // load environment texture and create large sphere to apply texture to the inside
        loader.load('images/stars_milky_way.jpg', function(texture) {
            var sphereGeometry = new THREE.SphereGeometry(500, 60, 40)
            var sphereMaterial = new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.DoubleSide
            })
            sphereGeometry.scale(-1, 1, 1);
            var mesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
            scene.add(mesh);
            mesh.position.set(0, 0, 0)
        });

        // create center point light to give off light from the sun
        var light = new THREE.PointLight( 0xffffff, 2, 400 );
        light.position.set( 0, 0, 0 );
        scene.add( light );

        // dim abmient light to prevent complete darkness on the dark side of the planets
        var ambientLight = new THREE.AmbientLight( 0x303030 ); // soft white light
        scene.add( ambientLight );

        document.addEventListener('keydown', Keyboard, false);

        // VR
        // document.body.appendChild(WEBVR.createButton(renderer));
        //
    }

    function Keyboard() {

        //Key: F
        if(event.keyCode == 70) {
            controls.setPan();
        }

        //Key: H
        if(event.keyCode == 72) {
            showSolarSytem();
            setCamera(Math.PI/2, 0, 150, 2000);
        }

        //Key: 1
        if(event.keyCode == 49) {
            showBigPlanet(0);
        }

        //Key: 2
        if(event.keyCode == 50) {
            showBigPlanet(5);
            setCamera(Math.PI/4, Math.PI/2, bigPlanets[5].radius*2, 2000);
        }

    }

    // animate camera to a given location using the tween.js library
    // this uses custom written functions added to THREE.js' OrbitControls addon
    // find the custom functions in public/js/controls/OrbitControls.js
    function setCamera(xRotation, yRotation, zDistance, time) {
        //get current and animate to passed in value with the time passed in using tween.js

        // x rotation (left and right)
        var xFrom = { t: controls.getAzimuthalAngle() };
        var xTween = new TWEEN.Tween(xFrom)
            .to({ t: xRotation }, time)
            .onUpdate(function() {
                controls.setRotationX(this.t);
            })
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();

        // y rotation (up and down)
        var yFrom = { t: controls.getPolarAngle() };
        var yTween = new TWEEN.Tween(yFrom)
            .to({ t: yRotation }, time)
            .onUpdate(function() {
                controls.setRotationY(this.t);
            })
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();

        // zoom (in and out)
        var zFrom = { t: controls.getRadius() };
        var zTween = new TWEEN.Tween(zFrom)
            .to({ t: zDistance }, 1000)
            .onUpdate(function() {
                controls.setRadius(this.t);
            })
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();
    }

    // animate visibility of big planet with given id
    function showBigPlanet(planet) {
        // get div for planet's info
        var infoBox = document.getElementById("info" + planet);

        //fade solarsystem to hidden
        var opacityFrom = { o: 1 };
        var opacityTween = new TWEEN.Tween(opacityFrom)
            .to({ o: 0 }, 1000)
            .onUpdate(function() {
                // fade all small planets
                for (var i = 0; i < planets.length; i++) {
                    planets[i].setOpacity(this.o);
                }
                // fade any showing big planets
                for (var i = 0; i < bigPlanets.length; i++) {
                    bigPlanets[i].setOpacity(this.o);
                    document.getElementById("info" + i).style.opacity = this.o;
                }
                // fade sun
                sun.material.opacity = this.o;
            })
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onComplete(function() {
                // on animation complete set visibilities to false to prevent texture clipping
                // set solarsystem visiblity to false
                for (var i = 0; i < planets.length; i++) {
                    planets[i].visible(false);
                }
                sun.mesh.visible = false;
                // set all big planets visibility to false
                for (var i = 0; i < bigPlanets.length; i++) {
                    bigPlanets[i].visible(false);
                    document.getElementById("info" + i).style.display = "none";
                }
                // set given big planet visiblity to true and its info box
                bigPlanets[planet].visible(true);
                infoBox.style.display = "block";
            })
            .start();

        // fade given big planet to visible and its info box
        var from = { o: bigPlanets[planet].material.opacity };
        var tween = new TWEEN.Tween(from)
            .to({ o: 1 }, 1000)
            .delay(1000)
            .onUpdate(function() {
                bigPlanets[planet].setOpacity(this.o);
                infoBox.style.opacity = this.o;
            })
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();
    }



    function showSolarSytem() {
        // fade all big planet to transparent
        var from = { o: 1 };
        var tween = new TWEEN.Tween(from)
            .to({ o: 0 }, 1000)
            .onUpdate(function() {
                for (var i = 0; i < bigPlanets.length; i++) {
                    bigPlanets[i].setOpacity(this.o);
                    document.getElementById("info" + i).style.opacity = this.o;
                }
            })
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onComplete(function() {
                // set all big planets visiblity to false to prevent texture clipping
                for (var i = 0; i < bigPlanets.length; i++) {
                    bigPlanets[i].visible(false);
                    document.getElementById("info" + i).style.display = "none";
                }

                // set all small planets visibilty to true as well as the sun
                for (var i = 0; i < planets.length; i++) {
                    planets[i].visible(true);
                }
                sun.mesh.visible = true;
            })
            .start();

        // fade all small planets and sun opacity to visible
        var opacityFrom = { o: 0 };
        var opacityTween = new TWEEN.Tween(opacityFrom)
            .to({ o: 1 }, 1000)
            .delay(1000)
            .onUpdate(function() {
                for (var i = 0; i < planets.length; i++) {
                    planets[i].setOpacity(this.o);
                }
                sun.material.opacity = this.o;
            })
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();
    }


    function animate() {
        // VR
        // renderer.setAnimationLoop(render);
        //

        requestAnimationFrame(animate);
        render();
    }

    function render() {

        // constantly rotate all small planets on axis and pivot point
        for (var i = 0; i < planets.length; i++) {
            planets[i].rotateOnAxis();
            planets[i].rotateOnPivot();
        }

        // constantly rotate all big planets on axis
        for (var i = 0; i < bigPlanets.length; i++) {
            bigPlanets[i].rotateOnAxis(-0.003);
        }

        // experimenting with camera focusing on certain plants bit camera does not follow planet as it rotates around pivot
        // controls.target = planets[2].pivot.position;

        TWEEN.update();
        controls.update();

        renderer.render(scene, camera);
    }

    io.on('game_connected', game_connected);

    // when controller connects hide QR code modal
    io.on('controller_connected', function(connected) {
        if (connected) {
            document.getElementById("qrContainer").style.display = "none";
        } else {
            document.getElementById("qrContainer").style.display = "block";
        }
    });

    // increment cameras x and y rotation using custom functions in OrbitControls.js and values set from the controller
    io.on('xRotating', function(xRotation) {
        controls.rotateX((Math.PI/50)*xRotation);
    });
    io.on('yRotating', function(yRotation) {
        controls.rotateY((Math.PI/50)*yRotation);
    });

    io.on('showBigPlanet', function(id) {
        showBigPlanet(id);
        setCamera(Math.PI/4, Math.PI/2, bigPlanets[id].radius*2, 2000);
    });
    io.on('showSolarSytem', function() {
        showSolarSytem();
        setCamera(Math.PI/2, 0, 150, 2000);
    });

    io.on('optionToggled', function(boolean) {
        showOrbitTracks = boolean;
        for (var i = 0; i < planets.length; i++) {
            planets[i].trackMesh.visible = showOrbitTracks;
        }
    });

});
