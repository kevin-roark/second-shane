
let THREE = require('three');
let $ = require('jquery');
let kt = require('kutility');

let urls = require('../../urls');
import {Talisman} from '../../talisman.es6';
import {ShaneScene} from '../../shane-scene.es6';

import {doKaraoke} from './karaoke.es6';
import {Basketball} from './basketball.es6';

export class GodIsAMan extends ShaneScene {

  constructor(renderer, camera, scene, options) {
    super(renderer, camera, scene, options);

    var host = (this.isLive? urls.godIsAMan.live : urls.godIsAMan.web);
    this.videoBase = host + 'video/';
    this.imageBase = host + 'images/';
  }

  createTalisman() {
    // TODO: make this a basketball
    let talisman = new Talisman({
      position: new THREE.Vector3(0, 0, -10)
    });
    return talisman;
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

    //setTimeout(this.createVin.bind(this), 2000);
    //setTimeout(this.createWhitey.bind(this), 2000);
    //setTimeout(this.createPapaJohn.bind(this), 2000);
    //setTimeout(this.createGodManVideo.bind(this), 2000);
    //setTimeout(this.createJohnCena.bind(this), 2000);
    //setTimeout(this.createBruceWillis.bind(this), 2000);
    //setTimeout(this.createGodSistene.bind(this), 2000);
    //setTimeout(this.createHulkHogan.bind(this), 2000);
    //setTimeout(this.createLebron.bind(this), 2000);
    //setTimeout(this.createJordan.bind(this), 2000);
    //setTimeout(this.createBigSean.bind(this), 2000);
    //setTimeout(this.createLilWayne.bind(this), 2000);

    //setTimeout(this.transitionToBall.bind(this), 1666); // 13 minutes?

    setTimeout(() => {
      this.basketball = new Basketball(this.imageBase + 'basketball.png');
      this.basketball.addTo(this.domContainer);
      doKaraoke(this.domContainer, this.basketball);
    }, 1000);
  }

  exit() {
    super.exit();

    $(this.highwayVideo).remove();
  }

  click() {
    if (!this.active) {
      return;
    }
  }

  /// Highway Manipulation

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

  /// Vision Creation

  createVin() {
    this.vin = this.makeVision('vin_diesel');

    this.vin.style.left = '54%';
    this.vin.style.top = '100px';
    this.vin.style.width = '45%';

    this.animateVision(this.vin);
  }

  createWhitey() {
    this.whitey = this.makeVision('whitey');

    this.whitey.style.left = '60px';
    this.whitey.style.bottom = '40px';
    this.whitey.style.width = '45%';

    this.animateVision(this.whitey);
  }

  createPapaJohn() {
    this.papaJohn = this.makeVision('papajohn');

    this.papaJohn.style.left = '25%';
    this.papaJohn.style.top = '0px';
    this.papaJohn.style.width = '50%';

    this.animateVision(this.papaJohn);
  }

  createGodManVideo() {
    this.godMan = this.makeVision('godmanvideo');

    this.godMan.style.left = '25%';
    this.godMan.style.top = '40px';
    this.godMan.style.width = '50%';

    this.animateVision(this.godMan);
  }

  createJohnCena() {
    this.johnCena = this.makeVision('johncena');

    this.johnCena.style.left = '25%';
    this.johnCena.style.top = '40px';
    this.johnCena.style.width = '50%';

    this.animateVision(this.johnCena);
  }

  createBruceWillis() {
    this.bruceWillis = this.makeVision('brucewillis');

    this.bruceWillis.style.left = '25%';
    this.bruceWillis.style.top = '40px';
    this.bruceWillis.style.width = '50%';

    this.animateVision(this.bruceWillis);
  }

  createGodSistene() {
    this.godSistene = this.makeVision('godsistene');

    this.godSistene.style.left = '25%';
    this.godSistene.style.top = '40px';
    this.godSistene.style.width = '50%';

    this.animateVision(this.godSistene);
  }

  createHulkHogan() {
    this.hulkHogan = this.makeVision('hulkhogan');

    this.hulkHogan.style.left = '25%';
    this.hulkHogan.style.top = '40px';
    this.hulkHogan.style.width = '50%';

    this.animateVision(this.hulkHogan);
  }

  createLebron() {
    this.lebron = this.makeVision('lebron');

    this.lebron.style.left = '25%';
    this.lebron.style.top = '40px';
    this.lebron.style.width = '50%';

    this.animateVision(this.lebron);
  }

  createJordan() {
    this.jordan = this.makeVision('jordan');

    this.jordan.style.left = '25%';
    this.jordan.style.top = '40px';
    this.jordan.style.width = '50%';

    this.animateVision(this.jordan);
  }

  createBigSean() {
    this.bigSean = this.makeVision('bigsean');

    this.bigSean.style.left = '25%';
    this.bigSean.style.top = '40px';
    this.bigSean.style.width = '50%';

    this.animateVision(this.bigSean);
  }

  createLilWayne() {
    this.lilWayne = this.makeVision('lilwayne');

    this.lilWayne.style.left = '30px';
    this.lilWayne.style.top = '8%';
    this.lilWayne.style.height = '70%';

    this.animateVision(this.lilWayne);
  }

  /// Vision Utility

  stylizeVision(vision) {
    $(vision).css('box-shadow', '0px 0px 30px 16px rgba(255, 255, 255, 0.95)');
  }

  makeVision(name) {
    var vision = this.makeVideo(this.videoBase + name);
    this.stylizeVision(vision);
    return vision;
  }

  animateVision(vision) {
    vision.style.opacity = 0;
    vision.play();

    $(vision).animate({opacity: 0.8}, kt.randInt(4444, 6666));

    setTimeout(() => {
      this.destroyVision(vision);
    }, kt.randInt(25000, 35000));
  }

  destroyVision(vision) {
    $(vision).animate({opacity: 0}, kt.randInt(4444, 6666), () => {
      vision.src = '';
      $(vision).remove();
    });
  }

  /// Basketball at the end

  transitionToBall() {
    this.ballWidth = 50;
    this.upBallWidth();

    this.finalOverlay = $('<div></div>');
    this.finalOverlay.css('background-color', 'white');
    this.finalOverlay.css('opacity', '0');
    this.finalOverlay.css('z-index', '10000');
    this.finalOverlay.css('position', 'fixed');
    this.finalOverlay.css('width', '100%');
    this.finalOverlay.css('height', '100%');
    this.finalOverlay.css('left', '0');
    this.finalOverlay.css('top', '0');
    this.domContainer.append(this.finalOverlay);
    this.finalOverlay.animate({opacity: 0.98}, 45000);

    this.basketball.bounce({
      x: window.innerWidth / 2 - 25,
      time: 100
    });
    setTimeout(this.bounceBall.bind(this), 500);
  }

  upBallWidth(amt) {
    this.ballWidth += (amt || 0.15);
    this.basketball.setWidth(this.ballWidth);

    if (this.ballWidth < window.innerWidth * 0.6) {
      setTimeout(this.upBallWidth.bind(this), 20);
    }
  }

  bounceBall() {
    this.basketball.bounce({
      x: window.innerWidth / 2 - this.ballWidth / 2,
      y: window.innerHeight / 2 - this.ballWidth * 0.5,
      time: 2666
    }, () => {
      if (this.active) {
        this.bounceBall();
      }
    });
  }

}
