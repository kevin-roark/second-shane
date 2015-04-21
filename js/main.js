
let $ = require('jquery');
let THREE = require('three');

import {ThreeBoiler} from './three-boiler.es6';

let FlyControls = require('./fly-controls');

import {oneOffs} from './shared-space/one-offs.js';

class SecondShane extends ThreeBoiler {
  constructor() {
    super();

    this.controls = new FlyControls(this.camera);
    this.scene.add(this.controls.getObject());

    $(document).click(() => {
      if (this.controls.requestPointerlock) {
        this.controls.requestPointerlock();
      }
      this.controls.enabled = true;
    });

    for (var i = 0; i < oneOffs.length; i++) {
      oneOffs[i].activate(this.scene);
    }
  }

  render() {
    super.render();

    this.controls.update();

    for (var i = 0; i < oneOffs.length; i++) {
      oneOffs[i].update();
    }
  }
}

$(function() {
  var shane = new SecondShane();
  shane.activate();
});
