
module.exports = function() {
  var scope = this;

  var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
  var pointerlockElement = document.body;

  this.canRequestPointerlock = false;
  this.currentlyHasPointerlock = false;

  addPointerlockListeners();

  this.requestPointerlock = function() {
    scope.canRequestPointerlock = true;

    if (/Firefox/i.test( navigator.userAgent)) {
      var fullscreenchange = function() {
        if ( document.fullscreenElement === pointerlockElement || document.mozFullscreenElement === pointerlockElement || document.mozFullScreenElement === pointerlockElement ) {
          document.removeEventListener( 'fullscreenchange', fullscreenchange );
          document.removeEventListener( 'mozfullscreenchange', fullscreenchange );

          pointerlockElement.requestPointerLock();
        }
      };

      document.addEventListener('fullscreenchange', fullscreenchange, false);
      document.addEventListener('mozfullscreenchange', fullscreenchange, false);

      pointerlockElement.requestFullscreen = pointerlockElement.requestFullscreen || pointerlockElement.mozRequestFullScreen || pointerlockElement.webkitRequestFullscreen;
      pointerlockElement.requestFullscreen();
    } else {
      pointerlockElement.requestPointerLock = pointerlockElement.requestPointerLock ||
                                              pointerlockElement.mozRequestPointerLock ||
                                              pointerlockElement.webkitRequestPointerLock;

      if (pointerlockElement.requestPointerLock) {
        pointerlockElement.requestPointerLock();
      }
    }
  };

  this.exitPointerlock = function() {
    pointerlockElement.exitPointerLock =  pointerlockElement.exitPointerLock    ||
                                          pointerlockElement.mozExitPointerLock ||
                                          pointerlockElement.webkitExitPointerLock;

    if (pointerlockElement.exitPointerLock) {
      pointerlockElement.exitPointerLock();
    }

    scope.canRequestPointerlock = false;
  };

  this.canEverHavePointerLock = function() {
    return havePointerLock;
  };

  function pointerlockchange() {
    if (document.pointerLockElement === pointerlockElement || document.mozPointerLockElement === pointerlockElement || document.webkitPointerLockElement === pointerlockElement ) {
      scope.currentlyHasPointerlock = true;
    } else {
      scope.currentlyHasPointerlock = false;
    }

    if (scope.pointerLockChangeCallback) {
      scope.pointerLockChangeCallback(scope.currentlyHasPointerlock);
    }
  }

  function pointerlockerror(event) {
    console.log('POINTER LOCK ERROR:');
    console.log(event);
  }

  function addPointerlockListeners() {
    if (havePointerLock) {
      // Hook pointer lock state change events
      document.addEventListener('pointerlockchange', function() {
        pointerlockchange();
      }, false);
      document.addEventListener('mozpointerlockchange', function() {
        pointerlockchange();
      }, false);
      document.addEventListener('webkitpointerlockchange', function() {
        pointerlockchange();
      }, false);

      document.addEventListener('pointerlockerror', function(ev) {
        pointerlockerror(ev);
      }, false);
      document.addEventListener('mozpointerlockerror', function(ev) {
        pointerlockerror(ev);
      }, false);
      document.addEventListener('webkitpointerlockerror', function(ev) {
        pointerlockerror(ev);
      }, false);
    }
  }
};
