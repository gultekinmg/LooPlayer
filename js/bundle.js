var PLAYER=function (options) {
    this.player=options.player;
    this.diy=options.diyplayer;
    this.currentAudioId= 0;this.prevAudio=null;
    this.songLength=0;
    this.isPlaying=false;
    this.playTimer=0;
    this.totalTime=0;
    this.currentTime=0;
    this.loopMode=0;
    this.volumeValue=.8;
    this.init();
};
PLAYER.prototype.setAudioListApi=function (apis) {    this.listApis=apis;    return apis.length;};
PLAYER.prototype.init=function () { this.setVolume(.8); this.bindEvents(); return this;};
PLAYER.prototype.myBlink=function (e) {var x=document.getElementsByTagName("a");for(i=0;i<x.length;i++){	if(x[i].getAttribute("data-aid")==e)x[i].classList.toggle('pulsate'); } };
PLAYER.prototype.play=function () { this.player.play(); this.isPlaying=true; //this.diy.playBtn.className='pause';
    this.playTimer=setInterval((function(that) { return function () { that.update.call(that); }; })(this), 1000);
			this.myBlink(this.prevAudio);//remove old
			this.myBlink(this.currentAudioId);
			this.prevAudio= this.currentAudioId;
    return this;
};
PLAYER.prototype.pause=function () { this.player.pause(); this.isPlaying=false; /* this.diy.playBtn.className='play';  */clearInterval(this.playTimer); return this;};
PLAYER.prototype.prev=function () { if (--this.currentAudioId < 0) {  this.currentAudioId=this.songLength - 1; } this.goto(this.currentAudioId); return this;};
PLAYER.prototype.next=function () { if (++this.currentAudioId >= this.songLength) {  this.currentAudioId=0; } this.goto(this.currentAudioId); return this;};
PLAYER.prototype.goto=function (id) { this.listApis && this.listApis.goto && this.listApis.goto(id); return this;};

PLAYER.prototype.formatSec=function (f, e) { var s=f%60, m=(f-s)/60, a=''; if (e) a += '-'; a += m>9?m:'0'+m; a += ':'; a += s>9?s:'0'+s; return a;};
PLAYER.prototype.updateTime=function () { this.currentTime=this.getCurrentTime(); this.totalTime=this.getTotalTime(); return this;};
PLAYER.prototype.setCurrentTime=function (a) { this.player.currentTime=a; return this;};
PLAYER.prototype.getCurrentTime=function () { return Math.round(this.player.currentTime);};
PLAYER.prototype.getTotalTime=function () { return Math.floor(this.player.duration);};
PLAYER.prototype.update=function () { this.updateTime(); this.diy.process.value=this.currentTime; this.diy.process.max=this.totalTime;
    this.diy.time.current.innerHTML=this.formatSec(this.currentTime, false);
   // if (this.totalTime) this.diy.time.total.innerHTML=this.formatSec(this.totalTime);// - this.currentTime, true);
    return this;
};

