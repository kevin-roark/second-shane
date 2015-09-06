
let $ = require('jquery');
let THREE = require('three');
let queryString = require('querystring');

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
var $hud = $('#hud');
var $pointerLockTip = $('#pointer-lock-tip');

let IS_LIVE = false;

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
    this.controls.locker.pointerLockChangeCallback = (hasPointerLock) => {
      this.reactToPointerLock(hasPointerLock);
    };

    $(document).click(() => {
      if (this.activeScene) {
        return;
      }

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
    this.framesUntilCameraPositionCalculations = 30;

    this.showIntroChatter();

    this.renderCurrentURL();
    window.addEventListener('popstate', () => {
      this.renderCurrentURL();
    });
  }

  render() {
    super.render();

    if (this.activeScene) {
      this.activeScene.update();
    }
    else {
      this.controls.update();

      for (var i = 0; i < this.oneOffs.length; i++) {
        this.oneOffs[i].update();
      }

      for (i = 0; i < this.shaneScenes.length; i++) {
        this.shaneScenes[i].update();
      }

      this.framesUntilCameraPositionCalculations -= 1;
      if (this.framesUntilCameraPositionCalculations <= 0) {
        this.nearestTalismanScene = this.searchForTalisman();

        if (this.nearestTalismanScene) {
          $nearbyArtifactContainer.show();
          $nearbyArtifactName.text(this.nearestTalismanScene.name);
        } else {
          $nearbyArtifactContainer.hide();
        }

        var cameraPosition = this.controls.getObject().position;
        for (i = 0; i < this.oneOffs.length; i++) {
          this.oneOffs[i].relayCameraPosition(cameraPosition);
        }

        this.framesUntilCameraPositionCalculations = 30;
      }
    }
  }

  /// History

  renderCurrentURL() {
    var currentQuery = queryString.parse(window.location.search.substring(1));

    if (currentQuery.shaneScene) {
      if (!this.activeScene) {
        this.transitioning = false;
        this.transitionToSceneWithName(currentQuery.shaneScene);
      }
    }
    else {
      if (this.activeScene) {
        this.transitioning = false;
        this.transitionFromScene(this.activeScene);
      }
    }
  }

  updateHistoryForScene(scene) {
    var currentQuery = queryString.parse(window.location.search.substring(1));

    currentQuery.shaneScene = scene.name;

    this.updateHistoryWithQuery(currentQuery);
  }

  updateHistoryForEarth() {
    var currentQuery = queryString.parse(window.location.search.substring(1));
    delete currentQuery.shaneScene;

    this.updateHistoryWithQuery(currentQuery);
  }

  updateHistoryWithQuery(query) {
    var newQueryString = queryString.encode(query);

    if (window.history.pushState) {
      var newURL = window.location.protocol + "//" + window.location.host + window.location.pathname;
      if (newQueryString.length > 0) {
          newURL += '?' + newQueryString;
      }
      window.history.pushState({shaneScene: query.shaneScene}, '', newURL);
    }
  }

  /// Behavior

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

  reactToPointerLock(hasPointerlock) {
    if (!this.controls.locker.canEverHavePointerLock()) {
      return;
    }

    if (this.activeScene) {
      return;
    }

    if (!hasPointerlock) {
      $pointerLockTip.show();
    }
    else {
      $pointerLockTip.hide();
    }
  }

  /// Interaction

  keypress(keycode) {
    switch (keycode) {
      case 32:
        this.spacebarPressed();
        break;
    }
  }

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

  /// Talismans

  talismans() {
    return this.shaneScenes.map(scene => scene.talisman);
  }

  searchForTalisman() {
    var cameraPosition = this.controls.getObject().position;
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
    if (this.transitioning) {
      return;
    }

    this.transitioning = true;

    this.fadeSceneOverlay(() => {
      shaneScene.exit();
      this.activeScene = null;

      this.updateHistoryForEarth();
      $hud.show();

      this.controls.reset();

      this.addSharedObjects();
      this.controls.getObject().position.copy(this.sharedCameraPosition);
      this.controls.enabled = true;

      setTimeout(() => {
        this.transitioning = false;
      }, 4444);
    });
  }

  transitionToSceneWithName(name) {
    for (var i = 0; i < this.shaneScenes.length; i++) {
      var scene = this.shaneScenes[i];
      if (scene.name === name) {
        this.transitionToScene(scene);
        return;
      }
    }
  }

  transitionToScene(shaneScene) {
    if (this.transitioning) {
      return;
    }

    this.transitioning = true;
    this.activeScene = shaneScene;
    this.controls.enabled = false;
    this.controls.exitPointerlock();
    this.sharedCameraPosition.copy(this.controls.getObject().position);

    this.fadeSceneOverlay(() => {
      this.removeSharedObjects();
      $introBox.fadeOut();
      $nearbyArtifactContainer.hide();
      $hud.hide();

      this.controls.reset();

      this.updateHistoryForScene(shaneScene);

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
