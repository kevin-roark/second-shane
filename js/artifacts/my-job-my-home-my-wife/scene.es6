
let THREE = require('three');
let $ = require('jquery');

let urls = require('../../urls');
import {Talisman} from '../../talisman.es6';
import {ShaneScene} from '../../shane-scene.es6';
let ShaneMesh = require('../../shane-mesh');

/**
 * LAYOUT OF SCENE
 *
 * 1. it is just stark white with golf ball rotating with shadow over ground
 */

export class MyJobMyHomeMyWife extends ShaneScene {

  /// Init

  constructor(renderer, camera, scene, options) {
    super(renderer, camera, scene, options);

    this.name = "My Job My Home My Wife";
    this.slug = 'my-job-my-home-my-wife';
    this.symbolName = '/media/symbols/home.png';

    var host = (this.isLive? urls.myJobMyHomeMyWife.live : urls.myJobMyHomeMyWife.web);
    this.audioBase = host + 'audio/';
  }

  createTalisman() {
    return new Talisman({
      position: new THREE.Vector3(64, -4, -150),
      modelPath: '/js/models/golfball.json',
      modelScale: 7.0
    });
  }

  /// Shane System

  enter() {
    super.enter();

    if (!this.isLive) {
      this.numMediaToLoad += 1;
      this.audio = this.dahmer.makeAudio(this.audioBase + 'my_job_my_home_my_wife');
      this.audio.addEventListener('canplaythrough', () => {
        this.didLoadMedia();
      });
    }

    this.makeLights();
    this.makeWhiteGround();
    this.makeGolfBall();
  }

  doTimedWork() {
    super.doTimedWork();

    if (!this.isLive) {
      this.audio.play();
    }

    let trackDuration = (7 * 60 + 33) * 1000; // 7:33
    this.addTimeout(this.iWantOut.bind(this), trackDuration);
  }

  exit() {
    super.exit();

    if (!this.isLive) {
      this.audio.src = '';
      $(this.audio).remove();
      this.audio = null;
    }

    this.scene.remove(this.hemiLight);
    this.scene.remove(this.spotLight);
    this.scene.remove(this.leftTopLight);
    this.scene.remove(this.rightTopLight);
    this.scene.remove(this.leftBottomLight);
    this.scene.remove(this.rightBottomLight);
    this.scene.remove(this.forwardLight);
    this.hemiLight = null;
    this.spotLight = null;
    this.rightTopLight = null;
    this.leftTopLight = null;
    this.rightBottomLight = null;
    this.leftBottomLight = null;
    this.forwardLight = null;

    if (this.whiteGround) {
      this.whiteGround.removeFrom(this.scene);
      this.whiteGround = null;
    }

    if (this.golfBall) {
      this.golfBall.removeFrom(this.scene);
      this.golfBall = null;
    }
  }

  update() {
    super.update();

    if (this.golfBall) {
      this.golfBall.rotate(0, 0.005, 0);
    }
  }

  /// Creation

  makeLights() {
    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.4);
    //this.hemiLight.color.setHSL(0.6, 1, 0.6);
    //this.hemiLight.groundColor.setHSL(0.085, 1, 0.75);
    this.hemiLight.position.set(0, 500, 10);
    this.scene.add(this.hemiLight);

    this.spotLight = new THREE.SpotLight(0xfff6db, 0.2, 300);
    this.spotLight.position.set(-128, 214, 312);
    this.spotLight.castShadow = true;
    this.spotLight.shadowDarkness = 0.4;
    this.spotLight.shadowMapWidth = this.spotLight.shadowMapHeight = 4096;
    this.scene.add(this.spotLight);

    this.leftTopLight = new THREE.PointLight(0xfff6db, 0.35);
    this.leftTopLight.position.set(-200, 125, 0);
    this.leftTopLight.distance = 1000;
    this.scene.add(this.leftTopLight);

    this.rightTopLight = new THREE.PointLight(0xfff6db, 0.35);
    this.rightTopLight.position.set(200, 125, 0);
    this.rightTopLight.distance = 1000;
    this.scene.add(this.rightTopLight);

    this.leftBottomLight = new THREE.PointLight(0xfff6db, 0.35);
    this.leftBottomLight.position.set(-200, -125, 0);
    this.leftBottomLight.distance = 1000;
    this.scene.add(this.leftBottomLight);

    this.rightBottomLight = new THREE.PointLight(0xfff6db, 0.35);
    this.rightBottomLight.position.set(200, -125, 0);
    this.rightBottomLight.distance = 1000;
    this.scene.add(this.rightBottomLight);

    this.forwardLight = new THREE.PointLight(0xfff6db, 0.28);
    this.forwardLight.position.set(0, 0, 200);
    this.forwardLight.distance = 1000;
    this.scene.add(this.forwardLight);
  }

  makeWhiteGround() {
    let ground = new ShaneMesh({
      meshCreator: (callback) => {
        let groundLength = 666;
        let geometry = new THREE.BoxGeometry(groundLength, groundLength, 0.05);

        let material = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          side: THREE.DoubleSide
        });

        let mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2;
        mesh.receiveShadow = true;

        callback(geometry, material, mesh);
      },

      position: new THREE.Vector3(0, -1.55, 0)
    });

    ground.addTo(this.scene);
    this.whiteGround = ground;
  }

  makeGolfBall() {
    this.golfBall = new ShaneMesh({
      modelName: '/js/models/golfball.json',
      position: new THREE.Vector3(0, -0.4, -3.5)
    });
    this.golfBall.addTo(this.scene, () => {
      this.golfBall.mesh.castShadow = true;

      var material = this.golfBall.mesh.material.materials[0];
      material.reflectivity = 0.1;
      material.shininess = 26;
    });
  }

}
