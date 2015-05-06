
let $ = require('jquery');

let desiredMarkerBottom = 80;
let defaultMarkerLeft = window.innerWidth / 2.5;

export class Basketball {
  constructor(imageName) {
    this.div = markerDiv(imageName);
    this.img = $(this.div.children()[0]);
  }

  addTo($domContainer) {
    $domContainer.append(this.div);
  }

  setWidth(width) {
    this.img.css('width', width + 'px');
    this.div.css('border-radius', (width / 2) + 'px');
  }

  bounce(options, callback) {
    var marker = this.div;

    var currentX = marker.offset().left;

    var x = options.x || currentX;
    var y = options.y;
    var time = options.time || 500;

    if (y !== undefined) {
      var halfWayX = currentX + (x - currentX) / 2;
      marker.animate({left: halfWayX, bottom: desiredMarkerBottom + y}, time / 2, function() {
        marker.animate({left: x, bottom: desiredMarkerBottom}, time / 2, function() {
          if (callback) callback();
        });
      });
    }
    else {
      marker.animate({left: x, bottom: desiredMarkerBottom}, time, function() {
        if (callback) callback();
      });
    }
  }
}


function markerDiv(imageName) {
  var img = $('<img src="' + imageName + '"></img>');
  img.css('width', '50px');

  var marker = $('<div></div>');
  marker.append(img);

  marker.css('position', 'absolute');
  marker.css('bottom', desiredMarkerBottom + 'px');
  marker.css('left', defaultMarkerLeft + 'px');
  marker.css('box-shadow', '0px 0px 30px 8px rgba(255, 255, 255, 0.95)');
  marker.css('z-index', '1000000');
  marker.css('border-radius', '25px');

  return marker;
}
