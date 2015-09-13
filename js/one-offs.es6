
let THREE = require('three');
let $ = require('jquery');
let ShaneMesh = require('./shane-mesh');
let kt = require('kutility');
import {Dahmer} from './dahmer.es6';

let domContainer = $('body');
let dahmer = new Dahmer({$domContainer: domContainer});

var didFindBeaconCallback;

class OneOff {
  constructor(options) {
    this.name = options.name || (Math.random() * 10000) + '';
    this.symbolName = options.symbolName;
    this.symbolLength = options.symbolLength;
    this.position = options.position;

    this.active = false;
  }

  activate(scene) {
    this.active = true;
  }

  deactivate(scene) {
    this.active = false;
  }

  update() {}

  relayCameraPosition(cameraPosition) {}
}

/** 3D MESH ONE OFFS */

class MeshedOneOff extends OneOff {
  constructor(options) {
    super(options);

    this.shaneMesh = new ShaneMesh(options);
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
}

class RotatingMan extends MeshedOneOff {
  constructor(options) {
    options.modelName = '/js/models/male.js';

    if (!options.symbolName) {
      options.symbolName = '/media/symbols/mannequin.png';
    }
    if (!options.symbolLength) {
      options.symbolLength = 18;
    }

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

/** BEACON OFFS */

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

class BeaconOneOff extends MeshedOneOff {
  constructor(options) {
    if (!options.meshCreator && !options.modelName) {
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
    this.isNear = false;
    this.nearDistance = options.nearDistance || 20;
  }

  deactivate(scene) {
    super.deactivate(scene);

    this.updateForFar();
  }

  relayCameraPosition(cameraPosition) {
    super.relayCameraPosition(cameraPosition);

    var distanceSquared = this.position.distanceToSquared(cameraPosition);
    this.setNear(distanceSquared < this.nearDistance * this.nearDistance);
  }

  setNear(near) {
    if (near === this.isNear) {
      return;
    }

    if (near) {
      this.updateForNear();
    }
    else {
      this.updateForFar();
    }
  }

  updateForNear() {
    this.isNear = true;

    if (this.$element) {
      this.$element.css('display', 'none');
      domContainer.append(this.$element);
      this.$element.fadeIn();
    }

    if (didFindBeaconCallback) {
      didFindBeaconCallback(this);
    }

    // TODO: flash name across screen
  }

  updateForFar() {
    this.isNear = false;
    if (this.$element) {
      this.$element.fadeOut();
    }
  }
}

class PoeticBeacon extends BeaconOneOff {
  constructor(options) {
    var text = options.text;
    options.$element = $('<div class="one-off-text">' + text + '</div>');

    if (!options.symbolName) {
      options.symbolName = '/media/symbols/pencil.png';
    }
    if (!options.symbolLength) {
      options.symbolLength = 24;
    }

    super(options);
  }
}

class ImageBeacon extends BeaconOneOff {
  constructor(options) {
    options.meshCreator = function(callback) {
      var longEdgeSize = 9;
      var geometry = options.portait ? new THREE.PlaneGeometry(longEdgeSize * 0.75, longEdgeSize) : new THREE.PlaneGeometry(longEdgeSize, longEdgeSize * 0.75);
      var texture = THREE.ImageUtils.loadTexture(options.imageName);
      texture.minFilter = THREE.NearestFilter;
      var material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        map: texture,
        side: THREE.DoubleSide
      });
      var mesh = new THREE.Mesh(geometry, material);
      callback(geometry, material, mesh);
    };

    if (!options.symbolName) {
      options.symbolName = '/media/symbols/lens.png';
    }
    if (!options.symbolLength) {
      options.symbolLength = 12;
    }
    if (!options.nearDistance) {
      options.nearDistance = 10;
    }

    super(options);
  }
}

class VideoBeacon extends BeaconOneOff {
  constructor(options) {
    options.modelName = '/js/models/tv.json';
    options.scale = 12;
    options.postLoadRotation = {x: 0, y: Math.random() * Math.PI * 2, z: 0};

    if (!options.symbolName) {
      options.symbolName = '/media/symbols/camcorder.png';
    }
    if (!options.symbolLength) {
      options.symbolLength = 24;
    }

    super(options);

    this.videoName = options.videoName;
    this.previewImageName = options.videoName + '.jpg';
  }

  meshWasLoaded() {
    super.meshWasLoaded();

    var geometry = new THREE.PlaneGeometry(0.75, 0.75 * 0.5); // tuned to line up with tv
    var texture = THREE.ImageUtils.loadTexture(this.previewImageName);
    texture.minFilter = THREE.NearestFilter;
    var material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      map: texture,
      side: THREE.DoubleSide
    });
    var previewImageMesh = new THREE.Mesh(geometry, material);
    var mirrorPreviewMesh = previewImageMesh.clone();
    previewImageMesh.position.set(0, 0.29, 0.015); // tuned to line up with tv
    mirrorPreviewMesh.position.set(0, 0.29, -0.015);

