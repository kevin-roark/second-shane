
$(function() {
  var isLive = true;
  var totalLength = 60000 * 3;

  if (isLive) {
    $(document).keypress(function(ev) {
      if (ev.which === 115) { // s
        go();
      }
    });
  } else {
    go();
  }

  function makeVideo(name) {
    var video = document.createElement('video');

    var base = isLive ? 'http://localhost:5555/video/' : 'http://kevin-roark.github.io/second-shane-asmr/video/';
    var videoURL;
    if (video.canPlayType('video/mp4').length > 0) {
      videoURL = base + name + '.mp4';
    } else {
      videoURL = base + name + '.webm';
    }

    video.src = videoURL;
    video.preload = true;
    video.loop = true;

    return video;
  }

  function shuffle(arr) {
    arr.sort(function(item1, item2) {
      return 0.5 - Math.random();
    });
  }

  // fuck matt: http://coding.vdhdesign.co.nz/?p=29

  function rectangle(x, y, w, h) {
    return {x: x, y: y, width: w, height: h};
  }

  var videoRectangles = [
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
  shuffle(videoRectangles);

  var videoData = [
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

  function go() {
    var videos = [];
    for (var i = 0; i < videoData.length; i++) {
      var data = videoData[i];
      var video = makeVideo(data.name);
      videos.push(video);
      addVideo(video, data.onset, videoRectangles[i]);
    }

    setTimeout(function() {
      for (var j = 0; j < videos.length; j++) {
        var video = videos[j];
        video.removeAttribute("src"); // thanks mdn really smart
      }
      document.body.innerHTML = '';
    }, totalLength);
  }

  function addVideo(video, delay, rect) {
    setTimeout(function() {
      video.style.left = (rect.x * 100) + '%';
      video.style.top = (rect.y * 100) + '%';
      video.style.width = (rect.width * 100) + '%';
      video.style.height = (rect.height * 100) + '%';
      console.log(video);

      document.body.appendChild(video);
      video.play();
    }, delay);
  }
});
