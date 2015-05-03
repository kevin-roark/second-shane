
var THREE = require('three');

module.exports = VideoMesh;

function VideoMesh(options) {
  this.video = options.video;
  this.renderedVideoWidth = options.renderedVideoWidth || 150;
  this.renderedVideoHeight = options.renderedVideoHeight || 75;

  var sourceVideoWidth = options.sourceVideoWidth || 320;
  var sourceVideoHeight = options.sourceVideoHeight || 180;

  this.videoImage = document.createElement('canvas');
  this.videoImage.width = sourceVideoWidth.width;
  this.videoImage.height = sourceVideoHeight.height;

  this.videoImageContext = this.videoImage.getContext('2d');
	this.videoImageContext.fillStyle = '#000000'; // background color if no video present
	this.videoImageContext.fillRect(0, 0, this.renderedVideoWidth, this.renderedVideoHeight);

  this.videoTexture = new THREE.Texture(this.videoImage);
  this.videoTexture.minFilter = THREE.LinearFilter;
  this.videoTexture.magFilter = THREE.LinearFilter;
  this.videoTexture.format = THREE.RGBFormat;
  this.videoTexture.generateMipmaps = false;

  this.videoMaterial = new THREE.MeshBasicMaterial({
    map: this.videoTexture,
    overdraw: true,
    side: THREE.DoubleSide
  });

  this.videoGeometry = new THREE.BoxGeometry(this.renderedVideoWidth, this.renderedVideoHeight, 20);
  this.mesh = new THREE.Mesh(this.videoGeometry, this.videoMaterial);
}

VideoMesh.prototype.addTo = function(scene) {
  scene.add(this.mesh);
};

VideoMesh.prototype.render = function() {
  if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
    this.videoImageContext.drawImage(this.video, 0, 0);

    if (this.videoTexture) this.videoTexture.needsUpdate = true;
  }
};

VideoMesh.prototype.moveTo = function(x, y, z) {
  this.mesh.position.set(x, y + this.renderedVideoHeight / 2, z);
};

VideoMesh.prototype.rotateTo = function(rx, ry, rz) {
  this.mesh.rotation.set(rx, ry, rz);
};
