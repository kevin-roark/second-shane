
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

    this.domContainer = $('body');

    $('body').click(this.click.bind(this));
    $(window).resize(this.resize.bind(this));

    this.isLive = true;
  }

  update() {
    if (this.talisman) {
      this.talisman.update();
    }
  }

  enter() {
    this.active = true;

    this.camera.position.set(0, 0, 0);
    this.camera.rotation.x = 0; this.camera.rotation.y = 0; this.camera.rotation.z = 0;
  }

  exit() {
    this.active = false;

    let children = this.children();
    for (var i = 0; i < children.length; i++) {
      let child = children[i];
      this.scene.remove(child);
    }
  }

  iWantOut() {
    if (this.exitCallback) {
      this.exitCallback();
    }
  }

  click() {

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
    } else {
      $(video).addClass('video-overlay');
    }

    this.domContainer.append(video);

    return video;
  }

  makeImage(basedFilename) {
    var img = $('<img src="' + basedFilename + '" class="image-overlay"/>');

    this.domContainer.append(img);

    return img;
  }

}
