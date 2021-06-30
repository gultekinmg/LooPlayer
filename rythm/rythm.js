;(function(global, factory) { typeof exports === 'object' && typeof module !== 'undefined'
    ? (module.exports = factory())  : typeof define === 'function' && define.amd  ? define(factory)  : (global.Rythm = factory());
})
(this, function() {'use strict'
  var classCallCheck = function(instance, Constructor) {
		if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function');}}
  var createClass = (function() {/// for Dancer
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false
        descriptor.configurable = true
        if ('value' in descriptor) descriptor.writable = true
        Object.defineProperty(target, descriptor.key, descriptor)
      }
    }
		var fking =function(Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps)
      if (staticProps) defineProperties(Constructor, staticProps)
      return Constructor;};
		wtf(5,['fking',fking]);
    return fking;
  })()
//
  var Analyser = function Analyser() {var here = this; classCallCheck(this, Analyser);
    this.initialise = function(analyser) {here.analyser = analyser; here.analyser.fftSize = 2048;}
    this.reset = function() {  here.hzHistory = [];  here.frequences = new Uint8Array(here.analyser.frequencyBinCount);}
    this.analyse = function() {  here.analyser.getByteFrequencyData(here.frequences)
      for (var i = 0; i < here.frequences.length; i++) {
        if (!here.hzHistory[i]) { here.hzHistory[i] = []; }
        if (here.hzHistory[i].length > here.maxValueHistory) { here.hzHistory[i].shift();}
        here.hzHistory[i].push(here.frequences[i])
      }
    }
    this.getRangeAverageRatio = function(startingValue, nbValue) { var total = 0;
      for (var i = startingValue; i < nbValue + startingValue; i++) { total += here.getFrequenceRatio(i); }
      return total / nbValue
    }
    this.getFrequenceRatio = function(index) { var min = 255;  var max = 0;
      here.hzHistory[index].forEach(function(value) { if (value < min) { min = value; }; if (value > max) {max = value;}})
      var scale = max - min
      var actualValue = here.frequences[index] - min
      var percentage = scale === 0 ? 0 : actualValue / scale
      return here.startingScale + here.pulseRatio * percentage
    }
    this.startingScale = 0; this.pulseRatio = 1; this.maxValueHistory = 100; this.hzHistory = [];
  }
  var Analyser$1 = ACnod_analyser; //new Analyser()
  var Player = function Player(forceAudioContext) {var here = this; classCallCheck(this, Player);
    this.createSourceFromAudioElement = function(audioElement) {
      audioElement.setAttribute( 'rythm-connected', here.connectedSources.length)
      var source = ACnod_source; wtf(4,['Rysource',source,]);
      here.connectedSources.push(source);
      return source
    }
    this.connectSource = function(source) {
      source.connect(here.gain)
      here.gain.connect(Analyser$1.analyser)
      if (here.currentInputType !== here.inputTypeList['STREAM']) { Analyser$1.analyser.connect(AC.destination);
        here.audio.addEventListener('ended', here.stop);} else { Analyser$1.analyser.disconnect();}
    }
    this.setMusic = function(trackUrl) { here.audio = new Audio(trackUrl); here.currentInputType = here.inputTypeList['TRACK'];
      here.source = here.createSourceFromAudioElement(here.audio); here.connectSource(here.source)
    }
    this.setGain = function(value) { here.gain.gain.value = value }
    this.plugMicrophone = function() {
      return here.getMicrophoneStream().then(function(stream) {
        here.audio = stream
        here.currentInputType = here.inputTypeList['STREAM']
        here.source = AC.createMediaStreamSource(stream)
        here.connectSource(here.source)
      })
    }
    this.getMicrophoneStream = function() { navigator.getUserMedia =  navigator.getUserMedia ||  navigator.webkitGetUserMedia ||  navigator.mozGetUserMedia ||  navigator.msGetUserMedia;
      return new Promise(function(resolve, reject) {navigator.getUserMedia({ audio: true },  function(medias) {return resolve(medias)},  function(error) {return reject(error)})})
    }
    this.start = function() {
      if (here.currentInputType === here.inputTypeList['TRACK']) {
        if (AC.state === 'suspended') {AC.resume().then(function() {return here.audio.play();})
				} else {here.audio.play();}
      }
    }
    this.stop = function() {
      if (here.currentInputType === here.inputTypeList['TRACK']) {here.audio.pause();
      } else if (here.currentInputType === here.inputTypeList['STREAM']) {here.audio.getAudioTracks()[0].enabled = false;}
    }
		//this.browserAudioCtx = window.AudioContext || window.webkitAudioContext
		//this.audioCtx = forceAudioContext || AC; //new this.browserAudioCtx()
    this.connectedSources = [];
    //Analyser$1.initialise(AC.createAnalyser());
    this.gain = ACnod_gain;//AC.createGain();
    this.source = {};
    this.audio = {};
    this.hzHistory = [];
    this.inputTypeList = {TRACK: 0,STREAM: 1,EXTERNAL: 2,}
  }
	//full
  var pulse = function(elem, value) {var options =  arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var max = !isNaN(options.max) ? options.max : 1.25,  min = !isNaN(options.min) ? options.min : 0.75
    var scale = (max - min) * value;  elem.style.transform = 'scale(' + (min + scale) + ') translateZ(0)'
  }
  var shake = function(elem, value) {var options =  arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var max = !isNaN(options.max) ? options.max : 15,  min = !isNaN(options.min) ? options.min : -15
    if (options.direction === 'left') {
      max = -max
      min = -min
    }
    var twist = (max - min) * value;  elem.style.transform = 'translate3d(' + (min + twist) + 'px, 0, 0)';
  }
  var jump = function(elem, value) {var options =  arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var max = !isNaN(options.max) ? options.max : 30,  min = !isNaN(options.min) ? options.min : 0
    var jump = (max - min) * value;  elem.style.transform = 'translate3d(0, ' + -jump + 'px, 0)'
  }
  var twist = function(elem, value) {var options =  arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var max = !isNaN(options.max) ? options.max : 20,  min = !isNaN(options.min) ? options.min : -20
    if (options.direction === 'left') {
      max = -max
      min = -min
    }
    var twist = (max - min) * value;  elem.style.transform = 'rotate(' + (min + twist) + 'deg) translateZ(0)'
  }
  var swing = function(elem, value) {var options =  arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var radius = !isNaN(options.radius) ? options.radius : 20
    var direction = Object.keys(coefficientMap).includes(options.direction)
      ? options.direction
      : 'right'
    var curve = Object.keys(coefficientMap).includes(options.curve)
      ? options.curve
      : 'down'
    var _ref = [coefficientMap[direction], coefficientMap[curve]],
      xCoefficient = _ref[0], yCoefficient = _ref[1]
    elem.style.transform =
      'translate3d(' +
      xCoefficient * radius * Math.cos(value * Math.PI) +
      'px, ' +
      yCoefficient * radius * Math.sin(value * Math.PI) +
      'px, 0)'
  }
  var neon = function(elem, value) {var options =  arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var from = options.from || [0, 0, 0]
    var to = options.to || [255, 255, 255]
    var scaleR = (to[0] - from[0]) * value
    var scaleG = (to[1] - from[1]) * value
    var scaleB = (to[2] - from[2]) * value
    elem.style.boxShadow =
      '0 0 1em rgb(' +
      Math.floor(to[0] - scaleR) +
      ', ' +
      Math.floor(to[1] - scaleG) +
      ', ' +
      Math.floor(to[2] - scaleB) +
      ')'
  }
  var tilt = function(elem, value) {var options =  arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var max = !isNaN(options.max) ? options.max : 25,  min = !isNaN(options.min) ? options.min : 20
    var rotate3d = (max - min) * value
    if (options.reverse) {rotate3d = max - rotate3d;}
    elem.style.transform = 'matrix(1, ' + Math.sin(rotate3d) + ', 0, 1 , 0 ,0)';
  }
	var reset = function reset(elem) { elem.style.transform = '';}
	//opacity
  var vanish = function(elem, value) {var options =  arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var max = !isNaN(options.max) ? options.max : 1,  min = !isNaN(options.max) ? options.max : 0
    var vanish = (max - min) * value
    if (options.reverse) {
      elem.style.opacity = max - vanish
    } else {
      elem.style.opacity = min + vanish
    }
  }
  var reset$4 = function reset(elem) {elem.style.opacity = '';}
	//backgroundColor
  var color = function(elem, value) {var options =  arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var from = options.from || [0, 0, 0]
    var to = options.to || [255, 255, 255]
    var scaleR = (to[0] - from[0]) * value
    var scaleG = (to[1] - from[1]) * value
    var scaleB = (to[2] - from[2]) * value
    elem.style.backgroundColor =
      'rgb(' +
      Math.floor(to[0] - scaleR) +
      ', ' +
      Math.floor(to[1] - scaleG) +
      ', ' +
      Math.floor(to[2] - scaleB) +
      ')'
  }
  var reset$6 = function reset(elem) { elem.style.backgroundColor = '';}
  var borderWidth = function(elem, value) {var options =  arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var max = !isNaN(options.max) ? options.max : 5,  min = !isNaN(options.min) ? options.min : 0
    var borderWidth = (max - min) * value + min;  elem.style.borderWidth = borderWidth + 'px'
  }
	//border
  var reset$13 = function reset(elem) {elem.style.borderWidth = '';}
  var radius = function(elem, value) {var options =  arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var max = !isNaN(options.max) ? options.max : 25,  min = !isNaN(options.min) ? options.min : 0
    var borderRadius = (max - min) * value
    if (options.reverse) {
      borderRadius = max - borderRadius
    } else {
      borderRadius = min + borderRadius
    }
    elem.style.borderRadius = borderRadius + 'px'
  }
  var reset$7 = function reset(elem) { elem.style.borderRadius = '';}
  var borderColor = function(elem, value) {var options =  arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var from = options.from || [0, 0, 0]
    var to = options.to || [255, 255, 255]
    var scaleR = (to[0] - from[0]) * value
    var scaleG = (to[1] - from[1]) * value
    var scaleB = (to[2] - from[2]) * value
    elem.style.borderColor =
      'rgb(' +
      Math.floor(to[0] - scaleR) +
      ', ' +
      Math.floor(to[1] - scaleG) +
      ', ' +
      Math.floor(to[2] - scaleB) +
      ')'
  }
  var reset$5 = function reset(elem) {elem.style.borderColor = '';}
	//filter
  var blur = function(elem, value) {var options =  arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var max = !isNaN(options.max) ? options.max : 8,  min = !isNaN(options.min) ? options.min : 0
    var blur = (max - min) * value
    if (options.reverse) {
      blur = max - blur
    } else {
      blur = min + blur
    }
    elem.style.filter = 'blur(' + blur + 'px)'
  }
  var reset$8 = function reset(elem) {elem.style.filter = '';}
	//boxShadow
  var coefficientMap = {
    up: -1,
    down: 1,
    left: 1,
    right: -1,
  }
  var reset$10 = function reset(elem) { elem.style.boxShadow = '';}
	//font
  var kern = function(elem, value) {var options =  arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var max = !isNaN(options.max) ? options.max : 25,  min = !isNaN(options.min) ? options.min : 0
    var kern = (max - min) * value
    if (options.reverse) {
      kern = max - kern
    } else {
      kern = min + kern
    }
    elem.style.letterSpacing = kern + 'px'
  }
  var reset$11 = function reset(elem) {elem.style.letterSpacing = '';}
  var fontSize = function(elem, value) {var options =  arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var max = !isNaN(options.max) ? options.max : 0.8,  min = !isNaN(options.min) ? options.min : 1.2
    var fontSize = (max - min) * value + min;  elem.style.fontSize = fontSize + 'em'
  }
  var reset$12 = function reset(elem) {elem.style.fontSize = '1em';}
  var fontColor = function(elem, value) {var options =  arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var from = options.from || [0, 0, 0]
    var to = options.to || [255, 255, 255]
    var scaleR = (to[0] - from[0]) * value
    var scaleG = (to[1] - from[1]) * value
    var scaleB = (to[2] - from[2]) * value
    elem.style.color =
      'rgb(' +
      Math.floor(to[0] - scaleR) +
      ', ' +
      Math.floor(to[1] - scaleG) +
      ', ' +
      Math.floor(to[2] - scaleB) +
      ')'
  }
  var reset$15 = function reset(elem) {elem.style.color = '';}
