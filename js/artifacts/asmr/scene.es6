
let THREE = require('three');
let $ = require('jquery');
let kt = require('kutility');

let urls = require('../../urls');
import {Talisman} from '../../talisman.es6';
import {ShaneScene} from '../../shane-scene.es6';
let ShaneMesh = require('../../shane-mesh');

let curtainDuration = 12000;

export class ASMR extends ShaneScene {

  /// Init

  constructor(renderer, camera, scene, options) {
    super(renderer, camera, scene, options);

    var host = (this.isLive? urls.asmr.live : urls.asmr.web);
    this.videoBase = host + 'video/';
    this.imageBase = host + 'images/';

    this.humans = [];
  }

  createTalisman() {
    let talisman = new Talisman({
      position: new THREE.Vector3(-15, 0, -15)
    });
    return talisman;
  }

  /// Shane System

  enter() {
    super.enter();

    this.renderer.setClearColor(0x000000);

    this.videos = [];

    this.setupVideoData();
    this.timeVideos();

    let asmrLength = 60000 * 4;

    let dvdTime = 131666;
    setTimeout(this.doDVD.bind(this), dvdTime);
    setTimeout(this.doCurtains.bind(this), asmrLength - curtainDuration);

    setTimeout(this.iWantOut.bind(this), asmrLength + 6666);
  }

  exit() {
    super.exit();

    this.renderer.setClearColor(0xffffff);

    for (var j = 0; j < this.videos.length; j++) {
      let video = this.videos[j];
      video.removeAttribute("src"); // thanks mdn really smart
      $(video).remove();
    }

    this.dvd.removeAttribute('src');
    $(this.dvd).remove();

    this.leftCurtain.remove();
    this.rightCurtain.remove();
  }

  update() {
    super.update();

    for (var i = 0; i < this.humans.length; i++) {
      this.humans[i].update();
    }
  }

  /// Curtains

  doCurtains() {
    this.leftCurtain = this.makeCurtain('left_curtain.jpg');
    this.rightCurtain = this.makeCurtain('right_curtain.jpg');

    this.leftCurtain.css('left', -this.leftCurtain.width());
    this.rightCurtain.css('right', -this.rightCurtain.width());

    this.leftCurtain.animate({left: 0}, curtainDuration);
    this.rightCurtain.animate({right: 0}, curtainDuration);
  }

  makeCurtain(name) {
    var curtain = this.makeImage(this.imageBase + name);
    curtain.css('width', '50%');
    return curtain;
  }

  /// Videos

  setupVideoData() {
    let videoRectangles = [
      rectangle(0, 0, 0.3, 0.2), // 1
      rectangle(0.6, 0.8, 0.4, 0.2), // 2
      rectangle(0, 0.7, 0.4, 0.3), // 3
      rectangle(0.3, 0.3, 0.4, 0.2), // 4
      rectangle(0.4, 0.5, 0.6, 0.3), // 5
      rectangle(0.3, 0, 0.6, 0.3), // 6
      rectangle(0, 0.4, 0.4, 0.2), // 7
      rectangle(0, 0.6, 0.6, 0.4), // 8
      rectangle(0, 0.2, 0.4, 0.2), // 9
      rectangle(0.8, 0, 0.2, 0.3), // 10
      rectangle(0.4, 0.9, 0.2, 0.1), // 11,
      rectangle(0.6, 0.3, 0.4, 0.2) // 12
    ];
    this.videoRectangles = kt.shuffle(videoRectangles);

    this.videoData = [
      {name: 'black_holes', onset: 0},
      {name: 'morning_routine', onset: 16000},
      {name: 'papa_johns', onset: 32000},
      {name: 'pickles', onset: 46000},
      {name: 'ehookah', onset: 60000},
      {name: 'ear_pov', onset: 72000},
      {name: 'iphone', onset: 84000},
      {name: 'pasta', onset: 94000},
      {name: 'hummus', onset: 104000},
      {name: 'mac', onset: 112000},
      {name: 'mcdonalds', onset: 120000},
      {name: 'real_hookah', onset: 126000},
    ];
  }

  timeVideos() {
    for (var i = 0; i < this.videoData.length; i++) {
      var data = this.videoData[i];
      this.addVideo(data.name, data.onset, this.videoRectangles[i]);
    }
  }

  addVideo(videoName, delay, rect) {
    setTimeout(() => {
      var video = this.makeASMRVideo(videoName);
      this.videos.push(video);

      this.sizeVideo(video, rect);

      $(video).css('visibility', 'visible');
      video.play();
    }, delay);
  }

  sizeVideo(video, rect) {
    video.style.left = (rect.x * 100) + '%';
    video.style.top = (rect.y * 100) + '%';
    video.style.width = (rect.width * 100) + '%';
    video.style.height = (rect.height * 100) + '%';
  }

  // fuck matt: http://coding.vdhdesign.co.nz/?p=29
  makeASMRVideo(name) {
    let video = this.makeVideo(this.videoBase + name, false);

    $(video).css('position', 'absolute');
    $(video).css('object-fit', 'fill');
    $(video).css('visibility', 'hidden');

    return video;
  }

  /// DVD

  doDVD() {
    this.dvd = this.makeASMRVideo('jjs-asmr');
    this.dvd.loop = false;

    this.sizeVideo(this.dvd, rectangle(0.35, 0.35, 0.3, 0.3));
    $(this.dvd).css('visibility', 'visible');
    this.dvd.play();

    setTimeout(() => {
      this.shadowizeDVD(this.dvd, () => {
        setTimeout(() => {
          this.growDVD(this.dvd, () => {
            console.log('i am grown man');
          });
        }, 3666);
      });
    }, 5666);
  }

  shadowizeDVD(dvd, callback) {
    var shadowSize = 0;

    let shadowInterval = setInterval(() => {
      shadowSize += 1;
      $(dvd).css('box-shadow', '10px 10px 30px ' + shadowSize + 'px rgba(0, 0, 0, 0.8)');

      if (shadowSize >= 30) {
        clearInterval(shadowInterval);
        callback();
      }
    }, 140);
  }

  growDVD(dvd, callback) {
    var length = 30; // the current length

    let growthInterval = setInterval(() => {
      length += 0.07;
      var offset = 100 - length;
      if (offset > 0) {
        offset /= 2;
      }

      dvd.style.left = offset + '%';
      dvd.style.top = offset + '%';
      dvd.style.width = length + '%';
      dvd.style.height = length + '%';

      if (length >= 90) {
        clearInterval(growthInterval);
        callback();
      }
    }, 30);
  }

}

function rectangle(x, y, w, h) {
  return {x: x, y: y, width: w, height: h};
}
