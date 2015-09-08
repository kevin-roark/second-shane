
let THREE = require('three');
let $ = require('jquery');
let ShaneMesh = require('./shane-mesh');
let kt = require('kutility');
import {Dahmer} from './dahmer.es6';

let domContainer = $('body');
let dahmer = new Dahmer({$domContainer: domContainer});

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
    this.rotationSpeed = options.rotationSpeed || 0.025;
    this.bevelEnabled = options.bevelEnabled || false;
  }

  meshWasLoaded() {
    super.meshWasLoaded();

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

function makeStyledGeometry(geometryStyle, geometrySize) {
  let cylinderRadialMultipler = 0.33;
  switch (geometryStyle) {
    case 'sphere':
      return new THREE.SphereGeometry(geometrySize, 12, 12);

    case 'cylinder':
      return new THREE.CylinderGeometry(geometrySize * cylinderRadialMultipler, geometrySize * cylinderRadialMultipler, geometrySize);

    case 'cone':
      return new THREE.CylinderGeometry(geometrySize * cylinderRadialMultipler * 0.25, geometrySize * cylinderRadialMultipler, geometrySize);

    //case 'cube':
    default:
      return new THREE.BoxGeometry(geometrySize, geometrySize, geometrySize);
  }
}

class DomOneOff extends MeshedOneOff {
  constructor(options) {

    if (!options.meshCreator) {
      let geometryStyle = options.geometryStyle || kt.choice(['cube', 'sphere', 'cone', 'cylinder']);
      let geometrySize = options.geometrySize || 3;
      let materialColor = options.color || parseInt(Math.random() * 16777215);

      options.meshCreator = (callback) => {
        var geometry = makeStyledGeometry(geometryStyle, geometrySize);

        var material = new THREE.MeshBasicMaterial({
          color: materialColor
        });

        callback(geometry, material, new THREE.Mesh(geometry, material));
      };
    }

    super(options);

    this.$element = options.$element;
    this.position = options.position;
    this.activationDistance = options.activationDistance || 20;

    this.isVisible = false;
  }

  deactivate() {
    super.deactivate();
    this.hide();
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

    if (visible) {
      this.show();
    }
    else {
      this.hide();
    }
  }

  show() {
    this.isVisible = true;
    this.$element.css('display', 'none');
    domContainer.append(this.$element);
    this.$element.fadeIn();
  }

  hide() {
    this.isVisible = false;
    this.$element.fadeOut();
  }
}

class VideoOneOff extends DomOneOff {
  constructor(options) {
    super(options);

    this.videoName = options.videoName;
  }

  show() {
    var video = dahmer.makeVideo(this.videoName);

    this.$element = $(video);
    this.$element.addClass('one-off-video');

    super.show();

    video.play();
  }

  hide() {
    super.hide();

    this.$element.get(0).src = '';
    this.$element.remove();
    this.$element = null;
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
  new RotatingMan({
    name: 'chris',
    text: "A Hopelessly Romantic Man Of Integrity",
    textColor: 0xff0017,
    position: {x: 0, y: 0, z: -50}
  }),
  new RotatingMan({
    name: 'dog as god I',
    text: 'I have known dogs that gave their lives for their masters',
    textColor: 0x372708,
    position: {x: 25, y: 0, z: -50}
  }),
  new RotatingMan({
    name: 'dog as god II',
    text: 'And if you give your heart to a dog he will not break it',
    textColor: 0x372708,
    position: {x: -25, y: 0, z: -50}
  }),
  new RotatingMan({
    name: 'dog as god III',
    text: 'If you seek loyalty unto death, look no further than a dog',
    textColor: 0x372708,
    position: {x: 50, y: 0, z: -50}
  }),
  new RotatingMan({
    name: 'dog as god IV',
    text: "I don’t think that Dog is God spelled backwards",
    textColor: 0x372708,
    position: {x: -50, y: 0, z: -50}
  }),

  new DomOneOff({
    name: 'dog life poem',
    $element: $('<div class="one-off-text">' + dogPoemOneOffText + '</div>'),
    position: new THREE.Vector3(-10, -5, -10)
  }),
  new DomOneOff({
    name: 'life hack',
    $element: $('<div class="one-off-text">Life Hack I.<br>If you want to die gamble everything until:<br>1. You have enough money to live as a king<br>2. You have nothing</div>'),
    position: new THREE.Vector3(-30, -5, -25)
  }),

  new VideoOneOff({
    name: 'big sur forest',
    videoName: 'media/videos/bigsur',
    position: new THREE.Vector3(50, -5, 0)
  })
];
