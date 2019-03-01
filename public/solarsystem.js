var io = io.connect();
// const Planet = require('./planet.js').default;

io.on('connect', function() {

    io.emit('game_connect');

    var qr = document.createElement('div');
    qr.id = "qr";
    document.body.appendChild(qr);

    var game_connected = function() {
        var url = "http://192.168.2.108:8080/controller.html?id=" + io.id;
        // document.body.innerHTML += url;
        console.log(url);
        var qr_code = new QRCode("qr");
        qr_code.makeCode(url);
        io.removeListener('game_connected', game_connected);
    };


    // THREE JS CODE

    var camera,
        scene,
        renderer,
        controls;

    var planets = [];

    var sun,
        mercury,
        venus,
        earth,
        moon,
        mars,
        jupiter,
        saturn,
        saturnsRings, saturnsRingsPivot,
        uranus,
        neptune,
        pluto;

    var opacityLevel = 1;
    var resetCamera = false;
    var zoomDistance = 40;

    var opacityTween;
    // var spin = 0;
    // var yRotationValue = 0;
    // const axis = new THREE.Vector3(0, 1, 0).normalize();
    // var quaternion = new THREE.Quaternion();

    init();
    animate();

    function init() {
        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
        controls = new THREE.OrbitControls( camera );
        camera.position.set(0, 2, 50);
        controls.update();
        // camera.lookAt(scene.position);

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        var loader = new THREE.TextureLoader();

        class Sun {
            constructor(name, radius, widthSegments, heightSegments, loader, textureImg, distance) {
                this.name = name;
                this.geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
                this.texture = loader.load( textureImg );
                // this.material = new THREE.MeshBasicMaterial( { map: this.texture } );
                this.material = new THREE.MeshBasicMaterial( { map: this.texture } );
                this.material.transparent = true;
                this.mesh = new THREE.Mesh(this.geometry, this.material);
                this.mesh.position.x = distance;
                this.pivot = new THREE.Object3D();
            }

            addToScene() {
                scene.add(this.mesh);
            }
        };

        class Planet {
            constructor(name, radius, widthSegments, heightSegments, loader, textureImg, distance) {
                this.name = name;
                this.geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
                this.texture = loader.load( textureImg );
                // this.material = new THREE.MeshBasicMaterial( { map: this.texture } );
                this.material = new THREE.MeshLambertMaterial( { map: this.texture } );
                this.material.transparent = true;
                this.mesh = new THREE.Mesh(this.geometry, this.material);
                this.mesh.position.x = distance;
                this.pivot = new THREE.Object3D();
            }

            addToPivot(pivotPoint) {
                pivotPoint.mesh.add( this.pivot );
                this.pivot.add(this.mesh);
            }

            rotateOnAxis(speed) {
                this.mesh.rotateY(speed);
            }

            rotateOnPivot(speed) {
                this.pivot.rotation.y += speed;
            }
        };

        // SUN
        sun = new Sun("sun", 10, 32, 32, loader, 'sun.jpg', 0);
        sun.addToScene();

        // MERCURY
        planets[0] = new Planet("mercury", 2, 32, 32, loader, 'mercury.jpg', 20);
        planets[0].addToPivot(sun);

        // VENUS
        planets[1] = new Planet("venus", 2, 32, 32, loader, 'venus.jpg', 30);
        planets[1].addToPivot(sun);

        // EARTH
        planets[2] = new Planet("earth", 3, 64, 64, loader, 'earth.jpg', 40);
        planets[2].addToPivot(sun);

        // MOON
        planets[3] = new Planet("moon", 0.7, 32, 32, loader, 'moon.jpg', 5);
        planets[3].addToPivot(planets[2]);

        // MARS
        planets[4] = new Planet("mars", 1.5, 32, 32, loader, 'mars.jpg', 50);
        planets[4].addToPivot(sun);

        // JUPITER
        planets[5] = new Planet("jupiter", 5, 32, 32, loader, 'jupiter.jpg', 60);
        planets[5].addToPivot(sun);

        // SATURN
        planets[6] = new Planet("saturn", 4, 32, 32, loader, 'saturn.jpg', 70);
        planets[6].addToPivot(sun);

        // --------------------FIX
        // saturnsRingsPivot = new THREE.Object3D();
        // saturn.add( saturnsRingsPivot );
        //
        // var saturnsRingsGeometry = new THREE.CircleGeometry( 9, 32 );
        // var saturnsRingsTexture = loader.load( 'saturn_ring_alpha.png' );
        // var saturnsRingsMaterial = new THREE.MeshLambertMaterial( { map: saturnsRingsTexture,
        // side: THREE.DoubleSide } );
        // saturnsRings = new THREE.Mesh( saturnsRingsGeometry, saturnsRingsMaterial );
        // saturnsRings.rotation.x = 5;
        // saturnsRingsPivot.add( saturnsRings );
        // --------------------FIX

        //
        // URANUS
        //

        planets[7] = new Planet("uranus", 3, 32, 32, loader, 'uranus.jpg', 80);
        planets[7].addToPivot(sun);

        //
        // NEPTUNE
        //

        planets[8] = new Planet("neptune", 3, 32, 32, loader, 'neptune.jpg', 90);
        planets[8].addToPivot(sun);

        //
        // PLUTO
        //

        planets[9] = new Planet("pluto", 1, 32, 32, loader, 'pluto.jpg', 100);
        planets[9].addToPivot(sun);



        loader.load('stars_milky_way.jpg', function(texture) {
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

        rings();

        var light = new THREE.PointLight( 0xffffff, 2, 400 );
        light.position.set( 0, 0, 0 );
        scene.add( light );

        var ambientLight = new THREE.AmbientLight( 0x303030 ); // soft white light
        scene.add( ambientLight );

        document.addEventListener('keydown', Keyboard, false);

        var opacityFrom = { o: 1 };
        opacityTween = new TWEEN.Tween(opacityFrom)
            .to({ o: 0 }, 1000)
            .onUpdate(function() {
                opacityLevel = this.o;
            })
            .easing(TWEEN.Easing.Quadratic.InOut);


    }

    function Keyboard() {

        //Test Key: "T"
        if(event.keyCode == 84) {
            console.log("Camera X: " + controls.getAzimuthalAngle());
            console.log("Camera Y: " + controls.getPolarAngle());

            var coords = { z: camera.position.z };
            var tween = new TWEEN.Tween(coords)
            	.to({ z: 30 }, 1000)
            	.onUpdate(function() {
            		camera.position.z = this.z;
                    console.log(this.z);
            	})
                .easing(TWEEN.Easing.Quadratic.InOut)
            	.start();
        }

        if(event.keyCode == 70) {
            resetCamera = !resetCamera;


        }

        if(event.keyCode == 72) {
            console.log("hide");

            opacityTween.start();

        }

        if(event.keyCode == 49) {
            zoomDistance = 20;
        }

        if(event.keyCode == 50) {
            zoomDistance = 70;
        }





        // console.log(controls.getZoom());


        // console.log(camera.position);

    }

    function rings() {
        var ringMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff } );

        for (i = 0; i < 9; i++) {
            var ringgeom = new THREE.TorusGeometry( (i+2)*10, 0.1, 16, 100 );
            var ring = new THREE.Mesh( ringgeom, ringMaterial );
            ring.rotation.x = Math.PI / 2;
            scene.add( ring );
        }

    }

    function animate() {
        requestAnimationFrame(animate);
        render();
    }

    function render() {

        for (var i = 0; i < planets.length; i++) {
            planets[i].rotateOnAxis(-0.003);
            // console.log(i);
        }
        // planets[0].rotateOnAxis(-0.003);
        // planets[1].rotateOnAxis(-0.003);
        // planets[2].rotateOnAxis(-0.003);
        // planets[3].rotateOnAxis(-0.003);
        // planets[4].rotateOnAxis(-0.003);
        // planets[5].rotateOnAxis(-0.003);
        // planets[6].rotateOnAxis(-0.003);
        // planets[7].rotateOnAxis(-0.003);
        // planets[8].rotateOnAxis(-0.003);
        // planets[9].rotateOnAxis(-0.003);

        planets[0].rotateOnPivot(0.0047);
        planets[1].rotateOnPivot(0.0035);
        planets[2].rotateOnPivot(0.0029);
        planets[3].rotateOnPivot(0.01);
        planets[4].rotateOnPivot(0.0024);
        planets[5].rotateOnPivot(0.002);
        planets[6].rotateOnPivot(0.0014);
        planets[7].rotateOnPivot(0.0022);
        planets[8].rotateOnPivot(0.001);
        planets[9].rotateOnPivot(0.0013);

        for (var i = 0; i < planets.length; i++) {
            planets[i].material.opacity = opacityLevel;
        }
        sun.material.opacity = opacityLevel;
        // earth.material.opacity = opacityLevel;

        if (resetCamera) {

            if (controls.getAzimuthalAngle() < -0.1) {
                if (controls.getAzimuthalAngle() < 0.1 && controls.getAzimuthalAngle() > -0.1) {
                    // console.log("STOP");
                } else {
                    controls.rotateX((Math.PI/50)*-0.02);
                }
            } else if (controls.getAzimuthalAngle() > 0.1) {
                if (controls.getAzimuthalAngle() < 0.1 && controls.getAzimuthalAngle() > -0.1) {
                    // console.log("STOP");
                } else {
                    controls.rotateX((Math.PI/50)*0.02);
                }
            }

            if (controls.getPolarAngle() < 1.5) {
                if (controls.getPolarAngle() < 1.6 && controls.getPolarAngle() > 1.5) {
                    // console.log("STOP");
                } else {
                    controls.rotateY((Math.PI/50)*-0.01);
                }
            } else if (controls.getPolarAngle() > 1.6) {
                if (controls.getPolarAngle() < 1.6 && controls.getPolarAngle() > 1.5) {
                    // console.log("STOP");
                } else {
                    controls.rotateY((Math.PI/50)*0.01);
                }
            }

            // if (camera.position.z > zoomDistance+2) {
            //     camera.position.z -= 0.3;
            // } else if (camera.position.z < zoomDistance-2) {
            //     camera.position.z += 0.3;
            // }

            // console.log(camera.position.z);
            // camera.position.z = 30;

        }








        // quaternion.setFromAxisAngle(axis, 0.005);
        // earth.position.applyQuaternion(quaternion);
        // mars.position.applyQuaternion(quaternion);

        // spin += 0.001;
        //
        // camera.position.x = Math.cos(spin) * 5;
        // camera.position.z = Math.sin(spin) * 5;
        // camera.position.y = yRotationValue;
        //
        // camera.lookAt(scene.position);

        // controls.rotateLeft(Math.PI/500);
        // controls.rotateUp(Math.PI/500);


        // controls.target.set(saturn.position.x,saturn.position.y,saturn.position.z);

        TWEEN.update();
        controls.update();

        renderer.render(scene, camera);
    };

    io.on('game_connected', game_connected);

    io.on('controller_connected', function(connected) {
        if (connected) {
            document.getElementById("qr").style.display = "none";
        } else {
            document.getElementById("qr").style.display = "block";
        }
    });

    io.on('xRotating', function(xRotation) {
        // spin += message;
        controls.rotateX((Math.PI/50)*xRotation);
        // console.log(message);
    });

    io.on('yRotating', function(yRotation) {
        controls.rotateY((Math.PI/50)*yRotation);
    });



});
