
let THREE = require('three');
let $ = require('jquery');
let kt = require('kutility');
let TWEEN = require('tween.js');

let urls = require('../../urls');
import {Talisman} from '../../talisman.es6';
import {ShaneScene} from '../../shane-scene.es6';
let ShaneMesh = require('../../shane-mesh');
let VideoMesh = require('../../util/video-mesh');
let fadeSceneOverlay = require('../../overlay');
let moneyMan = require('../../new-money');

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
    this.audioBase = this.host + 'audio/';

    window.addEventListener('keydown', (ev) => {
      this.clawKeyDown(ev);
    }, false);
    window.addEventListener('keyup', (ev) => {
      this.clawKeyUp(ev);
    }, false);
  }

  createTalisman() {
    let talisman = new Talisman({
      position: new THREE.Vector3(-50, 0, 108),
      modelPath: '/js/models/minion.json',
      modelScale: 5.0
    });
    return talisman;
  }

  /// Shane System

  enter() {
    super.enter();

    if (!this.isLive) {
      this.numMediaToLoad += 1;
      this.audio = this.dahmer.makeAudio(this.audioBase + 'get_the_minion');
      this.audio.addEventListener('canplaythrough', () => {
        this.didLoadMedia();
      });
    }

    this.camera.rotation.x += 0.05;

    this.makeLights();
    this.makeWhiteGround();
  }

  doTimedWork() {
    super.doTimedWork();

    if (!this.isLive) {
      let silentTime = 1000;
      this.addTimeout(() => {
        this.audio.play();
      }, silentTime);
    }

    // part 1
    this.showArticleText(() => {
      this.addTimeout(() => {
        this.performBoyCardFlyingAnimation();
      }, 333);
    });

    // part 2
    let part2Onset = 36 * 1000;
    this.addTimeout(() => {
      fadeSceneOverlay(
        1500,
        () => {
          this.removePart1Portions();

          this.makeArcade();
          this.makeClawMachine();
          this.addMinionsToClawMachine();
          this.showClawMachineInstructions();

          this.addTimeout(() => {
            this.flashGetTheMinionText();
          }, 3000);
        }
      );

      var beginShowingMyselfOffset = 65 * 1000;
      this.addTimeout(() => {
        this.setupWebcamStream();
      }, beginShowingMyselfOffset);

      var makeTheMinionsMeOffset = 110 * 1000;
      this.addTimeout(() => {
        this.stopFlashingText = true;
        this.makeTheMinionsMe();
      }, makeTheMinionsMeOffset);
    }, part2Onset);

    this.addTimeout(() => {
      this.showMinionStatusMessage('YOU GOT IT. THE MINION IS YOURS', 2000);
    }, 167 * 1000);

    // end it
    let trackDuration = 171.5 * 1000;
    this.addTimeout(this.iWantOut.bind(this), trackDuration);
  }

  exit() {
    this.removePart1Portions();
    this.removePart2Portions();

    this.scene.remove(this.hemiLight);
    this.scene.remove(this.dirLight);
    this.scene.remove(this.ambientLight);

    if (!this.isLive) {
      this.audio.src = '';
      $(this.audio).remove();
      this.audio = null;
    }

    super.exit();
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
    if (this.meMinionUpdate) {
      this.meMinionUpdate();
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
        let geometry = new THREE.PlaneBufferGeometry(groundLength, groundLength);

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
    $articleDiv.css('padding', window.innerHeight + 'px 100px');
    $articleDiv.css('color', 'rgb(237, 61, 14)');
    $articleDiv.css('font-size', '40px');
    $articleDiv.css('font-weight', 'bold');
    $articleDiv.css('line-height', '70px');
    $articleDiv.css('letter-spacing', '1px');
    this.domContainer.append($articleDiv);

    this.addTimeout(() => {
      if (!this.$articleDiv) return;

      var articlePosition = {top: 0};
      var articlePositionTarget = {top: -$articleDiv.height() - window.innerHeight};
      let scrollDuration = 25 * 1000;
      var tween = new TWEEN.Tween(articlePosition).to(articlePositionTarget, scrollDuration);
      tween.onUpdate(() => {
        $articleDiv.css('transform', 'translate(0px, ' + articlePosition.top + 'px)');
      });
      tween.onComplete(() => {
        if (this.$articleDiv) {
          this.$articleDiv.remove();
          this.$articleDiv = null;
        }
        if (callback) {
          callback();
        }
      });
      tween.start();

      this.articleTween = tween;
    }, 1000);

    this.$articleDiv = $articleDiv;
  }

  performBoyCardFlyingAnimation() {
    this.flyingCards = [];

    var currentTimeout = 0;
    for (var i = 0; i < 16; i++) {
      this.addTimeout(this.makeFlyingCard.bind(this), currentTimeout);
      currentTimeout += Math.random() * 700 + 444;
    }
  }

  makeFlyingCard() {
    if (!this.flyingCards) {
      return;
    }

    let textures = ['/media/textures/minionboy1.jpg', '/media/textures/minionboy2.jpg', '/media/textures/minionboy3.jpg'];
    let position = new THREE.Vector3((Math.random() - 0.5) * 28, -2 + Math.random() * 10, 3);
    let velocity = new THREE.Vector3((Math.random() - 0.5) * 0.005, 0, -0.2 + Math.random() * -0.4);
    let acceleration = new THREE.Vector3(0, -0.00025, 0);
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

    if (this.articleTween) {
      this.articleTween.stop();
      this.articleTween = null;
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
    var div = $('<div class="track-instruction-box" style="right: 10px; top: 10px;">You\'re Here. Work the Machine to Get the Minion. Use the Arrows to move the Claw. Press Enter to Submit the Claw.</div>');
    this.domContainer.append(div);
    this.$clawMachineInstructions = div;
  }

  flashGetTheMinionText() {
    if (!this.active || this.stopFlashingText) {
      return;
    }

    var textOptions = [
      'GET THE MINION',
      'SUBMIT THE CLAW',
      'USE THE MACHINE',
      'GRAB THE MINION',
      'TAKE IT',
      'EARN IT',
      'GET IT',
      'KEEP IT',
      'MOVE THE CLAW',
      'FIND YOUR MINION',
      'WORK',
      'PROGRESS',
      'PERSEVERE',
      "IT CAN BE YOURS"
    ];

    var text = kt.choice(textOptions);
    var div = $('<div class="text-popup" style="position: absolute;">' + text + '</div>');
    div.css('right', (Math.random() * 120 + 5) + 'px');
    div.css('top', ((Math.random() - 0.5) * 450 + window.innerHeight / 2) + 'px');
    div.css('color', kt.randColor());
    div.css('font-size', kt.randInt(28, 44) + 'px');
    if (Math.random() > 0.5) div.css('font-style', 'italic');

    this.domContainer.append(div);

    // set timeout intentional here so div is always removed
    setTimeout(() => {
      div.remove();
    }, Math.random() * 6666 + 3333);

    // call myself again
    this.addTimeout(() => {
      this.flashGetTheMinionText();
    }, Math.random() * 5666 + 666);
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

    moneyMan.setBackground('black');
    moneyMan.show();
    var amount = -kt.randInt(25, 50);
    moneyMan.addMoney(amount);
    var message = kt.choice(['NO GAME IS FREE', 'PAY TO USE THE CLAW', 'THE MINION IS WORTH IT', 'PAY TO EARN', 'THIS IS OUR PYRAMID', 'FEED IT WHAT YOU HAVE', 'WATCH THE GOLD LEAK']);
    moneyMan.setMoneyReason(message, 3600, function() {
      moneyMan.hide();
    });

    var movingClawDown = true;
    this.clawDownUpdate = () => {
      if (movingClawDown) {
        this.shakeMinions();
        this.clawMesh.position.y -= 0.01;
        if (this.clawMesh.position.y <= -2.75) {
          movingClawDown = false;
          this.showMinionStatusMessage(kt.choice(['CLOSE', 'GOOD ATTEMPT', 'NEXT TIME', 'ALMOST', 'ATTEMPT THWARTED', 'I FELT IT SLIP', 'PLEASE', 'ONE MORE INCH', 'JUST ONE MORE', 'IT JUMPED FREE', 'IT WIGGLED LOOSE']));
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

  showMinionStatusMessage(message, dur) {
    if (!dur) dur = 490;
    var div = $('<div style="position: fixed; left: 0; width: 100%; text-align: center; height: 140px; top: 50%; margin-top: -140px; font-size: 140px; color: white;"></div>');
    div.text(message);
    this.domContainer.append(div);
    setTimeout(function() {
      div.remove();
    }, dur);
  }

  addMinionsToClawMachine() {
    this.minions = [];

    var minionCount = 20;
    for (var i = 0; i < minionCount; i++) {
      this.addTimeout(() => {
        var x = (Math.random() - 0.5) * (ClawMachineWidth * 0.9);
        var y = MinimumMinionY + Math.random() * (ClawMachineHeight * 0.4);
        var z = frontPanePosition.z + Math.random() * -ClawMachineDepth;
        var position = new THREE.Vector3(x, y, z);
        this.makeMinion(position);
      }, i * 250);
    }
  }

  shakeMinions(strength) {
    if (!this.minions) {
      return;
    }

    var minions = this.minions;
    for (var i = 0; i < minions.length; i++) {
      var minion = minions[i];
      this.shakeMinion(minion.mesh, strength);
    }
  }

  shakeMinion(mesh, strength) {
    if (!strength) {
      strength = 0.04;
    }

    var dx = (Math.random() - 0.5) * strength;
    var dy = (Math.random() - 0.5) * strength;
    var dz = (Math.random() - 0.5) * strength;

    var pos = mesh.position;

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

  makeTheMinionsMe() {
    if (!this.mirrorVideoMesh) {
      return;
    }
    var minions = this.minions;
    if (!minions) {
      return;
    }

    var meTexture = new THREE.Texture(this.mirrorVideoMesh.videoImage);
    meTexture.minFilter = meTexture.magFilter = THREE.LinearFilter;
    meTexture.format = THREE.RGBFormat;
    meTexture.generateMipmaps = false;

    var meMaterial = new THREE.MeshBasicMaterial({
      map: meTexture,
      color: 0xffffff
    });
    var meGeometry = new THREE.SphereGeometry(0.25);
    var meMinionMesh = new THREE.Mesh(meGeometry, meMaterial);
    meMinionMesh.position.set(0, 1.0, frontPanePosition.z - ClawMachineDepth/3);
    meMinionMesh.rotation.y = -Math.PI/3;
    meTexture.needsUpdate = true;
    this.scene.add(meMinionMesh);
    this.meMinionMesh = meMinionMesh;

    var updateCount = 0;
    var scale = 1;
    this.meMinionUpdate = () => {
      if (updateCount++ % 10 === 0) {
        meTexture.needsUpdate = true;
      }

      meMinionMesh.rotation.y -= 0.08;

      if (scale < 10) {
        scale *= 1.0025;
        meMinionMesh.scale.set(scale, scale, scale);
      }
    };
  }

  setupWebcamStream() {
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

        var videoMeshWidth = ClawMachineWidth * 0.85;
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

        self.mirrorUpdate = () => {
          if (!self.mirrorVideoMesh) {
            return;
          }

          if (self.mirrorVideoMesh.videoMaterial.opacity < 0.48) {
            self.mirrorVideoMesh.videoMaterial.opacity += 0.0008;
          }
          else {
            self.mirrorUpdate = null;
          }
        };
      }, false);
    };

    var onError = (error) => {
      console.log('navigator.getUserMedia error: ', error);

      var div = $('<div class="text-popup" style="position: absolute; left: 20px; width: 200px; top: 20px; font-size: 36px; color: rgba(0, 0, 0, 0.87);">You could have become something More. Could have obtained the Minion, and, even, Became the Minion. But you made a Choice...</div>');
      this.domContainer.append(div);

      // set timeout intentional here so div is always removed
      setTimeout(() => {
        div.remove();
      }, 30000);
    };

    if (navigator.getUserMedia) {
      var mediaConstraints = {audio: false, video: true};
      navigator.getUserMedia(mediaConstraints, onSuccess, onError);
    }
    else {
      onError();
    }
  }

  removePart2Portions() {
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
      if (this.localMediaStream.stop) {
        this.localMediaStream.stop();
      }
      // https://developers.google.com/web/updates/2015/07/mediastream-deprecations
      if (this.localMediaStream.getTracks) {
        var tracks = this.localMediaStream.getTracks();
        for (var i = 0; i < tracks.length; i++) {
          tracks[i].stop();
        }
      }
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

    if (this.meMinionMesh) {
      this.scene.remove(this.meMinionMesh);
      this.meMinionMesh = null;
    }

    this.refractionCube = null;
    this.reflectionCube = null;
    this.mirrorUpdate = null;
    this.clawDownUpdate = null;
    this.meMinionUpdate = null;

    moneyMan.setBackground(null);
  }

}