//
  var Dancer = (function() {
    function Dancer() {
      classCallCheck(this, Dancer)
      this.resets = {}
      this.dances = {}
      this.registerDance('size', pulse, reset)
      this.registerDance('pulse', pulse, reset)
      this.registerDance('shake', shake, reset)
      this.registerDance('jump', jump, reset)
      this.registerDance('twist', twist, reset)
      this.registerDance('swing', swing, reset)
      this.registerDance('tilt', tilt, reset)
      this.registerDance('vanish', vanish, reset$4)
      this.registerDance('color', color, reset$6)
      this.registerDance('borderColor', borderColor, reset$5)
      this.registerDance('radius', radius, reset$7)
      this.registerDance('blur', blur, reset$8)
      this.registerDance('neon', neon, reset$10)
      this.registerDance('kern', kern, reset$11)
      this.registerDance('borderWidth', borderWidth, reset$13)
      this.registerDance('fontSize', fontSize, reset$12)
      this.registerDance('fontColor', fontColor, reset$15)
    }
    createClass(Dancer, [ 
			{ key: 'registerDance',
        value: function registerDance(type, dance) {
          var reset$$1 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function() {};
          this.dances[type] = dance
          this.resets[type] = reset$$1
        },
      },
      { key: 'dance',
        value: function dance(type, className, ratio, options) {
          var dance = type
          if (typeof type === 'string') {dance = this.dances[type] || this.dances['pulse']}//In case of a built in dance
					else {dance = type.dance}//In case of a custom dance
          var elements = document.getElementsByClassName(className)
          Array.from(elements).forEach(function(elem) {return dance(elem, ratio, options)})
        },
      },
      { key: 'reset',
        value: function reset$$1(type, className) {
          var reset$$1 = type
          if (typeof type === 'string') {reset$$1 = this.resets[type] || this.resets['pulse']} //In case of a built in dance
					else {reset$$1 = type.reset} //In case of a custom dance
          var elements = document.getElementsByClassName(className)
          Array.from(elements).forEach(function(elem) {return reset$$1(elem)})
        },
      },
    ])
    return Dancer
  })()
  var dancer = new Dancer();
	
  var Visualizer = function Rythm(forceAudioContext) { var here = this; classCallCheck(this, Rythm);
    this.setMusic = function(url) {return here.player.setMusic(url);}
    this.plugMicrophone = function() {return here.player.plugMicrophone();}
    this.setGain = function(value) {return here.player.setGain(value);  }
    this.connectSource = function(source) {return here.player.connectSource(source);}
    this.addRythm = function(elementClass, type, startValue, nbValue, options) {
			here.rythms.push({  elementClass: elementClass,  type: type,  startValue: startValue,  nbValue: nbValue,  options: options,});}
    this.start = function() {here.stopped = false;here.player.start();here.analyser.reset();here.renderRythm();}
    this.renderRythm = function() {if (here.stopped) return;
      here.analyser.analyse()
      here.rythms.forEach(function(mappingItem) {
        var type = mappingItem.type,
          elementClass = mappingItem.elementClass,
          nbValue = mappingItem.nbValue,
          startValue = mappingItem.startValue,
          options = mappingItem.options;
        here.dancer.dance( type, elementClass, here.analyser.getRangeAverageRatio(startValue, nbValue), options)
      })
      here.animation = animate(here.renderRythm)
    }
    this.resetRythm = function() {
      here.rythms.forEach(function(mappingItem) {
        var type = mappingItem.type,
          elementClass = mappingItem.elementClass,
          nbValue = mappingItem.nbValue,
          startValue = mappingItem.startValue,
          options = mappingItem.options
        here.dancer.reset(type, elementClass)
      })
    }
    this.stop = function(freeze) { here.stopped = true;  here.player.stop()
      if (here.animation) cancelAnimationFrame(here.animation);
      if (!freeze) here.resetRythm();
    }
    this.player = new Player(forceAudioContext)
    this.analyser = Analyser$1
    //this.maxValueHistory = Analyser$1.maxValueHistory
    this.dancer = dancer
    this.rythms = []
    this.addRythm('rythm-bass', 'pulse', 0, 10)
    this.addRythm('rythm-medium', 'pulse', 150, 40)
    this.addRythm('rythm-high', 'pulse', 400, 200)
    this.addRythm('blur1', 'BLUR', 0, 10);
    this.addRythm('blur2', 'BLUR', 0, 10, { reverse: true }); this.addRythm('blur3', 'BLUR', 0, 10, { max: 16 });
    this.addRythm('borderWidth1', 'borderWidth', 0, 2);
    this.addRythm('borderWidth2', 'borderWidth', 0, 2, { min: 1, max: 99 });
    this.addRythm('borderWidth3', 'borderWidth', 150, 40, { min: 0.1, max: 299});
    this.addRythm('borderColor1', 'borderColor', 0, 10);
    this.addRythm('borderColor2', 'borderColor', 0, 10, {from: [0, 0, 255],to: [255, 0, 255],}); 
    this.addRythm('borderColor3', 'borderColor', 0, 10, {from: [255, 255, 0],to: [255, 0, 0],});
    this.addRythm('color1', 'color', 0, 10);
    this.addRythm('color2', 'color', 0, 10, {    from: [0, 255, 255],  to: [255, 0, 255],});  
    this.addRythm('color3', 'color', 0, 10, {    from: [255, 255, 0],  to: [255, 0, 0],});
    this.addRythm('color4', 'color', 0, 10, {    from: [200, 200, 200],  to: [80, 80, 80],});  
    this.addRythm('fontColor1', 'fontColor', 0, 10);  
    this.addRythm('fontColor2', 'fontColor', 0, 10, { from: [0, 0, 0], to: [255, 255, 255],  });
    this.addRythm('fontColor2', 'fontColor', 0, 2, { from: [255, 255, 255],  to:  [0, 0, 0],});
    this.addRythm('fontSize1', 'fontSize', 0, 2);
    this.addRythm('fontSize2', 'fontSize', 0, 10, { min: 0.1, max: 4 });
    this.addRythm('fontSize3', 'fontSize', 150, 2, { min: 0.3, max: 99 });
    this.addRythm('jump1', 'jump', 0, 10);  
    this.addRythm('jump2', 'jump', 150, 40, { min: -20, max: 20 });
    this.addRythm('jump3', 'jump', 500, 0, { min: -200, max: 400 });
    this.addRythm('kern1', 'kern', 0, 10, { min: -5, max: 5 });
    this.addRythm('kern2', 'kern', 0, 10, { min: -5, max: 55, reverse: true });
    this.addRythm('neon1', 'neon', 0, 10);
    this.addRythm('neon2', 'neon', 0, 10, { from: [0, 0, 255], to: [255, 0, 255],  });
    this.addRythm('neon3', 'neon', 150, 10, { from: [255, 255, 0], to: [255, 0, 0], width:22, });
    this.addRythm('neon4', 'neon', 500, 100, { from: [255, 255, 0], to: [255, 0, 0], width:99, });
    this.addRythm('pulse1', 'pulse', 0, 10);  
    this.addRythm('pulse2', 'pulse', 0, 10, { min: 0.1, max: 9 });  this.addRythm('pulse3', 'pulse', 150, 40, { min: 0.5, max: 2 });
    this.addRythm('radius1', 'radius', 0, 10, { min: 0, max: 30 }); this.addRythm('radius2', 'radius', 0, 10, { reverse: true, min: 0, max: 30 });
    this.addRythm('shake1', 'shake', 0, 10);
    this.addRythm('shake2', 'shake', 150, 40, { min: -20, max: 20 }); this.addRythm('shake3', 'shake', 0, 10, { direction: 'left' });
    this.addRythm('swing1', 'swing', 0, 10);
    this.addRythm('swing2', 'swing', 0, 10, { curve: 'up' }); this.addRythm('swing3', 'swing', 0, 10, { direction: 'left' });
    this.addRythm('swing4', 'swing', 0, 10, { radius: 10 });
    this.addRythm('tilt1', 'tilt', 0, 10);  this.addRythm('tilt2', 'tilt', 0, 10, { reverse: true });
    this.addRythm('twist1', 'twist', 0, 10);
    this.addRythm('twist2', 'twist', 0, 10, { min: -120, max: 180 }); this.addRythm('twist3', 'twist', 0, 10, { direction: 'left' });
    this.addRythm('vanish1', 'vanish', 0, 10); this.addRythm('vanish2', 'vanish', 0, 10, { reverse: true });
	//
    this.animation = void 0
  }
  return Visualizer
})

