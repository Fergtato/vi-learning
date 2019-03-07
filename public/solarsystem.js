var io = io.connect();
// const Planet = require('./planet.js').default;

io.on('connect', function() {

    io.emit('game_connect');

    var qr = document.createElement('div');
    qr.id = "qr";
    document.body.appendChild(qr);

    var game_connected = function() {

        var url = process.env.URL || "http://192.168.104.182:8080";
        url += "/controller.html?id=" + io.id;
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
    var bigPlanets = [];

    var sun,
        mercury,
        venus,
        earth,
        moon,
        mars,
        jupiter,
        saturn,
        uranus,
        neptune,
        pluto;

    var opacityLevel = 1;
    var resetCamera = false;
    var zoomDistance = 40;

    var zoomTween;
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
            constructor(name, radius, widthSegments, heightSegments, loader, textureImg, distance, showRings, pivotSpeed) {
                this.name = name;
                this.geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
                this.texture = loader.load( textureImg );
                // this.material = new THREE.MeshBasicMaterial( { map: this.texture } );
                this.material = new THREE.MeshLambertMaterial( { map: this.texture } );
                this.material.transparent = true;
                this.mesh = new THREE.Mesh(this.geometry, this.material);
                this.mesh.position.x = distance;
                this.pivot = new THREE.Object3D();
                this.spinSpeed = -0.01;
                this.pivotSpeed = pivotSpeed;

                this.trackMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff } );
                this.trackMaterial.transparent = true;
                this.trackGeom = new THREE.TorusGeometry( distance, 0.1, 16, 100 );
                this.trackMesh = new THREE.Mesh( this.trackGeom, this.trackMaterial );
                this.trackMesh.rotation.x = Math.PI / 2;

                this.showRings = showRings;
                if (this.showRings) {
                    this.ringsPivot = new THREE.Object3D();
                    this.mesh.add( this.ringsPivot );
                    this.ringsGeometry = new THREE.CircleGeometry( 9, 32 );
                    this.ringsTexture = loader.load( 'saturn_ring_alpha.png' );
                    this.ringsMaterial = new THREE.MeshLambertMaterial( { map: this.ringsTexture,
                    side: THREE.DoubleSide } );
                    this.ringsMaterial.transparent = true;
                    this.rings = new THREE.Mesh( this.ringsGeometry, this.ringsMaterial );
                    this.rings.rotation.x = 5;
                    this.ringsPivot.add( this.rings );
                }
            }

            addToPivot(pivotPoint) {
                pivotPoint.mesh.add( this.pivot );
                this.pivot.add(this.mesh);
                scene.add( this.trackMesh );
            }

            rotateOnAxis() {
                this.mesh.rotateY(this.spinSpeed);
            }

            rotateOnPivot() {
                this.pivot.rotation.y += this.pivotSpeed;
            }

            setOpacity(opacity) {
                this.material.opacity = opacity;
                this.trackMaterial.opacity = opacity;
                if (this.showRings) {
                    this.ringsMaterial.opacity = opacity;
                }
            }

            visible(boolean) {
                this.mesh.visible = boolean;
                this.trackMesh.visible = boolean;
            }

        };

        class BigPlanet {
            constructor(name, radius, widthSegments, heightSegments, loader, textureImg, cloudTexture) {
                this.name = name;
                this.geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
                this.texture = loader.load( textureImg );
                // this.material = new THREE.MeshBasicMaterial( { map: this.texture } );
                this.material = new THREE.MeshLambertMaterial( { map: this.texture } );
                this.material.transparent = true;
                this.material.opacity = 0;
                this.mesh = new THREE.Mesh(this.geometry, this.material);
                this.mesh.visible = false;

                //clouds
                this.cloudGeometry = new THREE.SphereGeometry(radius+0.1, widthSegments, heightSegments);
                this.cloudTexture = loader.load( cloudTexture );
                this.cloudMaterial = new THREE.MeshLambertMaterial( { map: this.cloudTexture } );
                this.cloudMaterial.transparent = true;
                this.cloudMaterial.opacity = 0;
                this.cloudMesh = new THREE.Mesh(this.cloudGeometry, this.cloudMaterial);
                this.cloudMesh.visible = false;

                this.bigPlanetLight = new THREE.PointLight( 0xffffff, 0, 200 );
                this.bigPlanetLight.position.set( 50, 20, 0 );
                this.bigPlanetLight.visible = false;
            }

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
            }

            visible(boolean) {
                this.mesh.visible = boolean;
                this.cloudMesh.visible = boolean;
                this.bigPlanetLight.visible = boolean;
            }
        };

        // SUN
        sun = new Sun("sun", 10, 32, 32, loader, 'sun.jpg', 0);
        sun.addToScene();

        // MERCURY
        planets[0] = new Planet("mercury", 2, 32, 32, loader, 'mercury.jpg', 20, false, 0.0047);
        planets[0].addToPivot(sun);

        // VENUS
        planets[1] = new Planet("venus", 2, 32, 32, loader, 'venus.jpg', 30, false, 0.0035);
        planets[1].addToPivot(sun);

        // EARTH
        planets[2] = new Planet("earth", 3, 64, 64, loader, 'earth.jpg', 40, false, 0.0029);
        planets[2].addToPivot(sun);

        // MOON
        planets[3] = new Planet("moon", 0.7, 32, 32, loader, 'moon.jpg', 5, false, 0.01);
        planets[3].addToPivot(planets[2]);

        // MARS
        planets[4] = new Planet("mars", 1.5, 32, 32, loader, 'mars.jpg', 50, false, 0.0024);
        planets[4].addToPivot(sun);

        // JUPITER
        planets[5] = new Planet("jupiter", 5, 32, 32, loader, 'jupiter.jpg', 60, false, 0.002);
        planets[5].addToPivot(sun);

        // SATURN
        planets[6] = new Planet("saturn", 4, 32, 32, loader, 'saturn.jpg', 70, true, 0.0014);
        planets[6].addToPivot(sun);

        // URANUS
        planets[7] = new Planet("uranus", 3, 32, 32, loader, 'uranus.jpg', 80, false, 0.0022);
        planets[7].addToPivot(sun);

        // NEPTUNE
        planets[8] = new Planet("neptune", 3, 32, 32, loader, 'neptune.jpg', 90, false, 0.001);
        planets[8].addToPivot(sun);

        // PLUTO
        planets[9] = new Planet("pluto", 1, 32, 32, loader, 'pluto.jpg', 100, false, 0.0013);
        planets[9].addToPivot(sun);



        //Highres Mercury
        bigPlanets[0] = new BigPlanet("mercury2", 20, 64, 64, loader, 'mercury.jpg', 'earth_clouds.png');
        bigPlanets[0].addToScene();

        //Highres Earth
        bigPlanets[1] = new BigPlanet("earth2", 20, 64, 64, loader, 'earth.jpg', 'earth_clouds.png');
        bigPlanets[1].addToScene();

        //Highres Mars
        bigPlanets[2] = new BigPlanet("mars2", 20, 64, 64, loader, 'mars.jpg', 'earth_clouds.png');
        bigPlanets[2].addToScene();


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

        var light = new THREE.PointLight( 0xffffff, 2, 400 );
        light.position.set( 0, 0, 0 );
        scene.add( light );

        var ambientLight = new THREE.AmbientLight( 0x303030 ); // soft white light
        scene.add( ambientLight );

        document.addEventListener('keydown', Keyboard, false);


    }

    function Keyboard() {

        //Test Key: T
        if(event.keyCode == 84) {

            setCamera(Math.PI/4, Math.PI/2, 40, 2000);
        }

        //Test Key: "U"
        if(event.keyCode == 85) {
            setCamera(Math.PI/2, 0, 150, 2000);
        }

        //Key: F
        if(event.keyCode == 70) {
            // resetCamera = !resetCamera;
            controls.setPan();


        }

        //Key: H
        if(event.keyCode == 72) {
            showSolarSytem();
        }

        //Key: 1
        if(event.keyCode == 49) {
            showBigPlanet(0);
        }

        //Key: 2
        if(event.keyCode == 50) {
            showBigPlanet(1);
        }

        if(event.keyCode == 90) {
            var zFrom = { t: controls.getRadius() };
            var zTween = new TWEEN.Tween(zFrom)
                .to({ t: 40 }, 1000)
                .onUpdate(function() {
                    controls.setRadius(this.t);
                })
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();


        }
        if(event.keyCode == 88) {
            controls.setRadius(200);
        }

    }

    function setCamera(xRotation, yRotation, zDistance, time) {
        var xFrom = { t: controls.getAzimuthalAngle() };
        var xTween = new TWEEN.Tween(xFrom)
            .to({ t: xRotation }, time)
            .onUpdate(function() {
                controls.setRotationX(this.t);
            })
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();

        var yFrom = { t: controls.getPolarAngle() };
        var yTween = new TWEEN.Tween(yFrom)
            .to({ t: yRotation }, time)
            .onUpdate(function() {
                controls.setRotationY(this.t);
            })
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();

        var zFrom = { t: controls.getRadius() };
        var zTween = new TWEEN.Tween(zFrom)
            .to({ t: zDistance }, 1000)
            .onUpdate(function() {
                controls.setRadius(this.t);
            })
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();
    }

    function showBigPlanet(planet) {
        //fade solarsystem to hidden
        var opacityFrom = { o: 1 };
        var opacityTween = new TWEEN.Tween(opacityFrom)
            .to({ o: 0 }, 1000)
            .onUpdate(function() {
                for (var i = 0; i < planets.length; i++) {
                    planets[i].setOpacity(this.o);
                }
                for (var i = 0; i < bigPlanets.length; i++) {
                    bigPlanets[i].setOpacity(this.o);
                }
                sun.material.opacity = this.o;
            })
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onComplete(function() {
                //set solarsystem visiblity to false
                for (var i = 0; i < planets.length; i++) {
                    planets[i].visible(false);
                }
                sun.mesh.visible = false;
                for (var i = 0; i < bigPlanets.length; i++) {
                    bigPlanets[i].visible(false);
                }
                //set big planet visiblity to true
                bigPlanets[planet].visible(true);
            })
            .start();

        //fade chosen big planet to visible
        var from = { o: bigPlanets[planet].material.opacity };
        var tween = new TWEEN.Tween(from)
            .to({ o: 1 }, 1000)
            .delay(1000)
            .onUpdate(function() {
                bigPlanets[planet].setOpacity(this.o);
            })
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();
    }

    function showSolarSytem() {
        //fade big planet to hidden
        var from = { o: 1 };
        var tween = new TWEEN.Tween(from)
            .to({ o: 0 }, 1000)
            .onUpdate(function() {
                for (var i = 0; i < bigPlanets.length; i++) {
                    bigPlanets[i].setOpacity(this.o);
                }
            })
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onComplete(function() {
                for (var i = 0; i < bigPlanets.length; i++) {
                    bigPlanets[i].visible(false);
                }

                for (var i = 0; i < planets.length; i++) {
                    planets[i].visible(true);
                }
                sun.mesh.visible = true;
            })
            .start();

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
        requestAnimationFrame(animate);
        render();
    }

    function render() {

        for (var i = 0; i < planets.length; i++) {
            planets[i].rotateOnAxis();
            planets[i].rotateOnPivot();
        }

        for (var i = 0; i < bigPlanets.length; i++) {
            bigPlanets[i].rotateOnAxis(-0.003);
        }


        if (resetCamera && Math.abs(controls.getAzimuthalAngle()) > 0.1) {
            controls.rotateX((Math.PI/50)*0.02*Math.sign(controls.getAzimuthalAngle()));
        }
        if (resetCamera && Math.abs(controls.getPolarAngle()-1.55) > 0.02) {
            controls.rotateY((Math.PI/50)*0.01*Math.sign(controls.getPolarAngle()-1.55));
        }




        // controls.target = planets[2].pivot.position;

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
        controls.rotateX((Math.PI/50)*xRotation);
    });

    io.on('yRotating', function(yRotation) {
        controls.rotateY((Math.PI/50)*yRotation);
    });



});
