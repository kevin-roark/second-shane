
export var chatter = ($container, text, options) => {
  let delayBetweenLetters = options.delayBetweenLetters || 100;
  let delayBetweenWords = options.delayBetweenWords || 400;

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
};
