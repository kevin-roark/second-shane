
let THREE = require('three');
let $ = require('jquery');

let urls = require('../../urls');
import {Talisman} from '../../talisman.es6';
import {ShaneScene} from '../../shane-scene.es6';
let ShaneMesh = require('../../shane-mesh');
let VideoMesh = require('../../util/video-mesh');

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

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
  }

  doTimedWork() {
    super.doTimedWork();

    this.setupWebcamStream();
  }

  exit() {
    super.exit();

    this.scene.remove(this.hemiLight);
    this.scene.remove(this.dirLight);
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

    var dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
		dirLight.color.setHSL( 0.1, 1, 0.95 );
		dirLight.position.set(0, 372, 400);

		dirLight.castShadow = true;
		dirLight.shadowMapWidth = 2048;
		dirLight.shadowMapHeight = 2048;

		dirLight.shadowCameraFar = 3500;
		dirLight.shadowBias = -0.0001;
		dirLight.shadowDarkness = 0.35;

    this.dirLight = dirLight;
    this.scene.add(dirLight);
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

      var self = this;
      video.addEventListener('playing', function() {
        console.log('playing!');
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
        self.mirrorVideoMesh.moveTo(0, 0, -30);
        self.mirrorVideoMesh.addTo(self.scene);
        //this.mirrorVideoMesh.mesh.castShadow = true;
        //this.mirrorVideoMesh.mesh.receiveShadow = true;
        self.mirrorVideoMesh.videoMaterial.opacity = 0.5;
      }, false);
    };

    var onError = (error) => {
      console.log('navigator.getUserMedia error: ', error);
    };

    var mediaConstraints = {audio: false, video: true};
    navigator.getUserMedia(mediaConstraints, onSuccess, onError);
  }

}
