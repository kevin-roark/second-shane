
let $ = require('jquery');
let THREE = require('three');
let queryString = require('querystring');

import {ThreeBoiler} from './three-boiler.es6';

let FlyControls = require('./controls/fly-controls');
let moneyMan = require('./new-money');
let minimap = require('./minimap');

import {oneOffs, setDidFindBeaconCallback} from './one-offs.es6';
import {createShaneScenes} from './scenes.es6';
import {currentTheme} from './theme.es6';
import {chatter} from './util/chatterbox.es6';

let $loadingOverlay = $('#loading-overlay');
let $loadingText = $('#loading-text');
let $clickToStartText = $('#click-to-start-text');
let $sceneOverlay = $('#scene-overlay');
let $nearbyArtifactContainer = $('#nearby-artifact-container');
let $nearbyArtifactName = $('#nearby-artifact-name');
let $introBox = $('#intro-box');
let $chatterBoxContainer = $('#chatter-box');
var $hud = $('#hud');
var $pointerLockTip = $('#pointer-lock-tip');

let IS_LIVE = false;
let SCRATCH_PAD = true;

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

    this.waitBeforeAddingMoney = true;

    this.controls = new FlyControls(this.camera);
    this.scene.add(this.controls.getObject());
    this.controls.locker.pointerLockChangeCallback = (hasPointerLock) => {
      this.reactToPointerLock(hasPointerLock);
    };

    $(document).click(() => {
      if (!this.hasLoaded) {
        return;
      }
      if (this.activeScene && !SCRATCH_PAD) {
        return;
      }

      if (!this.hasQuitLoadingScreen) {
        this.exitLoadingScreen();
        this.hasQuitLoadingScreen = true;
      }

      if (this.controls.requestPointerlock) {
        this.controls.requestPointerlock();
      }
      this.controls.setEnabled(true);
    });

    this.shaneScenes = createShaneScenes(this.transitionFromScene.bind(this), this.renderer, this.camera, this.scene);

    this.theme = currentTheme;
    this.theme.applyTo(this.scene);

    this.sharedWorldLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.5);
    this.sharedWorldLight.position.set(0, 500, 0);
    this.scene.add(this.sharedWorldLight);

    this.sharedCameraPosition = new THREE.Vector3(0, 0, 0);

    this.activeScene = null;
    this.nearestTalismanScene = null;

    if (SCRATCH_PAD) {
      this.oneOffs = [];
      return;
    }

    this.oneOffs = oneOffs;
    for (var i = 0; i < oneOffs.length; i++) {
      this.oneOffs[i].activate(this.scene);
    }

    this.initMiniMap();

    setDidFindBeaconCallback((beacon) => {
      var money = parseInt(Math.random() * 200) + 100;
      moneyMan.addMoney(money);
      moneyMan.setMoneyReason('Earned $' + money + ' for discovering "' + beacon.name + '"!');

      this.waitBeforeAddingMoney = true;
      setTimeout(() => {
        this.waitBeforeAddingMoney = false;
      }, 3000);

      if (beacon.$element) {
        this.controls.movementSpeedMultiplier = 0.5;
        setTimeout(() => {
          this.controls.movementSpeedMultiplier = 1.0;
        }, 2666);
      }
    });
  }

  render() {
    super.render();

    if (this.activeScene) {
      this.activeScene.update();
    }
    else {
      this.controls.update();

      if (!this.hasLoaded && this.controls.mostRecentDelta && this.controls.mostRecentDelta < 0.05) {
        this.performDidLoadTransition();
        this.hasLoaded = true;
      }

      for (var i = 0; i < this.oneOffs.length; i++) {
        this.oneOffs[i].update();
      }

      var cameraPosition = this.controls.getObject().position;
      minimap.update(cameraPosition, this.controls.getObject().rotation.y);

      // perform camera position calculations
      if (this.frame % 30 === 0) {
        this.nearestTalismanScene = this.searchForTalisman();

        if (this.nearestTalismanScene) {
          $nearbyArtifactContainer.show();
          $nearbyArtifactName.text(this.nearestTalismanScene.name);
        } else {
          $nearbyArtifactContainer.hide();
        }

        for (i = 0; i < this.oneOffs.length; i++) {
          this.oneOffs[i].relayCameraPosition(cameraPosition);
        }
      }

      // update my money count just for being alive
      if (this.frame % 90 === 0 && !this.waitBeforeAddingMoney) {
        if (!(this.activeScene || this.transitioning)) {
          moneyMan.addMoney(1);
        }
      }
    }
  }

  /// Loading

  performDidLoadTransition() {
    let dur = 966;
    $loadingText.fadeOut(dur);
    $clickToStartText.fadeIn(dur);
  }

  exitLoadingScreen() {
    $loadingOverlay.fadeOut(1566, function() {
      $loadingOverlay.remove();
    });

    setTimeout(() => {
      this.renderCurrentURL();
      window.addEventListener('popstate', () => {
        this.renderCurrentURL();
      });
    }, 2666);

    setTimeout(() => {
      this.waitBeforeAddingMoney = false;
      moneyMan.init();
      moneyMan.setMoneyReason('Keep an eye on your New Money accumulation!');

      setTimeout(() => {
        if (!this.activeScene) {
          this.showIntroChatter();
        }
      }, 3333);
    }, 3333);
  }

  /// History

  renderCurrentURL() {
    var currentQuery = queryString.parse(window.location.search.substring(1));

    if (currentQuery.shaneScene) {
      if (!this.activeScene) {
        this.transitioning = false;
        this.transitionToSceneWithSlug(currentQuery.shaneScene);
      }
    }
    else {
      if (this.activeScene) {
        this.transitioning = false;
        this.transitionFromScene(this.activeScene, true);
      }
    }
  }

  updateHistoryForScene(scene) {
    var currentQuery = queryString.parse(window.location.search.substring(1));

    currentQuery.shaneScene = scene.slug;

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
                   "First thing's first... Second Shane is a self-driven experience. Explore the infinite universe and Hunt For Shane's Treasures. Move your eyes and body with the instructions to the left...",
                   "You will find portals to other worlds along the way. Press the Spacebar to enter them. Fear not for within those worlds lies the reality of Second Shane. This realm is a shell.",
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

  initMiniMap() {
    var mapElements = [];

    // add one-offs to map
    for (i = 0; i < this.oneOffs.length; i++) {
      var oneOff = this.oneOffs[i];
      mapElements.push({
        position: oneOff.position,
        symbol: oneOff.symbolName,
        length: oneOff.symbolLength
      });
    }

    // add shane scenes to map
    for (var i = 0; i < this.shaneScenes.length; i++) {
      var scene = this.shaneScenes[i];
      mapElements.push({
        position: scene.talisman.position,
        symbol: scene.symbolName,
        length: 32
      });
    }

    minimap.init(mapElements);
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
      this.transitionFromScene(this.activeScene, true);
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

  transitionFromScene(shaneScene, didCancel) {
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
      this.controls.setEnabled(true);
    }, () => {
      this.transitioning = false;

      if (!didCancel) {
        moneyMan.addMoney(1000);
        moneyMan.setMoneyReason('Earned $1000 for completing ' + shaneScene.name + '!');
      }
      else {
        moneyMan.addMoney(-500);
        moneyMan.setMoneyReason('Lost $500 for Lack of Honor');
      }

      this.waitBeforeAddingMoney = true;
      setTimeout(() => {
        this.waitBeforeAddingMoney = false;
      }, 3000);
    });
  }

  transitionToSceneWithSlug(slug) {
    for (var i = 0; i < this.shaneScenes.length; i++) {
      var scene = this.shaneScenes[i];
      if (scene.slug === slug) {
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
    if (!SCRATCH_PAD) {
      this.controls.setEnabled(false);
    }
    this.controls.exitPointerlock();
    this.sharedCameraPosition.copy(this.controls.getObject().position);

    this.fadeSceneOverlay(() => {
      this.removeSharedObjects();
      $introBox.fadeOut();
      $hud.hide();

      this.controls.reset();

      this.updateHistoryForScene(shaneScene);

      shaneScene.startScene();
    }, () => {
      this.transitioning = false;
    });
  }

  fadeSceneOverlay(behavior, callback) {
    let duration = IS_LIVE? 3000 : 1000;

    $sceneOverlay.fadeIn(duration, () => {
      behavior();
      $sceneOverlay.fadeOut(duration, () => {
        if (callback) callback();
      });
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

    this.scene.add(this.sharedWorldLight);
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

    this.scene.remove(this.sharedWorldLight);
  }
}

$(function() {
  var shane = new SecondShane();
  shane.activate();
});
