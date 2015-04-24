
let THREE = require('three');
let $ = require('jquery');

let web = require('../../js/web');
import {Talisman} from '../../js/talisman.es6';
import {ShaneScene} from '../../js/shane-scene.es6';

export class GodIsAMan extends ShaneScene {

  constructor(renderer, camera, scene, options) {
    super(renderer, camera, scene, options);

    this.videoBase = (this.isLive? web.liveBase.godIsAMan : web.webBase.godIsAMan) + 'video/';
  }

  enter() {
    super.enter();

    this.highwayVideo = this.makeVideo(this.videoBase + 'mojave_cycle', true);
    this.domContainer.append(this.highwayVideo);
    this.highwayVideo.play();
  }

  exit() {
    super.exit();

    $(this.highwayVideo).remove();
  }

  click() {
    if (!this.active) {
      return;
    }
    
    if (this.exitCallback) {
      this.exitCallback(this);
    }
  }

  createTalisman() {
    // TODO: make this a cactus
    let talisman = new Talisman({
      position: new THREE.Vector3(0, 0, -10)
    });
    return talisman;
  }

}
