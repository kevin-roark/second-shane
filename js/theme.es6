
import {create as createSkybox} from './util/skybox';

class ShaneTheme {
  constructor(options) {
    this.skyboxURL = options.skyboxURL || null;

    this.skybox = createSkybox({
      textureURL: this.skyboxURL
    });
  }

  applyTo(scene) {
    if (this.skybox.__shaneShaderReset) {
      this.skybox.__shaneShaderReset();
    }
    scene.add(this.skybox);
  }

  removeFrom(scene) {
    scene.remove(this.skybox);
  }
}

let universeTheme = new ShaneTheme({
  skyboxURL: '/media/theme-images/universe/pure.jpg'
});

export let currentTheme = universeTheme;
