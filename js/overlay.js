
var $ = require('jquery');
var $sceneOverlay = $('#scene-overlay');


module.exports = function fadeSceneOverlay(duration, behavior, callback) {
  if (!duration) duration = 1000;

  $sceneOverlay.fadeIn(duration, () => {
    if (behavior) behavior();
    $sceneOverlay.fadeOut(duration, () => {
      if (callback) callback();
    });
  });
};
