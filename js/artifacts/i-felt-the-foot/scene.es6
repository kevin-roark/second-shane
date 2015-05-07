
let THREE = require('three');
let $ = require('jquery');
let kt = require('kutility');

let urls = require('../../urls');
import {Talisman} from '../../talisman.es6';
import {ShaneScene} from '../../shane-scene.es6';
let ShaneMesh = require('../../shane-mesh');

export class iFeltTheFoot extends ShaneScene {

  /// Init

  constructor(renderer, camera, scene, options) {
    super(renderer, camera, scene, options);

    var host = (this.isLive? urls.iFeltTheFoot.live : urls.iFeltTheFoot.web);
    this.videoBase = host + 'video/';
    this.imageBase = host + 'images/';
  }

  createTalisman() {
    let talisman = new Talisman({
      position: new THREE.Vector3(0, 0, -10)
    });
    return talisman;
  }

  /// Shane System

  enter() {
    super.enter();

    this.renderer.setClearColor(0x000000, 0);

    this.marble = this.makeImage(this.imageBase + 'marble.jpg', true, -10);

    this.makeSpotlight();

    this.fountainVelocityMultiplier = 1.0;

    this.doMarbledDigitalFoot();
  }

  doTimedWork() {
    super.doTimedWork();

    this.marbledDigitalFoot.remove();
    this.doMarbledDigitalFoot(4888);

    var endOfItAll = 113.75 * 1000;

    setTimeout(() => {
      this.doFootMassage(12666);
    }, 6666);
    setTimeout(() => {
      this.doRotatingFoot(9666);
    }, 19666);
    setTimeout(() => {
      this.doFootSlap(13666);
    }, 30666);
    setTimeout(() => {
      this.doFootModel(10666);
    }, 45666);
    setTimeout(() => {
      this.doCadFootImage(6666);
    }, 57666);

    let seanOffset = 66666;
    setTimeout(() => {
      this.doSean(endOfItAll - seanOffset);
    }, seanOffset);
    let kevinOffset = seanOffset + 6000;
    setTimeout(() => {
      this.doKevin(endOfItAll - kevinOffset);
    }, kevinOffset);
    let restOfThemOffset = kevinOffset + 5000;
    setTimeout(() => {
      let dur = endOfItAll - restOfThemOffset;
      this.doFootMassage(dur);
      this.doRotatingFoot(dur);
      this.doFootSlap(dur);
      this.doFootModel(dur);
      this.doCadFootImage(dur);

      setTimeout(this.flash.bind(this), 4000);
      setTimeout(this.makeFountain.bind(this), 5666);
    }, restOfThemOffset);

    setTimeout(this.iWantOut.bind(this), endOfItAll);
  }

  exit() {
    super.exit();

    this.renderer.setClearColor(0xffffff, 1);

    this.marble.remove();

    $(this.fountainCanvas).remove();
    this.fountainsActive = false;

    this.scene.remove(this.spotLight);
  }

  update() {
    super.update();

    if (this.footModel && this.footModel.active) {
      this.footModel.rotate(0, 0.02, 0);
      this.footModel.update();
    }

    if (this.cadFootImage) {
      this.cadFootImage.__rotation += 1;
      kt.rotate3dy(this.cadFootImage, this.cadFootImage.__rotation);
    }

    if (this.fountainsActive) {
      this.updateFountain();
    }
  }

  resize() {
    super.resize();
    if (this.fountainCanvas) {
      this.fountainCanvas.width = window.innerWidth;
      this.fountainCanvas.height = window.innerHeight;
    }
  }

  /// Manipulation

  flash() {
    if (!this.active) {
      return;
    }

    let selector = 'video, #cad-foot, #fountain-canvas';

    $(selector).css('opacity', '0');
    this.footModel.mesh.visible = false;
    setTimeout(() => {
      $(selector).css('opacity', '1');
      this.footModel.mesh.visible = true;
      setTimeout(() => {
        this.flash();
      }, kt.randInt(1000, 3666));
    }, kt.randInt(200, 500));
  }

  /// Body Videos

  doRotatingFoot(duration) {
    this.rotatingFoot = this.makeBodyVideo('rotating_foot');

    this.rotatingFoot.style.height = '60%';
    this.rotatingFoot.style.right = '3%';
    this.rotatingFoot.style.bottom = '20%';

    $(this.rotatingFoot).hide();
    this.rotatingFoot.play();
    setTimeout(() => {$(this.rotatingFoot).show();}, 100);

    setTimeout(() => {
      this.removeVideo(this.rotatingFoot);
    }, duration);
  }

  doFootMassage(duration) {
    this.footMassage = this.makeBodyVideo('foot_massage');

    this.footMassage.style.width = '33%';
    this.footMassage.style.left = '3%';
    this.footMassage.style.bottom = '50px';

    this.footMassage.play();

    setTimeout(() => {
      this.removeVideo(this.footMassage);
    }, duration);
  }

  doFootSlap(duration) {
    this.footSlap = this.makeBodyVideo('footslap');

    this.footSlap.style.width = '40%';
    this.footSlap.style.right = '15%';
    this.footSlap.style.top = '6%';

    this.footSlap.play();

    setTimeout(() => {
      this.removeVideo(this.footSlap);
    }, duration);
  }

