
let THREE = require('three');
let $ = require('jquery');
let kt = require('kutility');

let urls = require('../../urls');
import {Talisman} from '../../talisman.es6';
import {ShaneScene} from '../../shane-scene.es6';

import {doKaraoke} from './karaoke.es6';
import {Basketball} from './basketball.es6';

let vegasLength = 75;
let papaLength = 90;
let cowboyLength = 70;
let gameLength = 60;

export class GodIsAMan extends ShaneScene {

  constructor(renderer, camera, scene, options) {
    super(renderer, camera, scene, options);

    this.name = 'God Is A Man';
    this.slug = 'god-is-a-man';
    this.symbolName = '/media/symbols/cross.png';

    var host = (this.isLive? urls.godIsAMan.live : urls.godIsAMan.web);
    this.videoBase = host + 'video/';
    this.imageBase = host + 'images/';

    this.basketballPath = this.imageBase + 'basketball.png';
  }

  createTalisman() {
    let talisman = new Talisman({
      position: new THREE.Vector3(220, 0, -220),
      modelPath: '/js/models/basketball/basketball.json',
      modelScale: 3.0
    });
    return talisman;
  }

  enter() {
    super.enter();

    this.highwayVideo = this.dahmer.makeVideo(this.videoBase + 'mojave_cycle', true);

    this.basketball = new Basketball(this.basketballPath);
    this.basketball.addTo(this.domContainer);

    this.numMediaToLoad += 1;
    this.highwayVideo.addEventListener('canplaythrough', () => {
      this.didLoadMedia();
    });
  }

  doTimedWork() {
    super.doTimedWork();

    this.highwayVideo.play();
    doKaraoke(this.domContainer, this.basketball);

    let vegasOffset = 45;
    this.addTimeout(this.vegasTime.bind(this), vegasOffset * 1000); // 45 seconds in, last for a minute

    let papaOffset = vegasOffset + vegasLength + 30;
    this.addTimeout(this.papaTime.bind(this), papaOffset * 1000); // 30 seconds after vegas ends

    let cowboyOffset = papaOffset + papaLength + 20;
    this.addTimeout(this.cowboyTime.bind(this), cowboyOffset * 1000); // 15 seconds after papa ends

    let gameOffset = cowboyOffset + cowboyLength + 30; // 30 seconds after cowboy ends
    this.addTimeout(this.game2Time.bind(this), gameOffset * 1000);
    this.addTimeout(this.game1Time.bind(this), (gameOffset + 20) * 1000);

    let visionOffset = 15; // 15
    let timeBetweenVisions = 44; // 44
    this.addTimeout(this.createVin.bind(this), (visionOffset + timeBetweenVisions * 0) * 1000);
    this.addTimeout(this.createWhitey.bind(this), (visionOffset + timeBetweenVisions * 1) * 1000);
    this.addTimeout(this.createLebron.bind(this), (visionOffset + timeBetweenVisions * 2) * 1000);
    this.addTimeout(this.createGodManVideo.bind(this), (visionOffset + timeBetweenVisions * 3) * 1000);
    this.addTimeout(this.createJohnCena.bind(this), (visionOffset + timeBetweenVisions * 4) * 1000);
    this.addTimeout(this.createBruceWillis.bind(this), (visionOffset + timeBetweenVisions * 5) * 1000);
    this.addTimeout(this.createLilWayne.bind(this), (visionOffset + timeBetweenVisions * 6) * 1000);
    this.addTimeout(this.createGodSistene.bind(this), (visionOffset + timeBetweenVisions * 7) * 1000);
    this.addTimeout(this.createHulkHogan.bind(this), (visionOffset + timeBetweenVisions * 8) * 1000);
    this.addTimeout(this.createJordan.bind(this), (visionOffset + timeBetweenVisions * 9) * 1000);
    this.addTimeout(this.createBigSean.bind(this), (visionOffset + timeBetweenVisions * 10) * 1000);
    this.addTimeout(this.createPapaJohn.bind(this), (visionOffset + timeBetweenVisions * 11) * 1000);

    this.addTimeout(this.transitionToBall.bind(this), 9.5 * 60 * 1000); // 9.5 minutes
  }

