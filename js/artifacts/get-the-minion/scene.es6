
let THREE = require('three');
let $ = require('jquery');
let kt = require('kutility');

let urls = require('../../urls');
import {Talisman} from '../../talisman.es6';
import {ShaneScene} from '../../shane-scene.es6';
let ShaneMesh = require('../../shane-mesh');
let VideoMesh = require('../../util/video-mesh');

var GroundYPosition = -10;
var PI_OVER_2 = Math.PI / 2;
var PI_3_OVER_2 = 3 * PI_OVER_2;
var PI2 = Math.PI * 2;
var ClawMachineDepth = 2;
var ClawMachineWidth = 2; var HalfClawMachineWidth = ClawMachineWidth/2;
var ClawMachineHeight = 2;
var RestingJoystickRotation = Math.PI / 6;
var RestingClawYPosition = -1.6;
var MinimumMinionY = -0.5 + ClawMachineHeight * 0.05;
var frontPanePosition = new THREE.Vector3(0, ClawMachineHeight/2 - 0.5, -3);

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

/**
 * LAYOUT OF SCENE
 *
 * 1. starts with all white
 * 2. Text from boy stuck article (https://uk.news.yahoo.com/boy-trying-to-win-a-minion-teddy-got-himself-stuck-inside-an-arcade-machine-121454521.html)
 *    begins to dom sroll in giant times new roman over everything
 * 3. Next, the images of the boy begin to fly in from the screen, casting shadow onto the white ground. they fall like cards
      and rest for the remainder of the scene.
 * 4. $sceneOverlay.show(), and when it fadeOut(), the scene has transformed to have a skybox with
      carpet floor, office ceiling, and four images of the inside of an arcade. There is a claw machine
      made from four glass panels. It is stuffed with minions (they can be added periodically in the begining with timeouts).
      There is a red base. Make sure the carpet shows shadows.
      reference claw: http://adsoftheworld.com/sites/default/files/images/AFGHANISTAN.jpg
   5. A claw is visible above the machine. User uses the arrow keys to move the claw, and another key to slam it down.
      The claw never picks up a minion, but it rattles them pretty good.
   6. After a while, the front glass panel begins to reveal the user's face. It is a startling sensation,
      to feel like that boy.
   7. A male.json mesh with a head made from a webcam still appears and slowly grows over the entire claw machine,
      enveloping itself into the minions. You got the minion. The claw rests.
 */

export class GetTheMinion extends ShaneScene {

  /// Init

  constructor(renderer, camera, scene, options) {
    super(renderer, camera, scene, options);

    this.name = "Get The Minion";
    this.slug = 'get-the-minion';
    this.symbolName = '/media/symbols/minion.png';

    this.host = (this.isLive? urls.getTheMinion.live : urls.getTheMinion.web);

    window.addEventListener('keydown', (ev) => {
      this.clawKeyDown(ev);
    }, false);
    window.addEventListener('keyup', (ev) => {
      this.clawKeyUp(ev);
    }, false);
  }

  createTalisman() {
    let talisman = new Talisman({
      position: new THREE.Vector3(-25, 0, -25),
      modelPath: '/js/models/minion.json',
      modelScale: 3.0
    });
    return talisman;
  }

  /// Shane System

  enter() {
    super.enter();

    this.makeLights();
    //this.makeWhiteGround();
  }

  doTimedWork() {
    super.doTimedWork();

    // this.showArticleText(() => {
    //   console.log('done with article');
    //   setTimeout(() => {
    //     this.performBoyCardFlyingAnimation();
    //   }, 4444);
    // });

    this.makeArcade();
    this.makeClawMachine();
    this.addMinionsToClawMachine();
    this.showClawMachineInstructions();

    var beginShowingMyselfOffset = 15 * 1000;
    this.addTimeout(() => {
      this.setupWebcamStream();

      this.mirrorUpdate = () => {
        if (!this.mirrorVideoMesh) {
          return;
        }

        if (this.mirrorVideoMesh.videoMaterial.opacity < 0.45) {
          this.mirrorVideoMesh.videoMaterial.opacity += 0.0008;
        }
        else {
          this.mirrorUpdate = null;
        }
      };
    }, beginShowingMyselfOffset);
  }

  exit() {
    super.exit();

    this.scene.remove(this.hemiLight);
    this.scene.remove(this.dirLight);
    this.scene.remove(this.ambientLight);

    this.removePart1Portions();
    this.removePart2Portions();
  }

