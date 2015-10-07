
let THREE = require('three');
let $ = require('jquery');

let urls = require('../../urls');
import {Talisman} from '../../talisman.es6';
import {ShaneScene} from '../../shane-scene.es6';
let ShaneMesh = require('../../shane-mesh');

/**
 * LAYOUT OF SCENE
 *
 * 1. all white with gold fountain
 * 2. Begins flashing to anti-screen, all black with blood fountain
 * 3. This flashing becomes more and more rapid, until the Climactic WHAT IF YOU WERE HUNTED MOTHERFUCKER
 * 4. you're in a jungle first-person hunting...
 */
export class HuntMe extends ShaneScene {

  /// Init

  constructor(renderer, camera, scene, options) {
    super(renderer, camera, scene, options);

    this.name = "Hunt Me";
    this.slug = 'hunt-me';
    this.symbolName = '/media/symbols/safari.png';

    var host = (this.isLive? urls.huntMe.live : urls.huntMe.web);
    this.mediaBase = host + 'media/';
  }

  createTalisman() {
    let talisman = new Talisman({
      position: new THREE.Vector3(0, 0, 0),
      geometryCreator: () => {
        return new THREE.SphereGeometry(16, 32, 32);
      },
      materialOptions: {
        color: 0xffffff
      }
    });
    return talisman;
  }

  /// Overrides

  enter() {
    super.enter();

  }

  doTimedWork() {
    super.doTimedWork();

    let trackDuration = 60 * 1000;
    this.addTimeout(this.iWantOut.bind(this), trackDuration);
  }

  exit() {
    super.exit();

  }

  update() {
    super.update();


  }

}
