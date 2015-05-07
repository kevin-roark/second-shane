
let $ = require('jquery');
let kt = require('kutility');

let spaceBeforeLine = 1000;

// hard-coded offsets of each word in the song from the start
let wordOffsets = [13481,13909, 14300, 18659,21253,22039,25405,25853,26782,27647,29468,32556,33285,34342,36881,38162,39872,40752,43019,43468,43929,47112,47583,48012,48909,49901,50855,54517,55566,58291,59098,61875,62300,62788,64704,65548,66459,68402,69418,72053,72983,73422,73959,78937,79416,80403,80852,88234,88704,90226,91427,91900,93369,95574,96054,97075,97627,98494,102063,102487,102960,106645,107086,108038,108955,109853,110876,114450,116385,117274,118178,121507,121906,123755,124673,125586,126547,127459,128409,131168,132011,132485,133006,138006,138573,139478,139926,147322,147756,149192,150578,150970,152124,154714,155141,156181,156962,158027,161187,161652,162116,166287,169057,169953,173193,173618,174507,175372,177345,180067,181017,181905,184691,185628,187429,188398,190675,191163,191636,194860,195236,195796,196665,197580,198579,202234,203212,205933,206838,209641,210041,210546,212364,213297,214225,216099,217057,219819,220737,221105,221671,226690,227170,228156,228553,235999,236408,237973,239102,239559,240812,243240,243777,244690,245102,246024,249718,250174,250672,254388,254837,255773,256642,257523,258476,262265,264083,264975,265873,269169,269593,271555,272348,273329,274171,275075,276044,278942,279815,280215,280792,285688,286225,287146,287531,294998,295462,296880,298207,298645,299776,302410,302850,303756,304139,305248];

// these are the word-lengths of each line
let lineLengths = [
  3,3,5,7, // verse 1

  3,6,4,8, // verse 2

  4,4,6,5, // chorus

  3,6,4,8, // verse 3

  4,4,6,5, // chorus

  3,3,5,7, // verse 1

  3,6,4,8, // verse 2

  4,4,6,5, // chorus

  3,6,4,8, // verse 3

  4,4,6,5, // chorus
];

var verse1 = [
  "It's", "all", "right",
  "Everything", "is", "fine",
  "You", "live", "the", "perfect", "life",
  "Never", "one", "immoral", "thought", "inside", "your", "mind"
];

var verse2 = [
  "What", "they", "say",
  "Does", "it", "make", "you", "feel", "ashamed?",
  "Isn't", "everyone", "the", "same?",
  "Does", "it", "matter", "that", "it", "wasn't", "your", "idea?"
];

var chorus = [
  "God", "is", "a", "man",
  "You", "know", "for", "certain",
  "The", "knowledge", "in", "and", "of", "itself",
  "Is", "more", "than", "we", "deserve"
];

var verse3 = [
  "So", "you've", "tried",
  "And", "you've", "made", "up", "your", "mind",
  "Something's", "still", "not", "right",
  "The", "devil", "you", "don't", "know", "is", "still", "outside"
];

var allWords = verse1.concat(verse2).concat(chorus).concat(verse3).concat(chorus).concat(verse1).concat(verse2).concat(chorus).concat(verse3).concat(chorus);
var numberOfLines = 32;

export var doKaraoke = (domContainer, marker) => {
  var karaokeDomContainer = karaokeDiv([]);
  domContainer.append(karaokeDomContainer);

  var wordIndex = 0;
  var lineIndex = 0;

  setTimeout(function() {
    doLine();
  }, wordOffsets[wordIndex] - spaceBeforeLine);

  function doLine() {
    console.log('processing line ' + lineIndex);

    processLine(lineIndex, wordIndex, function() {
      console.log('finished with line ' + lineIndex);

      let currentOffset = wordOffsets[wordIndex + lineLengths[lineIndex] - 1];

      wordIndex += lineLengths[lineIndex];
      lineIndex += 1;

      if (lineIndex < numberOfLines) {
        let timeout = wordOffsets[wordIndex] - spaceBeforeLine - currentOffset;
        console.log('time before next line: ' + timeout);
        setTimeout(function() {
          emptyKaraokeDom();
          doLine();
        }, timeout);
      }
      else {
        emptyKaraokeDom();
        karaokeDomContainer.remove();

        marker.bounce({
          x: window.innerWidth / 2 - 25,
          time: 5000
        });
      }
    });
  }

  function processLine(lineIndex, startWordIndex, callback) {
    let lineLength = lineLengths[lineIndex];

    let words = [];
    for (var i = startWordIndex; i < startWordIndex + lineLength; i++) {
      var word = allWords[i];
      words.push(word);
    }
    console.log(words);

    var wordSpans = [];
    for (var w = 0; w < words.length; w++) {
      wordSpans.push(span(words[w] + ' ', 'word-' + i));
    }
    karaokeDomContainer.append($(spanView(wordSpans)));

    var children = karaokeDomContainer.children();

    marker.bounce({
      x: $(children[0]).offset().left,
      time: spaceBeforeLine
    });

    var lastWordOffset;
    let firstWordOffset = wordOffsets[startWordIndex];
    function doTimeoutForWord(index) {
      var offset = wordOffsets[index] - (firstWordOffset - spaceBeforeLine);
      lastWordOffset = offset;
      console.log('timeout for word: ' + index + ' is ' + offset);
      setTimeout(function() {
        let timeUntilNextWord = index === wordOffsets.length - 1 ? 200 : wordOffsets[index + 1] - wordOffsets[index];
        var bounceLength = Math.min(200, timeUntilNextWord);
        activateWord(index - startWordIndex, bounceLength);
        setTimeout(function() {
          let timeRemaining = timeUntilNextWord - bounceLength;
          smallBounce();
          function smallBounce() {
            let dribbleDuration = kt.randInt(100, 300);
            if (timeRemaining >= dribbleDuration) {
              dribble(dribbleDuration, function() {
                timeRemaining -= dribbleDuration;
                smallBounce();
              });
            }
          }
        }, bounceLength);
      }, offset);
    }

    for (var t = startWordIndex; t < startWordIndex + lineLength; t++) {
      doTimeoutForWord(t);
    }

    setTimeout(function() {
      if (callback) {
        callback();
      }
    }, lastWordOffset);

    function activateWord(i, bounceLength, callback) {
      var word = $(children[i]);
      activate(word);

      marker.bounce({
        x: word.offset().left + word.width() / 2  - 35,
        y: 50,
        time: bounceLength
      }, callback);
    }
  }

  function dribble(dur, callback) {
    marker.bounce({
      y: kt.randInt(10, 20),
      time: dur
    }, callback);
  }

  function emptyKaraokeDom() {
    karaokeDomContainer.empty();
  }

  function span(text, id) {
    return '<span id="' + id + '">' + text + '</span>';
  }

  function spanView(spans) {
    var view = '';
    for (var i = 0; i < spans.length; i++) {
      view += spans[i];
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
