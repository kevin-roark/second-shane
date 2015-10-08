
var $ = require('jquery');
var THREE = require('three');
var queryString = require('querystring');
var TWEEN = require('tween.js');

import {ThreeBoiler} from './three-boiler.es6';

let FlyControls = require('./controls/fly-controls');
let moneyMan = require('./new-money');
let minimap = require('./minimap');
let couponLeader = require('./coupon-leader');
let fadeSceneOverlay = require('./overlay');

import {oneOffs, setDidFindBeaconCallback} from './one-offs.es6';
import {createShaneScenes} from './scenes.es6';
import {applyCurrentTheme, removeCurrentTheme} from './theme.es6';
import {chatter} from './util/chatterbox.es6';

var $loadingOverlay = $('#loading-overlay');
var $loadingText = $('#loading-text');
var $clickToStartText = $('#click-to-start-text');
var $nearbyArtifactContainer = $('#nearby-artifact-container');
var $nearbyArtifactName = $('#nearby-artifact-name');
var $introBox = $('#intro-box');
var $chatterBoxContainer = $('#chatter-box');
var $sharedSpaceHudElements = $('#top-left-hud, #bottom-left-hud, #nearby-artifact-container');
var $pointerLockTip = $('#pointer-lock-tip');
var $siteMap = $('#site-map');
var $spacebarTip = $('#spacebar-tip');
var $menuTip = $('#menu-tip');

let IS_LIVE = false;
let SCRATCH_PAD = false;
let SceneFadeDuration = IS_LIVE? 3000 : 1000;

class SecondShane extends ThreeBoiler {
  constructor() {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      return;
    }

    super({
      antialias: true,
      alpha: true
    });

    this.renderer.shadowMapEnabled = true;
    this.renderer.shadowMapCullFace = THREE.CullFaceBack;
    this.renderer.shadowMapType = THREE.PCFSoftShadowMap;

    this.renderer.gammaInput = true;
	  this.renderer.gammaOutput = true;

    this.waitBeforeAddingMoney = true;

    var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    if (!isChrome) {
      $('#please-use-chrome').show();
    }

    this.controls = new FlyControls(this.camera);
    this.scene.add(this.controls.getObject());
    this.controls.locker.pointerLockChangeCallback = (hasPointerLock) => {
      this.reactToPointerLock(hasPointerLock);
    };
    this.reactToPointerLock(false);

    $('#hot-links a').click((ev) => {
      var href = event.target.href;
      var query = queryString.parse(href.substring(href.indexOf('?') + 1));
      if (query && query.portal) {
        ev.preventDefault();
        $siteMap.hide();
        this.isShowingSiteMap = false;
        this.transitionToSceneWithSlug(query.portal);
      }
    });

    $('canvas, #hud, #loading-overlay').click(() => {
      if (!this.hasLoaded) {
        return;
      }
      if (this.activeScene && !SCRATCH_PAD) {
        return;
      }

      if (this.isShowingSiteMap) {
        this.toggleSiteMap();
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

    applyCurrentTheme(this.camera);

    this.sharedWorldLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.5);
    this.sharedWorldLight.position.set(0, 500, 0);
    this.scene.add(this.sharedWorldLight);

    this.sharedCameraPosition = new THREE.Vector3(0, 0, 0);

    this.activeScene = null;
    this.nearestTalismanScene = null;
    this.isShowingSiteMap = false;

    couponLeader.init(() => {
      this.toggleSiteMap();
    });

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

    TWEEN.update();

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

  resize() {
    super.resize();
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
    }, 1333);

    setTimeout(() => {
      this.waitBeforeAddingMoney = false;
      moneyMan.init();
      moneyMan.setMoneyReason('Keep an eye on your New Money accumulation!');

      setTimeout(() => {
        if (!this.activeScene && !this.transitioning) {
          this.showIntroChatter();
        }

        setTimeout(() => {
          if (!this.activeScene && !this.transitioning) {
            moneyMan.setMoneyReason('Remember... Press "M" to learn more about Second Shane!');
          }
        }, 30666);
      }, 3333);
    }, 3333);
  }

  /// History