  doSean(duration) {
    this.sean = this.makeBodyVideo('sean');

    this.sean.style.height = '40%';
    this.sean.style.left = '25%';
    this.sean.style.bottom = '120px';

    this.sean.play();

    kt.rotate($(this.sean), 90);

    setTimeout(() => {
      this.removeVideo(this.sean);
    }, duration);
  }

  doKevin(duration) {
    this.kevin = this.makeBodyVideo('kevin');

    this.kevin.style.width = '30%';
    this.kevin.style.left = '5%';
    this.kevin.style.top = '5%';

    this.kevin.play();

    setTimeout(() => {
      this.removeVideo(this.kevin);
    }, duration);
  }

  makeBodyVideo(name) {
    let vid = this.makeVideo(this.videoBase + name, false, -10);

    $(vid).css('box-shadow', '25px 25px 30px 0px rgba(0, 0, 0, 0.75)');

    return vid;
  }

  removeVideo(video) {
    video.src = '';
    $(video).remove();
  }

  /// Body Models

  doFootModel(duration) {
    this.footModel = new ShaneMesh({
      modelName: '/js/models/foot.json',
      position: new THREE.Vector3(-15, -9, -20)
    });

    this.footModel.addTo(this.scene, () => {
      this.footModel.active = true;
      // human.twitching = true;
      // human.twitchIntensity = 0.015;

      this.spotLight.target = this.footModel.mesh;

      this.footModel.mesh.castShadow = true;
      this.footModel.mesh.receiveShadow = true;

      //this.footModel.setMeshColor(0xff0000);

      setTimeout(() => {
        this.footModel.active = false;
        this.footModel.removeFrom(this.scene);
      }, duration);
    });
  }

  makeSpotlight() {
    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(-10, 200, -20);

    spotLight.castShadow = true;
    spotLight.shadowDarkness = 0.75;

    this.scene.add(spotLight);
    this.spotLight = spotLight;
  }

  /// Body Images

  doCadFootImage(duration) {
    this.cadFootImage = this.makeBodyImage('cad_foot.jpg');
    this.cadFootImage.attr('id', 'cad-foot');

    this.cadFootImage.css('bottom', '5px');
    this.cadFootImage.css('right', '25%');
    this.cadFootImage.css('width', '220px');

    this.cadFootImage.__rotation = 0;

    setTimeout(() => {
      this.cadFootImage.remove();
    }, duration);
  }

  doMarbledDigitalFoot(duration) {
    this.marbledDigitalFoot = this.makeBodyImage('marble_digital_foot.jpg');
    this.marbledDigitalFoot.attr('id', 'marble-digital-foot');

    this.marbledDigitalFoot.css('left', '25%');
    this.marbledDigitalFoot.css('width', '50%');
    this.marbledDigitalFoot.css('top', '15%');

    if (duration) {
      setTimeout(() => {
        this.marbledDigitalFoot.remove();
      }, duration);
    }
  }

  makeBodyImage(name) {
    var image = this.makeImage(this.imageBase + name, false, -10);

    image.css('box-shadow', '25px 25px 30px 0px rgba(0, 0, 0, 0.75)');

    return image;
  }

  /// Fountain (delightfully modified from http://cssdeck.com/labs/html5-canvas-fountain-exploding-particles-with-gravity)

  makeFountain() {
    var self = this;

    this.fountainsActive = true;

    var canvas = this.makeCanvas(-5);
    canvas.id = 'fountain-canvas';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.top = '0px';
    canvas.style.left = '0px';

    this.fountainCanvas = canvas;

  	var ctx = canvas.getContext('2d');
    ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 10;
    ctx.shadowOffsetY = 10;

    var fountainImage = $('<img src="' + this.imageBase + 'fountain_foot.png"></img>').get(0);

  	var imageCount = 21;
  	this.fountainFeet = [];

  	function FountainFoot() {
      this.resetPosition = function() {
        this.x = canvas.width / 2;
        this.y = canvas.height - this.height;
      };

      this.resetVelocities = function() {
        this.vx = (Math.random() * 6 - 3) * self.fountainVelocityMultiplier;

        // vy should be negative initially
        this.vy = (Math.random() * -9 - 3) * self.fountainVelocityMultiplier;
      };

  		this.draw = function() {
        ctx.drawImage(fountainImage, this.x, this.y, this.width, this.height);
  		};

  		this.width = kt.randInt(25, 58);
      this.height = this.width * 0.75;

      this.resetPosition();
      this.resetVelocities();
  	}

  	for (var i = 0; i < imageCount; i++) {
  		this.fountainFeet.push(new FountainFoot());
  	}
  }

  updateFountain() {
    this.fountainVelocityMultiplier += 0.0013;

    var ctx = this.fountainCanvas.getContext('2d');

    ctx.clearRect(0, 0, this.fountainCanvas.width, this.fountainCanvas.height);

    var gravity = 0.5;

    for (var i = 0; i < this.fountainFeet.length; i++) {
      var foot = this.fountainFeet[i];

      foot.vy += gravity;

      foot.x += foot.vx;
      foot.y += foot.vy;

      if (foot.x + foot.width > this.fountainCanvas.width ||
          foot.x - foot.width < 0 ||
          foot.y + foot.height > this.fountainCanvas.height) {

        // we need to re-position the particles on the base :)
        foot.resetPosition();
        foot.resetVelocities();
      }

      foot.draw();
    }
  }

}
