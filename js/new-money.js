
var $ = require('jquery');
var Odometer = require('odometer');

var odometer;
var $moneyZone = $('#new-money-zone');
var $moneyCount = $('#new-money-count');
var $moneyReason = $('#new-money-reason');

var _myMoneyCount = 0; // fallback for those of us without window.localStorage

module.exports.init = function() {
  $moneyZone.show();

  var money = getMoney();

  odometer = new Odometer({
    el: $moneyCount.get(0),
    value: money,
    theme: 'default',
    duration: 1500
  });

  setMoney(money);
};

module.exports.addMoney = function(increment) {
  var money = getMoney();
  setMoney(money + increment);
};

module.exports.setMoneyReason = function(moneyReason, duration, callback) {
  if (!duration) {
    duration = 3333;
  }

  $moneyReason.hide();
  $moneyReason.text(moneyReason);
  $moneyReason.fadeIn(400, function() {
    setTimeout(function() {
      $moneyReason.fadeOut(400, function() {
        if (callback) {
          callback();
        }
      });
    }, duration);
  });
};

module.exports.drain = function() {
  setMoney(0);
};

module.exports.show = function() {
  $moneyZone.show();
};

module.exports.hide = function() {
  $moneyZone.hide();
};

module.exports.setBackground = function(color) {
  if (!color) {
    $moneyZone.css('background-color', 'transparent');
  }
  else {
    $moneyZone.css('background-color', color);
  }
};

function getMoney() {
  if (window.localStorage) {
    var money = parseInt(window.localStorage.getItem('myNewMoney'));
    if (!money) {
      money = 0;
      setMoney(money);
    }
    return money;
  }
  else {
    return _myMoneyCount;
  }
}

function setMoney(money) {
  if (window.localStorage) {
    window.localStorage.setItem('myNewMoney', money);
  }
  else {
    _myMoneyCount = money;
  }

  if (odometer) {
    odometer.update(money);
  }
}
