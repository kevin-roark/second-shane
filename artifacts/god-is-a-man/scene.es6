
let THREE = require('three');
let $ = require('jquery');
let kt = require('kutility');

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
    this.highwayVideo.play();

    setTimeout(this.createVin.bind(this), 2000);

    setTimeout(this.vegasTime.bind(this), 20000);
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
//      this.exitCallback(this);
    }
  }

  createTalisman() {
    // TODO: make this a cactus
    let talisman = new Talisman({
      position: new THREE.Vector3(0, 0, -10)
    });
    return talisman;
  }

  /// Timed Actions

  vegasTime() {
    console.log('vegas time!');
    this.vegasVideo = this.makeVideo(this.videoBase + 'vegas', true);
    this.vegasVideo.play();

    this.vegasVideo.style.opacity = 0.0;
    $(this.vegasVideo).animate({opacity: 0.67}, 10000, () => {
      // this.highwayVideo.pause();
    });
  }

  createVin() {
    this.vin = this.makeVideo(this.videoBase + 'vin_diesel');
    this.stylizeVision(this.vin);

    this.vin.style.left = '54%';
    this.vin.style.top = '100px';
    this.vin.style.width = '45%';

    this.vin.style.opacity = 0;
    $(this.vin).animate({opacity: 0.8}, kt.randInt(4444, 6666));

    this.vin.play();

    setTimeout(() => {
      $(this.vin).animate({opacity: 0}, kt.randInt(4444, 6666), () => {
        $(this.vin).remove();
      });
    }, kt.randInt(25000, 35000));
  }

  /// Vision Animations

  stylizeVision(vision) {
    $(vision).css('box-shadow', '10px 10px 30px 7px rgba(0, 0, 0, 0.9)');
  }

}
