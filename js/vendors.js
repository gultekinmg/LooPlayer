/// global
console.clear();
window.animate = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
var DOM={
    "DROPAREAWrapper" : $('fileReader_wrapper'),
    "DROPAREA" : $('dropArea'),
    "FILEINPUT" : $('selectedFiles'),
    "LISTPLACE" : $('audioLIST'),
    "AUDIOPLAYER" : $('audioPLAYER'),
    "LISTTPL" : $('audioLIST').innerHTML,
    "LOOPLAYER" : {
        "trackNAME": $('audioINFO'),
				"PREVBtn": $('prevBtn'),
        "REWINDBtn": $('rewindBtn'), 
        "PLAYBtn": $('playICON'),
        "FORWARDBtn": $('forwardBtn'), 
				"NEXTBtn": $('nextBtn'),
        "PROCESS": $('audioProcess'),
        "TIME": { "current": $('audio-time-current'), "total": $('audio-time-total')},
        "LOOP": { "SINGLE": $('looperBtn'),"BOOKMARK":$('bookmark')},
    },
		"AUDIOCONTROLS": { 
        "VolumeSLIDER": $('audioVolume'),
        "VolKEY": $('volumeKey'),
				"speakerICON": $('speakerICON'),
        "PANEL": $('.volume_controls'),
				"page": $('popWin_wrapper'),
				"POS3D":  $('.pos3d'),
				"closeBtn": $('#popWin_wrapper .closeBtn')}
};
var WIN={
    "allowAudioTypes": ['audio/mpeg', 'audio/mp3', 'audio/x-m4a', 'audio/x-wav'],
		"audioFiles": [],
    "currentAudioID": 0,
    "songLength":0,
    "isPlaying":false,
    "playTimer":0,
    "Duration":0,
    "currentTime":0,
    "loopMode":0,
    "volumeValue":.8,
		"BookmarkPins":2,
		"BookmarkVals":[],
		"BookmarkCurrentPin":undefined,
    "stage":0,
};
/// main
// debug
var unbearable=5;
function bitch(){var trace = new Error().stack; //console.log(trace); 
	var line=trace.trim().split( '\n' ); line.shift(); line.shift();line.shift();//console.log('traces:',line); 
	//var w=trace.split( '/' );
	return '\n=>'+line;	}//return w[w.length - 1]+'\n'+'traces:'+line;	}
function wtf(is,thatBitch){if(is>=unbearable||is=='crazy')console.trace(thatBitch);else return 'to sender'; } ; wtf(unbearable-1,{bitch});
function $(e){ if(e.charAt(0)=='.' ||e.charAt(0)=='#') return document.querySelector(e); else return document.getElementById(e); }//get DOM..
function formatTime(time) { var min=Math.floor(time / 60), sec=Math.floor(time % 60);   return min+':'+(sec < 10 ? '0'+sec : sec); }
//
/// _drag DOM Elements //MAKE THE ABSOLUTE DIV ELEMENT DRAGGABLE WITH DRAGERCHILDNODE..GREAT..
function _dragElement(elmnt,dragger) {	var farX=farY=oldX=oldY=0;  
	if (dragger) {dragger.onmousedown=dragMouseDown; } else return;   /* if present, the dragger is where you move the DIV from:*/
	function dragMouseDown(e) {e=e || window.event;  e.preventDefault();  
		oldX=e.clientX; oldY=e.clientY;  // get the mouse cursor position at startup:
		wtf(3,[elmnt.offsetLeft,elmnt.offsetTop,'oldmouse',oldX,oldY]);
		document.onmouseup=close_dragElement;    
		document.onmousemove=elementDrag;  // call a function whenever the cursor moves:
	}
	function elementDrag(e) {e=e || window.event;  e.preventDefault();  
		// calculate the new cursor position:
		farY=oldY-e.clientY; farX=oldX-e.clientX;
		oldY=e.clientY;  oldX=e.clientX;  
		// set the element's new position:
		yPos=elmnt.offsetTop-farY;  if(yPos<10)yPos=10;  if(yPos>window.innerHeight-50)yPos=window.innerHeight-50;
		xPos=elmnt.offsetLeft-farX; if(xPos<10)xPos=10;  if(xPos>window.innerWidth-400)xPos=window.innerWidth-400;
		elmnt.style.top=(yPos)+"px";  elmnt.style.left=(xPos)+"px";  
	}
	function close_dragElement(e) {	wtf(3,['newdraggedcoord',xPos,yPos,'mouse',e.clientX,e.clientY]);
		document.onmouseup=document.onmousemove=null;  }/* stop moving when mouse button is released:*/
}
_dragElement($("audioPLAYER_wrapper"),$(".infoKEY"));
//