PLAYER.prototype.setVolume=function (val) { this.player.volume=val; this.volumeValue=val; return this;};
PLAYER.prototype.toggleMute=function () { if (this.player.muted) {  this.player.muted=false;  this.diy.volume.value=this.volumeValue * 100; } else {  this.player.muted=true;  this.diy.volume.value=0; } return this;};
PLAYER.prototype.toggleLoopMode=function () { this.loopMode=this.loopMode? 0 : 1; this.diy.loop.single.className=this.loopMode? 'active' : ''; return this;};
PLAYER.prototype.bindEvents=function () { var that=this;
    var _FinishPlaying=function () { /* that.diy.playBtn.className='play'; */if (that.loopMode) { that.goto.call(that, that.currentAudioId); } else { that.next.call(that); }};
    var _PlayBtn=function () { that[that.isPlaying?'pause':'play'].call(that);    };
    var _ChProcess=function () { that.setCurrentTime.call(that, parseInt(that.diy.process.value, 10));    };
    var _ChVolume=function () { that.setVolume.call(that, parseInt(that.diy.volume.value, 10)/100);    };
    var _NextBtn=function () { that.next.call(that);    };
    var _PrevBtn=function () { that.prev.call(that);    };
    var _LoopBtn=function () { that.toggleLoopMode.call(that);    };
    var openHelp=function () { that.diy.help.page.classList.toggle('hidden');    };
    var closeHelp=function () { that.diy.help.page.classList.toggle('hidden');    };
    var _KeyPress=function (e) { e.stopPropagation(); e.preventDefault();
        switch (e.keyCode) {
            case 32:    // Space
            case 80: _PlayBtn(); break;// P
            case 38:    // ↑
            case 87: _PrevBtn(); break; // W   
            case 40:    // ↓
            case 83: _NextBtn(); break; // S
            case 37:    // ←
            case 65: that.diy.volume.value -= 5; _ChVolume(); break; // A
            case 39:    // →
            case 68:   that.diy.volume.value=5 + parseInt(that.diy.volume.value, 10);_ChVolume();break; // D
            case 188:  that.diy.process.value -= 5;_ChProcess();break; // <
            case 190:   that.diy.process.value=5 + parseInt(that.diy.process.value, 10);_ChProcess();break;// >
            case 219:  that.diy.process.value -= 30;_ChProcess();break; // [
            case 221:  that.diy.process.value=30 + parseInt(that.diy.process.value, 10);_ChProcess();break; // ]
            case 82: location.reload();break;// R
            case 77:  that.toggleMute.call(that);break;  // M
            case 76: that.toggleLoopMode.call(that);break;// L
            case 191:   (that.diy.help.page.style.display=='block'?closeHelp:openHelp)();break; // ?
        }
        return false;
    };
    this.player.addEventListener('ended', _FinishPlaying, false);
    this.diy.playBtn.addEventListener('click', _PlayBtn, false);
    this.diy.volume.addEventListener('change', _ChVolume, false);
    //this.diy.switchBtn.next.addEventListener('click', _NextBtn, false);
   // this.diy.switchBtn.prev.addEventListener('click', _PrevBtn, false);
   // this.diy.process.addEventListener('change', _ChProcess, false);
   // this.diy.loop.single.addEventListener('click', _LoopBtn, false);
   this.diy.help.closeBtn.addEventListener('click', closeHelp, false);
    document.addEventListener('keydown', _KeyPress, false);
    return this;
};
PLAYER.prototype.finishLoad=function (id, name) { this.currentAudioId=id; this.diy.name.innerHTML=name; this.update(); this.play();};
//
var PLAYLIST = function (options) { this.options = options; wtf(3,['options',this.options]); this.init(); };
PLAYLIST.prototype.init = function () { this.bindEvents(); wtf(3,this.options.dropPlace);};
PLAYLIST.prototype.load = function (files) {var that = this; this.audios = [];///
    Array.prototype.forEach.call(files, function(file){    if (that.options.allowAudioTypes.indexOf(file.type)>=0) {    that.audios.push(file);}});
		wtf(4,['audios',this.audios]);
    this.options.dropPlaceWrapper.style.display = 'none';
    this.options.finishInit.call(this, this.audios.length);
    return this;
};
PLAYLIST.prototype.render = function () {
    var tplData = [];
    var rename = this.options.rename || function (name) { return name.replace(/\.\w{2,5}$/, '') };
    var rand = function (m, n) {return m + Math.round(Math.random()*(n-m));    };
    var randCOLOR = function (dark) {var t = []; for (var i=0; i<3; i++) {    t.push( dark? rand(0, 128) : rand(190, 255) );}return t.join(',');};
    this.audios.forEach(function(audio, id){tplData.push({ 'id' : id, 'name' : rename(audio.name), 'bg' : randCOLOR(), 'clr' : randCOLOR(true)});});
    this.options.listPlace.innerHTML = Mustache.render(this.options.listTpl, { 'lst' : tplData });
    this.options.listPlace.style.display = 'block';
    this.getFiles(0);
   wtf(3,tplData);
    return this;
};
PLAYLIST.prototype.getFiles = function (id) {  id = parseInt(id, 10);
    if (this.audios && this.audios[id]) {var reader = new FileReader(); var that = this;
        var _Load = function (evt) {    that.options.audioPlayer.src = evt.target.result;    that.options.audioPlayer.load();
            that.options.finishAudioLoad && that.options.finishAudioLoad(id, that.audios[id].name); // Callback player api
        };
        var _Error = function (evt) {    wtf(3,evt);    alert('讀取??失#@敗');};
        reader.addEventListener('load', _Load, false);
        reader.addEventListener('error', _Error, false);
        reader.readAsDataURL(this.audios[id]);
        that.options.audioPlayer.type = this.audios[id].type;
        that.options.showLoading();
        return true;
    } else {return false;
    }
};
PLAYLIST.prototype.sort = function () { return this;};
PLAYLIST.prototype.bindEvents = function () { var that = this; var _Dragover = function(evt) {evt.stopPropagation();evt.preventDefault();return false;};
    var _Drop = function(evt) {evt.stopPropagation();evt.preventDefault();that.load.call(that, evt.dataTransfer.files).render.call(that);return false;};
    var _AudioClick = function(evt) {evt.stopPropagation();evt.preventDefault();var link = evt.target || false;
        if (link && link.tagName.toUpperCase() == 'A' && link.dataset.aid) { that.getFiles(link.dataset.aid);}
        return false;
    };
    that.options.dropPlace.addEventListener('dragover', _Dragover, false);
    that.options.dropPlace.addEventListener('drop', _Drop, false);
    that.options.listPlace.addEventListener('click', _AudioClick, false);
};


