
let THREE = require('three');
let $ = require('jquery');

import {Talisman} from './talisman.es6';

export class ShaneScene {
  constructor(renderer, camera, scene, options) {
    this.renderer = renderer;
    this.camera = camera;
    this.scene = scene;
    this.options = options;

    this.name = 'shane scene';

    this.talisman = this.createTalisman();
    this.talisman.addTo(scene);

    this.shaneMeshes = [];

    this.domContainer = $('body');

    $('body').click(this.click.bind(this));
    $(window).resize(this.resize.bind(this));

    this.isLive = false;
    this.numMediaToLoad = this.isLive ? 1 : 0;
  }

  update() {
    if (this.talisman) {
      this.talisman.update();
    }
  }

  startScene() {
    this.enter();

    this.startTimedWorkIfPossible();
  }

  enter() {
    this.active = true;

    this.camera.position.set(0, 0, 0);
    this.camera.rotation.x = 0; this.camera.rotation.y = 0; this.camera.rotation.z = 0;
  }

  didLoadMedia() {
    this.numMediaToLoad -= 1;
    this.startTimedWorkIfPossible();
  }

  startTimedWorkIfPossible() {
    if (this.active && this.numMediaToLoad === 0) {
      this.doTimedWork();
    }
  }

  doTimedWork() {

  }

  exit() {
    this.active = false;

    let children = this.children();
    for (let i = 0; i < children.length; i++) {
      let child = children[i];
      this.scene.remove(child);
    }

    let shaneMeshes = this.shaneMeshes;
    for (let i = 0; i < shaneMeshes.length; i++) {
      let shaneMesh = shaneMeshes[i];
      shaneMesh.removeFrom(this.scene);
    }
  }

  iWantOut() {
    if (this.exitCallback) {
      this.exitCallback(this);
    }
  }

  addMesh(shaneMesh, callback) {
    shaneMesh.addTo(this.scene, callback);
    this.shaneMeshes.push(shaneMesh);
  }

  click() {
    if (this.active && this.isLive && !this.hasPerformedStartLiveClick) {
      this.didLoadMedia();
      this.hasPerformedStartLiveClick = true;
    }
  }

  resize() {

  }

  /// Protected overrides

  createTalisman() {
    return new Talisman();
  }

  children() {
    return [];
  }

  /// Utility

  makeAudio(basedFilename) {
    var audio = document.createElement('audio');

    if (audio.canPlayType('audio/mpeg')) {
      audio.src = basedFilename + '.mp3';
    }
    else {
      audio.src = basedFilename + '.ogg';
    }

    audio.preload = true;

    return audio;
  }

  makeVideo(basedFilename, fullscreen, z) {
    var video = document.createElement('video');

    var videoURL;
    if (video.canPlayType('video/mp4').length > 0) {
      videoURL = basedFilename + '.mp4';
    } else {
      videoURL = basedFilename + '.webm';
    }

    video.src = videoURL;
    video.preload = true;
    video.loop = true;

    if (fullscreen) {
      $(video).addClass('full-screen-video');
    } else {
      $(video).addClass('video-overlay');
    }

    if (z !== undefined) {
      $(video).css('z-index', z);
    }

    this.domContainer.append(video);

    return video;
  }

  makeImage(basedFilename, fullscreen, z) {
    var img = $('<img src="' + basedFilename + '" class="image-overlay"/>');

    if (fullscreen) {
      img.css('top', '0px');
      img.css('left', '0px');
      img.css('width', '100%');
      img.css('height', '100%');
    }

    if (z !== undefined) {
      img.css('z-index', z);
    }

    this.domContainer.append(img);

    return img;
  }

  makeCanvas(z) {
    var canvas = $('<canvas class="canvas-overlay"></canvas>');


    if (z !== undefined) {
      canvas.css('z-index', z);
    }

    this.domContainer.append(canvas);

    return canvas.get(0);
  }

}
