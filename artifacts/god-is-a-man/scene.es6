
let THREE = require('three');
let $ = require('jquery');
let kt = require('kutility');

let web = require('../../js/web');
import {Talisman} from '../../js/talisman.es6';
import {ShaneScene} from '../../js/shane-scene.es6';

import {karaokeWithDomContainer} from './karaoke.es6';

export class GodIsAMan extends ShaneScene {

  constructor(renderer, camera, scene, options) {
    super(renderer, camera, scene, options);

    this.videoBase = (this.isLive? web.liveBase.godIsAMan : web.webBase.godIsAMan) + 'video/';
  }

  enter() {
    super.enter();

    this.highwayVideo = this.makeVideo(this.videoBase + 'mojave_cycle', true);
    this.highwayVideo.play();

    setTimeout(this.vegasTime.bind(this), 10000);
    setTimeout(this.papaTime.bind(this), 20000); // this should be ~ 6 minutes
    setTimeout(this.cowboyTime.bind(this), 30000); // this should be ~ 8 minutes
    setTimeout(this.game2Time.bind(this), 40000); // ~ 11 minutes?
    setTimeout(this.game1Time.bind(this), 50000); // ~11.5 minutes?

    setTimeout(this.createVin.bind(this), 2000);
    setTimeout(this.createWhitey.bind(this), 8000);
    setTimeout(this.createPapaJohn.bind(this), 15000);

    setTimeout(() => {
      karaokeWithDomContainer(this.domContainer);
    }, 2000);
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
    this.vegasVideo = this.makeVideo(this.videoBase + 'vegas', true);
    this.vegasVideo.play();

    this.vegasVideo.style.opacity = 0.0;
    $(this.vegasVideo).animate({opacity: 0.67}, 10000);

    setTimeout(() => {
      $(this.vegasVideo).animate({opacity: 0.0}, 10000, () => {
        this.vegasVideo.src = '';
        $(this.vegasVideo).remove();
      });
    }, 320 * 1000); // thats the vegas length dummy
  }

  papaTime() {
    this.papaVideo = this.makeVideo(this.videoBase + 'softypapa', true);
    this.papaVideo.play();

    this.papaVideo.style.opacity = 0.0;
    $(this.papaVideo).animate({opacity: 0.67}, 10000);

    setTimeout(() => {
      $(this.papaVideo).animate({opacity: 0.0}, 10000, () => {
        this.papaVideo.src = '';
        $(this.papaVideo).remove();
      });
    }, 100 * 1000); // thats the papa length dummy
  }

  cowboyTime() {
    this.cowboyVideo = this.makeVideo(this.videoBase + 'lonely_cowboy', true);
    this.cowboyVideo.play();

    this.cowboyVideo.style.opacity = 0.0;
    $(this.cowboyVideo).animate({opacity: 0.67}, 10000);

    setTimeout(() => {
      $(this.cowboyVideo).animate({opacity: 0.0}, 10000, () => {
        this.cowboyVideo.src = '';
        $(this.cowboyVideo).remove();
      });
    }, 145 * 1000); // thats the cowboy length dummy
  }

  game2Time() {
    this.game2Video = this.makeVideo(this.videoBase + 'game_2', true);
    this.game2Video.play();

    this.game2Video.style.opacity = 0.0;
    $(this.game2Video).animate({opacity: 0.67}, 10000);

    setTimeout(() => {
      $(this.game2Video).animate({opacity: 0.0}, 10000, () => {
        this.game2Video.src = '';
        $(this.game2Video).remove();
      });
    }, 66 * 1000);
  }

  game1Time() {
    this.game1Video = this.makeVideo(this.videoBase + 'game_1', true);
    this.game1Video.play();

    this.game1Video.style.opacity = 0.0;
    $(this.game1Video).animate({opacity: 0.67}, 10000);

    setTimeout(() => {
      $(this.game1Video).animate({opacity: 0.0}, 10000, () => {
        this.game1Video.src = '';
        $(this.game1Video).remove();
      });
    }, 44 * 1000); // thats the vegas length dummy
  }

  createVin() {
    this.vin = this.makeVideo(this.videoBase + 'vin_diesel');
    this.stylizeVision(this.vin);

    this.vin.style.left = '54%';
    this.vin.style.top = '100px';
    this.vin.style.width = '45%';

    this.vin.style.opacity = 0;
    this.vin.play();

    $(this.vin).animate({opacity: 0.8}, kt.randInt(4444, 6666));

    setTimeout(() => {
      $(this.vin).animate({opacity: 0}, kt.randInt(4444, 6666), () => {
        this.vin.src = '';
        $(this.vin).remove();
      });
    }, kt.randInt(25000, 35000));
  }

  createWhitey() {
    this.whitey = this.makeVideo(this.videoBase + 'whitey');
    this.stylizeVision(this.whitey);

    this.whitey.style.left = '60px';
    this.whitey.style.bottom = '40px';
    this.whitey.style.width = '45%';

    this.whitey.style.opacity = 0;
    this.whitey.play();

    $(this.whitey).animate({opacity: 0.8}, kt.randInt(4444, 6666));

    setTimeout(() => {
      $(this.whitey).animate({opacity: 0}, kt.randInt(4444, 6666), () => {
        this.whitey.src = '';
        $(this.whitey).remove();
      });
    }, kt.randInt(25000, 35000));
  }

  createPapaJohn() {
    this.papaJohn = this.makeVideo(this.videoBase + 'papajohn');
    this.stylizeVision(this.papaJohn);

    this.papaJohn.style.left = '25%';
    this.papaJohn.style.top = '0px';
    this.papaJohn.style.width = '50%';

    this.papaJohn.style.opacity = 0;
    this.papaJohn.play();

    $(this.papaJohn).animate({opacity: 0.8}, kt.randInt(4444, 6666));

    setTimeout(() => {
      $(this.papaJohn).animate({opacity: 0}, kt.randInt(4444, 6666), () => {
        this.papaJohn.src = '';
        $(this.papaJohn).remove();
      });
    }, kt.randInt(25000, 35000));
  }

  /// Vision Animations

  stylizeVision(vision) {
    $(vision).css('box-shadow', '10px 10px 30px 7px rgba(0, 0, 0, 0.95)');
  }

}
