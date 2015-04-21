
let $ = require('jquery');
let THREE = require('three');

import {ThreeBoiler} from './three-boiler.es6';

let FlyControls = require('./fly-controls');

import {oneOffs} from './shared-space/one-offs';
import {createShaneScenes} from './scenes';

let $sceneOverlay = $('#scene-overlay');

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

    this.oneOffs = oneOffs;
    for (var i = 0; i < oneOffs.length; i++) {
      this.oneOffs[i].activate(this.scene);
    }

    this.shaneScenes = createShaneScenes(this.transitionFromScene.bind(this), this.renderer, this.camera, this.scene);

    this.sharedCameraPosition = new THREE.Vector3(0, 0, 0);
  }

  render() {
    super.render();

    this.controls.update();

    for (var i = 0; i < this.oneOffs.length; i++) {
      this.oneOffs[i].update();
    }

    for (var j = 0; j < this.shaneScenes.length; j++) {
      this.shaneScenes[j].update();
    }
  }

  keypress(keycode) {
    switch (keycode) {
      case 32:
        this.attemptToEnterScene();
        break;
    }
  }

  talismans() {
    return this.shaneScenes.map(scene => scene.talisman);
  }

  searchForTalisman() {
    let requiredDistanceSquared = 20 * 20;
    var cameraPosition = this.camera.position;
    var shaneScenes = this.shaneScenes;
    var minDistanceSquared = 100000000000;
    var sceneOfNearestTalisman = null;

    for (var i = 0; i < shaneScenes.length; i++) {
      var talisman = shaneScenes[i].talisman;
      var distSquared = talisman.mesh.position.distanceToSquared(cameraPosition);
      if (distSquared < minDistanceSquared) {
        minDistanceSquared = distSquared;
        sceneOfNearestTalisman = shaneScenes[i];
      }
    }

    return minDistanceSquared <= requiredDistanceSquared ? sceneOfNearestTalisman : null;
  }

  /// Transitions

  attemptToEnterScene() {
    var scene = this.searchForTalisman();
    if (scene) {
      console.log(scene);
      this.transitionToScene(scene);
    }
  }

  transitionFromScene(shaneScene) {
    this.fadeSceneOverlay(() => {
      shaneScene.exit();
      this.addSharedObjects();
      this.camera.position.copy(this.sharedCameraPosition);
    });
  }

  transitionToScene(shaneScene) {
    this.sharedCameraPosition.copy(this.camera.position);

    this.fadeSceneOverlay(() => {
      this.removeSharedObjects();

      shaneScene.enter();
    });
  }

  fadeSceneOverlay(behavior) {
    let duration = 1000;

    $sceneOverlay.fadeIn(duration, () => {
      behavior();

      $sceneOverlay.fadeOut(duration);
    });
  }

  addSharedObjects() {
    let talismans = this.talismans();
    talismans.forEach(talisman => {
      talisman.addTo(this.scene);
    });

    this.oneOffs.forEach(oneOff => {
      oneOff.activate(this.scene);
    });
  }

  removeSharedObjects() {
    let talismans = this.talismans();
    talismans.forEach(talisman => {
      talisman.removeFrom(this.scene);
    });

    this.oneOffs.forEach(oneOff => {
      oneOff.deactivate(this.scene);
    });
  }
}

$(function() {
  var shane = new SecondShane();
  shane.activate();
});
