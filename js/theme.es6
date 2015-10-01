
let $ = require('jquery');

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

var themeCache = {};
var _lastScene;

let themeCreator = (url) => {
  return () => {
    if (!themeCache[url]) {
      themeCache[url] = new ShaneTheme({
        skyboxURL: url
      });
    }
    return themeCache[url];
  };
};

let universeTheme = themeCreator('/media/theme-images/universe/pure.jpg');
let basketballTheme = themeCreator('/media/theme-images/basketball_court.jpg');
let grassyTheme = themeCreator('/media/theme-images/grassy_field.jpg');
let papaTheme = themeCreator('/media/theme-images/papa_johns_interior.jpg');
let marbleTheme = themeCreator('/media/theme-images/marble_walls.jpg');

var idToThemeMap = {
  'space-theme': universeTheme,
  'basketball-theme': basketballTheme,
  'grass-theme': grassyTheme,
  'papa-theme': papaTheme,
  'marble-theme': marbleTheme
};

var currentTheme = universeTheme(); // default theme

// if another theme was used in the most recent session, use it now!
if (window.localStorage) {
  var lastUsedThemeID = window.localStorage.getItem('lastUsedThemeID');
  if (lastUsedThemeID) {
    var themeFunction = idToThemeMap[lastUsedThemeID];
    if (themeFunction) {
      currentTheme = themeFunction();
    }
  }
}

export let applyCurrentTheme = (scene) => {
  _lastScene = scene;
  currentTheme.applyTo(scene);
};

export let removeCurrentTheme = (scene) => {
  _lastScene = scene;
  currentTheme.removeFrom(scene);
};

$('.theme-button').click(function() {
  var $button = $(this);
  var id = $button.attr('id');
  var themeFunction = idToThemeMap[id];
  if (themeFunction && _lastScene) {
    removeCurrentTheme(_lastScene);
    currentTheme = themeFunction();
    applyCurrentTheme(_lastScene);

    if (window.localStorage) {
      window.localStorage.setItem('lastUsedThemeID', id);
    }
  }
});
