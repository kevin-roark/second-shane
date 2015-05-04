
import {ASMR} from './artifacts/asmr/scene.es6';
import {LiveAtJJs} from './artifacts/live-at-jjs/scene.es6';
import {GodIsAMan} from './artifacts/god-is-a-man/scene.es6';
import {iFeltTheFoot} from './artifacts/i-felt-the-foot/scene.es6';
import {PapaJohn} from './artifacts/papa-john/scene.es6';

export let createShaneScenes = (exitCallback, renderer, camera, scene) => {
  let scenes = [
    new ASMR(renderer, camera, scene, {}),
    new LiveAtJJs(renderer, camera, scene, {}),
    new GodIsAMan(renderer, camera, scene, {}),
    new iFeltTheFoot(renderer, camera, scene, {}),
    new PapaJohn(renderer, camera, scene, {})
  ];

  scenes.forEach(scene => {
    scene.exitCallback = exitCallback;
  });

  return scenes;
};