// consolidate...
var player = new PLAYER({
		'player' : document.querySelector('#audioSource'),
    'diyplayer' : {
        'playBtn' : document.querySelector('#playICON'),
        'switchBtn' : { 'next' : document.querySelector('#nextBtn'), 'prev' : document.querySelector('#prevBtn')},
        'name' : document.querySelector('#audioINFO'),
        'volume' : document.querySelector('#gainer'),
        'process' : document.querySelector('#audioProcess'),
        'time' : { 'current' : document.querySelector('.current-time'), 'total' : document.querySelector('.total-time')},
        'loop' : { 'single' : document.querySelector('#loading')},
        'help' : { 'page' : document.querySelector('#popWin_wrapper'), 'closeBtn' : document.querySelector('#popWin_wrapper .closeBtn')}
    }
});
var LST = new PLAYLIST({//options
    'dropPlaceWrapper' : document.querySelector('#dropArea_wrapper'),
    'dropPlace' : document.querySelector('#dropArea'),
    'listPlace' : document.querySelector('#audioLIST'),
    'audioPlayer' : document.querySelector('#audioSource'),
    'allowAudioTypes' : ['audio/mpeg', 'audio/mp3', 'audio/x-m4a', 'audio/x-wav'],
    'listTpl' : document.querySelector('#audioLIST').innerHTML,
    'rename' : function (name) {   return name.replace(/^\d+\b|\.\w{2,5}$/g, ''); },
    'finishAudioLoad' : function (id, name) {   player.finishLoad.call(player, id, name.replace(/\.\w{2,5}$/g, '')); },
    'showLoading' : function () {   player.diy.name.innerHTML = 'Loading...'; },
    'finishInit' : function (l) {   player.songLength = l; }
});
player.setAudioListApi({ 'goto' : function (id) {   LST.getFiles.call(LST, id); }});
//

/** LOOPSLIDER forked  https://idjitjohn.github.io/portfolio */
function LOOPSLIDER(data) { this.init(data);}
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
    var aBmkVals = this.values;
    if(!Array.isArray(aBmkVals) || aBmkVals.length>0)this.setValues(aBmkVals);else{aBmkVals = this.elt.dataset.val;
        if(aBmkVals){ this.setValues(JSON.parse('['+this.elt.dataset.val+']')); this.elt.removeAttribute('data-val');}
        else{ for (let i = 0; i < this.pins; i++) this.values.push(this.start);}
    }
}
LOOPSLIDER.prototype.change = function() {
    var a_all = Array.from(LOOPSLIDER.current.elt.querySelectorAll(".pin"));
    a_all = a_all.map(function(pin) { return { pin: pin,
            val: pin.dataset.val ? parseFloat(pin.dataset.val) : LOOPSLIDER.current.start,
            x: pin.style.left ? parseFloat(pin.style.left) : 0
        };
    })//.sort(function(a, b) {return a.val < b.val ? -1 : 1; }); important..
    LOOPSLIDER.current.values = a_all.map(function(v) {return v.val;});
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
		this.loops.appendChild(d);
		};wtf(3,['loops',this.loops]);
	}
LOOPSLIDER.prototype.createPins = function(){for (let i = 0; i < this.pins; i++) {
		var d = document.createElement("div");
		d.classList.add("pin");
		this.elt.appendChild(d);
		d.innerHTML=i+1;
		}		
	}
