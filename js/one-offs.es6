
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
      if (!this.hasLoadedBefore) {
        this.meshWasLoaded();
      }
      this.hasLoadedBefore = true;
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

    if (this.active && this.meshesNeedUpdate) {
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

class Billboard extends MeshedOneOff {
  constructor(options) {
    options.meshCreator = function(callback) {
      var baseMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(1, 1, 20),
        new THREE.MeshBasicMaterial({color: 0xffffff})
      );

      var adTexture = new THREE.ImageUtils.loadTexture(options.adName);
      adTexture.wrapS = adTexture.wrapT = THREE.ClampToEdgeWrapping;
      adTexture.minFilter = THREE.NearestFilter;
      var width = options.width || 24;
      var height = width * 9/16;
      var adMesh = new THREE.Mesh(
        new THREE.PlaneBufferGeometry(width, height),
        new THREE.MeshBasicMaterial({map: adTexture, side: THREE.DoubleSide})
      );

      adMesh.position.set(0, 10 + height / 2, 0);
      baseMesh.add(adMesh);

      callback(baseMesh.geometry, baseMesh.material, baseMesh);
    };

    options.postLoadRotation = {x: 0, y: Math.random() * Math.PI * 2, z: 0};

    if (!options.symbolName) {
      options.symbolName = '/media/symbols/billboard.png';
    }
    if (!options.symbolLength) {
      options.symbolLength = 16;
    }

    super(options);
  }
}

class Plant extends MeshedOneOff {
  constructor(options) {
    if (!options.modelName) {
      options.modelName = kt.choice(['/js/models/tree.json']);
    }

    if (options.modelName === '/js/models/tree.json') {
      options.scale = Math.random() * 2 + 0.3;
    }

    if (!options.symbolName) {
      options.symbolName = '/media/symbols/plant.png';
    }
    if (!options.symbolLength) {
      options.symbolLength = 16;
    }

    super(options);
  }

  meshWasLoaded() {
    super.meshWasLoaded();

    // shiny random plant colors
    var materials = this.shaneMesh.mesh.material.materials;
    for (var i = 0; i < materials.length; i++) {
      var material = materials[i];
      material.color = new THREE.Color(parseInt(Math.random() * 16777215));
      material.emissive = new THREE.Color(parseInt(Math.random() * 16777215));
      material.ambient = new THREE.Color(parseInt(Math.random() * 16777215));
      material.needsUpdate = true;
    }
  }
}

class Skyscraper extends MeshedOneOff {
  constructor(options) {
    options.meshCreator = (callback) => {
      var texture = new THREE.ImageUtils.loadTexture(options.texturePath);
      texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping; texture.minFilter = THREE.NearestFilter;
      var mesh = new THREE.Mesh(
        new THREE.BoxGeometry(8, 80, 8),
        new THREE.MeshBasicMaterial({map: texture, side: THREE.DoubleSide})
      );
      callback(mesh.geometry, mesh.material, mesh);
    };

    if (!options.symbolName) {
      options.symbolName = '/media/symbols/building.png';
    }
    if (!options.symbolLength) {
      options.symbolLength = 16;
    }

    super(options);
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
    options.meshCreator = function(callback) {
      var longEdgeSize = options.longEdgeSize || 8;
      var geometry = new THREE.PlaneBufferGeometry(longEdgeSize * (Math.random() * 0.25 + 0.5), longEdgeSize);

      var texture = new THREE.ImageUtils.loadTexture('/media/textures/paper.jpg');
      texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.minFilter = THREE.NearestFilter;
      var material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide
      });

