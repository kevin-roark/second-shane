
let THREE = require('three');
let $ = require('jquery');
let ShaneMesh = require('./shane-mesh');

let domContainer = $('body');

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

  relayCameraPosition(cameraPosition) {

  }
}

/** 3D MESH ONE OFFS */

class MeshedOneOff extends OneOff {
  constructor(options) {
    super(options);

    this.shaneMesh = this.createShaneMesh(options);
  }

  activate(scene) {
    super.activate(scene);

    this.shaneMesh.addTo(scene, () => {
      this.meshWasLoaded();
    });
  }

  meshWasLoaded() {

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

class RotatingMan extends MeshedOneOff {
  constructor(options) {
    options.modelName = '/js/models/male.js';

    super(options);

    this.text = options.text;
    this.textSize = options.textSize || 1.0;
    this.textColor = options.textColor || 0xffffff;
    this.rotationSpeed = options.rotationSpeed || 0.033;
    this.bevelEnabled = options.bevelEnabled || false;
  }

  meshWasLoaded() {
    var textMesh = this.makeTextMesh(this.text);
    textMesh.position.set(0, 4, 0);
    this.shaneMesh.mesh.add(textMesh);
  }

  makeTextMesh(text) {
    let geometry = new THREE.TextGeometry(text, {
      size: this.textSize,
      height: 0.5,
      font: 'helvetiker',

      bevelThickness: 0.35,
      bevelSize: 0.05,
      bevelSegments: 5,
      bevelEnabled: this.bevelEnabled
    });

    geometry.computeBoundingBox();
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();
    geometry.center();

    let material = new THREE.MeshBasicMaterial({
      color: this.textColor,
      side: THREE.DoubleSide
    });

    let mesh = new THREE.Mesh(geometry, material);
    return mesh;
  }

  update() {
    super.update();

    if (this.active) {
      this.shaneMesh.rotate(0, this.rotationSpeed, 0);
    }
  }
}

/** DOM ONE OFFS */

class DomOneOff extends OneOff {
  constructor(options) {
    super(options);

    this.$element = options.$element;
    this.position = options.position;
    this.activationDistance = options.activationDistance || 20;

    this.isVisible = false;
  }

  relayCameraPosition(cameraPosition) {
    super.relayCameraPosition(cameraPosition);

    var distanceSquared = this.position.distanceToSquared(cameraPosition);
    this.setVisible(distanceSquared < this.activationDistance * this.activationDistance);
  }

  setVisible(visible) {
    if (visible === this.isVisible) {
      return;
    }

    this.isVisible = visible;

    if (visible) {
      this.$element.css('display', 'none');
      domContainer.append(this.$element);
      this.$element.fadeIn();
    }
    else {
      this.$element.fadeOut();
    }
  }
}

/** ONE OFF CREATION */

let dogPoemOneOffText = [
  "He wants his dog's life.",
  "He's got a big house, a new car,",
  "a beautiful wife.",
  "He wants his dog's life.",
  "Dogs shit on the street.",
  "They stink when they're wet.",
  "Dogs eat from a bowl, or",
  "slurp scraps from the floor.",
  "He wants his dog's life.",
  "A leash around his neck,",
  "his wet tongue licking the air.",
  "To look up at his owner ",
  "with love and respect.",
  "He wants his dog's life.",
  "A dog looks in a mirror",
  "and sees not himself,",
  "but another dog.",
  "His dog's mind.",
  "His dog's body.",
  "His dog's cock.",
  "He wants his dog's life.",
  "",
  "In dog years I'd already be dead."
].join('<br>');

export var oneOffs = [
  new RotatingMan({
    name: 'it is just sex man',
    text: "It's just ... sex ...",
    textColor: 0xff008a,
    position: {x: 0, y: 0, z: -25}
  }),
  new RotatingMan({
    name: 'dog man',
    text: "I want my dog's life",
    textColor: 0x035d32,
    position: {x: 25, y: 0, z: -25}
  }),
  new RotatingMan({
    name: 'old man',
    text: "My old man's ... that old man",
    textColor: 0x666666,
    position: {x: -25, y: 0, z: -25}
  }),
  new RotatingMan({
    name: 'man man',
    text: "I don't want to be a man anymore",
    textColor: 0x0d035d,
    position: {x: 50, y: 0, z: -25}
  }),
  new RotatingMan({
    name: 'break a man',
    text: "His Job, His Wife, His House, His Dog",
    textColor: 0xccad4f,
    position: {x: -50, y: 0, z: -25}
  }),

  new DomOneOff({
    name: 'dog life poem',
    $element: $('<div class="one-off-text">' + dogPoemOneOffText + '</div>'),
    position: new THREE.Vector3(0, 0, -50)
  })
];
