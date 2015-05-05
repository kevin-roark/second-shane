
let $ = require('jquery');

let desiredMarkerBottom = 80;
let defaultMarkerLeft = window.innerWidth / 2.5;

export class Basketball {
  constructor(imageName) {
    this.div = markerDiv(imageName);
  }

  addTo($domContainer) {
    $domContainer.append(this.div);
  }

  bounce(x, time, skipY) {
    var marker = this.div;

    var bounceY = desiredMarkerBottom + 50;
    var currentX = marker.offset().left;
    var halfWayX = currentX + (x - currentX) / 2;

    if (!skipY) {
      marker.animate({left: halfWayX, bottom: bounceY}, time / 2, function() {
        marker.animate({left: x, bottom: desiredMarkerBottom}, time / 2);
      });
    }
    else {
      marker.animate({left: x, bottom: desiredMarkerBottom}, time);
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

function bounceMarker(marker, x, time, skipY) {
  var bounceY = desiredMarkerBottom + 50;
  var currentX = marker.offset().left;
  var halfWayX = currentX + (x - currentX) / 2;

  if (!skipY) {
    marker.animate({left: halfWayX, bottom: bounceY}, time / 2, function() {
      marker.animate({left: x, bottom: desiredMarkerBottom}, time / 2);
    });
  }
  else {
    marker.animate({left: x, bottom: desiredMarkerBottom}, time);
  }
}
