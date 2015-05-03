
let THREE = require('three');
let $ = require('jquery');
let kt = require('kutility');
let Terrain = require('../../lib/three.terrain');

let urls = require('../../urls');
import {Talisman} from '../../talisman.es6';
import {ShaneScene} from '../../shane-scene.es6';
let ShaneMesh = require('../../shane-mesh');
let VideoMesh = require('../../util/video-mesh');

export class PapaJohn extends ShaneScene {

  /// Init

  constructor(renderer, camera, scene, options) {
    super(renderer, camera, scene, options);

    var host = (this.isLive? urls.papaJohn.live : urls.papaJohn.web);
    this.videoBase = host + 'video/';
    this.imageBase = host + 'images/';

    this.papaJohnZ = -175;
  }

  createTalisman() {
    let talisman = new Talisman({
      position: new THREE.Vector3(15, 0, -10)
    });
    return talisman;
  }

  /// Shane System

  enter() {
    super.enter();

    this.scene.fog = new THREE.Fog( 0xffffff, 1, 6000);
		this.scene.fog.color.setHSL( 0.6, 0, 1 );

    this.camera.position.set(0, -10, 0);

    this.makeTerrainScene();
    this.makeLights();
    this.spreadCactus();
    this.spreadRocks();
    this.makeSky();

    setTimeout(this.makePapaJohn.bind(this), 3666);
  }

  exit() {
    super.exit();

    this.scene.fog = null;

    this.scene.remove(this.terrainScene);
    this.scene.remove(this.sky);

    this.scene.remove(this.hemiLight);
    this.scene.remove(this.dirLight);

    this.papaJohnVideo.src = '';
    $(this.papaJohnVideo).remove();
    this.scene.remove(this.papaJohnVideoMesh.mesh);
  }

  update() {
    super.update();
  }

  /// Creation

  makeTerrainScene() {
    var terrainTexture = THREE.ImageUtils.loadTexture('/media/textures/sand.jpg');
    terrainTexture.wrapS = THREE.RepeatWrapping;
    terrainTexture.wrapT = THREE.RepeatWrapping;
    terrainTexture.repeat.set(16, 16);

    this.terrainScene = Terrain({
      easing: Terrain.Linear,
      frequency: 2.5,
      heightmap: Terrain.Hill,
      material: new THREE.MeshBasicMaterial({
        //color: 0xddceaa,
        map: terrainTexture
      }),
      maxHeight: -3,
      minHeight: -70,
      steps: 1,
      useBufferGeometry: false,
      xSegments: 63,
      xSize: 1024,
      ySegments: 63,
      ySize: 1024,
    });
    this.scene.add(this.terrainScene);

    this.terrainScene.receiveShadow = true;

    this.terrainMesh = this.terrainScene.children[0];
    this.terrainMesh.receiveShadow = true;

    this.terrainGeometry = this.terrainMesh.geometry;
  }

  spreadCactus() {
    var cactus = new ShaneMesh({
      modelName: '/js/models/cactus/low_poly_cactus.json'
    });

    cactus.createMesh(() => {
      cactus.mesh.scale.set(2, 2, 2);

      cactus.mesh.castShadow = true;
      cactus.mesh.receiveShadow = true;

      this.cactusScene = THREE.Terrain.ScatterMeshes(this.terrainGeometry, {
        mesh: cactus.mesh,
        w: 63,
        h: 63,
        spread: 0.02,
        randomness: Math.random,
      });
      this.terrainScene.add(this.cactusScene);
    });
  }

  spreadRocks() {
    var rock = new ShaneMesh({
      modelName: '/js/models/rock/rock.json'
    });

    rock.createMesh(() => {
      //rock.mesh.scale.set(2, 2, 2);

      rock.setMeshColor(0x6b4315);

      rock.mesh.castShadow = true;
      rock.mesh.receiveShadow = true;

      this.rockScene = THREE.Terrain.ScatterMeshes(this.terrainGeometry, {
        mesh: rock.mesh,
        w: 63,
        h: 63,
        spread: 0.03,
        randomness: Math.random,
      });
      this.terrainScene.add(this.rockScene);
    });
  }

  makeLights() {
    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1.15);
    this.hemiLight.color.setHSL(0.6, 1, 0.6);
    this.hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
    this.hemiLight.position.set( 0, 500, 0 );
    this.scene.add(this.hemiLight);

    var dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
		dirLight.color.setHSL( 0.1, 1, 0.95 );
		dirLight.position.set(0, 372, 400);

		dirLight.castShadow = true;
		dirLight.shadowMapWidth = 2048;
		dirLight.shadowMapHeight = 2048;

		dirLight.shadowCameraFar = 3500;
		dirLight.shadowBias = -0.0001;
		dirLight.shadowDarkness = 0.35;

    this.dirLight = dirLight;
    this.scene.add(dirLight);
  }

  // lifted from mrdoob.github.io/three.js/examples/webgl_lights_hemisphere.html
  makeSky() {
    var vertexShader = document.getElementById('skyVertexShader').textContent;
		var fragmentShader = document.getElementById('skyFragmentShader').textContent;
		var uniforms = {
			topColor: 	 { type: "c", value: new THREE.Color( 0x0077ff ) },
			bottomColor: { type: "c", value: new THREE.Color( 0xccccff ) },
			offset:		 { type: "f", value: 33 },
			exponent:	 { type: "f", value: 0.75 }
		};
		uniforms.topColor.value.copy(this.hemiLight.color);

		this.scene.fog.color.copy(uniforms.bottomColor.value);

		var skyGeo = new THREE.SphereGeometry(4000, 32, 24);
		var skyMat = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: uniforms,
      side: THREE.BackSide
    });

		this.sky = new THREE.Mesh(skyGeo, skyMat);
		this.scene.add(this.sky);
  }

  makePapaJohn() {
    this.papaJohnVideo = this.makeVideo(this.videoBase + 'papajohn', false, -10);
    $(this.papaJohnVideo).css('display', 'none');
    this.papaJohnVideo.play();

    this.papaJohnVideoMesh = new VideoMesh({
      video: this.papaJohnVideo
    });
    this.papaJohnVideoMesh.mesh.castShadow = true;
    this.papaJohnVideoMesh.mesh.receiveShadow = true;

    this.papaJohnVideoMesh.moveTo(0, -5, this.papaJohnZ);
    this.papaJohnVideoMesh.rotateTo(0.1, 0, 0);
    this.papaJohnVideoMesh.addTo(this.scene);
  }

}
