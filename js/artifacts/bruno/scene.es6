
let THREE = require('three');
let $ = require('jquery');

let urls = require('../../urls');
import {Talisman} from '../../talisman.es6';
import {ShaneScene} from '../../shane-scene.es6';
let ShaneMesh = require('../../shane-mesh');
let staticCanvas = require('./static-canvas');

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

    this.coinRotationSpeed = 0.01;
    this.staticRenderPercentage = 0.1;

    this.makeLights();
    this.addGoldCoins();
    this.makeStaticCanvas();
  }

  doTimedWork() {
    super.doTimedWork();

    let brunoLength = (3.5 * 60) * 1000;
    setTimeout(this.iWantOut.bind(this), brunoLength);
  }

  exit() {
    super.exit();

    if (this.$canvas) {
      this.$canvas.remove();
      this.$canvas = null;
    }
  }

  children() {
    return [this.hemiLight, this.dirLight];
  }

  update() {
    super.update();

    if (this.coin1) {
      this.coin1.rotate(0, 0, this.coinRotationSpeed);
      this.coin2.rotate(0, 0, -this.coinRotationSpeed);
    }

    if (this.$canvas && Math.random() <= this.staticRenderPercentage) {
      staticCanvas.fuzz(this.$canvas[0]);
    }
  }

  resize() {
    super.resize();

    if (this.$canvas) {
      this.$canvas.css('left', (window.innerWidth/2 - this.$canvas.width()/2) + 'px');
      this.$canvas.css('top', (window.innerHeight/2 - this.$canvas.height()/2) + 'px');
    }
  }

  // Lights

  makeLights() {
    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.8);
    this.hemiLight.color.setHSL(0.6, 1, 0.6);
    this.hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
    this.hemiLight.position.set( 0, 500, 0 );
    this.scene.add(this.hemiLight);

    var dirLight = new THREE.DirectionalLight( 0xffffff, 0.25);
    dirLight.color.setHex(0xFFD86C);
    dirLight.position.set(0, 100, 100);

    this.dirLight = dirLight;
    this.scene.add(dirLight);
  }

  // Gold

  addGoldCoins() {
    this.coin1 = this.makeCoin(new THREE.Vector3(-5, 0, -10));
    this.coin2 = this.makeCoin(new THREE.Vector3(5, 0, -10));
  }

  makeCoin(position) {
    let coin = new ShaneMesh({
      meshCreator: (callback) => {
        let geometry = new THREE.CylinderGeometry(2, 2, 0.5, 32);
        let material = new THREE.MeshLambertMaterial({
          color: 0xFFD86C
        });
        let mesh = new THREE.Mesh(geometry, material);
        callback(geometry, material, mesh);
      },
      position: position
    });

    this.addMesh(coin, () => {
      coin.geometry.center();
      coin.rotate(Math.PI / 2, 0, 0);
    });

    return coin;
  }

  // Static

  makeStaticCanvas() {
    let canvas = this.makeCanvas();

    canvas.width = 666;
    canvas.height = 666;

    let $canvas = $(canvas);

    $canvas.css('background-color', 'white');

    $canvas.css('box-shadow', '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)');

    this.domContainer.append($canvas);

    this.$canvas = $canvas;

    this.resize();
  }

}