///PLAYER
var PLAYER=function (options) {  wtf(4,['Poptions',options]);  this.init();};
PLAYER.prototype.setAudioListApi=function (apis) {    this.listApis=apis;    return apis.length;}; ///1
PLAYER.prototype.init=function () { this.setVolume(WIN.volumeValue); this.bindEvents(); return this;};///2
PLAYER.prototype.myBlink=function (n) {var x=document.getElementsByTagName("a");
		for(i=0;i<x.length;i++){
			if(x[i].getAttribute("data-aid")==n){x[i].classList.add('pulsate'); x[i].style.opacity=1;}
			else {x[i].classList.remove('pulsate'); x[i].style.opacity=.5;}
			} 
};
PLAYER.prototype.WebPLAY=function () {WIN.isPlaying=true;
		if(!AC) { initAC();	}	
		if (AC.state === 'suspended') { AC.resume();	}// check if context is in suspended state (autoplay policy)
		DOM.AUDIOPLAYER.play(); 
    DOM.LISTPLACE.style.display = 'block';
		DOM.LOOPLAYER.PLAYBtn.classList.add('fa-pause');
    WIN.playTimer=setInterval((function(here) { return function () { here.progress.call(here); }; })(this), 1000);
			this.myBlink(WIN.currentAudioID);
		RythmOnStartClick();
    return this;
};
PLAYER.prototype.WebPAUSE=function () {WIN.isPlaying=false; 
		DOM.AUDIOPLAYER.pause(); 
    DOM.LISTPLACE.style.display = 'none';
		DOM.LOOPLAYER.PLAYBtn.classList.remove('fa-pause');
		clearInterval(WIN.playTimer);
		RythmOffStopClick();
		return this;};
