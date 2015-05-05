
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
      position: new THREE.Vector3(-15, 0, -10)
    });
    return talisman;
  }

  /// Shane System

  enter() {
    super.enter();

    this.renderer.setClearColor(0x000000, 0);

    this.marble = this.makeImage(this.imageBase + 'marble.jpg', true, -10);

    this.makeSpotlight();

    this.doMarbledDigitalFoot(4888);

    var endOfItAll = 121000;

    setTimeout(() => {
      this.doFootMassage(12666);
    }, 6666);
    setTimeout(() => {
      this.doRotatingFoot(12666);
    }, 20666);
    setTimeout(() => {
      this.doFootSlap(11666);
    }, 34666);
    setTimeout(() => {
      this.doFootModel(15666);
    }, 46666);
    setTimeout(() => {
      this.doCadFootImage(12666);
    }, 62666);

    let seanOffset = 77666;
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
    }, restOfThemOffset);

    setTimeout(this.iWantOut.bind(this), endOfItAll);
  }

  exit() {
    super.exit();

    this.renderer.setClearColor(0xffffff, 1);

    this.marble.remove();

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
  }

  /// Manipulation

  flash() {
    if (!this.active) {
      return;
    }

    let selector = 'video, #cad-foot';

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

    $(vid).css('box-shadow', '12px 12px 30px 16px rgba(0, 0, 0, 0.75)');

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

    setTimeout(() => {
      this.marbledDigitalFoot.remove();
    }, duration);
  }

  makeBodyImage(name) {
    var image = this.makeImage(this.imageBase + name, false, -10);

    image.css('box-shadow', '12px 12px 30px 16px rgba(0, 0, 0, 0.75)');

    return image;
  }

}
