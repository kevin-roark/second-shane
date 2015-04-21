
let THREE = require('three');
import {Talisman} from './talisman.es6';

export class ShaneScene {
  constructor(renderer, camera, scene, options) {
    this.renderer = renderer;
    this.camera = camera;
    this.scene = scene;
    this.options = options;

    this.talisman = this.createTalisman();
    this.talisman.addTo(scene);

    this.camera.position.set(0, 0, 0);
  }

  update() {
    if (this.talisman) {
      this.talisman.update();
    }
  }

  enter() {

  }

  exit() {
    let children = this.children();
    for (var i = 0; i < children.length; i++) {
      let child = children[i];
      this.scene.remove(child);
    }
  }

  createTalisman() {
    return new Talisman();
  }

  children() {
    return [];
  }
}