  exit() {
    super.exit();

    $(this.highwayVideo).remove();
  }

  /// Highway Manipulation

  vegasTime() {
    if (!this.active) {
      return;
    }

    this.vegasVideo = this.dahmer.makeVideo(this.videoBase + 'vegas', true);
    this.vegasVideo.playbackRate = 3;
    this.vegasVideo.play();

    this.vegasVideo.style.opacity = 0.0;
    $(this.vegasVideo).animate({opacity: 0.8}, 10000);

    setTimeout(() => {
      $(this.vegasVideo).animate({opacity: 0.0}, 10000, () => {
        this.vegasVideo.src = '';
        $(this.vegasVideo).remove();
      });
    }, vegasLength * 1000); // thats the vegas length dummy
  }

  papaTime() {
    if (!this.active) {
      return;
    }

    this.papaVideo = this.dahmer.makeVideo(this.videoBase + 'softypapa', true);
    this.papaVideo.play();

    this.papaVideo.style.opacity = 0.0;
    $(this.papaVideo).animate({opacity: 0.9}, 10000);

    setTimeout(() => {
      $(this.papaVideo).animate({opacity: 0.0}, 10000, () => {
        this.papaVideo.src = '';
        $(this.papaVideo).remove();
      });
    }, papaLength * 1000); // thats the papa length dummy
  }

  cowboyTime() {
    if (!this.active) {
      return;
    }

    this.cowboyVideo = this.dahmer.makeVideo(this.videoBase + 'lonely_cowboy', true);
    this.cowboyVideo.play();

    this.cowboyVideo.style.opacity = 0.0;
    $(this.cowboyVideo).animate({opacity: 0.9}, 10000);

    setTimeout(() => {
      $(this.cowboyVideo).animate({opacity: 0.0}, 10000, () => {
        this.cowboyVideo.src = '';
        $(this.cowboyVideo).remove();
      });
    }, cowboyLength * 1000); // thats the cowboy length dummy
  }

  game2Time() {
    if (!this.active) {
      return;
    }

    this.game2Video = this.dahmer.makeVideo(this.videoBase + 'game_2', true);
    this.game2Video.play();

    this.game2Video.style.opacity = 0.0;
    $(this.game2Video).animate({opacity: 0.67}, 10000);

    setTimeout(() => {
      $(this.game2Video).animate({opacity: 0.0}, 10000, () => {
        this.game2Video.src = '';
        $(this.game2Video).remove();
      });
    }, gameLength * 1000);
  }

  game1Time() {
    if (!this.active) {
      return;
    }

    this.game1Video = this.dahmer.makeVideo(this.videoBase + 'game_1', true);
    this.game1Video.play();

    this.game1Video.style.opacity = 0.0;
    $(this.game1Video).animate({opacity: 0.67}, 10000);

    setTimeout(() => {
      $(this.game1Video).animate({opacity: 0.0}, 10000, () => {
        this.game1Video.src = '';
        $(this.game1Video).remove();
      });
    }, (gameLength - 20) * 1000);
  }

  /// Vision Creation

  createVin() {
    if (!this.active) {
      return;
    }

    this.vin = this.makeVision('vin_diesel');

    this.vin.style.left = '54%';
    this.vin.style.top = '100px';
    this.vin.style.width = '45%';

    this.animateVision(this.vin);
  }

  createWhitey() {
    if (!this.active) {
      return;
    }

    this.whitey = this.makeVision('whitey');

    this.whitey.style.left = '60px';
    this.whitey.style.bottom = '100px';
    this.whitey.style.width = '45%';

    this.animateVision(this.whitey);
  }

  createPapaJohn() {
    if (!this.active) {
      return;
    }

    this.papaJohn = this.makeVision('papajohn');

    this.papaJohn.style.left = '25%';
    this.papaJohn.style.top = '12px';
    this.papaJohn.style.width = '50%';

    this.animateVision(this.papaJohn);
  }