    this.shaneMesh.mesh.add(previewImageMesh);
    this.shaneMesh.mesh.add(mirrorPreviewMesh);
  }

  updateForNear() {
    var video = dahmer.makeVideo(this.videoName);
    this.$element = $(video);
    this.$element.addClass('one-off-video');

    super.updateForNear();

    video.play();
  }

  updateForFar() {
    super.updateForFar();

    if (this.$element && this.$element.get(0)) {
      this.$element.get(0).src = '';
      this.$element.remove();
      this.$element = null;
    }
  }
}

/** EXPORTS */

export var setDidFindBeaconCallback = function(callback) {
  didFindBeaconCallback = callback;
};

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
  // rotating men
  new RotatingMan({
    name: 'it is just sex man',
    text: "It's just... sex...",
    textColor: 0xff008a,
    position: new THREE.Vector3(-30, 0, -60)
  }),
  new RotatingMan({
    name: 'dog man',
    text: "I want my dog's life",
    textColor: 0x035d32,
    position: new THREE.Vector3(0, 0, -25)
  }),
  new RotatingMan({
    name: 'old man',
    text: "My old man's... that old man",
    textColor: 0x666666,
    position: new THREE.Vector3(-300, 0, 100)
  }),
  new RotatingMan({
    name: 'man man',
    text: "I don't want to be a man anymore",
    textColor: 0x0d035d,
    position: new THREE.Vector3(45, 0, 400)
  }),
  new RotatingMan({
    name: 'break a man',
    text: "His Job, His Wife, His House, His Dog",
    textColor: 0xccad4f,
    position: new THREE.Vector3(15, 0, -100)
  }),
  new RotatingMan({
    name: 'chris',
    text: "A Hopelessly Romantic Man Of Integrity",
    textColor: 0xff0017,
    position: new THREE.Vector3(70, 0, -175)
  }),
  new RotatingMan({
    name: 'something to cherish',
    text: 'Art used to be something to Cherish',
    textColor: 0x7a3caa,
    position: new THREE.Vector3(40, 0, 200)
  }),
  new RotatingMan({
    name: 'fragile',
    text: 'Fragile Masculinity',
    textColor: 0x0d15f0,
    position: new THREE.Vector3(-30, 0, 24)
  }),
  new RotatingMan({
    name: 'stationary monitors',
    text: 'Monitors stay where positioned',
    textColor: 0x44cca7,
    position: new THREE.Vector3(150, 0, 150)
  }),
  new RotatingMan({
    name: 'facial monitors',
    text: 'Monitors can be placed close to the face',
    textColor: 0x6ccc44,
    position: new THREE.Vector3(175, 0, 175)
  }),

  // dog as god
  new RotatingMan({
    name: 'dog as god I',
    text: 'I have known dogs that gave their lives for their masters',
    textColor: 0x372708,
    position: new THREE.Vector3(250, 0, -125)
  }),
  new RotatingMan({
    name: 'dog as god II',
    text: 'And if you give your heart to a dog he will not break it',
    textColor: 0x372708,
    position: new THREE.Vector3(250, 0, -185)
  }),
  new RotatingMan({
    name: 'dog as god III',
    text: 'If you seek loyalty unto death, look no further than a dog',
    textColor: 0x372708,
    position: new THREE.Vector3(250, 0, -65)
  }),
  new RotatingMan({
    name: 'dog as god IV',
    text: "I don’t think that Dog is God spelled backwards",
    textColor: 0x372708,
    position: new THREE.Vector3(290, 0, -125)
  }),

  // the flat
  new RotatingMan({
    name: 'The Flat I',
    text: "I fear The Flat",
    textColor: 0xb46262,
    position: new THREE.Vector3(100, 0, 0)
  }),
  new RotatingMan({
    name: 'The Flat II',
    text: "Flat residents will take My Computer",
    textColor: 0xb46262,
    position: new THREE.Vector3(100, 0, 20)
  }),
  new RotatingMan({
    name: 'The Flat III',
    text: "Stay away from the Hills",
    textColor: 0xb46262,
    position: new THREE.Vector3(100, 0, -20)
  }),

  // material
  new RotatingMan({
    name: 'Material Metaphor',
    text: 'Material is the metaphor',
    textColor: 0x3f27bd,
    position: new THREE.Vector3(-100, 0, -300)
  }),
  new RotatingMan({
    name: 'Meaningful Motion',
    text: 'Motion provides meaning',
    textColor: 0x3f27bd,
    position: new THREE.Vector3(-75, 0, -325)
  }),
  new PoeticBeacon({
    name: 'What is the material metaphor?',
    text: 'A material metaphor is the unifying theory of a rationalized space and a system of motion. The material is grounded in tactile reality, inspired by the study of paper and ink, yet technologically advanced and open to imagination and magic.',
    position: new THREE.Vector3(-50, -5, -310)
  }),
  new PoeticBeacon({
    name: 'Surfaces and Edges',
    text: 'Surfaces and edges of the material provide visual cues that are grounded in reality. The use of familiar tactile attributes helps users quickly understand affordances. Yet the flexibility of the material creates new affordances that supercede those in the physical world, without breaking the rules of physics.',
    position: new THREE.Vector3(-25, -5, -300)
  }),
  new RotatingMan({
    name: '1 Environment',
    text: 'All action takes place in a single environment',
    textColor: 0x3f27bd,
    position: new THREE.Vector3(0, 0, -310)
  }),
  new PoeticBeacon({
    name: 'Fundamentals of light and surface',
    text: 'The fundamentals of light, surface, and movement are key to conveying how objects move, interact, and exist in space and in relation to each other. Realistic lighting shows seams, divides space, and indicates moving parts.',
    position: new THREE.Vector3(25, -5, -325)
  }),
  new RotatingMan({
    name: 'meaningful and appropriate',
    text: 'Motion is meaningful and appropriate',
    textColor: 0x3f27bd,
    position: new THREE.Vector3(50, 0, -345)
  }),
  new RotatingMan({
    name: 'subtle yet clear',
    text: 'Feedback is subtle yet clear',
    textColor: 0x3f27bd,
    position: new THREE.Vector3(75, 0, -360)
  }),
  new RotatingMan({
    name: 'efficient yet coherent',
    text: 'Transitions are efﬁcient yet coherent',
    textColor: 0x3f27bd,
    position: new THREE.Vector3(100, 0, -345)
  }),
  new PoeticBeacon({
    name: 'Material has properties',
    text: 'Material has certain immutable characteristics and inherent behaviors. Understanding these qualities will help you manipulate material in a way that’s consistent.<br>Material casts shadows. Shadows result naturally from the relative elevation (z-position) between material elements.<br>Content is displayed on material, in any shape and color. Content does not add thickness to material.<br>Content can behave independently of the material, but is limited within the bounds of the material.',
    position: new THREE.Vector3(75, -5, -380)
  }),
  new RotatingMan({
    name: 'solid material',
    text: 'Material Is Solid',
    textColor: 0x3f27bd,
    position: new THREE.Vector3(125, 0, -360)
  }),
  new PoeticBeacon({
    name: 'Material never bends',
    text: 'Material never bends or folds.<br>Sheets of material can join together to become a single sheet of material.<br>When split, material can heal. For example, if you remove a portion of material from a sheet of material, the sheet of material will become a whole sheet again.<br>Material can be spontaneously generated or destroyed anywhere in the environment.',
    position: new THREE.Vector3(-125, -5, -310)
  }),

  // isolated poems
  new PoeticBeacon({
    name: "My Dog's Life",
    text: dogPoemOneOffText,
    position: new THREE.Vector3(-200, -5, -20)
  }),

  // life hacks
  new PoeticBeacon({
    name: 'Life Hack I',
    text: 'Life Hack I.<br>If you want to die gamble everything until:<br>1. You have enough money to live as a king<br>2. You have nothing',
    position: new THREE.Vector3(-140, -5, 150)
  }),
  new PoeticBeacon({
    name: 'Life Hack II',
    text: 'Life Hack II.<br>If you want to die<br>Never pay taxes and you\'ll have more money<br>to thrive<br>and when They finally come for you<br>just do what you wanted',
    position: new THREE.Vector3(60, -5, 250)
  }),
  new PoeticBeacon({
    name: 'Life Hack III',
    text: 'Life Hack III.<br>If you want to die<br>just Find a way<br>to accumulate power<br>and soon you are ready to<br>live again',
    position: new THREE.Vector3(200, -5, 100)
  }),

  // images
  new ImageBeacon({
    name: 'Garden Obelisk',
    imageName: 'media/beacon-images/obelisk.jpg',
    position: new THREE.Vector3(20, 3, -30)
  }),
  new ImageBeacon({
    name: 'Snips Got My Minion',
    imageName: 'media/beacon-images/snips_minion.jpg',
    portait: true,
    position: new THREE.Vector3(15, 3, -50)
  }),

  // vids
  new VideoBeacon({
    name: 'I Watched the Woods',
    videoName: 'media/videos/bigsur',
    position: new THREE.Vector3(80, -2, -40)
  }),
  new VideoBeacon({
    name: 'I Watched the Car',
    videoName: 'media/videos/brakes',
    position: new THREE.Vector3(-60, -2, 90)
  })
];
