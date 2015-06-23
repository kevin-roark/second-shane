
let $ = require('jquery');
let THREE = require('three');

import {ThreeBoiler} from './three-boiler.es6';

let FlyControls = require('./controls/fly-controls');

import {oneOffs} from './one-offs.es6';
import {createShaneScenes} from './scenes.es6';
import {currentTheme} from './theme.es6';
import {chatter} from './util/chatterbox.es6';

let $sceneOverlay = $('#scene-overlay');
let $nearbyArtifactContainer = $('#nearby-artifact-container');
let $nearbyArtifactName = $('#nearby-artifact-name');
let $introBox = $('#intro-box');
let $chatterBoxContainer = $('#chatter-box');

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

    this.activeScene = null;

    this.nearestTalismanScene = null;
    this.framesUntilTalismanSearch = 30;

    this.showIntroChatter();
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

  showIntroChatter() {
    setTimeout(() => {
      let words = ["Hello... Welcome to Second Shane... The ever-present and evolving realm of Mister Shane's sounds, sights, and feelings. I, the Red Bull™ Goblin, will be your trusted guide and companion.",
                   "First thing's first... Second Shane is a self-directed experience. Explore the infinite universe and Hunt For Shane's Treasures. Begin by using the mouse to move your eyes. The W, A, S, D, R, and F keys on your keyboard will move your body... That's it...",
                   "You will find portals to other worlds along the way. Press the spacebar to enter them. Don't be afraid; within those worlds lies the reality of Second Shane. This realm is only a shell.",
                   "Thank you, and enjoy your time here. Come back soon... Shane is always changing."];

      $introBox.fadeIn();
      chatter($chatterBoxContainer, words, {}, () => {
        $introBox.fadeOut();
      });
    }, 2000);
  }

  keypress(keycode) {
    switch (keycode) {
      case 32:
        this.spacebarPressed();
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

  spacebarPressed() {
    if (this.transitioning) {
      return;
    }

    if (!this.activeScene) {
      this.attemptToEnterScene();
    } else {
      this.transitionFromScene(this.activeScene);
    }
  }

  attemptToEnterScene() {
    var scene = this.nearestTalismanScene;
    if (scene) {
      console.log(scene);
      this.transitionToScene(scene);
    }
  }

  transitionFromScene(shaneScene) {
    this.transitioning = true;
    this.activeScene = null;

    this.fadeSceneOverlay(() => {
      shaneScene.exit();
      this.addSharedObjects();
      this.camera.position.copy(this.sharedCameraPosition);
      this.controls.enabled = true;
      $nearbyArtifactContainer.show();

      setTimeout(() => {
        this.transitioning = false;
      }, 4444);
    });
  }

  transitionToScene(shaneScene) {
    this.transitioning = true;
    this.activeScene = shaneScene;
    this.controls.enabled = false;
    this.sharedCameraPosition.copy(this.camera.position);

    this.fadeSceneOverlay(() => {
      this.removeSharedObjects();
      $nearbyArtifactContainer.hide();

      shaneScene.startScene();

      setTimeout(() => {
        this.transitioning = false;
      }, 6666);
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
