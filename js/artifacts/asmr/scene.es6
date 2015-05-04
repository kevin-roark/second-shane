
let THREE = require('three');
let $ = require('jquery');
let kt = require('kutility');

let urls = require('../../urls');
import {Talisman} from '../../talisman.es6';
import {ShaneScene} from '../../shane-scene.es6';
let ShaneMesh = require('../../shane-mesh');

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

    this.setupVideoData();
    this.timeVideos();

    let asmrLength = 60000 * 3;
    setTimeout(this.iWantOut.bind(this), asmrLength);
  }

  exit() {
    super.exit();

    this.renderer.setClearColor(0xffffff);

    for (var j = 0; j < this.videos.length; j++) {
      let video = this.videos[j];
      video.removeAttribute("src"); // thanks mdn really smart
      $(video).remove();
    }
  }

  update() {
    super.update();

    for (var i = 0; i < this.humans.length; i++) {
      this.humans[i].update();
    }
  }

  /// Curtains

  addCurtains() {
    this.leftCurtain = this.makeCurtain('left_curtain.jpg');
    this.leftCurtain.css('left', '0px');

    this.rightCurtain = this.makeCurtain('right_curtain.jpg');
    this.rightCurtain.css('right', '0px');
  }

  makeCurtain(name) {
    var curtain = this.makeImage(this.imageBase + name);
    curtain.css('width', '50%');
    return curtain;
  }

  animateCurtains() {
    var duration = 12000;
    this.leftCurtain.animate({left: -this.leftCurtain.width()}, duration);
    this.rightCurtain.animate({right: -this.rightCurtain.width()}, duration);
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
    var videos = [];
    for (var i = 0; i < this.videoData.length; i++) {
      var data = this.videoData[i];
      var video = this.makeASMRVideo(data.name);
      videos.push(video);
      this.addVideo(video, data.onset, this.videoRectangles[i]);
    }

    this.videos = videos;
  }

  addVideo(video, delay, rect) {
    setTimeout(function() {
      video.style.left = (rect.x * 100) + '%';
      video.style.top = (rect.y * 100) + '%';
      video.style.width = (rect.width * 100) + '%';
      video.style.height = (rect.height * 100) + '%';
      console.log(video);

      $(video).css('visibility', 'visible');
      video.play();
    }, delay);
  }

  // fuck matt: http://coding.vdhdesign.co.nz/?p=29
  makeASMRVideo(name) {
    let video = this.makeVideo(this.videoBase + name, false);

    $(video).css('position', 'absolute');
    $(video).css('object-fit', 'fill');
    $(video).css('visibility', 'hidden');

    return video;
  }

}

function rectangle(x, y, w, h) {
  return {x: x, y: y, width: w, height: h};
}