LOOPSLIDER.prototype.createLinks = function(){if (this.link) for (let i = 0; i < Math.ceil(this.pins / 2); i++) {var d = document.createElement("div");d.classList.add("LoopRange");this.elt.appendChild(d);}}
LOOPSLIDER.prototype.getMinStep = function(){return this.steps.reduce(function(prev, step) {return step.step < prev ? step.step : prev;}, this.steps[0].step);}
/** Computing all possible steps return all steps in percentage in an array*/
LOOPSLIDER.prototype.initSteps = function(){ var minstep = this.getMinStep();
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
//Adding events to pins
LOOPSLIDER.prototype.addEvents = function(){ this.initSteps(); var that = this;
    var f_win_handler = function(e) {
        if (!LOOPSLIDER.current_pin || e.y === 0) return;
        var values = LOOPSLIDER.current.steps_values.values; steps = LOOPSLIDER.current.steps_values.steps;
        //Variables - getting and Computing
        var val = LOOPSLIDER.current.start, pin = LOOPSLIDER.current_pin; par = parseInt(getComputedStyle(pin.parentNode).width);
        var left = 0, pin_parent = pin.parentNode;
        while(pin_parent){ left += pin_parent.offsetLeft;    pin_parent = pin_parent.offsetParent;}
        var x = (e.touches ? e.touches[0].clientX : e.clientX) - left ;
        /** if x is out of bounds */  if (x > par) x = par;else if (x < 0) x = 0;
        x = (x * 100) / par; //Respect steps - simulate jumping
        for (var i = 0; i < steps.length; i++) {
            if (steps[i + 1] >= x) {
                if (steps[i] < x) {if ( Math.abs(x - steps[i]) < Math.abs(x - steps[i + 1]) ) { x = steps[i]; val = values[i];} else { x = steps[i + 1]; val = values[i + 1]; }}
                break;
            }
        }
        if (parseFloat(pin.dataset.val) != val) { pin.style.left = x + "%"; pin.dataset.val = val; that.change();}//moving!
    }
    if( typeof LOOPSLIDER.window_handled == 'undefined' ) {LOOPSLIDER.window_handled = true;
        var deactivate = function() {  if(LOOPSLIDER.current)  wtf(3,LOOPSLIDER.current.values); LOOPSLIDER.current_pin = undefined;    LOOPSLIDER.current = undefined;}
        window.addEventListener("mousemove", f_win_handler, false);
        window.addEventListener("touchmove", f_win_handler, false);
        window.addEventListener("mouseup",deactivate,false);
        window.addEventListener("touchend",deactivate,false);
    }
    var activate = function(e) {LOOPSLIDER.current = that;LOOPSLIDER.current_pin = e.target;    }
    this.elt.querySelectorAll(".pin").forEach(function(pin) {pin.addEventListener("mousedown",activate,false);pin.addEventListener("touchstart",activate,false);});
}

/// call..LOOPSLIDER
var bmkPins= 2;
function bmkCh(aBmkVals){  var ppr = document.querySelectorAll(".inputs input");
    function s(elt,val){elt.value =  val.toLocaleString(); }
		for(var i=0;i<aBmkVals.length;i++){s(ppr[i],aBmkVals[i]);}
}
function bookdel(btn,i){ var Loop = document.querySelectorAll(".inputs input");
	Loop[i].remove(); Loop[i-1].remove(); btn.remove();
	Loop = document.querySelectorAll(".pin");
	Loop[i].remove(); Loop[i-1].remove();
	Loop = document.querySelectorAll(".LoopRange");wtf(3,[Loop,i]);
	Loop[(i-1)/2].remove();
	bmkPins =bmkPins-4<0? 2:bmkPins-4;
}
function fnBookmark(){ var loops= $('.inputs');	var abs= $('.abSlider'); wtf(3,['tt',AUDIOTRACK.duration]); ///starter
		loops.innerHTML= abs.innerHTML=lps = ''; 
		for (let i = 0; i < bmkPins; i++) {var d = document.createElement("INPUT"); d.id="bmkPins"+(i+1); d.type="text";	//d.setAttribute("readonly", "true");
			loops.appendChild(d);
			if(i==1||i==3||i==5||i==7){var e = document.createElement("BUTTON"); e.innerText="X"; e.addEventListener('click', function(){bookdel(this,i); });
				loops.appendChild(e);
				loops.appendChild(document.createElement("br"));
			}
		}
		var lps = new LOOPSLIDER({ elt: $('.abSlider'), handler: bmkCh, sameStep: false,	pins: bmkPins,
				start:0,	steps:[{step:1, number: AUDIOTRACK.duration},{step: 1, number: 1}, ], values: 0
		})
		bmkPins +=2;
}
$('bookmark').innerHTML='<div class="abSlider" data-val="0"></div><button id="bmButton" type="button" onclick="fnBookmark();">Bookmark</button><div class="inputs"></div>';
/*    */

