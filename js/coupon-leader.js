
var $ = require('jquery');
var moneyMan = require('./new-money');

var $couponError = $('#coupon-error');
var $couponInput = $('#shane-coupon-input');
var $submitCouponButton = $('#shane-coupon-submit-button');
var $themePicker = $('#theme-picker');

var SmallCoupon = 'Get What You Earned';
var LargeCoupon = 'The Money You Paid Will Have An Impact On Shane';
var validCoupons = [SmallCoupon, LargeCoupon];

module.exports.init = function(didFullfillCallback) {
  setupNewCouponHandler(didFullfillCallback);
  activateExistingRewards();
};

module.exports.reset = function() {
  $couponInput.val('');
  setErrorMessage('');
};

function setupNewCouponHandler(didFullfillCallback) {
  $submitCouponButton.click(function() {
    var enteredCoupon = $couponInput.val();
    if (!enteredCoupon.length) {
      // nothing entered
      setErrorMessage('enter a Shane Coupon!');
    }
    else if (validCoupons.indexOf(enteredCoupon) >= 0) {
      // valid coupon entered
      if (hasCouponBeenUsed(enteredCoupon)) {
        setErrorMessage('Nice Try! Shane Coupon Already Used');
      }
      else {
        fulfillCoupon(enteredCoupon);
        module.exports.reset();
        if (didFullfillCallback) {
          didFullfillCallback();
        }
      }
    }
    else {
      // invalid coupon entered
      setErrorMessage('bad Shane Coupon!');
    }
  });
}

function setErrorMessage(message) {
  $couponError.text(message);

  setTimeout(function() {
    $couponError.text('');
  }, 4000);
}

function activateExistingRewards() {
  if (!window.localStorage) {
    return;
  }

  // only persisting behavior reward currently is theme picker from large coupon
  if (hasCouponBeenUsed(LargeCoupon)) {
    activateLargeCouponReward();
  }
}

function activateLargeCouponReward() {
  $themePicker.show();
}

function hasCouponBeenUsed(coupon) {
  if (window.localStorage) {
    return !!(window.localStorage.getItem('_hasUsed' + coupon));
  }

  return false;
}

function setCouponAsUsed(coupon) {
  if (window.localStorage) {
    window.localStorage.setItem('_hasUsed' + coupon, 'true');
  }
}

function fulfillCoupon(coupon) {
  setCouponAsUsed(coupon);
  var message;

  if (coupon === LargeCoupon) {
    moneyMan.addMoney(96000000); // $96,000,000 New Money
    message = 'Injected with $96,000,000 New Money For An OUTSTANDING PLEDGE. SHANE IS ETERNALLY GREATFUL. ' +
              'You have a surprise reward waiting in the site map!';
    activateLargeCouponReward();
  }
  else {
    // for now assume small coupon
    moneyMan.addMoney(4000000); // $4,000,000 New Money
    message = 'Injected with $4,000,000 New Money For A Delightful Shane Pledge. Shane Says Thank You!';
  }

  if (message) {
    moneyMan.setMoneyReason(message, 8666);
  }
}
