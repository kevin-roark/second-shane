
var THREE = require('three');

var girlRoomPath = '/images/girl_room.jpg';

function cubify(url) {
  return [url, url, url, url, url, url];
}

function makeCubemap(textureURL, repeatX, repeatY) {
  if (!textureURL) return;
  if (!repeatX) repeatX = 4;
  if (!repeatY) repeatY = 4;

  var textureCube = cubify(textureURL);

  var cubemap = THREE.ImageUtils.loadTextureCube(textureCube); // load textures
  cubemap.format = THREE.RGBFormat;
  cubemap.wrapS = THREE.RepeatWrapping;
  cubemap.wrapT = THREE.RepeatWrapping;
  cubemap.repeat.set(repeatX, repeatY);

  return cubemap;
}

function makeShader(cubemap) {
  var shader = THREE.ShaderLib.cube; // init cube shader from built-in lib
  shader.uniforms.tCube.value = cubemap; // apply textures to shader
  return shader;
}

function skyboxMaterial(textureURL) {
  var cubemap = makeCubemap(textureURL);
  var shader = makeShader(cubemap);

  var material = new THREE.ShaderMaterial({
    fragmentShader: shader.fragmentShader,
    vertexShader: shader.vertexShader,
    uniforms: shader.uniforms,
    depthWrite: false,
    side: THREE.BackSide,
    opacity: 0.5
  });
  material.__shaneCubeMap = cubemap;
  return material;
}

module.exports.create = function(options) {
  var size = options.size || {x: 300, y: 300, z: 300};
  var textureURL = options.textureURL || girlRoomPath;

  var geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
  var material = skyboxMaterial(textureURL);
  var skybox = new THREE.Mesh(geometry, material);
  skybox.__shaneShaderReset = function() {
    makeShader(material.__shaneCubeMap);
  };
  return skybox;
};

module.exports.blocker = function(size) {
  if (!size) size = {x: 19500, y: 19500, z: 19500};

  var geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
  var material = new THREE.MeshBasicMaterial({
      color: 0x000000
    , side: THREE.DoubleSide
    , opacity: 1.0
    , transparent: true
  });
  return new THREE.Mesh(geometry, material);
};
