
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
    this.slug = 'bruno';
    this.symbolName = '/media/symbols/mars.png';

    var host = (this.isLive? urls.bruno.live : urls.bruno.web);
    this.mediaBase = host + 'media/';
  }

  createTalisman() {
    let talisman = new Talisman({
      position: new THREE.Vector3(-200, 666, -666),
      geometryCreator: () => {
        return new THREE.SphereGeometry(16, 32, 32);
      },
      materialOptions: {
        color: 0xffffff
      }
    });
    return talisman;
  }

  /// Overrides

  enter() {
    super.enter();

    this.coinRotationSpeed = 0.01;
    this.staticRenderPercentage = 0.9;

    if (!this.isLive) {
      this.numMediaToLoad += 1;
      this.audio = this.dahmer.makeAudio(this.mediaBase + 'bruno');
      this.audio.addEventListener('canplaythrough', () => {
        this.didLoadMedia();
      });
    }

    this.makeLights();
    this.makeGround();
    this.addGoldCoins();
  }

  doTimedWork() {
    super.doTimedWork();

    if (!this.isLive) {
      this.audio.play();
    }

    let canvasOffset = 45 * 1000;
    this.addTimeout(() => {
      this.makeStaticCanvas();
    }, canvasOffset);

    let brunoFadeOffset = canvasOffset + 90 * 1000;
    this.addTimeout(() => {
      this.addBrunoText();
    }, brunoFadeOffset);

    let brunoShakeOffset = brunoFadeOffset + 15 * 1000;
    this.addTimeout(() => {
      if (!this.$brunoText) {
        return;
      }

      this.brunoShakeInterval = setInterval(() => {
        var top = parseFloat(this.$brunoText.css('margin-top'));
        var newTop = top + (Math.random() - 0.5) * 5;
        this.$brunoText.css('margin-top', newTop + 'px');

        var left = parseFloat(this.$brunoText.css('margin-left'));
        var newLeft = left + (Math.random() - 0.5) * 5;
        this.$brunoText.css('margin-left', newLeft + 'px');
      }, 50);
    }, brunoShakeOffset);

    let brunoLength = (3.5 * 60) * 1000;
    this.addTimeout(this.iWantOut.bind(this), brunoLength);
  }

  exit() {
    super.exit();

    if (this.audio) {
      this.audio.src = '';
      $(this.audio).remove();
      this.audio = null;
    }

    if (this.$canvas) {
      this.$canvas.remove();
      this.$canvas = null;
    }

    if (this.$brunoText) {
      this.$brunoText.remove();
      this.$brunoText = null;
    }

    clearInterval(this.brunoShakeInterval);
  }

  children() {
    return [this.hemiLight, this.dirLight];
  }

  update() {
    super.update();

    if (this.coin1) {
      this.coin1.rotate(0, 0, this.coinRotationSpeed);
      this.coin2.rotate(0, 0, -this.coinRotationSpeed);
      this.coin3.rotate(0, 0, this.coinRotationSpeed);

      if (this.coinRotationSpeed < 0.35) {
        this.coinRotationSpeed += 0.000006;
      }
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
    dirLight.position.set(0, 75, 100);
    dirLight.castShadow = true;
    dirLight.shadowMapWidth = dirLight.shadowMapHeight = 8192;

    this.dirLight = dirLight;
    this.scene.add(dirLight);
  }

  // Ground

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

      position: new THREE.Vector3(0, -5, 0)
    });

    this.addMesh(ground);
  }

  // Gold

  addGoldCoins() {
    this.coin1 = this.makeCoin(new THREE.Vector3(-5, 0.5, -10));
    this.coin2 = this.makeCoin(new THREE.Vector3(5, 0.5, -10));
    this.coin3 = this.makeCoin(new THREE.Vector3(0, 3.0, -20));
    this.coin3.rotate(0, 0, Math.PI / 2);
  }

  makeCoin(position) {
    let coin = new ShaneMesh({
      meshCreator: (callback) => {
        let geometry = new THREE.CylinderGeometry(2, 2, 0.5, 32);
        let material = new THREE.MeshLambertMaterial({
          color: 0xFFD86C
        });

        let mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;

        callback(geometry, material, mesh);
      },
      position: position
    });

    this.addMesh(coin, () => {
      coin.mesh.geometry.center();
      coin.rotate(Math.PI / 2, 0, 0);
    });

    return coin;
  }

  // Static

  makeStaticCanvas() {
    if (!this.active) {
      return;
    }

    let canvas = this.dahmer.makeCanvas();

    canvas.width = 666;
    canvas.height = 666;

    let $canvas = $(canvas);

    $canvas.css('background-color', 'white');

    $canvas.css('box-shadow', '0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22)');
    $canvas.css('opacity', '0');

    this.domContainer.append($canvas);

    $canvas.animate({opacity: 0.75}, 60666);

    this.$canvas = $canvas;

    this.resize();
  }

  addBrunoText() {
    if (!this.$canvas) {
      return;
    }

    let $text = $('<div style="opacity: 0; color: rgb(255, 0, 138); font-family: cursive; position: absolute; top: 50%; text-align: center; width: 100%; font-size: 100px; font-weight: bold; letter-spacing: 5px; margin-top: -100px; z-index: 201; text-shadow: 3px 3px 6px rgba(255, 0, 0, 0.9);">Bruno?</div>');
    this.domContainer.append($text);

    $text.animate({opacity: 1}, 30666);

    this.$brunoText = $text;
  }

}