  renderCurrentURL() {
    var currentQuery = queryString.parse(window.location.search.substring(1));

    if (currentQuery.portal) {
      if (!this.activeScene) {
        this.transitioning = false;
        this.transitionToSceneWithSlug(currentQuery.portal);
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

    currentQuery.portal = scene.slug;

    this.updateHistoryWithQuery(currentQuery);
  }

  updateHistoryForEarth() {
    var currentQuery = queryString.parse(window.location.search.substring(1));
    delete currentQuery.portal;

    this.updateHistoryWithQuery(currentQuery);
  }

  updateHistoryWithQuery(query) {
    var newQueryString = queryString.encode(query);

    if (window.history.pushState) {
      var newURL = window.location.protocol + "//" + window.location.host + window.location.pathname;
      if (newQueryString.length > 0) {
          newURL += '?' + newQueryString;
      }
      window.history.pushState({portal: query.portal}, '', newURL);
    }
  }

  /// Behavior

  showIntroChatter() {
    var hasVisited = this.userHasVisitedBefore();

    var words;
    if (!hasVisited) {
      words = [
        "Hello... Welcome to Second Shane... The perpetual and evolving realm of Mister Shane, full of Visions Sound Media Money and Art. I, the Red Bull™ Goblin, will be your trusted guide and companion.",
        "First thing's first... Second Shane is a self-driven experience. No Tour Guides, Haha. Explore the infinite universe and Hunt For Shane's Treasures. Follow the instructions to the left...",
        "You will find portals to other worlds along the way. Press the Spacebar to enter them. Fear not for within those worlds lies the reality of Second Shane. This realm is a shell.",
        "Thank you, and enjoy your time here. Come back soon... Shane is always changing."
      ];
    }
    else {
      words = [
        "Welcome back to Second Shane... You know what to do...",
        "Remember... Press 'M' at any time to see a site map with useful link portals...",
        "Shane always wants You to have the most fun. Have fun while you're here...",
        "Goodbye..."
      ];
    }

    $introBox.fadeIn();
    chatter($chatterBoxContainer, words, {}, () => {
      $introBox.fadeOut();
    });
  }

  userHasVisitedBefore() {
    if (window.localStorage) {
      var hasVisited = window.localStorage.getItem('hasVisited');
      return !!hasVisited;
    }
    else {
      return false;
    }
  }

  reactToPointerLock(hasPointerlock) {
    if (!this.controls.locker.canEverHavePointerLock()) {
      $pointerLockTip.hide();
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
    if (keycode === 32) { // space
      this.spacebarPressed();
    }
    else if (keycode === 109) { // m
      if (!this.hasQuitLoadingScreen || this.transitioning || this.activeScene) {
        return;
      }

      if (!this.hasHiddenMenuTip) {
        $menuTip.fadeOut();
        this.hasHiddenMenuTip = true;
      }
      this.toggleSiteMap();
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

  toggleSiteMap() {
    this.isShowingSiteMap = !this.isShowingSiteMap;
    $siteMap.toggle();

    if (this.isShowingSiteMap) {
      this.controls.exitPointerlock();
    }
    else {
      if (this.controls.requestPointerlock) {
        this.controls.requestPointerlock();
      }
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
      if (!this.hasHiddenSpacebarTip) {
        $spacebarTip.fadeOut();
        this.hasHiddenSpacebarTip = true;
      }

      if (window.localStorage) {
        window.localStorage.setItem('hasVisited', true);
      }

      this.transitionToScene(scene);
    }
  }

  transitionFromScene(shaneScene, didCancel) {
    if (this.transitioning) {
      return;
    }

    this.transitioning = true;

    fadeSceneOverlay(SceneFadeDuration, () => {
      shaneScene.exit();
      this.activeScene = null;

      this.updateHistoryForEarth();
      $sharedSpaceHudElements.show();
      moneyMan.show();

      this.controls.reset();

      if (this.controls.requestPointerlock) {
        this.controls.requestPointerlock();
      }
      this.reactToPointerLock(this.controls.locker.currentlyHasPointerlock);

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
        var talismanPosition = scene.talisman.position;
        var controlPosition = this.controls.getObject().position;
        var controlPositionTarget = {x: talismanPosition.x + (Math.random() - 0.5) * 15, z: talismanPosition.z + (Math.random() - 0.5) * 15};
        var tween = new TWEEN.Tween(controlPosition).to(controlPositionTarget, 1666);
        tween.onComplete(() => {
          this.transitionToScene(scene);
          tween = null;
        });
        tween.start();
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
    if (this.isShowingSiteMap) {
      this.toggleSiteMap();
    }
    this.isShowingSiteMap = false;

    fadeSceneOverlay(SceneFadeDuration, () => {
      this.removeSharedObjects();
      $introBox.fadeOut();
      $sharedSpaceHudElements.hide();
      moneyMan.hide();

      this.controls.reset();

      this.updateHistoryForScene(shaneScene);

      shaneScene.startScene();
    }, () => {
      this.transitioning = false;
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

    applyCurrentTheme(this.camera);

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

    removeCurrentTheme(this.camera);

    this.scene.remove(this.sharedWorldLight);
  }
}

$(function() {
  var shane = new SecondShane();
  shane.activate();
});
