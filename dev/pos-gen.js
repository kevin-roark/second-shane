
var args = process.argv.slice(2);

var positonsToGenerate = parseInt(args[0]);
var maxDistance = args.length > 1 ? parseInt(args[1]) : 500;

for (var i = 0; i < positonsToGenerate; i++) {
  var x = Math.round((Math.random() - 0.5) * (2 * maxDistance));
  var z = Math.round((Math.random() - 0.5) * (2 * maxDistance));
  var pos = 'new THREE.Vector3(' + x + ', 0, ' + z + ')';
  console.log(pos);
}
