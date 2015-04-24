
let THREE = require('three');
let $ = require('jquery');
import {Talisman} from './talisman.es6';

export class ShaneScene {
  constructor(renderer, camera, scene, options) {
    this.renderer = renderer;
    this.camera = camera;
    this.scene = scene;
    this.options = options;

    this.talisman = this.createTalisman();
    this.talisman.addTo(scene);

    this.camera.position.set(0, 0, 0);

    this.domContainer = $('body');

    $('body').click(() => {this.click();});

    this.isLive = true;
  }

  update() {
    if (this.talisman) {
      this.talisman.update();
    }
  }

  enter() {
    this.active = true;
  }

  exit() {
    this.active = false;

    let children = this.children();
    for (var i = 0; i < children.length; i++) {
      let child = children[i];
      this.scene.remove(child);
    }
  }

  click() {

  }

  /// Protected overrides

  createTalisman() {
    return new Talisman();
  }

  children() {
    return [];
  }

  /// Utility

  makeVideo(basedFilename, fullscreen) {
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
    }

    return video;
  }
}
