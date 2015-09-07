
var $ = require('jquery');

export class Dahmer {
  constructor(options) {
    this.domContainer = options.$domContainer || $('body');
  }

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