PLAYER.prototype.prevTrack=function () { if (--WIN.currentAudioID < 0) { WIN.currentAudioID=this.songLength - 1; } this.GOto(WIN.currentAudioID); return this;};
PLAYER.prototype.nextTrack=function () { if (++WIN.currentAudioID >=WIN.songLength) { WIN.currentAudioID=0; } this.GOto(WIN.currentAudioID); return this;};
PLAYER.prototype.GOto=function (id) { this.listApis && this.listApis.goto && this.listApis.goto(id); return this;};
PLAYER.prototype.formatSec=function (f, e) { var s=f%60, m=(f-s)/60, a=''; /* if (e) a += '-';  */a += m>9?m:'0'+m; a += ':'; a += s>9?s:'0'+s; return a;};
PLAYER.prototype.updateTime=function () { WIN.currentTime=this.getCurrentTime(); WIN.Duration=this.getTotalTime(); return this;};
PLAYER.prototype.setCurrentTime=function (a) { DOM.AUDIOPLAYER.currentTime=a; return this;};
PLAYER.prototype.getCurrentTime=function () { return Math.round(DOM.AUDIOPLAYER.currentTime);};
PLAYER.prototype.getTotalTime=function () { return Math.floor(DOM.AUDIOPLAYER.duration);};
PLAYER.prototype.progress=function () {if(!WIN.isPlaying)return;
		this.updateTime();
		DOM.LOOPLAYER.PROCESS.value=WIN.currentTime; DOM.LOOPLAYER.PROCESS.max=WIN.Duration;
    DOM.LOOPLAYER.TIME.current.innerHTML=this.formatSec(WIN.currentTime, false);
    if (WIN.Duration) DOM.LOOPLAYER.TIME.total.innerHTML=this.formatSec(WIN.Duration - WIN.currentTime, true);
    return this;
};
PLAYER.prototype.setVolume=function (val) { DOM.AUDIOPLAYER.volume=WIN.volumeValue=val; return this;};
PLAYER.prototype.toggleMute=function () { if (DOM.AUDIOPLAYER.muted) {  DOM.AUDIOPLAYER.muted=false;  DOM.AUDIOCONTROLS.VolumeSLIDER.value=WIN.volumeValue * 100; } else {  DOM.AUDIOPLAYER.muted=true;  DOM.AUDIOCONTROLS.VolumeSLIDER.value=0; } return this;};
PLAYER.prototype.toggleLoop=function () {if(!WIN.isPlaying)return;
		WIN.loopMode=WIN.loopMode? 0 : 1;
		DOM.LOOPLAYER.LOOP.SINGLE.className=WIN.loopMode? 'active' : '';
		DOM.LOOPLAYER.LOOP.BOOKMARK.classList.toggle("hidden");
		return this;
};
PLAYER.prototype.bindEvents=function () { var here=this;wtf(4,{'DOM.LOOPLAYER':DOM.LOOPLAYER})///3
    var _FinishPlaying=function () { DOM.LOOPLAYER.PLAYBtn.classList.add('fa-pause');
				if (WIN.loopMode) { WIN.stage=0;here.GOto.call(here, WIN.currentAudioID); } else { here.nextTrack.call(here); }};
    var _PlayBtn=function () { here[WIN.isPlaying?'WebPAUSE':'WebPLAY'].call(here);    };
    var _REWINDBtn=function () {DOM.LOOPLAYER.PROCESS.value -= 5;_ChProcess(); };
    var _FORWARDBtn=function () {DOM.LOOPLAYER.PROCESS.value=5 + parseInt(DOM.LOOPLAYER.PROCESS.value, 10);_ChProcess(); };
		var _GOTOBMK=function (where) {DOM.LOOPLAYER.PROCESS.value = where;_ChProcess(); };
    var _PrevBtn=function () { here.prevTrack.call(here); };
    var _NextBtn=function () { here.nextTrack.call(here); };
    var _Equalizer=function () { DOM.AUDIOCONTROLS.PANEL.classList.toggle('hidden');  DOM.AUDIOCONTROLS.POS3D.classList.toggle('hidden'); };
    var _LoopBtn=function () { here.toggleLoop.call(here); };
    var _ChProcess=function () { here.setCurrentTime.call(here, parseInt(DOM.LOOPLAYER.PROCESS.value, 10));    };
    var _ChVolume=function () { here.setVolume.call(here, parseInt(DOM.AUDIOCONTROLS.VolumeSLIDER.value, 10)/100);    };
		var  _updateVolume= function() {  
			if (DOM.AUDIOPLAYER.volume >= 0.5) {DOM.AUDIOCONTROLS.speakerICON.attributes.d.value='M14.667 0v2.747c3.853 1.146 6.666 4.72 6.666 8.946 0 4.227-2.813 7.787-6.666 8.934v2.76C20 22.173 24 17.4 24 11.693 24 5.987 20 1.213 14.667 0zM18 11.693c0-2.36-1.333-4.386-3.333-5.373v10.707c2-.947 3.333-2.987 3.333-5.334zm-18-4v8h5.333L12 22.36V1.027L5.333 7.693H0z';
			} else if (DOM.AUDIOPLAYER.volume < 0.5 && DOM.AUDIOPLAYER.volume > 0.05) {DOM.AUDIOCONTROLS.speakerICON.attributes.d.value='M0 7.667v8h5.333L12 22.333V1L5.333 7.667M17.333 11.373C17.333 9.013 16 6.987 14 6v10.707c2-.947 3.333-2.987 3.333-5.334z';
			} else if (DOM.AUDIOPLAYER.volume <= 0.05) {DOM.AUDIOCONTROLS.speakerICON.attributes.d.value='M0 7.667v8h5.333L12 22.333V1L5.333 7.667';  }
		};
		var  _updateLooProgress= function() {  if (WIN.loopMode==0||!WIN.isPlaying) return;
				if(WIN.BookmarkCurrentPin){				
						if(WIN.BookmarkCurrentPin=="1"){WIN.stage=0;_GOTOBMK(WIN.BookmarkVals[0]); }
						if(WIN.BookmarkCurrentPin=="3"){WIN.stage=2; _GOTOBMK(WIN.BookmarkVals[2]);}
						if(WIN.BookmarkCurrentPin=="5"){WIN.stage=4;_GOTOBMK(WIN.BookmarkVals[4]); }
						if(WIN.BookmarkCurrentPin=="7"){WIN.stage=6; _GOTOBMK(WIN.BookmarkVals[6]);}
						wtf(4,['id',WIN.BookmarkCurrentPin,WIN.stage]);
						WIN.BookmarkCurrentPin=undefined;
				}
				else{
					var current=DOM.AUDIOPLAYER.currentTime, n=WIN.BookmarkVals.length;
					if(n>=1){
						if(current<=WIN.BookmarkVals[0]&&WIN.stage==0){_GOTOBMK(WIN.BookmarkVals[0]);}	//no preview start
						if(current>=WIN.BookmarkVals[1]&&WIN.stage==0){if(n<=2)WIN.stage=0;else WIN.stage=2;		_GOTOBMK(WIN.BookmarkVals[WIN.stage]);}	
						if(n>=3){   if(current>=WIN.BookmarkVals[3]&&WIN.stage==2){if(n<=4)WIN.stage=0;else WIN.stage=4;_GOTOBMK(WIN.BookmarkVals[WIN.stage]);}	
							if(n>=5){ if(current>=WIN.BookmarkVals[5]&&WIN.stage==4){if(n<=6)WIN.stage=0;else WIN.stage=6;_GOTOBMK(WIN.BookmarkVals[WIN.stage]);}	
								if(n>=7){if(current>=WIN.BookmarkVals[7]&&WIN.stage==6){WIN.stage=0;_GOTOBMK(WIN.BookmarkVals[0]);}	}
							}
						}
						wtf(4,['currentTime',current,'-loop',WIN.loopMode,n,'stage-start',WIN.stage,WIN.BookmarkVals[WIN.stage],]);
					}
				}
		};
    var _KeyPress=function (e) { e.stopPropagation(); e.preventDefault();
        switch (e.keyCode) {
            case 32:    // Space
            case 80: _PlayBtn(); break;// P
            case 38:    // ↑
            case 87: _PrevBtn(); break; // W   
            case 40:    // ↓
            case 83: _NextBtn(); break; // S
            case 37:    // ←
            case 65: DOM.AUDIOCONTROLS.VolumeSLIDER.value -= 5; _ChVolume(); break; // A
            case 39:    // →
            case 68:   DOM.AUDIOCONTROLS.VolumeSLIDER.value=5 + parseInt(DOM.AUDIOCONTROLS.VolumeSLIDER.value, 10);_ChVolume();break; // D
            case 188:  DOM.LOOPLAYER.PROCESS.value -= 5;_ChProcess();break; // <
            case 190:   DOM.LOOPLAYER.PROCESS.value=5 + parseInt(DOM.LOOPLAYER.PROCESS.value, 10);_ChProcess();break;// >
            case 219:  DOM.LOOPLAYER.PROCESS.value -= 30;_ChProcess();break; // [
            case 221:  DOM.LOOPLAYER.PROCESS.value=30 + parseInt(DOM.LOOPLAYER.PROCESS.value, 10);_ChProcess();break; // ]
            case 82: location.reload();break;// R
            case 77:  here.toggleMute.call(here);break;  // M
            case 76: here.toggleLoop.call(here);break;// L
            //case 191:   (DOM.LOOPLAYER.HELP.page.style.display=='block'?closeHelp:openHelp)();break; // ?
        }
        return false;
    };
    DOM.LOOPLAYER.PLAYBtn.addEventListener('click', _PlayBtn, false);
    DOM.LOOPLAYER.NEXTBtn.addEventListener('click', _NextBtn, false);
    DOM.LOOPLAYER.PREVBtn.addEventListener('click', _PrevBtn, false);
    DOM.LOOPLAYER.REWINDBtn.addEventListener('click', _REWINDBtn, false);
    DOM.LOOPLAYER.FORWARDBtn.addEventListener('click', _FORWARDBtn, false);
    DOM.AUDIOCONTROLS.VolKEY.addEventListener('click', _Equalizer, false);
		DOM.AUDIOPLAYER.addEventListener('timeupdate', _updateLooProgress, false);
		DOM.AUDIOPLAYER.addEventListener('volumechange', _updateVolume, false);
    DOM.AUDIOPLAYER.addEventListener('ended', _FinishPlaying, false);

    DOM.LOOPLAYER.LOOP.SINGLE.addEventListener('click', _LoopBtn, false);
    DOM.LOOPLAYER.PROCESS.addEventListener('change', _ChProcess, false);
    DOM.AUDIOCONTROLS.VolumeSLIDER.addEventListener('change', _ChVolume, false);
    DOM.AUDIOCONTROLS.VolumeSLIDER.addEventListener('dblclick', function(){here.toggleMute.call(here);}, false);
    //DOM.LOOPLAYER.HELP.closeBtn.addEventListener('click', closeHelp, false);
    document.addEventListener('keydown', _KeyPress, false);
    return this;
};
PLAYER.prototype.finishLoad=function (id, name) {
	WIN.currentAudioID=id;
	DOM.LOOPLAYER.trackNAME.innerHTML=name;
	this.progress(); 
	this.WebPLAY();
	wavesurfer.load(ACnod_source);
	wavesurfer.on('ready', function () {wavesurfer.play();});
};

