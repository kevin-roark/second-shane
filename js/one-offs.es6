
let THREE = require('three');
let ShaneMesh = require('./shane-mesh');

class OneOff {
  constructor(options) {
    this.name = options.name || (Math.random() * 10000) + '';
    this.active = false;
  }

  activate(scene) {
    this.active = true;
  }

  deactivate(scene) {
    this.active = false;
  }

  update() {

  }
}

class MeshedOneOff extends OneOff {
  constructor(options) {
    super(options);

    this.shaneMesh = this.createShaneMesh(options);
  }

  activate(scene) {
    super.activate(scene);

    this.shaneMesh.addTo(scene);
  }

  deactivate(scene) {
    super.deactivate(scene);

    this.shaneMesh.removeFrom(scene);
  }

  update() {
    super.update();

    if (this.active) {
      this.shaneMesh.update();
    }
  }

  createShaneMesh(options) {
    return new ShaneMesh(options);
  }
}

class Cube extends MeshedOneOff {
  constructor(options) {
    this.size = options.size || 1;
    this.color = options.color || 0x000000;

    options.meshCreator = (callback) => {
      var geometry = new THREE.BoxGeometry(this.size, this.size, this.size);
      var material = new THREE.MeshBasicMaterial({color: this.color});
      var mesh = new THREE.Mesh(geometry, material);
      callback(geometry, material, mesh);
    };

    super(options);
  }
}

class SexMan extends MeshedOneOff {
  constructor(options) {
    options.name = 'it is just sex man';
    options.modelName = '/js/models/male.js';

    super(options);
  }

  update() {
    super.update();

    if (this.active) {
      this.shaneMesh.rotate(0, 0.033, 0);
    }
  }
}

export var oneOffs = [
  new Cube({
    position: {x: -20, y: 0, z: -25},
    color: 0xff0000
  }),
  new SexMan({
    position: {x: 0, y: 0, z: -25}
  }),
  new Cube({
    position: {x: 20, y: 0, z: -25},
    color: 0x0000ff
  })
];
