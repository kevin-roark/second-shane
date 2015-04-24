
import {LiveAtJJs} from '../artifacts/live-at-jjs/scene.es6';
import {GodIsAMan} from '../artifacts/god-is-a-man/scene.es6';


export let createShaneScenes = (exitCallback, renderer, camera, scene) => {
  let scenes = [
    new LiveAtJJs(renderer, camera, scene, {}),
    new GodIsAMan(renderer, camera, scene, {})
  ];

  scenes.forEach(scene => {
    scene.exitCallback = exitCallback;
  });

  return scenes;
};
