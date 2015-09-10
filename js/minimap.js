
var canvas = document.querySelector('#minimap-canvas');
var context = canvas.getContext('2d');

var _mapElements;

var sizeOfMinimap = 400;
var halfSizeOfMinimap = sizeOfMinimap / 2;
var paddedHalfSizeOfMinimap = halfSizeOfMinimap + 5;

var defaultImage = new Image();
defaultImage.src = '/media/symbols/dot.png';

/// Map elements should be an array of objects with THREE.Vector3 position and String symbol imagePaths
module.exports.init = function(mapElements) {
  _mapElements = mapElements;

  var imageMap = {};
  for (var i = 0; i < mapElements.length; i++) {
    var element = mapElements[i];
    if (element.symbol) {
      if (!imageMap[element.symbol]) {
        var image = new Image();
        image.src = element.symbol;
        imageMap[element.symbol] = image;
      }
      element.image = imageMap[element.symbol];
    }
  }
};

module.exports.update = function(centerPosition, rotation) {
  if (!_mapElements) {
    return; // wait for init
  }

  console.log(rotation);
  var sinValue = Math.sin(rotation);
  var cosValue = Math.cos(rotation);

  // clear the map
  context.clearRect(0, 0, canvas.width, canvas.height);

  // draw nearby symbols
  for (var i = 0; i < _mapElements.length; i++) {
    var element = _mapElements[i];

    var xd = element.position.x - centerPosition.x;
    var zd = element.position.z - centerPosition.z;

    if (Math.abs(xd) <= paddedHalfSizeOfMinimap && Math.abs(zd) <= paddedHalfSizeOfMinimap) {
      // only pay attention to elements that are close enough to the center
      var image = element.image || defaultImage;
      var length = element.length || 8;

      var pixelUnits = canvas.width / sizeOfMinimap;
      var halfLength = length/2;
      var scaledHalfMinimapSize = halfSizeOfMinimap * pixelUnits;

      // rotation gleaned from http://stackoverflow.com/questions/3162643/proper-trigonometry-for-rotating-a-point-around-the-origin
      var xLocation = xd * pixelUnits - halfLength;
      var yLocation = zd * pixelUnits - halfLength;
      var rotatedXLocation = xLocation * cosValue - yLocation * sinValue;
      var rotatedYLocation = xLocation * sinValue + yLocation * cosValue;

      context.drawImage(image, rotatedXLocation + scaledHalfMinimapSize, rotatedYLocation + scaledHalfMinimapSize, length, length);
    }
  }
};
