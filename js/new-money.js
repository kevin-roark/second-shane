
var $ = require('jquery');
var Odometer = require('odometer');

var odometer;
var $moneyCount = $('#new-money-count');

var _myMoneyCount = 0; // fallback for those of us without window.localStorage

module.exports.init = function() {
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

module.exports.drain = function() {
  setMoney(0);
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

  odometer.update(money);
}
