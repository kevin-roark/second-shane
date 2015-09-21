
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
  }

  createTalisman() {
    return new Talisman({
      position: new THREE.Vector3(25, 0, -25),
      modelPath: '/js/models/golfball.json',
      modelScale: 3.0
    });
  }

  /// Shane System

  enter() {
    super.enter();

    this.makeLights();
    this.makeWhiteGround();
    this.makeGolfBall();
  }

  exit() {
    super.exit();

    this.scene.remove(this.hemiLight);
    this.scene.remove(this.dirLight);
    this.hemiLight = null; this.dirLight = null;

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
    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.5);
    //this.hemiLight.color.setHSL(0.6, 1, 0.6);
    this.hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
    this.hemiLight.position.set(0, 500, 10);
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight(0xffffff, 0.2);
    this.dirLight.color.setHex(0xfff6db);
    this.dirLight.position.set(-25, 30, 100);
    this.dirLight.castShadow = true;
    this.dirLight.shadowMapWidth = this.dirLight.shadowMapHeight = 8192;
    this.scene.add(this.dirLight);
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

      position: new THREE.Vector3(0, -3.5, 0)
    });

    ground.addTo(this.scene);
    this.whiteGround = ground;
  }

  makeGolfBall() {
    this.golfBall = new ShaneMesh({
      modelName: '/js/models/golfball.json',
      position: new THREE.Vector3(0, -0.3, -3.5)
    });
    this.golfBall.addTo(this.scene, () => {
      this.golfBall.mesh.castShadow = true;
    });
  }

}