// consolidate...
var myplayer = new PLAYER({});
var wavesurfer = WaveSurfer.create({container: '#waves_wrapper',waveColor: 'violet', progressColor: 'purple'});

///PLAYLIST
var PLAYLIST = function (options) { this.options = options; wtf(4,['Loptions',this.options]); this.init(); };
PLAYLIST.prototype.init = function () { this.bindEvents();};
PLAYLIST.prototype.renewList = function (files) {var here = this; WIN.audioFiles = [];///
    Array.prototype.forEach.call(files, function(file){    if (WIN.allowAudioTypes.indexOf(file.type)>=0) {    WIN.audioFiles.push(file);}});
		wtf(4,['WIN.audioFiles',WIN.audioFiles]);
    DOM.DROPAREAWrapper.classList.toggle('hidden');
    this.options.finishInit.call(this, WIN.audioFiles.length);
    return this;
};
PLAYLIST.prototype.MustacheRender = function () {
    var tplData = [];
    var rename = this.options.rename || function (name) { return name.replace(/\.\w{2,5}$/, '') };
    var rand = function (m, n) {return m + Math.round(Math.random()*(n-m));    };
    var randCOLOR = function (dark) {var t = []; for (var i=0; i<3; i++) { t.push( dark? rand(0, 128) : rand(190, 255) );}return t.join(',');};
    WIN.audioFiles.forEach(
			function(audio, id){tplData.push({ 'id' : id, 'name' : rename(audio.name), 'bg' : randCOLOR(), 'clr' : randCOLOR(true)});});
    DOM.LISTPLACE.innerHTML = Mustache.render(DOM.LISTTPL, { 'lst' : tplData });
    DOM.LISTPLACE.style.display = 'block';
    this.ReadFileAsDataURL(0); /// play 1st song fast.
		wtf(4,tplData);
    return this;
};
PLAYLIST.prototype.ReadFileAsDataURL = function (id) {  id = parseInt(id, 10);
    if (WIN.audioFiles && WIN.audioFiles[id]) { var here = this;
				var reader = new FileReader();
        var _Load = function (e) {
						DOM.AUDIOPLAYER.src = e.target.result;
						DOM.AUDIOPLAYER.load();
            here.options.finishAudioLoad && here.options.finishAudioLoad(id, WIN.audioFiles[id].name); // Callback player api
        };
        var _Error = function (e) { console.log(e); alert('讀取??失#@敗');};
        reader.addEventListener('load', _Load, false);
        reader.addEventListener('error', _Error, false);
        reader.readAsDataURL(WIN.audioFiles[id]);
        DOM.AUDIOPLAYER.type = WIN.audioFiles[id].type;
        here.options.showLoading();
        return true;
    } else {return false;}
};
PLAYLIST.prototype.sort = function () { return this;};
PLAYLIST.prototype.bindEvents = function () { var here = this; 
	// Prevent default event behaviors
	var _preventDefaults = function (e) {e.stopPropagation();e.preventDefault(); return false;};
	;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {DOM.DROPAREA.addEventListener(eventName, _preventDefaults, false);})
	//
    var _Drop = function(e) {here.renewList.call(here, e.dataTransfer.files).MustacheRender.call(here); return false;};
		var _Browse = function(e) {_preventDefaults; here.renewList.call(here, DOM.FILEINPUT.files).MustacheRender.call(here); return false;};
    var _AudioClick = function(e) {_preventDefaults; var link = e.target || false;
        if (link && link.tagName.toUpperCase() == 'A' && link.dataset.aid) { here.ReadFileAsDataURL(link.dataset.aid);}
        return false;
    };
    DOM.DROPAREA.addEventListener('drop', _Drop, false);
    DOM.FILEINPUT.addEventListener('change', _Browse, false);
    DOM.LISTPLACE.addEventListener('click', _AudioClick, false);
};
// consolidate...
var audioLST = new PLAYLIST({///options constructor
    'rename' : function (name) {   return name.replace(/^\d+\b|\.\w{2,5}$/g, ''); },
    'finishAudioLoad' : function (id, name) {   myplayer.finishLoad.call(myplayer, id, name.replace(/\.\w{2,5}$/g, '')); },
    'showLoading' : function () {   DOM.LOOPLAYER.trackNAME.innerHTML = 'Loading...'; },
    'finishInit' : function (l) {   WIN.songLength = l; }
});

