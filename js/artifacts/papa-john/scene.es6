
let THREE = require('three');
let $ = require('jquery');
let kt = require('kutility');
let Terrain = require('../../lib/three.terrain');

let urls = require('../../urls');
import {Talisman} from '../../talisman.es6';
import {ShaneScene} from '../../shane-scene.es6';

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
    terrainTexture.repeat.set(4, 4);

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
  }

  exit() {
    super.exit();

    this.scene.remove(this.terrainScene);
  }

  update() {
    super.update();
  }

}
