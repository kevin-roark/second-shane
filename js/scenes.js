
import {LiveAtJJs} from '../live-at-jjs/scene';

export let createShaneScenes = (exitCallback, renderer, camera, scene) => {
  let scenes = [
    new LiveAtJJs(renderer, camera, scene, {})
  ];

  scenes.forEach(scene => {
    scene.exitCallback = exitCallback;
  });

  return scenes;
};
