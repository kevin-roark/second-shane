
let THREE = require('three');
import {Talisman} from '../js/talisman.es6';
import {ShaneScene} from '../js/shane-scene.es6';

export class LiveAtJJs extends ShaneScene {

  constructor(renderer, camera, scene, options) {
    super(renderer, camera, scene, options);
  }

  enter() {
    super.enter();

    console.log('dying in 3000');
    setTimeout(() => {
      if (this.exitCallback) {
        this.exitCallback(this);
      }
    }, 3000);
  }

  createTalisman() {
    let talisman = new Talisman({
      position: new THREE.Vector3(0, 0, -50)
    });
    return talisman;
  }

}
