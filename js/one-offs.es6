
let THREE = require('three');

class OneOff {
  constructor(options) {
    this.name = options.name || (Math.random() * 10000) + '';
  }

  activate(scene) {
    // just do it
  }

  deactivate(scene) {
    // ok
  }

  update() {
    // override for frame-ly updates
  }
}

class MeshedOneOff extends OneOff {
  constructor(options) {
    super(options);

    this.initPosition = options.position || {x: 0, y: 0, z: 0};

    this.mesh = this.createMesh();
    this.mesh.position.copy(this.initPosition);
  }

  activate(scene) {
    scene.add(this.mesh);
  }

  deactivate(scene) {
    scene.remove(this.mesh);
  }

  createMesh() {
    return new THREE.Mesh();
  }
}

class Cube extends MeshedOneOff {
  constructor(options) {
    this.size = options.size || 5;
    this.color = options.color || 0x000000;

    super(options);
  }

  createMesh() {
    var geometry = new THREE.BoxGeometry(this.size, this.size, this.size);
    var material = new THREE.MeshBasicMaterial({color: this.color});
    return new THREE.Mesh(geometry, material);
  }
}

export var oneOffs = [
  new Cube({
    position: {x: -20, y: 0, z: -25},
    color: 0xff0000
  }),
  new Cube({
    position: {x: 0, y: 0, z: -25},
    color: 0x00ff00
  }),
  new Cube({
    position: {x: 20, y: 0, z: -25},
    color: 0x0000ff
  })
];
