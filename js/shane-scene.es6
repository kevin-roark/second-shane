
let THREE = require('three');
let Talisman = require('./talisman');

module.exports = ShaneScene;

class ShaneScene {
  constructor(renderer, camera, options) {
    this.renderer = renderer;
    this.camera = camera;
    this.options = options;

    this.talisman = this.createTalisman();

    this.createTalisman(talisman => {
      this.talisman = talisman;
    });
  }

  update() {
    if (this.talisman) {
      this.talisman.update();
    }
  }

  createTalisman() {
    return new Talisman();
  }
}
