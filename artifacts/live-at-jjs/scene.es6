
let THREE = require('three');
let $ = require('jquery');

let web = require('../../js/web');
import {Talisman} from '../../js/talisman.es6';
import {ShaneScene} from '../../js/shane-scene.es6';

export class LiveAtJJs extends ShaneScene {

  constructor(renderer, camera, scene, options) {
    super(renderer, camera, scene, options);

    this.videoBase = (this.isLive? web.godIsAMan.live : web.godIsAMan.web) + 'video/';
    this.imageBase = (this.isLive? web.godIsAMan.live : web.godIsAMan.web) + 'images/';
  }

  enter() {
    super.enter();

    this.dvd = this.makeVideo(this.videoBase + 'liveatjjs');

    this.curtainBackdrop = this.makeImage('curtain_backdrop.jpg');

    this.leftCurtain = this.makeImage('left_curtain.jpg');
    this.rightCurtain = this.makeImage('right_curtain.jpg');
  }

  createTalisman() {
    let talisman = new Talisman({
      position: new THREE.Vector3(0, 0, -40)
    });
    return talisman;
  }

  makeImage(name) {
    var img = $('img src="' + this.imageBase + name + '"');

    img.css('position', 'absolute');

    this.domContainer.append(img);
    return img;
  }

}