      var mesh = new THREE.Mesh(geometry, material);
      callback(geometry, material, mesh);
    };

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
      var longEdgeSize = options.longEdgeSize || 11;
      var geometry = options.portait ? new THREE.PlaneBufferGeometry(longEdgeSize * 0.75, longEdgeSize) : new THREE.PlaneBufferGeometry(longEdgeSize, longEdgeSize * 0.75);
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

    options.postLoadRotation = {x: 0, y: Math.random() * Math.PI * 2, z: 0};

    if (options.position && options.position.y === 0) {
      options.position.y = 2;
    }

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

    var geometry = new THREE.PlaneBufferGeometry(0.75, 0.75 * 0.5); // tuned to line up with tv
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

  // drop shadow
  new RotatingMan({
    name: 'origin of painting',
    text: 'The origin of painting is obscure... All, however, agree that painting began with the outlining of the shadow of a man.',
    textColor: 0x66FF66,
    position: new THREE.Vector3(203, 0, 63)
  }),
  new RotatingMan({
    name: 'animal is a higher being',
    text: 'The animal is a higher being, as the integrity of its animal nature makes it a much more gifted creature than man, its weaker counterpart.',
    textColor: 0x47A3FF,
    position: new THREE.Vector3(-492, 0, 367)
  }),
  new RotatingMan({
    name: 'Man can only DO in part',
    text: 'Man can only DO in part what what the animal IS, totally.',
    textColor: 0xE6B85C,
    position: new THREE.Vector3(-370, 0, 484)
  }),
  new RotatingMan({
    name: 'Early art',
    text: 'Early art represented not the manner in which a man appears to us, but what he is; not a view of his body, but an outline of his shadow.',
    textColor: 0x19A347,
    position: new THREE.Vector3(-258, 0, -262)
  }),
  new RotatingMan({
    name: 'Decaying art',
    text: 'I have said enough concerning the dignity of a decaying art.',
    textColor: 0xFFA3A3,
    position: new THREE.Vector3(-89, 0, -15)
  }),
  new RotatingMan({
    name: 'Excavation',
    text: 'Excavation is an inherently destructive process.',
    textColor: 0x8AB800,
    position: new THREE.Vector3(-497, 0, -244)
  }),
  new RotatingMan({
    name: 'a bronze dog',
    text: 'As an example of technique I shall mention a figure representing neither god nor man... a bronze dog, licking its wound.',
    textColor: 0xCC9900,
    position: new THREE.Vector3(-259, 0, 401)
  }),
  new RotatingMan({
    name: 'Solitude',
    text: 'Solitude is the profoundest fact of the human condition. Man is the only being who knows he is alone.',
    textColor: 0xE1E1E1,
    position: new THREE.Vector3(-144, 0, 366)
  }),
  new RotatingMan({
    name: 'everything but my dog',
    text: 'I lost everything but my dog.',
    textColor: 0xFF99FF,
    position: new THREE.Vector3(16, 0, 141)
  }),
  new RotatingMan({
    name: 'man renders science',
    text: 'Man is the one who renders science moral or immoral.',
    textColor: 0x009933,
    position: new THREE.Vector3(227, 0, 126)
  }),
  new RotatingMan({
    name: 'Art And Compromise',
    text: 'All Art Requires Compromise',
    textColor: 0x009933,
    position: new THREE.Vector3(233, 0, -244)
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
    position: new THREE.Vector3(-50, 2, -310)
  }),
  new PoeticBeacon({
    name: 'Surfaces and Edges',
    text: 'Surfaces and edges of the material provide visual cues that are grounded in reality. The use of familiar tactile attributes helps users quickly understand affordances. Yet the flexibility of the material creates new affordances that supercede those in the physical world, without breaking the rules of physics.',
    position: new THREE.Vector3(-25, 2, -300)
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
    position: new THREE.Vector3(25, 2, -325)
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
    position: new THREE.Vector3(75, 2, -380)
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
    position: new THREE.Vector3(-125, 2, -310)
  }),

  // isolated poems
  new PoeticBeacon({
    name: "My Dog's Life",
    text: dogPoemOneOffText,
    position: new THREE.Vector3(-200, 2, -20)
  }),
  new PoeticBeacon({
    name: "Excavate Everything",
    text: 'Excavate Everything<br>Leave Nothing Unturned<br>Find What\'s your\'s<br>Or They Will<br>Unearth The Now<br>Dig Into Me<br>Dig Into Us<br>Get What\'s Your\'s',
    position: new THREE.Vector3(100, 2, -333)
  }),
  new PoeticBeacon({
    name: "Everything Inside Me",
    text: "Everyting Inside Me<br>Divides Me From You",
    position: new THREE.Vector3(-43, 0, 477)
  }),

  // life hacks
  new PoeticBeacon({
    name: 'Life Hack I',
    text: 'Life Hack I.<br>If you want to die gamble everything until:<br>1. You have enough money to live as a king<br>2. You have nothing',
    position: new THREE.Vector3(-140, 2, 150)
  }),
  new PoeticBeacon({
    name: 'Life Hack II',
    text: 'Life Hack II.<br>If you want to die<br>Never pay taxes and you\'ll have more money<br>to thrive<br>and when They finally come for you<br>just do what you wanted',
    position: new THREE.Vector3(60, 2, 250)
  }),
  new PoeticBeacon({
    name: 'Life Hack III',
    text: 'Life Hack III.<br>If you want to die<br>just Find a way<br>to accumulate power<br>and soon you are ready to<br>live again',
    position: new THREE.Vector3(200, 2, 100)
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
  new ImageBeacon({
    name: 'Director of Swamp People',
    imageName: 'media/beacon-images/director_of_swamp_people.jpg',
    portrait: true,
    position: new THREE.Vector3(375, 3, -477)
  }),
  new ImageBeacon({
    name: 'An Exercise In Total Loss',
    imageName: 'media/beacon-images/an_exercise_in_total_loss.jpg',
    portrait: true,
    position: new THREE.Vector3(-69, 3, 136)
  }),
  new ImageBeacon({
    name: 'High Hopes, Big Dreams',
    imageName: 'media/beacon-images/high_hopes_big_dreams.jpg',
    position: new THREE.Vector3(-87, 3, 238)
  }),
  new ImageBeacon({
    name: 'Admit Nothing!',
    imageName: 'media/beacon-images/admit_nothing.jpg',
    portrait: true,
    position: new THREE.Vector3(-367, 3, -66)
  }),
  new ImageBeacon({
    name: 'John Goodman and Friend',
    imageName: 'media/beacon-images/john_goodman_and_friend.jpg',
    portrait: true,
    position: new THREE.Vector3(95, 3, 156)
  }),
  new ImageBeacon({
    name: 'Dark Energy Queen',
    imageName: 'media/beacon-images/dark_energy_queen.jpg',
    portrait: true,
    position: new THREE.Vector3(-303, 3, -125)
  }),
  new ImageBeacon({
    name: 'French Quarter Task Force',
    imageName: 'media/beacon-images/french_quarter_task_force.jpg',
    portrait: true,
    position: new THREE.Vector3(64, 3, 1)
  }),
  new ImageBeacon({
    name: 'Prodigal Son',
    imageName: 'media/beacon-images/young_sean.jpg',
    position: new THREE.Vector3(-143, 3, -142)
  }),
  new ImageBeacon({
    name: 'My Own Hand',
    imageName: 'media/beacon-images/typer.jpg',
    position: new THREE.Vector3(-29, 3, 316)
  }),
  new ImageBeacon({
    name: 'Trout Fishing',
    imageName: 'media/beacon-images/trout_fishing.jpg',
    position: new THREE.Vector3(-119, 3, 45)
  }),
  new ImageBeacon({
    name: 'Henry and Her Cigar',
    imageName: 'media/beacon-images/henry_cigar.jpg',
    portrait: true,
    position: new THREE.Vector3(-315, 3, 276)
  }),
  new ImageBeacon({
    name: 'And now, I Marry Her',
    imageName: 'media/beacon-images/now_i_marry_her.jpg',
    position: new THREE.Vector3(-371, 3, -40)
  }),
  new ImageBeacon({
    name: 'Casual Carl',
    imageName: 'media/beacon-images/casual_carl.jpg',
    position: new THREE.Vector3(421, 3, -6)
  }),
  new ImageBeacon({
    name: 'Canada and Her Cigar',
    imageName: 'media/beacon-images/canada_cigar.jpg',
    portrait: true,
    position: new THREE.Vector3(103, 3, 113)
  }),
  new ImageBeacon({
    name: 'To Sleep With The One You Love',
    imageName: 'media/beacon-images/bedtime.jpg',
    portrait: true,
    position: new THREE.Vector3(-324, 3, -356)
  }),
  new ImageBeacon({
    name: 'I have No Tools',
    imageName: 'media/beacon-images/i_am_miserable.jpg',
    position: new THREE.Vector3(-190, 3, 337)
  }),
  new ImageBeacon({
    name: 'Organic Fresh Young Coconut Milk',
    imageName: 'media/beacon-images/organic_fresh_young_coconut_milk.jpg',
    position: new THREE.Vector3(488, 3, -114)
  }),
  new ImageBeacon({
    name: 'Guy Ate Here',
    imageName: 'media/beacon-images/guy_ate_here.jpg',
    portrait: true,
    position: new THREE.Vector3(413, 3, 196)
  }),
  new ImageBeacon({
    name: 'He Was A Genius',
    imageName: 'media/beacon-images/genius_burger.jpg',
    position: new THREE.Vector3(-4, 3, -445)
  }),
  new ImageBeacon({
    name: 'My Friend and Me',
    imageName: 'media/beacon-images/air_force_ones.jpg',
    position: new THREE.Vector3(-462, 3, 36)
  }),
  new ImageBeacon({
    name: 'My Own Two Feet',
    imageName: 'media/beacon-images/birks_at_work.jpg',
    portrait: true,
    position: new THREE.Vector3(-61, 3, -232)
  }),
  new ImageBeacon({
    name: 'A new employee',
    imageName: 'media/beacon-images/work_gaming.jpg',
    portrait: true,
    position: new THREE.Vector3(-491, 3, 311)
  }),
  new ImageBeacon({
    name: 'MY LID (MINE)',
    imageName: 'media/beacon-images/my_lid.jpg',
    portrait: true,
    position: new THREE.Vector3(76, 3, 394)
  }),
  new ImageBeacon({
    name: 'In My Heart',
    imageName: 'media/beacon-images/wolf_nature.jpg',
    portrait: true,
    position: new THREE.Vector3(-69, 3, -458)
  }),
  new ImageBeacon({
    name: 'He Licks It',
    imageName: 'media/beacon-images/cream.jpg',
    portrait: true,
    position: new THREE.Vector3(434, 3, 271)
  }),
  new ImageBeacon({
    name: 'Thank You, Jerry',
    imageName: 'media/beacon-images/thank_you_jerry.jpg',
    portrait: true,
    position: new THREE.Vector3(258, 3, -268)
  }),
  new ImageBeacon({
    name: 'The Carving or the Stump?',
    imageName: 'media/beacon-images/this_carving.jpg',
    portrait: true,
    position: new THREE.Vector3(-331, 3, -326)
  }),
  new ImageBeacon({
    name: 'Gerald',
    imageName: 'media/beacon-images/gerald.jpg',
    portrait: true,
    position: new THREE.Vector3(24, 3, 408)
  }),
  new ImageBeacon({
    name: 'Drinking Friends',
    imageName: 'media/beacon-images/gnomes.jpg',
    portrait: true,
    position: new THREE.Vector3(182, 3, 382)
  }),
  new ImageBeacon({
    name: '13ye',
    imageName: 'media/beacon-images/jaq_eye.jpg',
    position: new THREE.Vector3(-8, 3, 284)
  }),
  new ImageBeacon({
    name: 'Unrepentance',
    imageName: 'media/beacon-images/louie_beard.jpg',
    portrait: true,
    position: new THREE.Vector3(-63, 3, -435)
  }),
  new ImageBeacon({
    name: 'His Majesty',
    imageName: 'media/beacon-images/special_tiger.jpg',
    portrait: true,
    position: new THREE.Vector3(-473, 3, -194)
  }),
  new ImageBeacon({
    name: 'Two Men, Fighting',
    imageName: 'media/beacon-images/two_fighters.jpg',
    portrait: true,
    position: new THREE.Vector3(-141, 3, -381)
  }),
  new ImageBeacon({
    name: 'A New Approach',
    imageName: 'media/beacon-images/french_toast_sandwich.jpg',
    portrait: true,
    position: new THREE.Vector3(128, 3, 336)
  }),
  new ImageBeacon({
    name: 'Natal Glow',
    imageName: 'media/beacon-images/bulb.jpg',
    portrait: true,
    position: new THREE.Vector3(-469, 3, -62)
  }),
  new ImageBeacon({
    name: 'A Collection Of Tools',
    imageName: 'media/beacon-images/tools.jpg',
    position: new THREE.Vector3(397, 3, -409)
  }),
  new ImageBeacon({
    name: 'Go on ... You Deserve It',
    imageName: 'media/beacon-images/you_deserve_it.jpg',
    portrait: true,
    position: new THREE.Vector3(-315, 3, 476)
  }),
  new ImageBeacon({
    name: 'A Singular Grape',
    imageName: 'media/beacon-images/grape.jpg',
    portrait: true,
    position: new THREE.Vector3(423, 3, -76)
  }),
  new ImageBeacon({
    name: 'U Haul It',
    imageName: 'media/beacon-images/u_haul_it.jpg',
    position: new THREE.Vector3(-398, 0, -221)
  }),
  new ImageBeacon({
    name: 'Alien Arrival',
    imageName: 'media/beacon-images/alien_arrival.jpg',
    portrait: true,
    position: new THREE.Vector3(53, 4, 106)
  }),
  new ImageBeacon({
    name: 'Moose and Penguins',
    imageName: 'media/beacon-images/moose_penguin.jpg',
    portrait: true,
    position: new THREE.Vector3(144, 0, -493)
  }),
  new ImageBeacon({
    name: 'Moose and Cat',
    imageName: 'media/beacon-images/moose_cat.jpg',
    portrait: true,
    position: new THREE.Vector3(-43, -5, 459)
  }),
  new ImageBeacon({
    name: 'Man in Suit',
    imageName: 'media/beacon-images/mufon_suit.jpg',
    portrait: true,
    position: new THREE.Vector3(245, 0, -130)
  }),
  new ImageBeacon({
    name: 'A Gathering of Men',
    imageName: 'media/beacon-images/mufon_men.jpg',
    position: new THREE.Vector3(-304, 3, 240)
  }),
  new ImageBeacon({
    name: 'A Conference of Men',
    imageName: 'media/beacon-images/mufon_conference.jpg',
    position: new THREE.Vector3(-27, 2, 160)
  }),
  new ImageBeacon({
    name: 'A Man Speaks',
    imageName: 'media/beacon-images/mufon_speaker.jpg',
    portrait: true,
    position: new THREE.Vector3(-237, 0, 463)
  }),
  new ImageBeacon({
    name: 'MUFON Man',
    imageName: 'media/beacon-images/mufon_man.jpg',
    portrait: true,
    position: new THREE.Vector3(-218, 0, -452)
  }),
  new ImageBeacon({
    name: 'Who Is the Object and Who Is the Occupant?',
    imageName: 'media/beacon-images/object_occupant.jpg',
    position: new THREE.Vector3(123, 0, 237)
  }),
  new ImageBeacon({
    name: 'Jane and Her Husband, Clint',
    imageName: 'media/beacon-images/jane_and_clint_chapin.jpg',
    position: new THREE.Vector3(163, 0, -476)
  }),
  new ImageBeacon({
    name: 'Faded Figure',
    imageName: 'media/beacon-images/mufon_figure.jpg',
    portrait: true,
    position: new THREE.Vector3(130, 0, 490)
  }),
  new ImageBeacon({
    name: 'Kevin Roark',
    imageName: 'media/beacon-images/kevin_roark.jpg',
    position: new THREE.Vector3(403, 0, -72)
  }),
  new ImageBeacon({
    name: 'Saucey Sidewalk',
    imageName: 'media/beacon-images/sauce_views.jpg',
    position: new THREE.Vector3(-355, 0, -189)
  }),
  new ImageBeacon({
    name: 'Dog Solves Task',
    imageName: 'media/beacon-images/dog_task.jpg',
    position: new THREE.Vector3(-163, 0, 47)
  }),
  new ImageBeacon({
    name: 'Son Manh',
    imageName: 'media/beacon-images/son_manh.jpg',
    position: new THREE.Vector3(16, 0, 360)
  }),
  new ImageBeacon({
    name: 'Deputy Sheriffs Car After Skidding to a Halt',
    imageName: 'media/beacon-images/sheriffs_car.jpg',
    position: new THREE.Vector3(89, 0, -150)
  }),
  new ImageBeacon({
    name: 'Deputy Sheriff Val Johnson',
    imageName: 'media/beacon-images/deputy_johnson.jpg',
    portrait: true,
    position: new THREE.Vector3(-462, 0, -217)
  }),
  new ImageBeacon({
    name: 'Men on the Beach',
    imageName: 'media/beacon-images/beach_men.jpg',
    position: new THREE.Vector3(-307, 0, 28)
  }),
  new ImageBeacon({
    name: 'A Minion in My Room',
    imageName: 'media/beacon-images/bedroom_minion_shrine.jpg',
    position: new THREE.Vector3(220, 0, -342)
  }),
  new ImageBeacon({
    name: 'Brooklyn Mike',
    imageName: 'media/beacon-images/brooklyn_mike.jpg',
    position: new THREE.Vector3(364, 0, -171)
  }),
  new ImageBeacon({
    name: 'Me and the Minion',
    imageName: 'media/beacon-images/minion_reflection.jpg',
    position: new THREE.Vector3(-289, 0, 418)
  }),
  new ImageBeacon({
    name: 'Something Sinister, in the Park',
    imageName: 'media/beacon-images/park_observers.jpg',
    position: new THREE.Vector3(-42, 0, 346)
  }),
  new ImageBeacon({
    name: 'Step 1: Learning Truth',
    imageName: 'media/beacon-images/psychic_abilities.jpg',
    position: new THREE.Vector3(-185, 0, -273)
  }),
  new ImageBeacon({
    name: 'Craps On A Train',
    imageName: 'media/beacon-images/subway_craps.jpg',
    position: new THREE.Vector3(-119, 0, -157)
  }),
  new ImageBeacon({
    name: 'The Trump Tower on Fifth Avenue',
    imageName: 'media/beacon-images/trump_tower.jpg',
    position: new THREE.Vector3(76, 0, -429)
  }),
  new ImageBeacon({
    name: 'Vegan Marinara, For Lunch',
    imageName: 'media/beacon-images/vegan_marinara.jpg',
    position: new THREE.Vector3(277, 0, 201)
  }),
  new ImageBeacon({
    name: 'A Dog Looking Through the Window',
    imageName: 'media/beacon-images/window_dog.jpg',
    position: new THREE.Vector3(279, 0, -202)
  }),
  new ImageBeacon({
    name: 'Absolute Power Fitness',
    imageName: 'media/beacon-images/absolute_power_fitness.jpg',
    position: new THREE.Vector3(-377, 0, -8)
  }),
  new ImageBeacon({
    name: "He's Talking...",
    imageName: 'media/beacon-images/are_you_listening.jpg',
    position: new THREE.Vector3(228, 0, -52)
  }),
  new ImageBeacon({
    name: 'One Bending Body',
    imageName: 'media/beacon-images/bending_body.jpg',
    position: new THREE.Vector3(414, 0, -403)
  }),
  new ImageBeacon({
    name: 'Dancing Foot I.',
    imageName: 'media/beacon-images/club_feet_1.jpg',
    position: new THREE.Vector3(-416, 0, 222)
  }),
  new ImageBeacon({
    name: 'Dancing Foot II.',
    imageName: 'media/beacon-images/club_feet_2.jpg',
    position: new THREE.Vector3(286, 0, 178)
  }),
  new ImageBeacon({
    name: 'Dancing Foot III.',
    imageName: 'media/beacon-images/club_feet_3.jpg',
    position: new THREE.Vector3(-252, 0, 48)
  }),
  new ImageBeacon({
    name: 'Dancing Foot IV.',
    imageName: 'media/beacon-images/club_feet_4.jpg',
    position: new THREE.Vector3(-59, 0, 249)
  }),
  new ImageBeacon({
    name: 'Dancing Foot V.',
    imageName: 'media/beacon-images/club_feet_5.jpg',
    position: new THREE.Vector3(268, 0, -298)
  }),
  new ImageBeacon({
    name: 'Dancing Foot VI.',
    imageName: 'media/beacon-images/club_feet_6.jpg',
    position: new THREE.Vector3(371, 0, 350)
  }),
  new ImageBeacon({
    name: 'Dominos Demons',
    imageName: 'media/beacon-images/dominos_demons.jpg',
    position: new THREE.Vector3(68, 0, -45)
  }),
  new ImageBeacon({
    name: 'Trump, Donna',
    imageName: 'media/beacon-images/donna_trump.jpg',
    position: new THREE.Vector3(-45, 0, -9)
  }),
  new ImageBeacon({
    name: 'For TV',
    imageName: 'media/beacon-images/dress_to_impress_for_tv.jpg',
    position: new THREE.Vector3(93, 0, 482)
  }),
  new ImageBeacon({
    name: 'Father Demo Square',
    imageName: 'media/beacon-images/father_demo_square.jpg',
    position: new THREE.Vector3(-328, 0, -275)
  }),
  new ImageBeacon({
    name: "God's Flag",
    imageName: 'media/beacon-images/gods_flag.jpg',
    position: new THREE.Vector3(277, 0, -199)
  }),
  new ImageBeacon({
    name: "One Man's Neck",
    imageName: 'media/beacon-images/man_neck.jpg',
    position: new THREE.Vector3(-397, 0, 154)
  }),
  new ImageBeacon({
    name: 'Me, Love, Rambo',
    imageName: 'media/beacon-images/me_love_rambo.jpg',
    position: new THREE.Vector3(-437, 0, -303)
  }),
  new ImageBeacon({
    name: 'One Gold Watch',
    imageName: 'media/beacon-images/one_gold_watch.jpg',
    position: new THREE.Vector3(-328, 0, 361)
  }),
  new ImageBeacon({
    name: 'The Papal Stream',
    imageName: 'media/beacon-images/papal_livestream_1.jpg',
    position: new THREE.Vector3(-47, 0, -240)
  }),
  new ImageBeacon({
    name: 'Pope In Central Park',
    imageName: 'media/beacon-images/pope_in_the_park.jpg',
    position: new THREE.Vector3(410, 0, -295)
  }),
  new ImageBeacon({
    name: 'Tuesdays',
    imageName: 'media/beacon-images/pray_tuesdays.jpg',
    position: new THREE.Vector3(12, 0, 328)
  }),
  new ImageBeacon({
    name: 'Man Named Drew',
    imageName: 'media/beacon-images/projected_drew.jpg',
    position: new THREE.Vector3(346, 0, -92)
  }),
  new ImageBeacon({
    name: 'Protect Them All',
    imageName: 'media/beacon-images/protect_all.jpg',
    position: new THREE.Vector3(400, 0, -307)
  }),
  new ImageBeacon({
    name: 'Sell It From Hell',
    imageName: 'media/beacon-images/sell_from_hell.jpg',
    position: new THREE.Vector3(-261, 0, -151)
  }),
  new ImageBeacon({
    name: 'Did Love The World',
    imageName: 'media/beacon-images/so_loved_the_world.jpg',
    position: new THREE.Vector3(-483, 0, 14)
  }),
  new ImageBeacon({
    name: 'Welcome, Pope Frances',
    imageName: 'media/beacon-images/soho_room_welcomes_pope_frances.jpg',
    position: new THREE.Vector3(426, 0, 482)
  }),
  new ImageBeacon({
    name: 'Man and His Trumpet',
    imageName: 'media/beacon-images/trumpet_man.jpg',
    position: new THREE.Vector3(400, 0, -177)
  }),
  new ImageBeacon({
    name: 'View From The Highest Peak',
    imageName: 'media/beacon-images/view_from_the_ladder.jpg',
    position: new THREE.Vector3(144, 0, -389)
  }),
  new ImageBeacon({
    name: 'When I Say Weak Ass',
    imageName: 'media/beacon-images/you_live_the_perfect_life.jpg',
    position: new THREE.Vector3(335, 0, 426)
  }),
  new ImageBeacon({
    name: 'You Live The Perfect Life',
    imageName: 'media/beacon-images/you_live_the_perfect_life.jpg',
    position: new THREE.Vector3(-310, 0, 325)
  }),
  new ImageBeacon({
    name: 'You Live The Perfect Life',
    imageName: 'media/beacon-images/you_live_the_perfect_life.jpg',
    position: new THREE.Vector3(-310, 0, 325)
  }),
  new ImageBeacon({
    name: 'Emotional Technologists',
    imageName: 'media/beacon-images/emotional_technologists.jpg',
    position: new THREE.Vector3(-187, 0, -222)
  }),
  new ImageBeacon({
    name: 'Car in a Cage',
    imageName: 'media/beacon-images/car_in_a_cage.jpg',
    position: new THREE.Vector3(-165, 0, -153)
  }),
  new ImageBeacon({
    name: 'Italian Marble',
    imageName: 'media/beacon-images/italy_marble.jpg',
    position: new THREE.Vector3(260, 0, 121)
  }),
  new ImageBeacon({
    name: 'Venus',
    imageName: 'media/beacon-images/hadrians_venus.jpg',
    position: new THREE.Vector3(-436, 0, 157)
  }),
  new ImageBeacon({
    name: 'Passionate Perfectionists',
    imageName: 'media/beacon-images/passionate_perfectionists.jpg',
    position: new THREE.Vector3(327, 0, 99)
  }),
  new ImageBeacon({
    name: 'Autostadt Tree',
    imageName: 'media/beacon-images/autostadt_tree.jpg',
    position: new THREE.Vector3(-117, 0, 165)
  }),
  new ImageBeacon({
    name: 'Audi Screen',
    imageName: 'media/beacon-images/audi_screen.jpg',
    position: new THREE.Vector3(174, 0, 383)
  }),
  new ImageBeacon({
    name: 'A to Beyond',
    imageName: 'media/beacon-images/a_to_beyond.jpg',
    position: new THREE.Vector3(-103, 0, 252)
  }),
  new ImageBeacon({
    name: 'Autostadt Grass',
    imageName: 'media/beacon-images/autostadt_grass.jpg',
    position: new THREE.Vector3(184, 0, 123)
  }),
  new ImageBeacon({
    name: 'Autostadt Hill',
    imageName: 'media/beacon-images/autostadt_hill.jpg',
    position: new THREE.Vector3(-95, 0, 283)
  }),
  new ImageBeacon({
    name: 'Car in a Cage 2',
    imageName: 'media/beacon-images/car_in_a_cage_2.jpg',
    position: new THREE.Vector3(103, 0, 78)
  }),
  new ImageBeacon({
    name: 'Everything we know, is everything you feel',
    imageName: 'media/beacon-images/everything_we_know.jpg',
    position: new THREE.Vector3(256, 0, 345)
  }),
  new ImageBeacon({
    name: 'FlowerEarth Texture',
    imageName: 'media/beacon-images/flower_earth.jpg',
    position: new THREE.Vector3(-217, 0, -52)
  }),
  new ImageBeacon({
    name: 'Its a new dawn',
    imageName: 'media/beacon-images/its_a_new_dawn.jpg',
    position: new THREE.Vector3(-402, 0, -66)
  }),
  new ImageBeacon({
    name: 'Passion Is Our Driving Force',
    imageName: 'media/beacon-images/passion_is_our_driving_force.jpg',
    position: new THREE.Vector3(487, 0, 304)
  }),
  new ImageBeacon({
    name: 'PowerShot Rock',
    imageName: 'media/beacon-images/rock.jpg',
    position: new THREE.Vector3(417, 0, 413)
  }),
  new ImageBeacon({
    name: 'Technology to Enjoy',
    imageName: 'media/beacon-images/technology_to_enjoy.jpg',
    position: new THREE.Vector3(-425, 0, -384)
  }),
  new ImageBeacon({
    name: 'Turning the Ordinary into Extraordinary',
    imageName: 'media/beacon-images/turning_the_ordinary.jpg',
    position: new THREE.Vector3(486, 0, -447)
  }),
  new ImageBeacon({
    name: 'Justin in Chains',
    imageName: 'media/beacon-images/justin_in_chains.jpg',
    portrait: true,
    position: new THREE.Vector3(-130, 0, 109)
  }),
  new ImageBeacon({
    name: 'Moneymaker Shades',
    imageName: 'media/beacon-images/moneymaker_shades.jpg',
    position: new THREE.Vector3(-65, 0, 428)
  }),
  new ImageBeacon({
    name: 'A Dog',
    imageName: 'media/beacon-images/a_dog.jpg',
    position: new THREE.Vector3(428, 0, 431)
  }),
  new ImageBeacon({
    name: 'Camera Men',
    imageName: 'media/beacon-images/camera_men.jpg',
    position: new THREE.Vector3(446, 0, 80)
  }),
  new ImageBeacon({
    name: 'Tonys Dog',
    imageName: 'media/beacon-images/tonys_dog.jpg',
    portrait: true,
    position: new THREE.Vector3(-161, 0, 98)
  }),
  new ImageBeacon({
    name: 'Starbucks Man',
    imageName: 'media/beacon-images/starbucks_man.jpg',
    portrait: true,
    position: new THREE.Vector3(163, 0, 314)
  }),
  new ImageBeacon({
    name: 'Six Flags Minion Game',
    imageName: 'media/beacon-images/six_flags_minion.jpg',
    portrait: true,
    position: new THREE.Vector3(-360, 0, -35)
  }),
  new ImageBeacon({
    name: 'Wrigley Field',
    imageName: 'media/beacon-images/wrigley_field.jpg',
    portrait: true,
    position: new THREE.Vector3(205, 0, -411)
  }),
  new ImageBeacon({
    name: 'Eat Death',
    imageName: 'media/beacon-images/eat_death.jpg',
    position: new THREE.Vector3(-69, 0, -173)
  }),
  new ImageBeacon({
    name: 'Marble Mannequin',
    imageName: 'media/beacon-images/marble_mannequin.jpg',
    position: new THREE.Vector3(-463, 0, 47)
  }),
  new ImageBeacon({
    name: 'Cactus Mannequin',
    imageName: 'media/beacon-images/mannequin_cactus.jpg',
    portrait: true,
    position: new THREE.Vector3(249, 0, 491)
  }),
  new ImageBeacon({
    name: 'Hamburg Mannequins',
    imageName: 'media/beacon-images/hamburg_mannequins.jpg',
    position: new THREE.Vector3(299, 0, 176)
  }),
  new ImageBeacon({
    name: 'Mary Cameron Berlin Man',
    imageName: 'media/beacon-images/mary_cameron_berlin_man.jpg',
    portrait: true,
    position: new THREE.Vector3(-466, 0, -342)
  }),
  new ImageBeacon({
    name: 'Guoshi Eats Meat and Peppers',
    imageName: 'media/beacon-images/guoshi_meat_peppers.jpg',
    portrait: true,
    position: new THREE.Vector3(374, 0, 344)
  }),
  new ImageBeacon({
    name: 'Italy Wedding Photos',
    imageName: 'media/beacon-images/italy_wedding_photos.jpg',
    position: new THREE.Vector3(-461, 0, 476)
  }),
  new ImageBeacon({
    name: 'Low Steps Typing',
    imageName: 'media/beacon-images/low_steps_typing.jpg',
    position: new THREE.Vector3(152, 0, 108)
  }),
  new ImageBeacon({
    name: 'Jerry Bus Typing',
    imageName: 'media/beacon-images/jerry_bus_typing.jpg',
    position: new THREE.Vector3(273, 0, -422)
  }),
  new ImageBeacon({
    name: 'Kevin Mannequins 2',
    imageName: 'media/beacon-images/kevin_mannequins_2.jpg',
    position: new THREE.Vector3(323, 0, 232)
  }),
  new ImageBeacon({
    name: 'Kevin Mannequins',
    imageName: 'media/beacon-images/kevin_mannequins.jpg',
    position: new THREE.Vector3(304, 0, 145)
  }),
  new ImageBeacon({
    name: 'Dodge Mannequins',
    imageName: 'media/beacon-images/dodge_mannequins.jpg',
    position: new THREE.Vector3(474, 0, 25)
  }),
  new ImageBeacon({
    name: 'Inspiration',
    imageName: 'media/beacon-images/inspiration.jpg',
    position: new THREE.Vector3(379, 0, -244)
  }),
  new ImageBeacon({
    name: 'Ron Smiles',
    imageName: 'media/beacon-images/ron_smiles.jpg',
    position: new THREE.Vector3(324, 0, 416)
  }),
  new ImageBeacon({
    name: 'Ron and Wife',
    imageName: 'media/beacon-images/ron_smiles.jpg',
    position: new THREE.Vector3(343, 0, -112)
  }),
  new ImageBeacon({
    name: 'Open Mouthed Man',
    imageName: 'media/beacon-images/open_mouthed_man.jpg',
    position: new THREE.Vector3(312, 0, -145)
  }),
  new ImageBeacon({
    name: 'Money Bag',
    imageName: 'media/beacon-images/money_bag.jpg',
    position: new THREE.Vector3(-110, 0, -202)
  }),
  new ImageBeacon({
    name: 'Cop Shades',
    imageName: 'media/beacon-images/cop_shades.jpg',
    position: new THREE.Vector3(414, 0, 17)
  }),
  new ImageBeacon({
    name: 'Man Wife and Dog',
    imageName: 'media/beacon-images/man_wife_dog.jpg',
    position: new THREE.Vector3(-337, 0, -431)
  }),
  new ImageBeacon({
    name: 'Man on Screen',
    imageName: 'media/beacon-images/man_on_screen.jpg',
    portrait: true,
    position: new THREE.Vector3(-26, 0, 297)
  }),
  new ImageBeacon({
    name: 'Lake Zurich Tools',
    imageName: 'media/beacon-images/lake_zurich_tools.jpg',
    position: new THREE.Vector3(-312, 0, -120)
  }),
  new ImageBeacon({
    name: 'Peters TV',
    imageName: 'media/beacon-images/peter_tv.jpg',
    position: new THREE.Vector3(189, 0, -237)
  }),
  new ImageBeacon({
    name: 'Daido Moriyama Dog',
    imageName: 'media/beacon-images/moriyama_dog.jpg',
    portrait: true,
    position: new THREE.Vector3(-110, 0, -411)
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
  }),
  new VideoBeacon({
    name: 'An Attempt to Sculpt God',
    videoName: 'media/videos/obelisk',
    position: new THREE.Vector3(155, -2, 155)
  }),
  new VideoBeacon({
    name: 'Beans on a Plate',
    videoName: 'media/videos/beans',
    position: new THREE.Vector3(-40, -2, -70)
  }),
  new VideoBeacon({
    name: 'Air Marshall',
    videoName: 'media/videos/cops_on_a_plane',
    position: new THREE.Vector3(-140, -2, -190)
  }),
  new VideoBeacon({
    name: 'Want to go to a party?',
    videoName: 'media/videos/dark_roof',
    position: new THREE.Vector3(120, -2, -240)
  }),
  new VideoBeacon({
    name: 'Outdoor Gaming',
    videoName: 'media/videos/gamer',
    position: new THREE.Vector3(-20, -2, 75)
  }),
  new VideoBeacon({
    name: 'Gracias Madre',
    videoName: 'media/videos/guitar_madre',
    position: new THREE.Vector3(111, -2, 225)
  }),
  new VideoBeacon({
    name: 'Run Away With Me (Shane)',
    videoName: 'media/videos/gym',
    position: new THREE.Vector3(160, -2, -180)
  }),
  new VideoBeacon({
    name: 'iThai',
    videoName: 'media/videos/ithai',
    position: new THREE.Vector3(20, -2, -300)
  }),
  new VideoBeacon({
    name: 'Joel Returns',
    videoName: 'media/videos/joel_osteen',
    position: new THREE.Vector3(120, -2, 250)
  }),
  new VideoBeacon({
    name: 'A Kiss and A Hug',
    videoName: 'media/videos/love',
    position: new THREE.Vector3(400, -2, 0)
  }),
  new VideoBeacon({
    name: 'Which Whip is This?',
    videoName: 'media/videos/porsche',
    position: new THREE.Vector3(-222, -2, 66)
  }),
  new VideoBeacon({
    name: 'Sing Along With the Rock Band',
    videoName: 'media/videos/stasis',
    position: new THREE.Vector3(0, -2, -300)
  }),
  new VideoBeacon({
    name: 'A New One',
    videoName: 'media/videos/vape_shop',
    position: new THREE.Vector3(0, -2, 300)
  }),
  new VideoBeacon({
    name: 'To Touch An Eagle',
    videoName: 'media/videos/bubble_eagles',
    position: new THREE.Vector3(-172, 0, 372)
  }),
  new VideoBeacon({
    name: 'An Impromptu Meeting',
    videoName: 'media/videos/cell_in_the_park',
    position: new THREE.Vector3(237, 0, -381)
  }),
  new VideoBeacon({
    name: 'Transit Entertainment — Craps',
    videoName: 'media/videos/craps_on_a_train',
    position: new THREE.Vector3(420, 0, -284)
  }),
  new VideoBeacon({
    name: 'Larger Than Life',
    videoName: 'media/videos/fifth_avenue',
    position: new THREE.Vector3(278, 0, -297)
  }),
  new VideoBeacon({
    name: 'Draining The Keg',
    videoName: 'media/videos/keg_tapping',
    position: new THREE.Vector3(-454, 0, -414)
  }),
  new VideoBeacon({
    name: "Love's No Fun",
    videoName: 'media/videos/loves_no_fun',
    position: new THREE.Vector3(109, 0, 365)
  }),
  new VideoBeacon({
    name: "Marble Projection",
    videoName: 'media/videos/marble_at_the_club',
    position: new THREE.Vector3(-77, 0, -278)
  }),

  // Google Photos Content
  new VideoBeacon({
    name: 'Google and Jerry I',
    videoName: 'media/videos/google_dart_jerry',
    position: new THREE.Vector3(-194, -2, 100)
  }),
  new VideoBeacon({
    name: "Google's Graduation",
    videoName: 'media/videos/google_graduation',
    position: new THREE.Vector3(-194, -2, 140)
  }),
  new VideoBeacon({
    name: 'Google Strolling and Fighting',
    videoName: 'media/videos/google_hoodslam',
    position: new THREE.Vector3(-194, -2, 180)
  }),
  new VideoBeacon({
    name: 'Google Eats Itself',
    videoName: 'media/videos/google_eats_itself',
    position: new THREE.Vector3(-194, -2, 220)
  }),

  // Billboards
  new Billboard({
    adName: 'media/billboard-images/welcome.jpg',
    position: new THREE.Vector3(30, 5, -75)
  }),
  new Billboard({
    adName: 'media/billboard-images/glad.jpg',
    position: new THREE.Vector3(-18, 5, -157)
  }),
  new Billboard({
    adName: 'media/billboard-images/everything_you_see.jpg',
    position: new THREE.Vector3(-245, 5, -100)
  }),
  new Billboard({
    adName: 'media/billboard-images/when_i_die.jpg',
    position: new THREE.Vector3(-80, 5, 120)
  }),
  new Billboard({
    adName: 'media/billboard-images/papa_johns_football.jpg',
    position: new THREE.Vector3(140, 5, 92)
  }),

  // Plants
  new Plant({position: new THREE.Vector3(0, 0, -50)}),
  new Plant({position: new THREE.Vector3(188, 0, 177)}),
  new Plant({position: new THREE.Vector3(308, 0, 255)}),
  new Plant({position: new THREE.Vector3(-162, 0, -349)}),
  new Plant({position: new THREE.Vector3(-140, 0, -197)}),
  new Plant({position: new THREE.Vector3(313, 0, -259)}),
  new Plant({position: new THREE.Vector3(-143, 0, 274)}),
  new Plant({position: new THREE.Vector3(229, 0, 209)}),
  new Plant({position: new THREE.Vector3(320, 0, -2)}),
  new Plant({position: new THREE.Vector3(-221, 0, -347)}),
  new Plant({position: new THREE.Vector3(214, 0, -305)}),
  new Plant({position: new THREE.Vector3(-312, 0, 125)}),
  new Plant({position: new THREE.Vector3(-267, 0, 199)}),
  new Plant({position: new THREE.Vector3(-194, 0, 107)}),
  new Plant({position: new THREE.Vector3(-200, 0, 70)}),
  new Plant({position: new THREE.Vector3(13, 0, -218)}),
  new Plant({position: new THREE.Vector3(-5, 0, 293)}),
  new Plant({position: new THREE.Vector3(227, 0, -139)}),
  new Plant({position: new THREE.Vector3(-175, 0, -298)}),
  new Plant({position: new THREE.Vector3(262, 0, 116)}),
  new Plant({position: new THREE.Vector3(-308, 0, -201)}),
  new Plant({position: new THREE.Vector3(-187, 0, 157)}),
  new Plant({position: new THREE.Vector3(-332, 0, -242)}),
  new Plant({position: new THREE.Vector3(325, 0, -344)}),
  new Plant({position: new THREE.Vector3(-123, 0, -101)}),
  new Plant({position: new THREE.Vector3(-206, 0, -263)}),
  new Plant({position: new THREE.Vector3(27, 0, -90)}),
  new Plant({position: new THREE.Vector3(263, 0, -16)}),
  new Plant({position: new THREE.Vector3(66, 0, 185)}),
  new Plant({position: new THREE.Vector3(290, 0, -106)}),
  new Plant({position: new THREE.Vector3(-185, 0, 110)}),
  new Plant({position: new THREE.Vector3(336, 0, 271)}),
  new Plant({position: new THREE.Vector3(341, 0, -16)}),
  new Plant({position: new THREE.Vector3(317, 0, -13)}),
  new Plant({position: new THREE.Vector3(-273, 0, 116)}),
  new Plant({position: new THREE.Vector3(249, 0, -85)}),
  new Plant({position: new THREE.Vector3(258, 0, -115)}),
  new Plant({position: new THREE.Vector3(-140, 0, 304)}),
  new Plant({position: new THREE.Vector3(-36, 0, 315)}),
  new Plant({position: new THREE.Vector3(-137, 0, 278)}),
  new Plant({position: new THREE.Vector3(-91, 0, 66)}),

  // Architecture
  new Skyscraper({
    texturePath: '/media/architecture-textures/skyscraper-1.jpg',
    position: new THREE.Vector3(0, 30, 175)
  }),
  new Skyscraper({
    texturePath: '/media/architecture-textures/skyscraper-2.jpg',
    position: new THREE.Vector3(312, 30, -282)
  }),
  new Skyscraper({
    texturePath: '/media/architecture-textures/skyscraper-3.jpg',
    position: new THREE.Vector3(-173, 30, 60)
  }),
  new Skyscraper({
    texturePath: '/media/architecture-textures/skyscraper-4.jpg',
    position: new THREE.Vector3(185, 30, -333)
  }),
  new Skyscraper({
    texturePath: '/media/architecture-textures/skyscraper-5.jpg',
    position: new THREE.Vector3(-262, 30, 288)
  })

];