  update() {
    super.update();

    if (this.flyingCards) {
      var cards = this.flyingCards;
      for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        card.update();
        if (!card.mesh) continue;
        if (!card.__hasStopped && card.mesh.position.y <= GroundYPosition + 0.15) {
          card.stopAllMovement();
          card.__hasStopped = true;
        }
        if (card.__hasStopped && !card.__hasKilledRotation) {
          var rot = Math.abs(card.mesh.rotation.x % PI2);
          if (Math.abs(rot - PI_OVER_2) < 0.1 || Math.abs(rot - PI_3_OVER_2) < 0.1) {
            card.stopAllRotation();
            card.__hasKilledRotation = true;
          }
        }
      }
    }

    if (this.clawDownUpdate) {
      this.clawDownUpdate();
    }

    if (this.mirrorVideoMesh) {
      this.mirrorVideoMesh.update();
    }
    if (this.mirrorUpdate) {
      this.mirrorUpdate();
    }
  }

  /// PART 1

  makeLights() {
    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.8);
    this.hemiLight.color.setHSL(0.6, 1, 0.6);
    this.hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
    this.hemiLight.position.set( 0, 500, 0 );
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight( 0xffffff, 0.25);
    this.dirLight.color.setHex(0xFFD86C);
    this.dirLight.position.set(0, 75, 100);
    this.dirLight.castShadow = true;
    this.dirLight.shadowMapWidth = this.dirLight.shadowMapHeight = 8192;
    this.scene.add(this.dirLight);

    this.ambientLight = new THREE.AmbientLight(0xffffff);
    this.scene.add(this.ambientLight);
  }

  makeWhiteGround() {
    let ground = new ShaneMesh({
      meshCreator: (callback) => {
        let groundLength = 666;
        let geometry = new THREE.PlaneGeometry(groundLength, groundLength);

        let material = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          side: THREE.DoubleSide
        });

        let mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2;
        mesh.receiveShadow = true;

        callback(geometry, material, mesh);
      },

      position: new THREE.Vector3(0, GroundYPosition, 0)
    });

    ground.addTo(this.scene);
    this.whiteGround = ground;
  }

  showArticleText(callback) {
    let text = 'Boy Aged Four Gets Stuck Inside Arcade Machine After Trying To Win Minion Teddy. Henry Howes took matters into his own hands in his desperate quest to land a stuffed Despicable Me toy. There is nothing more agonising as a child than dropping a teddy in an arcade claw machine. Four-year-old Henry Howes experienced just that at his local Staffordshire swimming pool, after convincing his mum to give him £1 for the game. Things didn’t go quite as planned when the claw machine released the teddy. But Henry refused to give up, so he took matters into his own hand and attempted to put his hand inside the hatch to grab the toy - but reached too far. His bottom slipped under the trap door on the front of the machine, trapping him inside. The drama was witnessed by older brother Harvey, nine, who ran to get their mum.It took staff half an hour to find the keys to free Henry, so mum Emma took the opportunity to snap the scene. Mum-of-three Emma, 33, said: ‘He asked if he could have a go on the teddy machine so I gave him a £1 and told him to go with his big brother. ‘Off they went round the corner and then his brother came back and said \'Henry is stuck in the machine\'.‘I assumed he meant his hand - I didn\'t think he\'d be inside the machine. He was completely inside it. ‘I don\'t know how he managed to get in there. He\'s only four but he\'s a tall lad.‘I was laughing my head off. I could see that he was fine and he wasn\'t upset.Henry\'s adventure ended happily as he went home with the teddy when staff allowed him to keep it.Emma said: ‘I said to the lady \'I hope you\'ll let him have it\' and they did.\'<br><br><br><br>He hasn\'t let go of it since.';
    let $articleDiv = $('<div>' + text + '</div>');
    $articleDiv.css('position', 'fixed'); $articleDiv.css('top', '0px'); $articleDiv.css('left', '0px');
    $articleDiv.css('padding', '666px 100px');
    $articleDiv.css('color', 'rgb(237, 61, 14)');
    $articleDiv.css('font-size', '40px');
    $articleDiv.css('font-weight', 'bold');
    $articleDiv.css('line-height', '70px');
    $articleDiv.css('letter-spacing', '1px');
    this.domContainer.append($articleDiv);

    this.addTimeout(() => {
      if (!this.$articleDiv) return;

      let scrollDuration = 40 * 1000;
      let height = $articleDiv.height() + window.innerHeight;
      $articleDiv.animate( {top: -height + 'px'}, scrollDuration,'linear', () => {
        if (this.$articleDiv) {
          this.$articleDiv.remove();
          this.$articleDiv = null;
        }
        if (callback) {
          callback();
        }
      });
    }, 1000);

    this.$articleDiv = $articleDiv;
  }

  performBoyCardFlyingAnimation() {
    this.flyingCards = [];

    var currentTimeout = 0;
    for (var i = 0; i < 13; i++) {
      this.addTimeout(this.makeFlyingCard.bind(this), currentTimeout);
      currentTimeout += Math.random() * 2222 + 1111;
    }
  }

  makeFlyingCard() {
    let textures = ['/media/textures/minionboy1.jpg', '/media/textures/minionboy2.jpg', '/media/textures/minionboy3.jpg'];
    let position = new THREE.Vector3((Math.random() - 0.5) * 28, -2 + Math.random() * 10, 3);
    let velocity = new THREE.Vector3((Math.random() - 0.5) * 0.005, 0, -0.08 + Math.random() * -0.2);
    let acceleration = new THREE.Vector3(0, -0.00015, 0);
    let rotationMult = Math.random() > 0.5 ? 1 : -1;
    let rotationalVelocity = new THREE.Vector3(Math.random() * rotationMult * 0.02 + rotationMult * 0.02, 0, 0);
    let length = 3.5 + Math.random() * 6;

    let card = new ShaneMesh({
      meshCreator: (callback) => {
        var geometry = new THREE.BoxGeometry(length, length, 0.1);

        var texture = new THREE.ImageUtils.loadTexture(kt.choice(textures));
        texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.minFilter = THREE.NearestFilter;
        var material = new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.DoubleSide
        });

        var mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        callback(geometry, material, mesh);
      },
      position: position,
      velocity: velocity,
      acceleration: acceleration,
      rotationalVelocity: rotationalVelocity
    });
    card.__length = length;
    this.addMesh(card);
    this.flyingCards.push(card);
  }

  removePart1Portions() {
    if (this.whiteGround) {
      this.whiteGround.removeFrom(this.scene);
      this.whiteGround = null;
    }

    if (this.$articleDiv) {
      this.$articleDiv.remove();
      this.$articleDiv = null;
    }

    this.flyingCards = null;
  }

  // PART 2

  makeArcade() {
		var textureBase = "/media/textures/minion/";
    var cubeUrls = [textureBase + 'arcade-1.jpg', textureBase + 'arcade-2.jpg',
                    textureBase + 'ceiling.jpg', textureBase + 'carpet.jpg',
                    textureBase + 'arcade-3.jpg', textureBase + 'arcade-4.jpg'];

		this.reflectionCube = THREE.ImageUtils.loadTextureCube(cubeUrls);
		this.reflectionCube.format = THREE.RGBFormat;

		this.refractionCube = THREE.ImageUtils.loadTextureCube(cubeUrls);
		this.refractionCube.mapping = THREE.CubeRefractionMapping;
		this.refractionCube.format = THREE.RGBFormat;

		var skyboxShader = THREE.ShaderLib.cube;
		skyboxShader.uniforms.tCube.value = this.reflectionCube;
		var skyboxMaterial = new THREE.ShaderMaterial({
			fragmentShader: skyboxShader.fragmentShader,
			vertexShader: skyboxShader.vertexShader,
			uniforms: skyboxShader.uniforms,
			depthWrite: false,
			side: THREE.BackSide
		});
    var arcadeLength = 222;
    var skyboxGeometry = new THREE.BoxGeometry(arcadeLength, arcadeLength, arcadeLength);
		this.skyboxMesh = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
    this.skyboxMesh.receiveShadow = true;
    this.skyboxMesh.position.set(0, (arcadeLength/2 + GroundYPosition - 40), -arcadeLength/2 + 40);
		this.scene.add(this.skyboxMesh);
  }

  makeClawMachine() {
    //var glassMaterial = new THREE.MeshLambertMaterial({color: 0x666666, envMap: this.reflectionCube, combine: THREE.MixOperation, reflectivity: 0.3});
    var glassMaterial = new THREE.MeshLambertMaterial({color: 0x666666, envMap: this.refractionCube, refractionRatio: 0.95, transparent: true, opacity: 0.25});
    //var glassMaterial = new THREE.MeshLambertMaterial({color: 0xffffff, envMap: this.reflectionCube});
    //var glassMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});

    var glassGeometry = new THREE.BoxGeometry(ClawMachineWidth, ClawMachineHeight, 0.05);

    var frontPane = new THREE.Mesh(glassGeometry, glassMaterial);
    frontPane.castShadow = true;
    frontPane.position.set(frontPanePosition.x, frontPanePosition.y, frontPanePosition.z);

    var backPane = frontPane.clone();
    backPane.position.set(frontPanePosition.x, frontPanePosition.y, frontPanePosition.z - ClawMachineDepth);

    var leftPane = frontPane.clone();
    leftPane.rotation.y = PI_OVER_2;
    leftPane.position.set(frontPanePosition.x - HalfClawMachineWidth, frontPanePosition.y, frontPanePosition.z - ClawMachineDepth/2);

    var rightPane = frontPane.clone();
    rightPane.rotation.y = PI_OVER_2;
    rightPane.position.set(frontPanePosition.x + HalfClawMachineWidth, frontPanePosition.y, frontPanePosition.z - ClawMachineDepth/2);

    var verticalBarTexture = THREE.ImageUtils.loadTexture('/media/textures/minion/claw-machine-border.jpg');
    verticalBarTexture.minFilter = THREE.NearestFilter;
    var verticalBarMaterial = new THREE.MeshBasicMaterial({
      map: verticalBarTexture
    });
    var verticalBarGeometry = new THREE.BoxGeometry(0.1, ClawMachineHeight, 0.1);
    var frontPaneLeftBar = new THREE.Mesh(verticalBarGeometry, verticalBarMaterial);
    frontPaneLeftBar.position.set(-HalfClawMachineWidth + 0.1, 0, 0);
    frontPane.add(frontPaneLeftBar);
    var frontPaneRightBar = frontPaneLeftBar.clone();
    frontPaneRightBar.position.set(HalfClawMachineWidth - 0.1, 0, 0);
    frontPane.add(frontPaneRightBar);
    var backPaneLeftBar = frontPaneLeftBar.clone();
    backPaneLeftBar.position.set(-HalfClawMachineWidth + 0.1, 0, 0);
    backPane.add(backPaneLeftBar);
    var backPaneRightBar = frontPaneLeftBar.clone();
    backPaneRightBar.position.set(HalfClawMachineWidth - 0.1, 0, 0);
    backPane.add(backPaneRightBar);
    frontPaneLeftBar.rotation.z = Math.PI;
    backPaneLeftBar.rotation.z = Math.PI;

    var clawMachineBottomTexture = THREE.ImageUtils.loadTexture('/media/textures/minion/claw-machine-front.jpg');
    clawMachineBottomTexture.minFilter = THREE.NearestFilter;
    var clawMachineBottomMaterial = new THREE.MeshBasicMaterial({map: clawMachineBottomTexture/*,color: 0xff0000*/});
    var clawMachineBottomGeometry = new THREE.BoxGeometry(ClawMachineWidth, 0.75, ClawMachineDepth);
    this.clawMachineBottomMesh = new THREE.Mesh(clawMachineBottomGeometry, clawMachineBottomMaterial);
    frontPane.add(this.clawMachineBottomMesh);
    this.clawMachineBottomMesh.position.set(0, -1.3, -ClawMachineDepth/2);

    var topFrontTexture = THREE.ImageUtils.loadTexture('/media/textures/minion/claw-machine-top.jpg');
    var bumpyMetalMaterial;
    var topMaterials = [];
    for (var idx = 0; idx < 6; idx++) {
      var texture;
      if (idx === 4) {
        texture = topFrontTexture;
      }
      else {
        if (!bumpyMetalMaterial) {
          bumpyMetalMaterial = THREE.ImageUtils.loadTexture('/media/textures/minion/bumpy-metal.jpg');
          texture = bumpyMetalMaterial;
        }
        else {
          texture = bumpyMetalMaterial.clone();
        }
      }
      texture.minFilter = THREE.NearestFilter;
      topMaterials.push(new THREE.MeshBasicMaterial({map: texture}));
    }
    var clawMachineTopMaterial = new THREE.MeshFaceMaterial(topMaterials);
    var clawMachineTopGeometry = new THREE.BoxGeometry(ClawMachineWidth, 0.5, ClawMachineDepth);
    this.clawMachineTopMesh = new THREE.Mesh(clawMachineTopGeometry, clawMachineTopMaterial);
    frontPane.add(this.clawMachineTopMesh);
    this.clawMachineTopMesh.position.set(0, 1.2, -ClawMachineDepth/2);

    var loader = new THREE.JSONLoader();
    loader.load('/js/models/claw.json', (geometry, materials) => {
      var faceMaterial = new THREE.MeshFaceMaterial(materials);
      this.clawMesh = new THREE.Mesh(geometry, faceMaterial);
      this.clawMachineTopMesh.add(this.clawMesh);
      this.clawMesh.scale.set(0.15, 0.15, 0.15);
      this.clawMesh.position.set(0, RestingClawYPosition, -ClawMachineDepth/2);
    });

    var joystickMaterial = new THREE.MeshLambertMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.9
    });
    var joystickGeometry = new THREE.CylinderGeometry(0.05, 0.04, 0.45);
    this.joystickMesh = new THREE.Mesh(joystickGeometry, joystickMaterial);
    this.joystickMesh.rotation.x = RestingJoystickRotation;
    this.joystickMesh.position.set(0.074, 0.6, ClawMachineDepth/2 + 0.44);
    this.clawMachineBottomMesh.add(this.joystickMesh);

    this.glassPanes = [frontPane, leftPane, rightPane, backPane];
    for (idx = 0; idx < this.glassPanes.length; idx++) {
      this.scene.add(this.glassPanes[idx]);
    }
  }

  showClawMachineInstructions() {
    var div = $('<div style="position: absolute; left: 10px; top: 10px;">Work the Machine to Get the Minion. Use the Arrows to move the Claw. Press Enter to Submit the Claw.</div>');
    div.css('color', 'rgb(249, 240, 45)');
    div.css('font-size', '16px');
    div.css('font-family', 'Roboto Mono, monospace');
    div.css('font-weight', 'bold');
    div.css('max-width', '160px');
    div.css('text-shadow', '3px 3px 3px rgba(255, 253, 18, 0.5)');

    this.domContainer.append(div);
    this.$clawMachineInstructions = div;
  }

  clawKeyDown(ev) {
    if (!this.clawMesh) {
      return;
    }

    var dx, dz;
    let key = ev.keyCode;
    if (key === 38) { // up
      dx = 0;
      dz = -0.01;
    }
    else if (key === 40) { // down
      dx = 0;
      dz = 0.01;
    }
    else if (key === 37) { // left
      dx = -0.01;
      dz = 0;
    }
    else if (key === 39) { // right
      dx = 0.01;
      dz = 0;
    }
    else if (key === 13) { // enter
      this.doClawDown();
      ev.preventDefault();
    }

    if (dx || dz) {
      ev.preventDefault();
    }

    if (dx) {
      var newX = this.clawMesh.position.x + dx;
      if (newX >= -HalfClawMachineWidth && newX <= HalfClawMachineWidth) {
        this.clawMesh.position.x = newX;
      }

      if (dx > 0) {
        this.joystickMesh.rotation.z = -Math.PI / 8;
      }
      else {
        this.joystickMesh.rotation.z = Math.PI / 8;
      }
    }
    if (dz) {
      var newZ = this.clawMesh.position.z + dz;
      if (newZ <= 0 && newZ >= -ClawMachineDepth) {
        this.clawMesh.position.z = newZ;
      }

      if (dz > 0) {
        this.joystickMesh.rotation.x = Math.PI / 3;
      }
      else {
        this.joystickMesh.rotation.x = -Math.PI / 3;
      }
    }
  }

  clawKeyUp(ev) {
    if (!this.clawMesh) {
      return;
    }

    let key = ev.keyCode;
    if (key === 38 || key === 40) { // up/down
      this.joystickMesh.rotation.x = RestingJoystickRotation;
      ev.preventDefault();
    }
    else if (key === 37 || key === 39) { // left/right
      this.joystickMesh.rotation.z = 0;
      ev.preventDefault();
    }
  }

  doClawDown() {
    if (this.clawDownUpdate) {
      return;
    }

    var movingClawDown = true;
    this.clawDownUpdate = () => {
      if (movingClawDown) {
        this.shakeMinions();
        this.clawMesh.position.y -= 0.01;
        if (this.clawMesh.position.y <= -2.75) {
          movingClawDown = false;
        }
      }
      else {
        this.clawMesh.position.y += 0.015;
        if (this.clawMesh.position.y >= RestingClawYPosition) {
          this.clawDownUpdate = null;
        }
      }
    };
  }

  addMinionsToClawMachine() {
    this.minions = [];

    var minionCount = 20;
    for (var i = 0; i < minionCount; i++) {
      setTimeout(() => {
        var x = (Math.random() - 0.5) * (ClawMachineWidth * 0.9);
        var y = MinimumMinionY + Math.random() * (ClawMachineHeight * 0.4);
        var z = frontPanePosition.z + Math.random() * -ClawMachineDepth;
        var position = new THREE.Vector3(x, y, z);
        this.makeMinion(position);
      }, i * 30);
    }
  }

  shakeMinions(strength) {
    if (!this.minions) {
      return;
    }

    if (!strength) {
      strength = 0.04;
    }

    var minions = this.minions;
    for (var i = 0; i < minions.length; i++) {
      var minion = minions[i];
      var dx = (Math.random() - 0.5) * strength;
      var dy = (Math.random() - 0.5) * strength;
      var dz = (Math.random() - 0.5) * strength;

      var pos = minion.mesh.position;

      var newX = pos.x + dx;
      if (newX > -HalfClawMachineWidth * 0.9 && newX < HalfClawMachineWidth * 0.9) {
        pos.x = newX;
      }

      var newY = pos.y + dy;
      if (newY > MinimumMinionY && newY < MinimumMinionY + ClawMachineHeight * 0.4) {
        pos.y = newY;
      }

      var newZ = pos.z + dz;
      if (newZ > frontPanePosition.z && newX < frontPanePosition.z - ClawMachineDepth) {
        pos.z = newZ;
      }

      minion.move(dx, dy, dz);
    }
  }

  makeMinion(position) {
    var minion = new ShaneMesh({
      modelName: '/js/models/minion.json',
      position: position,
      scale: 0.1
    });

    this.minions.push(minion);

    this.addMesh(minion, () => {
      minion.mesh.castShadow = true;
    });
  }

  setupWebcamStream() {
    if (!navigator.getUserMedia) {
      return;
    }

    var onSuccess = (stream) => {
      var video = document.createElement('video');
      video.autoplay = true;
      if (window.URL) {
        video.src = window.URL.createObjectURL(stream);
      } else {
        video.src = stream;
      }

      this.localMediaStream = stream;
      this.localMediaVideo = video;

      var self = this;
      video.addEventListener('playing', function() {
        if (!this.videoWidth) {
          return;
        }

        var videoMeshWidth = ClawMachineWidth * 0.9;
        var videoMeshHeight = videoMeshWidth * (this.videoHeight / this.videoWidth);

        self.mirrorVideoMesh = new VideoMesh({
          video: video,
          sourceVideoWidth: this.videoWidth,
          sourceVideoHeight: this.videoHeight,
          renderedVideoWidth: videoMeshWidth,
          renderedVideoHeight: videoMeshHeight
        });
        self.mirrorVideoMesh.moveTo(frontPanePosition.x, frontPanePosition.y - videoMeshHeight/2, frontPanePosition.z + 0.1);
        self.mirrorVideoMesh.addTo(self.scene);
        self.mirrorVideoMesh.mesh.castShadow = true;
        self.mirrorVideoMesh.videoMaterial.opacity = 0.0;
      }, false);
    };

    var onError = (error) => {
      console.log('navigator.getUserMedia error: ', error);
    };

    var mediaConstraints = {audio: false, video: true};
    navigator.getUserMedia(mediaConstraints, onSuccess, onError);
  }

  removePart2Portions() {
    this.refractionCube = null;
    this.reflectionCube = null;

    if (this.skyboxMesh) {
      this.scene.remove(this.skyboxMesh);
      this.skyboxMesh = null;
    }

    if (this.glassPanes) {
      for (var i = 0; i < this.glassPanes.length; i++) {
        this.scene.remove(this.glassPanes[i]);
      }
      this.glassPanes = null;
    }

    if (this.$clawMachineInstructions) {
      this.$clawMachineInstructions.remove()
      this.$clawMachineInstructions = null;
    }

    if (this.localMediaStream) {
      this.localMediaStream.stop();
      this.localMediaStream = null;
    }

    if (this.localMediaVideo) {
      this.localMediaVideo.src = '';
      $(this.localMediaVideo).remove();
      this.localMediaVideo = null;
    }

    if (this.mirrorVideoMesh) {
      this.scene.remove(this.mirrorVideoMesh.mesh);
      this.mirrorVideoMesh = null;
    }
  }

}
