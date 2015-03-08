/**
 * Modified from mrdoob's THREE.PointerLockControls
 */

var THREE = require('three');

module.exports = function (camera, options) {
	if (!options) options = {};

	var scope = this;

	camera.rotation.set(0, 0, 0);

	var pitchObject = new THREE.Object3D();
	pitchObject.add(camera);

	var yawObject = new THREE.Object3D();
	yawObject.position.y = 10;
	yawObject.add(pitchObject);

	var moveForward = false;
	var moveBackward = false;
	var moveLeft = false;
	var moveRight = false;
	var moveUp = false;
	var moveDown = false;

	var prevTime = performance.now();

	var velocity = new THREE.Vector3();
	var velocityStep = options.velocityStep || 800;

	var PI_2 = Math.PI / 2;

	var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
	var pointerlockElement = document.body;
	var canRequestPointerlock = false;
	var currentlyHasPointerlock = false;
	addPointerlockListeners();

	var onMouseMove = function ( event ) {
		if (!currentlyHasPointerlock || !scope.enabled) return;

		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		yawObject.rotation.y -= movementX * 0.002;
		pitchObject.rotation.x += movementY * 0.002;

		pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, pitchObject.rotation.x ) );
	};

	var onKeyDown = function ( event ) {
		switch ( event.keyCode ) {
			case 38: // up
			case 87: // w
				moveForward = true;
				break;

			case 37: // left
			case 65: // a
				moveLeft = true;
				break;

			case 40: // down
			case 83: // s
				moveBackward = true;
				break;

			case 39: // right
			case 68: // d
				moveRight = true;
				break;

			case 82: // r
				moveUp = true;
				break;

			case 70: // f
				moveDown = true;
				break;
		}
	};

	var onKeyUp = function ( event ) {
		switch( event.keyCode ) {
			case 38: // up
			case 87: // w
				moveForward = false;
				break;

			case 37: // left
			case 65: // a
				moveLeft = false;
				break;

			case 40: // down
			case 83: // s
				moveBackward = false;
				break;

			case 39: // right
			case 68: // d
				moveRight = false;
				break;

			case 82: // r
				moveUp = false;
				break;

			case 70: // f
				moveDown = false;
				break;
		}
	};

	document.addEventListener( 'mousemove', onMouseMove, false );
	document.addEventListener( 'keydown', onKeyDown, false );
	document.addEventListener( 'keyup', onKeyUp, false );

	this.enabled = false;

	this.getObject = function () {
		return yawObject;
	};

	this.isIdle = function() {
		return !(moveForward || moveBackward || moveLeft || moveRight);
	};

	this.getDirection = function() {
		// assumes the camera itself is not rotated
		var direction = new THREE.Vector3( 0, 0, -1 );
		var rotation = new THREE.Euler( 0, 0, 0, "YXZ" );

		return function( v ) {
			rotation.set( pitchObject.rotation.x, yawObject.rotation.y, 0 );
			v.copy( direction ).applyEuler( rotation );
			return v;
		};
	}();

	this.update = function () {
		if ( scope.enabled === false ) return;

		var time = performance.now();
		var delta = ( time - prevTime ) / 1000;

		velocity.x -= velocity.x * 10.0 * delta;
		velocity.y -= velocity.y * 10.0 * delta;
		velocity.z -= velocity.z * 10.0 * delta;

		var velDelta = velocityStep * delta;

		if (moveForward) velocity.z -= velDelta;
		if (moveBackward) velocity.z += velDelta;

		if (moveLeft) velocity.x -= velDelta;
		if (moveRight) velocity.x += velDelta;

		if (moveUp) velocity.y += velDelta;
		if (moveDown) velocity.y -= velDelta;

		// var orientedCamera = this.getDirection(camera.position.clone());

		yawObject.translateX(velocity.x * delta);
		yawObject.translateY(velocity.y * delta);
		yawObject.translateZ(velocity.z * delta);

		prevTime = time;
	};

	this.requestPointerlock = function() {
		canRequestPointerlock = true;

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

		canRequestPointerlock = false;
	};

	function pointerlockchange() {
		if (document.pointerLockElement === pointerlockElement || document.mozPointerLockElement === pointerlockElement || document.webkitPointerLockElement === pointerlockElement ) {
			currentlyHasPointerlock = true;
		} else {
			currentlyHasPointerlock = false;
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
