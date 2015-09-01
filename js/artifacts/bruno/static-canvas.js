

module.exports.fuzz = function(canvas) {
  var ctx = canvas.getContext('2d');

  var image = ctx.createImageData(canvas.width, canvas.height);

  for (var x = 0; x < canvas.width; x++) {
    for (var y = 0; y < canvas.height; y++) {
      var value = Math.random() * 256;

      var cell = (x + y * canvas.width) * 4;

      // r, g, b
      image.data[cell] = image.data[cell + 1] = image.data[cell + 2] = value;

      // alpha
      image.data[cell + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);
};
