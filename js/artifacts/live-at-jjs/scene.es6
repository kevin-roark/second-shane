
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

    this.name = "Mister Shane Live at JJ's";
    this.slug = 'live-at-jjs-place';
    this.symbolName = '/media/symbols/projector.png';

    var host = (this.isLive? urls.liveAtJJs.live : urls.liveAtJJs.web);
    this.videoBase = host + 'video/';
    this.imageBase = host + 'images/';

    this.humans = [];
  }

  createTalisman() {
    let talisman = new Talisman({
      position: new THREE.Vector3(-75, 0, -200),
      modelPath: '/js/models/projector.json',
      modelScale: 18.0
    });
    return talisman;
  }

  /// Overrides

  enter() {
    super.enter();

    this.renderer.setClearColor(0x000000, 0);
    $('body').css('background-color', 'black');

    this.curtainBackdrop = this.dahmer.makeImage(this.imageBase + 'curtain_backdrop.jpg');
    this.curtainBackdrop.css('max-height', '666px');
    this.curtainBackdrop.css('top', '10px');
    this.curtainBackdrop.css('z-index', '-10');

    var filename = this.isLive ? 'live_liveatjjs' : 'liveatjjs';
    this.dvd = this.dahmer.makeVideo(this.videoBase + filename);
    this.dvd.style.height = '365px';
    this.dvd.style.top = '135px';
    this.dvd.style.left = '50%';
    $(this.dvd).css('box-shadow', '10px 10px 15px 10px rgba(0, 0, 0, 0.8)');

    this.leftCurtain = this.makeCurtain('left_curtain.jpg');
    this.leftCurtain.css('left', '0px');

    this.rightCurtain = this.makeCurtain('right_curtain.jpg');
    this.rightCurtain.css('right', '0px');

    for (let i = 0; i < 10; i++) {
      var x = -2.5 + (0.5 * i);
      this.makeHuman({x: x, z: -3, y: -1.5});
    }

    setTimeout(this.resize.bind(this), 500);

    this.numMediaToLoad += 1;
    this.dvd.addEventListener('canplaythrough', () => {
      this.didLoadMedia();
    });
  }

  doTimedWork() {
    super.doTimedWork();

    this.dvd.play();
    this.animateCurtains();

    this.addTimeout(this.popcornTimer.bind(this), 9666);

    let videoLength = this.isLive ? (9 * 60 + 16) * 1000 : (17 * 60 + 41) * 1000;
    this.addTimeout(this.makeDVDFullScreen.bind(this), videoLength - (76 * 1000));
    this.addTimeout(this.iWantOut.bind(this), videoLength);
  }

  exit() {
    super.exit();

    this.renderer.setClearColor(0xffffff, 1);
    $('body').css('background-color', 'white');

    if (this.dvd) {
      this.dvd.src = '';
      $(this.dvd).remove();
      this.dvd = null;
    }

    if (this.curtainBackdrop) {
      this.curtainBackdrop.remove();
      this.curtainBackdrop = null;
    }
    if (this.leftCurtain) {
      this.leftCurtain.remove();
      this.leftCurtain = null;
    }
    if (this.rightCurtain) {
      this.rightCurtain.remove();
      this.rightCurtain = null;
    }
  }

  resize() {
    if (this.active) {
      this.curtainWidth = this.curtainBackdrop.width();
      this.curtainBackdrop.css('left', (window.innerWidth / 2 - this.curtainWidth / 2) + 'px');

      var dvdWidth = $(this.dvd).width();
      this.dvd.style.marginLeft = (-dvdWidth / 2) + 'px';
    }
  }

  update() {
    super.update();

    for (var i = 0; i < this.humans.length; i++) {
      this.humans[i].update();
    }
  }

  /// Marbling

  makeDVDFullScreen() {
    if (!this.active) {
      return;
    }

    var dvd = this.dvd;

    var currentHeight = 365;
    var currentTop = 135;

    let growthAmt = 0.2;

    let growthInterval = setInterval(() => {
      currentHeight += growthAmt;

      currentTop -= growthAmt * 0.25;
      if (currentTop <= 0) currentTop = 0;

      dvd.style.height = currentHeight + 'px';
      dvd.style.top = currentTop + 'px';

      this.resize();

      if (currentTop + currentHeight >= window.innerHeight) {
        clearInterval(growthInterval);
      }
    }, 25);
  }

  /// Curtains

  makeCurtain(name) {
    var curtain = this.dahmer.makeImage(this.imageBase + name);
    curtain.css('width', '50%');
    return curtain;
  }

  animateCurtains() {
    var duration = 12000;
    this.leftCurtain.animate({left: -this.leftCurtain.width()}, duration);
    this.rightCurtain.animate({right: -this.rightCurtain.width()}, duration);
  }

  /// Popcorn

  popcornTimer() {
    if (!this.active) {
      return;
    }

    if (Math.random() > 0.64) {
      this.addPopcorn();
    }

    setTimeout(this.popcornTimer.bind(this), 1600);
  }

  addPopcorn() {
    let corn = this.dahmer.makeImage(this.imageBase + 'popcorn.png');

    let cornWidth = Math.round(Math.random() * 100) + 20;
    corn.css('width', cornWidth + 'px');
    corn.css('top', '-50px');

    let widthSansCurtain = window.innerWidth - this.curtainWidth;
    let left = Math.random() > 0.5;
    let offset = 30 + Math.round(Math.random() * (widthSansCurtain / 2 - 60));

    if (!left) {
      offset += cornWidth;
    }

    corn.css(left? 'left' : 'right', offset + 'px');

    let dur = Math.round(Math.random() * 10000) + 6666;
    corn.animate({top: (window.innerHeight + 175) + 'px'}, dur, function() {
      corn.remove();
    });
  }

  /// Humans

  makeHuman(position) {
    if (!position) position = new THREE.Vector3();

    var human = new ShaneMesh({
      modelName: '/js/models/male.js',
      position: position,
      scale: 0.1
    });

    this.addMesh(human, function() {
      human.twitching = true;
      human.twitchIntensity = 0.015;

      human.rotate(0, Math.PI, 0);

      human.setMeshColor(0xffffff);
    });

    this.humans.push(human);

    return human;
  }

}