/// run
myplayer.setAudioListApi({ 'goto' : function (id) {   audioLST.ReadFileAsDataURL.call(audioLST, id); }});
//

/** LOOPSLIDER forked  https://idjitjohn.github.io/portfolio */
function LOOPSLIDER(data) { this.init(data);}///aBookmarkVals[]
LOOPSLIDER.prototype.initParams = function(data){///??
    var params = { elt:null, loops:null, sameStep:true, start:0, pins:1, handler:console.log, link:true, steps:[{ step: 1, number: 10 }],values: []  };
    for (key in params){this[key] = (typeof data[key] == 'undefined') ? params[key]:data[key];}    //replace paramtrs Adding data from options..
}
LOOPSLIDER.prototype.getValues = function(){ return this.values;}
LOOPSLIDER.prototype.setValues = function(values){ if(!Array.isArray(values)) return this.setValues([values]);
    var a_all = Array.from(this.elt.querySelectorAll(".pin"));
    for (let i = 0; i < values.length && a_all[i]; i++) {var l = this.steps_values.values.indexOf(values[i]);
        if(l>=0){    a_all[i].style.left = this.steps_values.steps[l]+'%';    a_all[i].dataset.val = values[i];
            LOOPSLIDER.current = this;
            this.change();
            LOOPSLIDER.current = undefined;
        }
    }
}
LOOPSLIDER.prototype.init = function(data){
    //this.createINPUTS();
    this.initParams(data);
    if(!this.checkErrors()) return;
    this.createPins();
    this.createLinks();
    this.addEvents();
    //read initial values
    var aBookmarkVals = this.values;
    if(!Array.isArray(aBookmarkVals) || aBookmarkVals.length>0)this.setValues(aBookmarkVals);
		else{
			aBookmarkVals = this.elt.dataset.val;
			if(aBookmarkVals){ this.setValues(JSON.parse('['+this.elt.dataset.val+']')); this.elt.removeAttribute('data-val');}
			else{ for (let i = 0; i < this.pins; i++) this.values.push(this.start);}
    }
}
LOOPSLIDER.prototype.change = function() {
    var a_all = Array.from( LOOPSLIDER.current.elt.querySelectorAll(".pin") );
    a_all = a_all.map( function(pin) { /// maps a function
						return { pin: pin,
            val: pin.dataset.val ? parseFloat(pin.dataset.val) : LOOPSLIDER.current.start,
            x: pin.style.left ? parseFloat(pin.style.left) : 0 }; })//.sort(function(a, b) {return a.val < b.val ? -1 : 1; }); important..
    LOOPSLIDER.current.values = a_all.map(function(v) {return v.val;});wtf(2,LOOPSLIDER.current.values);
    if (LOOPSLIDER.current.link){ var rest = LOOPSLIDER.current.pins % 2;
        if(rest){var link = LOOPSLIDER.current.elt.querySelector(".LoopRange");    link.style.left ="0";    link.style.width = a_all[0].x + "%";}
        for (let i = rest; i < Math.ceil(LOOPSLIDER.current.pins / 2); i++) {
            var link = LOOPSLIDER.current.elt.querySelectorAll(".LoopRange")[i + rest];
            link.style.left = a_all[i * 2 + rest].x + "%";
            link.style.width = a_all[i * 2 + 1 + rest].x - a_all[i * 2 + rest].x + "%";
        }
    }
    LOOPSLIDER.current.handler(a_all.map(function(v) { return v.val;}));
}
LOOPSLIDER.prototype.checkErrors = function(){
    if (!this.elt.classList) {return console.error(    "The passed elt parameter must be a DOMElemnt");}
    else this.elt.classList.add('abSlider');
    if (this.pins <= 0) {return console.error("The passed `pins` value is not valid ");}
    return true;
}
LOOPSLIDER.prototype.createINPUTS = function(){for (let i = 0; i < this.pins/2-1; i++) {
		var d = document.createElement("div");	//d.type="text";//d.readonly=true;
		this.loops.appendChild(d);};wtf(3,['loops',this.loops]);
	}
