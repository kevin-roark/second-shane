
let THREE = require('three');
let $ = require('jquery');

let urls = require('../../urls');
import {Talisman} from '../../talisman.es6';
import {ShaneScene} from '../../shane-scene.es6';
let ShaneMesh = require('../../shane-mesh');

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
      position: new THREE.Vector3(-50, 0, -50),
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
  }

  exit() {
    super.exit();

    this.scene.remove(this.hemiLight);
    this.scene.remove(this.dirLight);
  }

  update() {
    super.update();
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

}
