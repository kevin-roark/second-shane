
let THREE = require('three');
let $ = require('jquery');
let kt = require('kutility');

let urls = require('../../urls');
import {Talisman} from '../../talisman.es6';
import {ShaneScene} from '../../shane-scene.es6';
let ShaneMesh = require('../../shane-mesh');

export class iFeltTheFoot extends ShaneScene {

  /// Init

  constructor(renderer, camera, scene, options) {
    super(renderer, camera, scene, options);

    var host = (this.isLive? urls.iFeltTheFoot.live : urls.iFeltTheFoot.web);
    this.videoBase = host + 'video/';
    this.imageBase = host + 'images/';
  }

  createTalisman() {
    let talisman = new Talisman({
      position: new THREE.Vector3(-15, 0, -10)
    });
    return talisman;
  }

  /// Shane System

  enter() {
    super.enter();

    this.marble = this.makeImage(this.imageBase + 'marble.jpg', true);

    setTimeout(this.doFootMassage.bind(this), 6666);
    setTimeout(this.doRotatingFoot.bind(this), 38666);
    setTimeout(this.doFootBone.bind(this), 60666);
  }

  exit() {
    super.exit();
  }

  update() {
    super.update();
  }

  /// Body Videos

  doRotatingFoot() {
    this.rotatingFoot = this.makeBodyVideo('rotating_foot');

    this.rotatingFoot.style.height = '60%';
    this.rotatingFoot.style.right = '100px';
    this.rotatingFoot.style.top = '15%';

    $(this.rotatingFoot).hide();
    this.rotatingFoot.play();
    setTimeout(() => {$(this.rotatingFoot).show();}, 100);

    setTimeout(() => {
      this.removeVideo(this.rotatingFoot);
    }, 15666);
  }

  doFootMassage() {
    this.footMassage = this.makeBodyVideo('foot_massage');

    this.footMassage.style.width = '33%';
    this.footMassage.style.left = '16%';
    this.footMassage.style.bottom = '200px';

    this.footMassage.play();

    setTimeout(() => {
      this.removeVideo(this.footMassage);
    }, 18666);
  }

  doFootBone() {
    this.footBone = this.makeBodyVideo('foot_bone');

    this.footBone.style.width = '40%';
    this.footBone.style.left = '30%';
    this.footBone.style.top = '40%';

    this.footBone.play();

    setTimeout(() => {
      this.removeVideo(this.footBone);
    }, 29666);
  }

  makeBodyVideo(name) {
    let vid = this.makeVideo(this.videoBase + name);

    $(vid).css('box-shadow', '0px 0px 30px 16px rgba(0, 0, 0, 0.75)');

    return vid;
  }

  removeVideo(video) {
    video.src = '';
    $(video).remove();
  }

}
