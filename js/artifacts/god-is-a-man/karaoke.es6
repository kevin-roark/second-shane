
let $ = require('jquery');

let defaultLineLength = 8000;
let defaultTimeBetweenLines = 2000;
let defaultTimeBetweenBlocks = 4000;

var verse1 = [
  {text: "It's alright", length: 1},
  {text: "Everything is fine", length: 1},
  {text: "You live the perfect life", length: 1},
  {text: "Never one immoral thought inside your mind", length: 2}
];

var chorusBlock1 = [
  {text: "What they say", length: 1},
  {text: "Does it make you feel ashamed?", length: 1},
  {text: "Isn't everyone the same?", length: 1},
  {text: "Does it matter that it wasn't your idea?", length: 2}
];

var chorusBlock2 = [
  {text: "God is a man", length: 1},
  {text: "You know for certain", length: 1},
  {text: "The knowledge in and of itself", length: 1},
  {text: "Is more than we deserve", length: 1}
];

var verse2 = [
  {text: "So you've tried", length: 1},
  {text: "And you've made up your mind", length: 1},
  {text: "Something's still not right", length: 1},
  {text: "The devil you don't know is still outside", length: 2}
];

export var doKaraoke = (domContainer, marker, endtime) => {
  if (!endtime) {
    endtime = 13 * 60000;
  }

  var karaokeDomContainer = karaokeDiv([]);
  domContainer.append(karaokeDomContainer);

  setTimeout(function() {
    karaokeDomContainer.remove();
  }, endtime);

  processBlock(verse1, function() {
    setTimeout(function() {
      processBlock(chorusBlock1, function() {
        processBlock(chorusBlock2, function() {
          setTimeout(function() {
            processBlock(verse2, function() {
              processBlock(chorusBlock1, function() {
                processBlock(chorusBlock2);
              });
            });
          }, defaultTimeBetweenBlocks);
        });
      });
    }, defaultTimeBetweenBlocks);
  });

  function processBlock(block, callback) {
    doLine(0);

    function doLine(lineIndex) {
      processLine(block[lineIndex], defaultTimeBetweenLines, function() {
        if (lineIndex + 1 < block.length) {
          doLine(lineIndex + 1);
        }
        else {
          if (callback) {
            callback();
          }
        }
      });
    }
  }

  function processLine(line, delayTime, callback) {
    if (!delayTime) delayTime = 0;

    var characters = line.text.split('');
    var charSpans = [];
    for (var i = 0; i < characters.length; i++) {
      charSpans.push(span(characters[i], 'character-' + i));
    }

    emptyKaraokeDom();
    karaokeDomContainer.append($(spanView(charSpans)));
    karaokeDomContainer.css('opacity', '0');

    var children = karaokeDomContainer.children();
    var lineLength = defaultLineLength * line.length;
    var letterLength = lineLength / children.length;

    marker.bounce({
      x: $(children[0]).offset().left,
      time: delayTime
    });

    setTimeout(function() {
      karaokeDomContainer.css('opacity', '1');
      activateLetter(0);
    }, letterLength + delayTime);

    function activateLetter(i) {
      var letter = $(children[i]);
      activate(letter);

      marker.bounce({
        x: letter.offset().left + letter.width() / 2,
        y: 50,
        time: letterLength
      });

      if (i + 1 < children.length) {
        setTimeout(function() {
          activateLetter(i + 1);
        }, letterLength);
      }
      else {
        setTimeout(function() {
          emptyKaraokeDom();
          if (callback) {
            callback();
          }
        }, letterLength);
      }
    }
  }

  function emptyKaraokeDom() {
    karaokeDomContainer.empty();
  }

  function span(text, id) {
    return '<span id="' + id + '">' + text + '</span>';
  }

  function spanView(charSpans) {
    var view = '';
    for (var i = 0; i < charSpans.length; i++) {
      view += charSpans[i];
    }
    return view;
  }

  function karaokeDiv(charSpans) {
    var view = spanView(charSpans);

    var div = $('<div>' + view + '</div>');
    div.css('position', 'absolute');
    div.css('bottom', '20px');
    div.css('left', '0px');
    div.css('width', '100%');
    div.css('text-align', 'center');
    div.css('color', 'white');
    div.css('font-size', '72px');
    div.css('z-index', '1000000');

    return div;
  }

  function activate(span) {
    span.css('color', '#fdd700');
  }

};
