
let THREE = require('three');
let kt = require('kutility');
var loader = require('./util/model-loader');

module.exports = ShaneMesh;

var _meshCloningCache = {};

function ShaneMesh(options) {
  var startPos = options.position || new THREE.Vector3();
  this.startX = startPos.x;
  this.startY = startPos.y;
  this.startZ = startPos.z;

  this.postLoadRotation = options.postLoadRotation;

  this.scale = options.scale || 1;

  this.modelName = options.modelName;
  this.modelChoices = [];

  this.meshCreator = options.meshCreator;

  this.velocity = options.velocity;
  this.rotationalVelocity = options.rotationalVelocity;
  this.acceleration = options.acceleration;
  this.melting = false;
  this.twitching = false;
}

ShaneMesh.prototype.move = function(x, y, z) {
  if (!this.mesh) return;

  this.mesh.position.x += x;
  this.mesh.position.y += y;
  this.mesh.position.z += z;

  this.mesh.__dirtyPosition = true;
};

ShaneMesh.prototype.rotate = function(rx, ry, rz) {
  if (!this.mesh) return;

  this.mesh.rotation.x += rx;
  this.mesh.rotation.y += ry;
  this.mesh.rotation.z += rz;

  this.mesh.__dirtyRotation = true;
};

ShaneMesh.prototype.moveTo = function(x, y, z) {
  if (!this.mesh) return;

  this.mesh.position.set(x, y, z);

  this.move(0, 0, 0);
};

ShaneMesh.prototype.scaleBody = function(s) {
  if (!this.mesh) return;

  this.mesh.scale.set(s, s, s);
};

ShaneMesh.prototype.scaleMultiply = function(s) {
  if (!this.mesh) return;

  this.mesh.scale.set(this.initialScale.x * s, this.initialScale.y * s, this.initialScale.z * s);
};

ShaneMesh.prototype.createMesh = function(callback) {
  var self = this;

  if (self.meshCreator) {
    self.meshCreator(function(geometry, material, mesh) {
      self.mesh = mesh;
      if (callback) {
        callback();
      }
    });
  }
  else {
    if (!self.modelName) {
      if (self.modelChoices) {
        self.modelName = kt.choice(self.modelChoices);
      }
      else {
        self.modelName = '';
      }
    }

    // var cloneableMesh = _meshCloningCache[self.modelName];
    // if (cloneableMesh) {
    //   self.mesh = cloneableMesh.clone();
    //   if (callback) {
    //     callback();
    //   }
    //   return;
    // }

    loader(self.modelName, function(geometry, materials) {
      var faceMaterial = new THREE.MeshFaceMaterial(materials);
      self.mesh = new THREE.Mesh(geometry, faceMaterial);

      //_meshCloningCache[self.modelName] = self.mesh;

      if (callback) {
        callback();
      }
    });
  }
};

ShaneMesh.prototype.addTo = function(scene, callback) {
  var self = this;

  var addMesh = function() {
    scene.add(self.mesh);

    if (callback) {
      callback(self);
    }
  };

  if (!self.mesh) {
    self.createMesh(function() {
      self.scaleBody(self.scale);

      self.moveTo(self.startX, self.startY, self.startZ);

      if (self.postLoadRotation) {
        self.rotate(self.postLoadRotation.x, self.postLoadRotation.y, self.postLoadRotation.z);
      }

      self.additionalInit();

      self.initialPosition = {x: self.mesh.position.x, y: self.mesh.position.y, z: self.mesh.position.z};
      self.initialScale = {x: self.mesh.scale.x, y: self.mesh.scale.y, z: self.mesh.scale.z};
      self.initialRotation = {x: self.mesh.rotation.x, y: self.mesh.rotation.y, z: self.mesh.rotation.z};

      addMesh();
    });
  }
  else {
    addMesh();
  }
};

ShaneMesh.prototype.removeFrom = function(scene) {
  if (this.mesh) {
    scene.remove(this.mesh);
  }
};

ShaneMesh.prototype.setMeshColor = function(hex) {
  if (!this.mesh) {
    return;
  }

  var materials = this.mesh.material.materials || [this.mesh.material];
  for (var i = 0; i < materials.length; i++) {
    var mat = materials[i];
    mat.color = new THREE.Color(hex);
    mat.ambient = new THREE.Color(hex);
    mat.emissive = new THREE.Color(hex);
    mat.needsUpdate = true;
  }
};

ShaneMesh.prototype.update = function() {
  if (this.twitching) {
    this.twitch(this.twitchIntensity || 1);
  }

  if (this.fluctuating) {
    this.fluctuate(1);
  }

  if (this.velocity) {
    this.move(this.velocity.x, this.velocity.y, this.velocity.z);
  }
  if (this.rotationalVelocity) {
    this.rotate(this.rotationalVelocity.x, this.rotationalVelocity.y, this.rotationalVelocity.z);
  }
  if (this.acceleration) {
    this.velocity.x += this.acceleration.x;
    this.velocity.y += this.acceleration.y;
    this.velocity.z += this.acceleration.z;
  }

  this.additionalRender();
};

ShaneMesh.prototype.stopAllMovement = function() {
  this.velocity = null;
  this.acceleration = null;
};

ShaneMesh.prototype.stopAllRotation = function() {
  this.rotationalVelocity = null;
};

ShaneMesh.prototype.twitch = function(scalar) {
  var x = (Math.random() - 0.5) * scalar;
  var y = (Math.random() - 0.5) * scalar;
  var z = (Math.random() - 0.5) * scalar;
  this.move(x, y, z);
};

ShaneMesh.prototype.fluctuate = function(scalar) {
  var x = (Math.random() - 0.5) * scalar;
  var y = (Math.random() - 0.5) * scalar;
  var z = (Math.random() - 0.5) * scalar;
  this.rotate(x, y, z);
};

ShaneMesh.prototype.fallToFloor = function(threshold, speed) {
  if (!threshold) threshold = 1.5;
  if (!speed) speed = 0.5;

  var self = this;

  var fallInterval = setInterval(function() {
    var dy = Math.random() * -speed;

    self.move(0, dy, 0);

    if (self.mesh && self.mesh.position.y < threshold) {
      clearInterval(fallInterval);
    }
  }, 24);
};

ShaneMesh.prototype.additionalInit = function() {};
ShaneMesh.prototype.additionalRender = function() {};