  createGodManVideo() {
    if (!this.active) {
      return;
    }

    this.godMan = this.makeVision('godmanvideo', true);
    this.animateVision(this.godMan);
  }

  createJohnCena() {
    if (!this.active) {
      return;
    }

    this.johnCena = this.makeVision('johncena', true);
    this.animateVision(this.johnCena);
  }

  createBruceWillis() {
    if (!this.active) {
      return;
    }

    this.bruceWillis = this.makeVision('brucewillis', true);
    this.animateVision(this.bruceWillis);
  }

  createGodSistene() {
    if (!this.active) {
      return;
    }

    this.godSistene = this.makeVision('godsistene', true);
    this.animateVision(this.godSistene);
  }

  createHulkHogan() {
    if (!this.active) {
      return;
    }

    this.hulkHogan = this.makeVision('hulkhogan', true);
    this.animateVision(this.hulkHogan);
  }

  createLebron() {
    if (!this.active) {
      return;
    }

    this.lebron = this.makeVision('lebron', true);
    this.animateVision(this.lebron);
  }

  createJordan() {
    if (!this.active) {
      return;
    }

    this.jordan = this.makeVision('jordan', true);
    this.animateVision(this.jordan);
  }

  createBigSean() {
    if (!this.active) {
      return;
    }

    this.bigSean = this.makeVision('bigsean', true);
    this.animateVision(this.bigSean);
  }

  createLilWayne() {
    if (!this.active) {
      return;
    }

    this.lilWayne = this.makeVision('lilwayne');

    this.lilWayne.style.left = '30px';
    this.lilWayne.style.top = '8%';
    this.lilWayne.style.height = '70%';

    this.animateVision(this.lilWayne);
  }

  /// Vision Utility

  makeVision(name, randomPlacement) {
    var vision = this.dahmer.makeVideo(this.videoBase + name);

    if (randomPlacement) {
      var width = Math.random() * 0.4 + 0.25;
      vision.style.width = (width * 100) + '%';

      var vert = Math.random() * 0.33;
      if (Math.random() < 0) {
        vision.style.top = (vert * 100) + '%';
      } else {
        vision.style.bottom = (vert * 100) + '%';
      }

      var hor = Math.random() * (1 - width);
      if (Math.random() < 0) {
        vision.style.left = (hor * 100) + '%';
      } else {
        vision.style.right = (hor * 100) + '%';
      }
    }
    $(vision).css('box-shadow', '0px 0px 20px 13px rgba(255, 255, 255, 0.95)');

    return vision;
  }

  animateVision(vision) {
    var curOffset = $(vision).offset();

    // do slide animation
    if (Math.random() < 0.62) {
      vision.style.left = '';
      vision.style.right = '';
      vision.style.top = '';
      vision.style.bottom = '';

      let p = Math.random();
      if (p < 0.25) {
        vision.style.left = - kt.randInt(666, 1000);
        vision.style.top = - kt.randInt(666, 1000);
      } else if (p < 0.5) {
        vision.style.left = window.innerWidth + kt.randInt(666, 1000);
        vision.style.top = - kt.randInt(666, 1000);
      } else if (p < 0.75) {
        vision.style.left = window.innerWidth + kt.randInt(666, 1000);
        vision.style.top = window.innerHeight + kt.randInt(666, 1000);
      } else {
        vision.style.left = - kt.randInt(666, 1000);
        vision.style.top = window.innerHeight + kt.randInt(666, 1000);
      }
    }

    // always do opacity
    vision.style.opacity = 0;

    vision.play();

    let duration = kt.randInt(4444, 6666);

    $(vision).animate({opacity: 0.8, left: curOffset.left, top: curOffset.top}, duration);

    let length = kt.randInt(36000, 48000);
    setTimeout(() => {
      this.destroyVision(vision);
    }, length);
  }

  destroyVision(vision) {
    $(vision).animate({opacity: 0}, kt.randInt(4444, 6666), () => {
      vision.src = '';
      $(vision).remove();
    });
  }

  /// Basketball at the end

  transitionToBall() {
    if (!this.active) {
      return;
    }

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
    if (!this.active) {
      return;
    }

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