LOOPSLIDER.prototype.createPins = function(){for (let i = 0; i < this.pins; i++) {
		var d = document.createElement("div");
		d.classList.add("pin");d.id=i+1;
		this.elt.appendChild(d);
		d.innerHTML=i+1;}		
	}
LOOPSLIDER.prototype.createLinks = function(){if (this.link) for (let i = 0; i < Math.ceil(this.pins / 2); i++) {var d = document.createElement("div");d.classList.add("LoopRange");this.elt.appendChild(d);}}
LOOPSLIDER.prototype.getMinStep = function(){return this.steps.reduce(function(prev, step) {return step.step < prev ? step.step : prev;}, this.steps[0].step);}
LOOPSLIDER.prototype.initSteps = function(){ var minstep = this.getMinStep();/** Computing all possible steps return all steps in percentage in an array*/
    this.steps = this.steps.map(function(step) {step["multiply"] = this.sameStep ? 1 : step.step / minstep;return step;});
    //Taking all steps in percentage
    var onestep =100 /this.steps.reduce(function(prev, step) {    return prev + step.number * step.multiply;}, 0);
    var steps = [0];
    var values = [this.start];
    this.steps.reduce(
        function(prev, step) { var v = prev[1]; prev = prev[0];
            for (let i = 1; i <= step.number; i++) { steps.push(prev + onestep * step.multiply * i); values.push(v + step.step * i); }
            prev = prev + onestep * step.multiply * step.number;
            v = v + step.step * step.number;
            return [prev, v];
        },
        [0, this.start]
    );
    this.steps_values = {steps:steps,values:values};wtf(3,['this.steps_values',this.steps_values]);
}
LOOPSLIDER.prototype.addEvents = function(){ this.initSteps(); var that = this;///Adding events to pins
    var f_win_handler = function(e) {
        if (!LOOPSLIDER.current_pin || e.y === 0) return;
        var values = LOOPSLIDER.current.steps_values.values; steps = LOOPSLIDER.current.steps_values.steps;
        ///Variables - getting and Computing
        var val = LOOPSLIDER.current.start, pin = LOOPSLIDER.current_pin; par = parseInt(getComputedStyle(pin.parentNode).width);
        var left = 0, pin_parent = pin.parentNode;
        while(pin_parent){ left += pin_parent.offsetLeft;    pin_parent = pin_parent.offsetParent;}
        var x = (e.touches ? e.touches[0].clientX : e.clientX) - left ;
        /** if x is out of bounds */  if (x > par) x = par;else if (x < 0) x = 0;
        x = (x * 100) / par; ///Respect steps - simulate jumping
        for (var i = 0; i < steps.length; i++) {
            if (steps[i + 1] >= x) {
                if (steps[i] < x) {if ( Math.abs(x - steps[i]) < Math.abs(x - steps[i + 1]) ) { x = steps[i]; val = values[i];} else { x = steps[i + 1]; val = values[i + 1]; }}
                break;
            }
        }
        if (parseFloat(pin.dataset.val) != val) { pin.style.left = x + "%"; pin.dataset.val = val; that.change();}//moving!
    }
    if( typeof LOOPSLIDER.window_handled == 'undefined' ) {
				LOOPSLIDER.window_handled = true;
        var deactivate = function() {  LOOPSLIDER.current_pin = LOOPSLIDER.current = undefined;}/// if(LOOPSLIDER.current) {;wtf(5,LOOPSLIDER.current.values); } 
        window.addEventListener("mousemove", f_win_handler, false);
        //window.addEventListener("touchmove", f_win_handler, false);
        window.addEventListener("mouseup",deactivate,false);
        //window.addEventListener("touchend",deactivate,false);
    }
    var activate = function(e) { WIN.BookmarkCurrentPin=e.target.id;/// impo
			LOOPSLIDER.current = that;LOOPSLIDER.current_pin = e.target;
		}
    this.elt.querySelectorAll(".pin").forEach(
			function(pin) {pin.addEventListener("mousedown",activate,false);/* pin.addEventListener("touchstart",activate,false); */});
}

