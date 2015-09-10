
let $ = require('jquery');

export var chatter = ($container, lines, options, callback) => {
  if (!options) options = {};
  if (!Array.isArray(lines)) lines = [lines];

  let blinkingCursorDelay = options.blinkingCursorDelay || 400;
  let initialDelay = options.initialDelay || 1000;
  let postHumousDelay = options.postHumousDelay || 1000;

  let $subContainer = $('<span></span>');
  $container.append($subContainer);

  let cursor = createCursor($container);
  let blinkingCursorInterval = setInterval(() => {
    cursor.toggle();
  }, blinkingCursorDelay);

  let clear = () => {
    if (callback) {
      callback();
    }
    clearInterval(blinkingCursorInterval);
    cursor.remove();
  };

  let processLines = () => {
    let currentIndex = 0;
    let processLine = () => {
      processText($subContainer, lines[currentIndex], options, () => {
        if (++currentIndex < lines.length) {
          setTimeout(processLine, initialDelay);
        } else {
          setTimeout(clear, postHumousDelay);
        }
      });
    };
    processLine();
  };

  setTimeout(processLines, initialDelay);
};

var processText = ($container, text, options, callback) => {
  let delayBetweenLetters = options.delayBetweenLetters || 60;
  let delayBetweenWords = options.delayBetweenWords || 100;

  var refreshText = (freshText, delay) => {
    setTimeout(() => {
      $container.text(freshText);
    }, delay);
  };

  let accumulatedDelay = 0;
  let accumulatedText = '';
  for (let i = 0; i < text.length; i++) {
    let letter = text.charAt(i);
    accumulatedText += letter;

    refreshText(accumulatedText, accumulatedDelay);

    accumulatedDelay += (letter === ' ')? delayBetweenWords : delayBetweenLetters;
  }

  setTimeout(callback, accumulatedDelay);
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
