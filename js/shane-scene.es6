
let THREE = require('three');
let $ = require('jquery');

import {Talisman} from './talisman.es6';
import {Dahmer} from './dahmer.es6';

export class ShaneScene {
  constructor(renderer, camera, scene, options) {
    this.renderer = renderer;
    this.camera = camera;
    this.scene = scene;
    this.options = options;

    this.name = 'shane scene';

    this.talisman = this.createTalisman();
    this.talisman.addTo(scene);

    this.shaneMeshes = [];

    this.domContainer = $('body');
    this.dahmer = new Dahmer({$domContainer: this.domContainer});

    $('body').click(this.click.bind(this));
    $(window).resize(this.resize.bind(this));

    this.isLive = false;
    this.numMediaToLoad = this.isLive ? 1 : 0;
  }

  update() {
    if (this.talisman) {
      this.talisman.update();
    }
  }

  startScene() {
    this.enter();

    this.startTimedWorkIfPossible();
  }

  enter() {
    this.active = true;

    this.camera.position.set(0, 0, 0);
    this.camera.rotation.x = 0; this.camera.rotation.y = 0; this.camera.rotation.z = 0;

    this.timeoutsToCancel = [];
  }

  didLoadMedia() {
    this.numMediaToLoad -= 1;
    this.startTimedWorkIfPossible();
  }

  startTimedWorkIfPossible() {
    if (this.active && this.numMediaToLoad === 0) {
      this.doTimedWork();
    }
  }

  doTimedWork() {

  }

  exit() {
    this.active = false;

    for (let i = 0; i < this.timeoutsToCancel.length; i++) {
      clearTimeout(this.timeoutsToCancel[i]);
    }

    let children = this.children();
    for (let i = 0; i < children.length; i++) {
      let child = children[i];
      this.scene.remove(child);
    }

    let shaneMeshes = this.shaneMeshes;
    for (let i = 0; i < shaneMeshes.length; i++) {
      let shaneMesh = shaneMeshes[i];
      shaneMesh.removeFrom(this.scene);
    }
  }

  iWantOut() {
    if (this.exitCallback) {
      this.exitCallback(this);
    }
  }

  addMesh(shaneMesh, callback) {
    shaneMesh.addTo(this.scene, callback);
    this.shaneMeshes.push(shaneMesh);
  }

  click() {
    if (this.active && this.isLive && !this.hasPerformedStartLiveClick) {
      this.didLoadMedia();
      this.hasPerformedStartLiveClick = true;
    }
  }

  resize() {

  }

  /// Protected overrides

  createTalisman() {
    return new Talisman();
  }

  children() {
    return [];
  }

  /// Utility

  addTimeout(fn, timeout) {
    var id = setTimeout(fn, timeout);
    this.timeoutsToCancel.push(id);
  }

}