/// call..LOOPSLIDER
function BookmarkCh(aBookmarkVals){  var ppr = document.querySelectorAll(".inputs input");
    function s(elt,val){elt.value =  val.toLocaleString(); }
		for(var i=0;i<aBookmarkVals.length;i++){s(ppr[i],aBookmarkVals[i]);}
		WIN.BookmarkVals=aBookmarkVals;		wtf(4,WIN.BookmarkVals);//
}
function bookdel(btn,i){ var Loop = document.querySelectorAll(".inputs input");
	Loop[i].remove(); Loop[i-1].remove(); btn.remove();
	Loop = document.querySelectorAll(".pin");
	Loop[i].remove(); Loop[i-1].remove();
	Loop = document.querySelectorAll(".LoopRange");wtf(3,[Loop,i]);
	Loop[(i-1)/2].remove();
	WIN.BookmarkPins =WIN.BookmarkPins-4<0? 2:WIN.BookmarkPins-4;
}
function fnBookmark(){ if(WIN.BookmarkPins>=10)return; var loops= $('.inputs');	var abs= $('.abSlider');
		wtf('crazy',{'WINDuration':WIN.Duration}); ///starter
		loops.innerHTML= abs.innerHTML=lps = ''; 
		for (let i = 0; i < WIN.BookmarkPins; i++) {var d = document.createElement("INPUT"); d.id="BookmarkPin"+(i+1); d.type="text";	//d.setAttribute("readonly", "true");
			loops.appendChild(d);
			if(i==1||i==3||i==5||i==7){var e = document.createElement("BUTTON"); e.innerText="X"; e.addEventListener('click', function(){bookdel(this,i); });
				loops.appendChild(e); loops.appendChild(document.createElement("br"));	}
		}
		var lps = new LOOPSLIDER({ elt: abs, handler: BookmarkCh, sameStep: false,	pins: WIN.BookmarkPins,
				start:0,	steps:[{step:1, number: WIN.Duration},{step: 1, number: 1}, ], values: 0});
		WIN.BookmarkPins +=2;
}
$('bookmark').innerHTML='<div class="abSlider" data-val="0"></div><button id="bmButton" type="button" onclick="fnBookmark();">Bookmark</button><div class="inputs"></div>';
/*    */

