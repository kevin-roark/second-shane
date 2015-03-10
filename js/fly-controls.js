/**
 * Originally by James Baicoianu / http://www.baicoianu.com/
 * Modified by Kevin Roark (porkf.at) to meld with pointerlock controls
 */

var THREE = require('three');

module.exports = function (camera, options) {
	if (!options) options = {};

	this.object = camera;

	var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
	var pointerlockElement = document.body;
	var canRequestPointerlock = false;
	var currentlyHasPointerlock = false;
	addPointerlockListeners();

	// API

	this.domElement = options.domElement || document;
	if (this.domElement.setAttribute) {
		this.domElement.setAttribute('tabindex', -1);
	}

	this.movementSpeed = options.movementSpeed || 9.0;
	this.rollSpeed = options.rollSpeed || 0.5;

	this.dragToLook = options.dragToLook || false;
	this.autoForward = options.autoForward || false;

	this.enabled = false;

	this.getObject = function() {
		return this.object;
	};

	// internals

	this.prevTime = performance.now();

	this.tmpQuaternion = new THREE.Quaternion();

	this.mouseStatus = 0;

	this.moveState = { up: 0, down: 0, left: 0, right: 0, forward: 0, back: 0, pitchUp: 0, pitchDown: 0, yawLeft: 0, yawRight: 0, rollLeft: 0, rollRight: 0 };
	this.moveVector = new THREE.Vector3( 0, 0, 0 );
	this.rotationVector = new THREE.Vector3( 0, 0, 0 );

	this.handleEvent = function ( event ) {
		if ( typeof this[ event.type ] === 'function' ) {
			this[ event.type ]( event );
		}
	};

	this.keydown = function( event ) {
		if (!this.enabled) return;

		if ( event.altKey ) {
			return;
		}

		switch ( event.keyCode ) {
			case 16: /* shift */ this.movementSpeedMultiplier = 0.1; break;

			case 87: /*W*/ this.moveState.forward = 1; break;
			case 83: /*S*/ this.moveState.back = 1; break;

			case 65: /*A*/ this.moveState.left = 1; break;
			case 68: /*D*/ this.moveState.right = 1; break;

			case 82: /*R*/ this.moveState.up = 1; break;
			case 70: /*F*/ this.moveState.down = 1; break;

			case 38: /*up*/ this.moveState.pitchUp = 1; break;
			case 40: /*down*/ this.moveState.pitchDown = 1; break;

			case 37: /*left*/ this.moveState.yawLeft = 1; break;
			case 39: /*right*/ this.moveState.yawRight = 1; break;

			case 81: /*Q*/ this.moveState.rollLeft = 1; break;
			case 69: /*E*/ this.moveState.rollRight = 1; break;
		}

		this.updateMovementVector();
		this.updateRotationVector();
	};

	this.keyup = function( event ) {
		if (!this.enabled) return;

		switch( event.keyCode ) {
			case 16: /* shift */ this.movementSpeedMultiplier = 1; break;

			case 87: /*W*/ this.moveState.forward = 0; break;
			case 83: /*S*/ this.moveState.back = 0; break;

			case 65: /*A*/ this.moveState.left = 0; break;
			case 68: /*D*/ this.moveState.right = 0; break;

			case 82: /*R*/ this.moveState.up = 0; break;
			case 70: /*F*/ this.moveState.down = 0; break;

			case 38: /*up*/ this.moveState.pitchUp = 0; break;
			case 40: /*down*/ this.moveState.pitchDown = 0; break;

			case 37: /*left*/ this.moveState.yawLeft = 0; break;
			case 39: /*right*/ this.moveState.yawRight = 0; break;

			case 81: /*Q*/ this.moveState.rollLeft = 0; break;
			case 69: /*E*/ this.moveState.rollRight = 0; break;
		}

		this.updateMovementVector();
		this.updateRotationVector();
	};

	this.mousedown = function( event ) {
		if (!this.enabled) return;

		if ( this.domElement !== document ) {
			this.domElement.focus();
		}

		event.preventDefault();
		event.stopPropagation();

		if ( this.dragToLook ) {
			this.mouseStatus ++;
		} else {
			switch ( event.button ) {
				case 0: this.moveState.forward = 1; break;
				case 2: this.moveState.back = 1; break;
			}

			this.updateMovementVector();
		}
	};

	this.mousemove = function( event ) {
		if (!this.enabled || !currentlyHasPointerlock) return;

		if ( !this.dragToLook || this.mouseStatus > 0 ) {
			var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
			var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

			this.object.rotation.y -= movementX * 0.002;
			this.object.rotation.x += movementY * 0.002;
		}
	};

	this.mouseup = function( event ) {
		event.preventDefault();
		event.stopPropagation();

		if ( this.dragToLook ) {
			this.mouseStatus--;
			this.moveState.yawLeft = this.moveState.pitchDown = 0;
		} else {
			switch ( event.button ) {
				case 0: this.moveState.forward = 0; break;
				case 2: this.moveState.back = 0; break;
			}

			this.updateMovementVector();
		}

		this.updateRotationVector();
	};

	this.update = function() {
		var time = performance.now();
		var delta = ( time - this.prevTime ) / 1000;

		var moveMult = delta * this.movementSpeed;
		var rotMult = delta * this.rollSpeed;

		this.object.translateX( this.moveVector.x * moveMult );
		this.object.translateY( this.moveVector.y * moveMult );
		this.object.translateZ( this.moveVector.z * moveMult );

		this.tmpQuaternion.set( this.rotationVector.x * rotMult, this.rotationVector.y * rotMult, this.rotationVector.z * rotMult, 1 ).normalize();
		this.object.quaternion.multiply( this.tmpQuaternion );

		// expose the rotation vector for convenience
		this.object.rotation.setFromQuaternion( this.object.quaternion, this.object.rotation.order );

		this.prevTime = time;
	};

	this.updateMovementVector = function() {
		var forward = ( this.moveState.forward || ( this.autoForward && !this.moveState.back ) ) ? 1 : 0;

		this.moveVector.x = ( -this.moveState.left    + this.moveState.right );
		this.moveVector.y = ( -this.moveState.down    + this.moveState.up );
		this.moveVector.z = ( -forward + this.moveState.back );
	};

	this.updateRotationVector = function() {
		this.rotationVector.x = ( -this.moveState.pitchDown + this.moveState.pitchUp );
		this.rotationVector.y = ( -this.moveState.yawRight  + this.moveState.yawLeft );
		this.rotationVector.z = ( -this.moveState.rollRight + this.moveState.rollLeft );
	};

	this.getContainerDimensions = function() {
		if ( this.domElement !== document ) {
			return {
				size	: [ this.domElement.offsetWidth, this.domElement.offsetHeight ],
				offset	: [ this.domElement.offsetLeft,  this.domElement.offsetTop ]
			};
		} else {
			return {
				size	: [ window.innerWidth, window.innerHeight ],
				offset	: [ 0, 0 ]
			};
		}
	};

	function bind( scope, fn ) {
		return function () {
			fn.apply( scope, arguments );
		};
	}

	this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );

	this.domElement.addEventListener( 'mousemove', bind( this, this.mousemove ), false );
	this.domElement.addEventListener( 'mousedown', bind( this, this.mousedown ), false );
	this.domElement.addEventListener( 'mouseup',   bind( this, this.mouseup ), false );

	window.addEventListener( 'keydown', bind( this, this.keydown ), false );
	window.addEventListener( 'keyup',   bind( this, this.keyup ), false );

	this.updateMovementVector();
	this.updateRotationVector();

	// pointer lock stuff

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
