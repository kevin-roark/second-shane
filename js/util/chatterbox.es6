
let $ = require('jquery');

export var chatter = ($container, text, options) => {
  if (!options) options = {};
  let delayBetweenLetters = options.delayBetweenLetters || 200;
  let delayBetweenWords = options.delayBetweenWords || 300;
  let blinkingCursorDelay = options.blinkingCursorDelay || 400;
  let initialDelay = options.initialDelay || 500;
  let postHumousDelay = options.postHumousDelay || 500;

  let $subContainer = $('<span></span>');
  $container.append($subContainer);

  let cursor = createCursor($container);
  let blinkingCursorInterval = setInterval(() => {
    cursor.toggle();
  }, blinkingCursorDelay);

  var refreshText = (freshText, delay) => {
    setTimeout(() => {
      $subContainer.text(freshText);
    }, delay);
  };

  let accumulatedDelay = initialDelay;
  let accumulatedText = '';
  for (let i = 0; i < text.length; i++) {
    let letter = text.charAt(i);
    accumulatedText += letter;

    refreshText(accumulatedText, accumulatedDelay);

    accumulatedDelay += (letter === ' ')? delayBetweenWords : delayBetweenLetters;
  }

  setTimeout(() => {
    clearInterval(blinkingCursorInterval);
    cursor.remove();
  }, accumulatedDelay + postHumousDelay);
};

var createCursor = ($container) => {
  let cursor = $('<span></span>');
  cursor.css('display', 'inline-block');
  cursor.css('width', '2px');
  cursor.css('margin-left', '6px');
  cursor.css('height', '12px');
  cursor.css('background-color', $container.css('color') || 'white');
  $container.append(cursor);
  return cursor;
};
