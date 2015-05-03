
let THREE = require('three');
let $ = require('jquery');
let kt = require('kutility');
let Terrain = require('../../lib/three.terrain');

let urls = require('../../urls');
import {Talisman} from '../../talisman.es6';
import {ShaneScene} from '../../shane-scene.es6';
let ShaneMesh = require('../../shane-mesh');

export class PapaJohn extends ShaneScene {

  /// Init

  constructor(renderer, camera, scene, options) {
    super(renderer, camera, scene, options);

    var host = (this.isLive? urls.papaJohn.live : urls.papaJohn.web);
    this.videoBase = host + 'video/';
    this.imageBase = host + 'images/';
  }

  createTalisman() {
    let talisman = new Talisman({
      position: new THREE.Vector3(15, 0, -10)
    });
    return talisman;
  }

  /// Shane System

  enter() {
    super.enter();

    var terrainTexture = THREE.ImageUtils.loadTexture('/media/textures/sand.jpg');
    terrainTexture.wrapS = THREE.RepeatWrapping;
    terrainTexture.wrapT = THREE.RepeatWrapping;
    terrainTexture.repeat.set(16, 16);

    this.terrainScene = Terrain({
      easing: Terrain.Linear,
      frequency: 2.5,
      heightmap: Terrain.Hill,
      material: new THREE.MeshBasicMaterial({
        //color: 0xddceaa,
        map: terrainTexture,
        side: THREE.DoubleSide
      }),
      maxHeight: -3,
      minHeight: -70,
      steps: 1,
      useBufferGeometry: false,
      xSegments: 63,
      xSize: 1024,
      ySegments: 63,
      ySize: 1024,
    });
    this.scene.add(this.terrainScene);

    this.makeSpotlight();
    this.spreadCactus();
    this.spreadRocks();
  }

  exit() {
    super.exit();

    this.scene.remove(this.terrainScene);

    this.scene.remove(this.spotLight);
  }

  update() {
    super.update();
  }

  /// Creation

  spreadCactus() {
    var cactus = new ShaneMesh({
      modelName: '/js/models/cactus/low_poly_cactus.json'
    });

    cactus.createMesh(() => {
      cactus.mesh.scale.set(2, 2, 2);

      var terrainGeometry = this.terrainScene.children[0].geometry;
      this.cactusScene = THREE.Terrain.ScatterMeshes(terrainGeometry, {
        mesh: cactus.mesh,
        w: 63,
        h: 63,
        spread: 0.02,
        randomness: Math.random,
      });
      this.terrainScene.add(this.cactusScene);
    });
  }

  spreadRocks() {
    var rock = new ShaneMesh({
      modelName: '/js/models/rock/rock.json'
    });

    rock.createMesh(() => {
      //rock.mesh.scale.set(2, 2, 2);

      //rock.setMeshColor(0x857023);

      var terrainGeometry = this.terrainScene.children[0].geometry;
      this.rockScene = THREE.Terrain.ScatterMeshes(terrainGeometry, {
        mesh: rock.mesh,
        w: 63,
        h: 63,
        spread: 0.03,
        randomness: Math.random,
      });
      this.terrainScene.add(this.rockScene);
    });
  }

  makeSpotlight() {
    this.spotLight = new THREE.HemisphereLight(0xeeeeff, 0xffffff, 1); // 0xb8e5f8 (blue)
    this.scene.add(this.spotLight);
  }

}
