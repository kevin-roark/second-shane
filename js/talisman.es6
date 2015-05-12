
let THREE = require('three');

let talismanLoader = new THREE.JSONLoader();

export class Talisman {
  constructor(options) {
    if (!options) options = {};

    this.position = options.position || new THREE.Vector3(0, 0, 0);

    if (options.modelPath) {
      this.talismanType = 'model';
      this.modelPath = options.modelPath;
      this.modelScale = options.modelScale || 1.0;
    } else {
      this.talismanType = 'geometric';
      this.materialType = options.materialType || 'basic';
      this.materialOptions = options.materialOptions || {color: 0x777777};

      this.geometryCreator = options.geometryCreator || () => {
        return new THREE.SphereGeometry(1);
      };
    }

    this.updater = options.updater;
    this.postInit = options.postInit;

    this.hasMesh = false;
  }

  update() {
    if ('function' === typeof this.updater) {
      this.updater();
    }
  }

  addTo(scene) {
    this.createMesh(() => {
      this.mesh.position.copy(this.position);
      scene.add(this.mesh);
    });
  }

  removeFrom(scene) {
    if (this.mesh) {
      scene.remove(this.mesh);
    }
  }

  createMesh(callback) {
    var cb = () => {
      this.hasMesh = true;

      if (this.postInit) {
        this.postInit();
      }

      callback();
    };

    if (this.talismanType === 'model') {
      this.createModelMesh(cb);
    } else {
      this.createGeometricMesh(cb);
    }
  }

  createModelMesh(callback) {
    talismanLoader.load(this.modelPath, (geometry, materials) => {
      this.geometry = geometry;
      this.materials = materials;
      this.material = new THREE.MeshFaceMaterial(materials);

      this.mesh = new THREE.SkinnedMesh(geometry, this.material);
      this.mesh.scale.set(this.modelScale, this.modelScale, this.modelScale);

      callback();
    });
  }

  createGeometricMesh(callback) {
    switch (this.materialType) {
      case 'phong':
        this.material = new THREE.MeshPhongMaterial(this.materialOptions);
        break;

      default:
        this.material = new THREE.MeshBasicMaterial(this.materialOptions);
    }
    this.materials = [this.material];

    this.geometry = this.geometryCreator();

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    callback();
  }

}
