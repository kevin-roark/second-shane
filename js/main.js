
let $ = require('jquery');
let THREE = require('three');

import {ThreeBoiler} from './three-boiler.es6';

let PointerControls = require('./pointer-freeform-controls');

class SecondShane extends ThreeBoiler {
  constructor() {
    super();

    this.controls = new PointerControls(this.camera);
    this.scene.add(this.controls.getObject());

    $(document).click(() => {
      this.controls.requestPointerlock();
      this.controls.enabled = true;
    });

    var mesh = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 5), new THREE.MeshBasicMaterial({color: 0xff0000}));
    mesh.position.set(-5, 0, -25);
    this.scene.add(mesh);
  }

  render() {
    super.render();

    this.controls.update();
  }
}

$(function() {
  var me = new SecondShane();
  me.activate();
});
