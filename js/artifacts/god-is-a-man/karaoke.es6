
let $ = require('jquery');
let kt = require('kutility');

let spaceBeforeLine = 1000;

// hard-coded offsets of each word in the song from the start
let wordOffsets = [13481,13909, 14300, 18659,21253,22039,25405,25853,26782,27647,29468,32556,33285,34342,36881,38162,39872,40752,43019,43468,43929,47112,47583,48012,48909,49901,50855,54517,55566,58291,59098,61875,62300,62788,64704,65548,66459,68402,69418,72053,72983,73422,73959,78937,79416,80403,80852,88234,88704,90226,91427,91900,93369,95574,96054,97075,97627,98494,102063,102487,102960,106645,107086,108038,108955,109853,110876,114450,116385,117274,118178,121507,121906,123755,124673,125586,126547,127459,128409,131168,132011,132485,133006,138006,138573,139478,139926,147322,147756,149192,150578,150970,152124,154714,155141,156181,156962,158027,161187,161652,162116,166287,169057,169953,173193,173618,174507,175372,177345,180067,181017,181905,184691,185628,187429,188398,190675,191163,191636,194860,195236,195796,196665,197580,198579,202234,203212,205933,206838,209641,210041,210546,212364,213297,214225,216099,217057,219819,220737,221105,221671,226690,227170,228156,228553,235999,236408,237973,239102,239559,240812,243240,243777,244690,245102,246024,249718,250174,250672,254388,254837,255773,256642,257523,258476,262265,264083,264975,265873,269169,269593,271555,272348,273329,274171,275075,276044,278942,279815,280215,280792,285688,286225,287146,287531,294998,295462,296880,298207,298645,299776,302410,302850,303756,304139,305248];

// new timed offsets
wordOffsets = [13619,14017,14450,18733,21284,22150,25711,26144,27050,28013,29802,32529,33427,34478,36989,38039,39942,40862,43233,43666,44115,47235,47677,48238,49144,50051,51150,54712,55694,58295,59226,62030,62431,62992,64792,65666,66628,68495,69440,72162,73133,73582,74087,79119,79572,80480,80919,88322,88796,90328,91715,92072,93540,95757,96203,97268,97614,98728,102217,102658,103132,106826,107234,108224,109107,110101,111024,114668,116468,117423,118376,121548,121997,123841,124784,125786,126675,127559,128525,131290,132240,132657,133139,138203,138670,139614,140055,147438,147901,149341,150519,151137,152285,154796,155261,156327,156877,157694,161339,161789,162309,166404,169184,170098,173294,173759,174649,175515,177573,180264,181223,182057,184840,185738,187631,188594,190876,191335,191784,195054,195431,195951,196830,197760,198739,202449,203443,206084,207103,209784,210225,210658,212525,213450,214349,216249,217136,219948,220902,221292,221821,226787,227325,228231,228656,236068,236549,237980,239392,239753,240627,243463,243946,244836,245260,246243,250002,250419,250907,254586,255051,256036,256839,257783,258719,262365,264289,265107,266089,269310,269780,271650,272555,273476,274395,275301,276224,279037,279959,280360,280897,285985,286442,287372,287813,295236,295668,296960,297874,298849,299803,302520,303039,303898,304371,305398];

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

var numberOfLines = 40;

export var doKaraoke = (domContainer, marker) => {
  var karaokeDomContainer = karaokeDiv([]);
  domContainer.append(karaokeDomContainer);

  var wordIndex = 0;
  var lineIndex = 0;

  setTimeout(function() {
    doLine();
  }, wordOffsets[wordIndex] - spaceBeforeLine);

  function doLine() {
    processLine(lineIndex, wordIndex, function() {

      let currentOffset = wordOffsets[wordIndex + lineLengths[lineIndex] - 1];

      wordIndex += lineLengths[lineIndex];
      lineIndex += 1;

      if (lineIndex < numberOfLines) {
        let timeout = wordOffsets[wordIndex] - spaceBeforeLine - currentOffset;
        setTimeout(function() {
          emptyKaraokeDom();
          doLine();
        }, timeout);
      }
      else {
        setTimeout(function() {
          emptyKaraokeDom();
          karaokeDomContainer.remove();

          marker.bounce({
            x: window.innerWidth / 2 - 25,
            time: 5000
          });
        }, 2000);
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
