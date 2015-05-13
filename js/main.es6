
let $ = require('jquery');
let THREE = require('three');

import {ThreeBoiler} from './three-boiler.es6';

let FlyControls = require('./controls/fly-controls');

import {oneOffs} from './one-offs.es6';
import {createShaneScenes} from './scenes.es6';
import {currentTheme} from './theme.es6';

let $sceneOverlay = $('#scene-overlay');
let $nearbyArtifactContainer = $('#nearby-artifact-container');
let $nearbyArtifactName = $('#nearby-artifact-name');

let IS_LIVE = true;

class SecondShane extends ThreeBoiler {
  constructor() {
    super({
      antialias: true,
      alpha: true
    });

    this.renderer.shadowMapEnabled = true;
    this.renderer.shadowMapCullFace = THREE.CullFaceBack;

    this.renderer.gammaInput = true;
	  this.renderer.gammaOutput = true;

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

    this.theme = currentTheme;
    this.theme.applyTo(this.scene);

    this.sharedCameraPosition = new THREE.Vector3(0, 0, 0);

    this.nearestTalismanScene = null;
    this.framesUntilTalismanSearch = 30;
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

    this.framesUntilTalismanSearch -= 1;
    if (this.framesUntilTalismanSearch <= 0) {
      this.nearestTalismanScene = this.searchForTalisman();
      $nearbyArtifactName.text(this.nearestTalismanScene? this.nearestTalismanScene.name : 'null');
      this.framesUntilTalismanSearch = 30;
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

    return minDistanceSquared <= 400 ? sceneOfNearestTalisman : null;
  }

  /// Transitions

  attemptToEnterScene() {
    var scene = this.nearestTalismanScene;
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
      this.controls.enabled = true;
      $nearbyArtifactContainer.show();
    });
  }

  transitionToScene(shaneScene) {
    this.controls.enabled = false;

    this.sharedCameraPosition.copy(this.camera.position);

    this.fadeSceneOverlay(() => {
      this.removeSharedObjects();
      $nearbyArtifactContainer.hide();

      shaneScene.startScene();
    });
  }

  fadeSceneOverlay(behavior) {
    let duration = IS_LIVE? 3000 : 1000;

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

    this.theme.applyTo(this.scene);
  }

  removeSharedObjects() {
    let talismans = this.talismans();
    talismans.forEach(talisman => {
      talisman.removeFrom(this.scene);
    });

    this.oneOffs.forEach(oneOff => {
      oneOff.deactivate(this.scene);
    });

    this.theme.removeFrom(this.scene);
  }
}

$(function() {
  var shane = new SecondShane();
  shane.activate();
});
