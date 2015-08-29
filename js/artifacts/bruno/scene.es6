
let THREE = require('three');
let $ = require('jquery');

let urls = require('../../urls');
import {Talisman} from '../../talisman.es6';
import {ShaneScene} from '../../shane-scene.es6';
let ShaneMesh = require('../../shane-mesh');

export class Bruno extends ShaneScene {

  /// Init

  constructor(renderer, camera, scene, options) {
    super(renderer, camera, scene, options);

    this.name = "Bruno?";

    // var host = (this.isLive? urls.bruno.live : urls.bruno.web);
    // this.videoBase = host + 'video/';
    // this.imageBase = host + 'images/';
  }

  createTalisman() {
    let talisman = new Talisman({
      position: new THREE.Vector3(-20, -1.3, -10),
      modelPath: '/js/models/popcorn-popper.json',
      modelScale: 1.0
    });
    return talisman;
  }

  /// Overrides

  enter() {
    super.enter();

    this.renderer.setClearColor(0x000000, 0);
    $('body').css('background-color', 'black');

    this.makeLights();
    this.addGoldCoins();
  }

  doTimedWork() {
    super.doTimedWork();

    let brunoLength = (3.5 * 60) * 1000;
    setTimeout(this.iWantOut.bind(this), brunoLength);
  }

  exit() {
    super.exit();

    this.renderer.setClearColor(0xffffff, 1);
    $('body').css('background-color', 'white');
  }

  children() {
    return [this.hemiLight, this.dirLight];
  }

  update() {
    super.update();

    if (this.coin1) {
      this.coin1.rotate(0, 0, 0.01);
      this.coin2.rotate(0, 0, -0.01);
    }
  }

  makeLights() {
    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.8);
    this.hemiLight.color.setHSL(0.6, 1, 0.6);
    this.hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
    this.hemiLight.position.set( 0, 500, 0 );
    this.scene.add(this.hemiLight);

    var dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
    dirLight.color.setHSL( 0.1, 1, 0.95 );
    dirLight.position.set(0, 100, 100);

    this.dirLight = dirLight;
    this.scene.add(dirLight);
  }

  addGoldCoins() {
    let coin1 = new ShaneMesh({
      modelName: '/js/models/bitcoin1.json',
      position: new THREE.Vector3(-5, 0, -10)
    });

    this.addMesh(coin1, () => {
      coin1.rotate(Math.PI / 2, 0, 0);
    });

    let coin2 = new ShaneMesh({
      modelName: '/js/models/bitcoin2.json',
      position: new THREE.Vector3(5, 0, -10)
    });

    this.addMesh(coin2, () => {
      coin2.rotate(Math.PI / 2, 0, 0);
    });

    this.coin1 = coin1;
    this.coin2 = coin2;
  }

}
