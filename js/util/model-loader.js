
let THREE = require('three');

var cache = {};

var loader = new THREE.JSONLoader();

module.exports = function loadModel(name, callback) {
  if (typeof callback !== 'function') return;

  // if (cache[name]) {
  //   fetch(name, callback);
  //   return;
  // }

  loader.load(name, function(geometry, materials) {
    callback(geometry, materials);
    // add(name, geometry, materials);
    // fetch(name, callback);
  });
};

function add(name, geometry, materials) {
  cache[name] = {
    geometry: geometry,
    materials: materials
  };
}

function fetch(name, callback) {
  var cached = cache[name];

  var geometry = cached.geometry.clone();
  var materials;
  if (Array.isArray(cached.materials)) {
    materials = [];
    for (var i = 0; i < cached.materials.length; i++) {
      materials.push(cached.materials[i].clone());
    }
  }
  else if (materials) {
    materials = cached.materials.clone();
  }
  else {
    materials = new THREE.MeshBasicMaterial();
  }

  callback(geometry, materials);
}
