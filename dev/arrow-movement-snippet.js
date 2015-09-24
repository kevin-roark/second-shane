
var mesh; // always set this
var granularity = 1; // u can set this for fine-tuning

function keydown(event) {
  var key = event.keyCode;
  var movementVector = new THREE.Vector3();
  if (key === 87) { // w
    movementVector.z = 1;
  }
  else if (key === 83) { // s
    movementVector.z = -1;
  }
  else if (key === 65) { // a
    movementVector.x = -1;
  }
  else if (key === 68) { // d
    movementVector.x = 1;
  }
  else if (key === 82) { // r
    movementVector.y = 1;
  }
  else if (key === 70) { // f
    movementVector.y = -1;
  }

  mesh.position.x += movementVector.x * granularity;
  mesh.position.y += movementVector.y * granularity;
  mesh.position.z += movementVector.z * granularity;
  console.log('new pos: (' + mesh.position.x + ', ' + mesh.position.y + ', ' + mesh.position.z + ')');
}

window.addEventListener('keydown', function(ev) {
  keydown(ev);
}, false);