var rythm=new Rythm(); 	var audio=document.getElementById('audioPLAYER'); var quoInterval, pompInterval ;
//
function showRythm(){
		$('.particles').classList.toggle('hidden');//Examples: bass 0-10 ; medium 150-40 ; high 500-100
		if($('.particles').classList.contains("hidden")){ clearInterval(quoInterval); clearInterval(pompInterval);}
		else {
			WAVES() ;
			quoInterval=setInterval(LETSQUOTE(), 10000);
			pompInterval=setInterval( rotate, 1000/30 );
		}
}
function onMicClick () {
	if (rythm.stopped === false) { $('miCON').style.color ='blue';  rythm.stop();return }
	rythm.plugMicrophone().then(function(){$('miCON').style.color ='red';  showRythm();})
}
function RythmOnStartClick () { if (rythm.stopped === false)return;
	//to use your audio element console.log(AUDIOTRACK,AUDIOTRACK.src);
	wtf(5,DOM.AUDIOPLAYER.src);
	rythm.setMusic(DOM.AUDIOPLAYER.src);
	rythm.setGain(1);
	rythm.start();
}
function RythmOffStopClick () { if (rythm.stopped === false) rythm.stop(); }//document.getElementById('element').addEventListener('click', RythmOnStartClick)
//
var Plot = function ( stage ) {
	this.setDimensions = function( x, y ) {  this.elm.style.width = x + 'px';  this.elm.style.height = y + 'px';  this.width = x;  this.height = y;};
	this.position = function( x, y ) {  var xoffset = arguments[2] ? 0 : this.width / 2;  var yoffset = arguments[2] ? 0 : this.height / 2; this.elm.style.left = (x - xoffset) + 'px';  this.elm.style.top = (y - yoffset) + 'px';  this.x = x;  this.y = y;};
	this.setBackground = function( col ) {  this.elm.style.background = col;};
	this.kill = function() {  stage.removeChild( this.elm );};
	this.rotate = function( str ) {  this.elm.style.webkitTransform = this.elm.style.MozTransform =   this.elm.style.OTransform = this.elm.style.transform =   'rotate(' + str + ')'; };
	this.content = function( content ) {  this.elm.innerHTML = content;};
	this.round = function( round ) {  this.elm.style.borderRadius = round ? '50%/50%' : '';};
	this.elm = document.createElement( 'div' );
	this.elm.style.position = 'absolute';
	stage.appendChild( this.elm );
};
var pompStage = $('.pomp'),  message = DOM.LOOPLAYER.trackNAME.innerHTML ? DOM.LOOPLAYER.trackNAME.innerHTML.toUpperCase() : 'Your moma great'
		, plots = message.length,  increase = Math.PI * 2 / plots,  angle = -Math.PI,  turnangle = 0, x = 0,  y = 0,  multiplier = 0,  plotcache = [];
