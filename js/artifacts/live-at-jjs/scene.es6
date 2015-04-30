
let THREE = require('three');
let $ = require('jquery');

let urls = require('../../urls');
import {Talisman} from '../../talisman.es6';
import {ShaneScene} from '../../shane-scene.es6';
let ShaneMesh = require('../../shane-mesh');

export class LiveAtJJs extends ShaneScene {

  /// Init

  constructor(renderer, camera, scene, options) {
    super(renderer, camera, scene, options);

    var host = (this.isLive? urls.liveAtJJs.live : urls.liveAtJJs.web);
    this.videoBase = host + 'video/';
    this.imageBase = host + 'images/';

    this.humans = [];
  }

  createTalisman() {
    let talisman = new Talisman({
      position: new THREE.Vector3(0, 0, -40)
    });
    return talisman;
  }

  /// Overrides

  enter() {
    super.enter();

    this.renderer.setClearColor(0x000000);

    this.curtainBackdrop = this.makeImage(this.imageBase + 'curtain_backdrop.jpg');
    this.curtainBackdrop.css('max-height', '666px');
    this.curtainBackdrop.css('left', '50%');
    this.curtainBackdrop.css('top', '10px');
    setTimeout(() => {
      this.resize();
    }, 500);

    this.dvd = this.makeVideo(this.videoBase + 'liveatjjs');
    this.dvd.style.height = '365px';
    this.dvd.style.top = '135px';
    this.dvd.style.left = '50%';
    $(this.dvd).css('box-shadow', '10px 10px 30px 30px rgba(0, 0, 0, 0.8)');

    this.leftCurtain = this.makeCurtain('left_curtain.jpg');
    this.leftCurtain.css('left', '0px');

    this.rightCurtain = this.makeCurtain('right_curtain.jpg');
    this.rightCurtain.css('right', '0px');

    setTimeout(this.animateCurtains.bind(this), 2000);
  }

  exit() {
    super.exit();

    this.renderer.setClearColor(0xffffff);
  }

  resize() {
    var curtainWidth = this.curtainBackdrop.width();
    this.curtainBackdrop.css('margin-left', (-curtainWidth / 2) + 'px');

    var dvdWidth = $(this.dvd).width();
    this.dvd.style.marginLeft = (-dvdWidth / 2) + 'px';
  }

  /// Curtains

  makeCurtain(name) {
    var curtain = this.makeImage(this.imageBase + name);
    curtain.css('width', '50%');
    return curtain;
  }

  animateCurtains() {
    this.leftCurtain.animate({left: -this.leftCurtain.width()}, 11000);
    this.rightCurtain.animate({right: -this.rightCurtain.width()}, 11000);
  }

  /// Humans

  makeHuman(position) {
    if (!position) position = new THREE.Vector3();

    var human = new ShaneMesh({
      modelName: '/js/models/male.js',
      position: position
    });

    human.addTo(this.scene);

    this.humans.push(human);

    return human;
  }

}
