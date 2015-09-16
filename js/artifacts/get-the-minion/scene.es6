
let THREE = require('three');
let $ = require('jquery');

let urls = require('../../urls');
import {Talisman} from '../../talisman.es6';
import {ShaneScene} from '../../shane-scene.es6';
let ShaneMesh = require('../../shane-mesh');
let VideoMesh = require('../../util/video-mesh');

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

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
    //this.makeGround();
    this.makeWorld();

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

    var beginShowingMyselfOffset = 13 * 1000;
    this.addTimeout(() => {
      if (!this.mirrorVideoMesh) {
        return;
      }

      this.showMyselfInterval = setInterval(() => {
        if (this.mirrorVideoMesh.videoMaterial.opacity < 0.5) {
          this.mirrorVideoMesh.videoMaterial.opacity += 0.002;
        }
        else {
          clearInterval(this.showMyselfInterval);
          this.showMyselfInterval = null;
        }
      }, 200);
    }, beginShowingMyselfOffset);
  }

  exit() {
    super.exit();

    this.scene.remove(this.hemiLight);
    this.scene.remove(this.dirLight);
    this.scene.remove(this.ambientLight);

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

    if (this.mirrorVideoMesh) {
      this.mirrorVideoMesh.update();
    }
  }

  /// Creation

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

  makeWorld() {
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

  makeGround() {
    let ground = new ShaneMesh({
      meshCreator: (callback) => {
        let groundLength = 100;
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

      position: new THREE.Vector3(0, -10, 0)
    });

    this.addMesh(ground);
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
