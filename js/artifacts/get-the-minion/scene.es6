
let THREE = require('three');
let $ = require('jquery');
let kt = require('kutility');

let urls = require('../../urls');
import {Talisman} from '../../talisman.es6';
import {ShaneScene} from '../../shane-scene.es6';
let ShaneMesh = require('../../shane-mesh');
let VideoMesh = require('../../util/video-mesh');

let GroundYPosition = -10;
let PI_OVER_2 = Math.PI / 2;
let PI_3_OVER_2 = 3 * PI_OVER_2;
let PI2 = Math.PI * 2;

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

var frontPanePosition = new THREE.Vector3(0, -3, -8);

export class GetTheMinion extends ShaneScene {

  /// Init

  constructor(renderer, camera, scene, options) {
    super(renderer, camera, scene, options);

    this.name = "Get The Minion";
    this.slug = 'get-the-minion';
    this.symbolName = '/media/symbols/minion.png';

    this.host = (this.isLive? urls.getTheMinion.live : urls.getTheMinion.web);
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
    this.makeWhiteGround();

    //this.makeArcade();
    // this.makeMinion(new THREE.Vector3(-10, 0, -25));
    // this.makeMinion(new THREE.Vector3(-5, 0, -25));
    // this.makeMinion(new THREE.Vector3(0, 0, -25));
    // this.makeMinion(new THREE.Vector3(5, 0, -25));
    // this.makeMinion(new THREE.Vector3(10, 0, -25));
    // this.makeMinion(new THREE.Vector3(-10, 5, -25));
    // this.makeMinion(new THREE.Vector3(-5, 5, -25));
    // this.makeMinion(new THREE.Vector3(0, 5, -25));
    // this.makeMinion(new THREE.Vector3(5, 5, -25));
    // this.makeMinion(new THREE.Vector3(10, 5, -25));
    // this.makeMinion(new THREE.Vector3(-10, -5, -25));
    // this.makeMinion(new THREE.Vector3(-5, -5, -25));
    // this.makeMinion(new THREE.Vector3(0, -5, -25));
    // this.makeMinion(new THREE.Vector3(5, -5, -25));
    // this.makeMinion(new THREE.Vector3(10, -5, -25));
    //this.setupWebcamStream();
  }

  doTimedWork() {
    super.doTimedWork();

    this.showArticleText(() => {
      console.log('done with article');
      setTimeout(() => {
        this.performBoyCardFlyingAnimation();
      }, 4444);
    });

    // var beginShowingMyselfOffset = 13 * 1000;
    // this.addTimeout(() => {
    //   if (!this.mirrorVideoMesh) {
    //     return;
    //   }
    //
    //   this.showMyselfInterval = setInterval(() => {
    //     if (this.mirrorVideoMesh.videoMaterial.opacity < 0.5) {
    //       this.mirrorVideoMesh.videoMaterial.opacity += 0.002;
    //     }
    //     else {
    //       clearInterval(this.showMyselfInterval);
    //       this.showMyselfInterval = null;
    //     }
    //   }, 200);
    // }, beginShowingMyselfOffset);
  }

  exit() {
    super.exit();

    this.scene.remove(this.hemiLight);
    this.scene.remove(this.dirLight);
    this.scene.remove(this.ambientLight);

    this.removePart1Portions();

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

    if (this.showMyselfInterval) {
      clearInterval(this.showMyselfInterval);
      this.showMyselfInterval = null;
    }
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

    if (this.mirrorVideoMesh) {
      this.mirrorVideoMesh.update();
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
    var cubeUrls = [textureBase + 'arcade1.jpg', textureBase + 'arcade2.jpg', textureBase + 'arcade3.jpg',
                    textureBase + 'arcade1.jpg', textureBase + 'arcade2.jpg', textureBase + 'arcade3.jpg'];

		var reflectionCube = THREE.ImageUtils.loadTextureCube(cubeUrls);
		reflectionCube.format = THREE.RGBFormat;

		var refractionCube = THREE.ImageUtils.loadTextureCube(cubeUrls);
		refractionCube.mapping = THREE.CubeRefractionMapping;
		refractionCube.format = THREE.RGBFormat;

		//dark orange head: var glassMaterial = new THREE.MeshLambertMaterial({color: 0xff6600, envMap: reflectionCube, combine: THREE.MixOperation, reflectivity: 0.3});
		var glassMaterial = new THREE.MeshLambertMaterial({color: 0xffffff, envMap: refractionCube, refractionRatio: 0.95 } );
		// perfect reflections var glassMaterial = new THREE.MeshLambertMaterial({color: 0xffffff, envMap: reflectionCube } );
    var glassGeometry = new THREE.PlaneBufferGeometry(9, 6);
    var glass = new THREE.Mesh(glassGeometry, glassMaterial);
    glass.position.set(frontPanePosition.x, 0, frontPanePosition.z);
    this.scene.add(glass);

		var skyboxShader = THREE.ShaderLib.cube;
		skyboxShader.uniforms.tCube.value = reflectionCube;
		var skyboxMaterial = new THREE.ShaderMaterial({
			fragmentShader: skyboxShader.fragmentShader,
			vertexShader: skyboxShader.vertexShader,
			uniforms: skyboxShader.uniforms,
			depthWrite: false,
			side: THREE.BackSide
		});
    var skyboxGeometry = new THREE.BoxGeometry(100, 100, 100);
		this.skyboxMesh = new THREE.Mesh(skyboxGeometry,skyboxMaterial);
		this.scene.add(this.skyboxMesh);
  }

  makeMinion(position) {
    var minion = new ShaneMesh({
      modelName: '/js/models/minion.json',
      position: position
    });

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

        self.mirrorVideoMesh = new VideoMesh({
          video: video,
          sourceVideoWidth: this.videoWidth,
          sourceVideoHeight: this.videoHeight,
          renderedVideoWidth: 9,
          renderedVideoHeight: 9 * (this.videoHeight / this.videoWidth)
        });
        self.mirrorVideoMesh.moveTo(frontPanePosition.x, frontPanePosition.y, frontPanePosition.z);
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

}