for( var i = 0; i < plots; i++ ) {var p = new Plot( pompStage );p.content( message.substr(i,1) );p.setDimensions( 60, 40 );plotcache.push( p );}
function rotate() {multiplier = 180 * Math.sin( angle );
	for( var i = 0; i < plots; i++ ) {
		x = multiplier * Math.cos( angle ) + 200;  y = multiplier * Math.sin( angle ) + 200;
		turnangle = Math.atan2( y - 200, x - 200 ) * 180 / Math.PI + 90 + 'deg';
		plotcache[ i ].rotate( turnangle );  plotcache[ i ].position( x, y );  angle += increase;
	}
	angle += 0.06;
}

function WAVES() {
			const CONF = {'color': '#ffffff',
				'lines': {'class': 'lines','color': '#000000','width': 1,'space': 140,'point': 3,'move': 10, 'animate': {	'nb': 10,	'duration': '30s'} },
				'sizes': {'min': 50,'max': 800,'margin': 200 }
			};
			const getRandomInt = function (min, max) {min = Math.ceil(min);max = Math.floor(max);return Math.floor(Math.random() * (max - min)) + min;}
			//GET DOCUMENT RESOLUTION
			const W = document.body.offsetWidth, H = document.body.offsetHeight;
			//CREATE SVG
			let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			let svgNS = svg.namespaceURI;svg.setAttribute('width', W);svg.setAttribute('height', H);
			//Background
			let svgBackground = document.createElementNS(svgNS, 'rect');
					svgBackground.setAttribute('width', W);
					svgBackground.setAttribute('height', H);
					svgBackground.setAttribute('fill', CONF.color);
			svg.appendChild(svgBackground);
			//ADD ELEMENTS
			//lines
			const P = W/CONF.lines.point;
			let yPoints = {};
			let svgGroup = document.createElementNS(svgNS, 'g');
			svgGroup.setAttribute('class', CONF.lines.class);
			//create lines 
			for (let i = 0; i < H; i+=CONF.lines.space) {
				let s = document.createElementNS(svgNS, "path");
				s.setAttribute('stroke-width', CONF.lines.width);
				s.setAttribute('stroke', CONF.lines.color);
				s.setAttribute('fill', 'transparent');
				let Y = i;
				let animations = [];
				for (let a = 0; a < CONF.lines.animate.nb; a++) {
					let d = 'M';
					//create points
					for (let p = 0; p <= CONF.lines.point; p++) {
						const X = P*p;
						//line
						if (!yPoints[a]) yPoints[a] = {};
						const ypp = yPoints[a][p] || i;
						const M = getRandomInt(ypp + CONF.lines.width, i + CONF.lines.move);
						yPoints[a][p] = Y = M;
						d+= X + ' ' + Y;
						if (p != CONF.lines.point) d+= ', ';									
					}
					animations.push(d);
				}
				animations.push(animations[0]);
				let animate = document.createElementNS(svgNS, "animate");
				animate.setAttribute('dur', CONF.lines.animate.duration);
				animate.setAttribute('repeatCount', 'indefinite');
				animate.setAttribute('attributeName', 'd');
				animate.setAttribute('values', animations.join(';'));
				s.appendChild(animate);
				svgGroup.appendChild(s);
				svg.appendChild(svgGroup);
			}
			$('waves').appendChild(svg);	
}
function LETSQUOTE() {
		const quotes=[
			{ text: "la ne salak sey sin sen ya bana mi deyon hirbo de get zirto poz kalas gey ikizi", author: "gmg" },
			{ text: "gele sem oraya boza rim fiyaka bostana salata ne sana ken dini beea gey ikizi", author: "gmg" },
			{ text: "I hope you're collecting what people song into the microphone. My wife just laid down a pretty sweet riff.", author: "jk3us" },
			{ text: "I think there's a bug, it also makes me dance.", author: "moogeekfull-stack" },
			{ text: "Where was this when I was making Geocities pages!?", author: "shabibbles" },
			{ text: "It's fun for a demo. But if I ever find it used on a web page I visit, I shall track the owner down and place them in isolation for life.", author: "crispinb" },
			{ text: "Jesus christ it's 1994 again", author: "WeaponizedMath" },
			{ text: "I don't know what it is but I like it!!!", author: "blairanderson" },
			{ text: "Turned on microphone, started finger drumming on laptop. This was more fun than I expected it to be.", author: "harel" },
			{ text: "This will be everywhere on April Fools 2018.", author: "prawn" },
			{ text: "Why.js", author: "Robby517" },
			{ text: "Blink tag 2: godzilla strikes back", author: "@erez" },
			{ text: "<Marque> tag back with vengeance", author: "@udayms" },
			{ text: "I. need. this. On. all. my. websites.", author: "@Lordmau5" },
			{ text: "With great power comes great responsibility. Or just obnoxious fun.", author: "@TheMeteorChef" },
			{ text: "I both recognize the obnoxiousness of this AND want to use it everywhere", author: "@ekmpls" },
			{ text: "lolwat.js", author: "@psychronautron" },
			{ text: "At this point, we're coming full circle back to my 1997 AngelFire site on Ultima Online... I'm OK with it.", author: "@ryanpoe85" },
			{ text: "<blink> tag on steroids!", author: "@master_mitch" },
			{ text: "This is why I love internet", author: "@builtbymiken" },
			{ text: "Played around with[...]. accidentally created a nightmare", author: "@becckitt" },
		];
		const quote=quotes[Math.floor(Math.random() * quotes.length)];
		$('words').innerHTML=quote.text;
}


///# sourceMappingURL=rythm.js.map
