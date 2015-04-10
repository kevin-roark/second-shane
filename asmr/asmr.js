
var isLive = true;

function makeVideo(name) {
  var video = document.createElement('video');

  var base = isLive ? 'http://localhost:6666/video/' : 'http://kevin-roark.github.io/second-shane-asmr/video/';
  var videoURL;
  if (video.canPlayType('video/mp4').length > 0) {
    videoURL = base + name + '.mp4';
  } else {
    videoURL = base + name + '.webm';
  }

  video.src = videoURL;
}
