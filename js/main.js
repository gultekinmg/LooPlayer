
function formatTime(time) { var min=Math.floor(time / 60), sec=Math.floor(time % 60);   return min+':'+(sec < 10 ? '0'+sec : sec); }
window.animate = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
/// VARS
let xPos=100, yPos =100 , zPos =100; /* let xPos=Math.floor( window.innerWidth/2), yPos=Math.floor(window.innerHeight/2), zPos=300; */
var LooPlayer=$('LooPlayer')
		, AUDIOTRACK=$('audioSource'), trackName
		, playICON=$('playICON')
		, loading=$("loading")
		, progress=LooPlayer.querySelector('.progress')
		, currentTime=LooPlayer.querySelector('.current-time'), totalTime=LooPlayer.querySelector('.total-time')
		, sliders=LooPlayer.querySelectorAll('.slider')
		, volumeKEY=$('volumeKey'), speakerICON=$('speaker'), fileKEY=$('fileKEY')		
		, volumeControls=LooPlayer.querySelector('.volume-controls'), volumeProgress=volumeControls.querySelector('.slider .progress')
		, draggableClasses=['pin']; wtf(3,sliders);
/// EVENTS
var currentlyDragged=null, REPLAY=false;
playICON.addEventListener('click', togglePlay);
volumeKEY.addEventListener('click', () => { volumeKEY.classList.toggle('open');  volumeControls.classList.toggle('hidden');  $('.pos3d').classList.toggle('hidden');  });
//
LooPlayer.addEventListener('mousedown', function (event) { if (!isDraggable(event.target)) return false;   currentlyDragged=event.target;
	let handleMethod=currentlyDragged.dataset.method;
	this.addEventListener('mousemove', window[handleMethod], false);
	LooPlayer.addEventListener('mouseup', () => {currentlyDragged=false;
		LooPlayer.removeEventListener('mousemove', window[handleMethod], false); ///
		}, false);
});
AUDIOTRACK.addEventListener('timeupdate', updateProgress);
AUDIOTRACK.addEventListener('volumechange', updateVolume);
AUDIOTRACK.addEventListener('loadedmetadata', () => {  totalTime.textContent=formatTime(AUDIOTRACK.duration); });
AUDIOTRACK.addEventListener('canplay', makePlay);
AUDIOTRACK.addEventListener('ended', function () { //AUDIOTRACK.currentTime=14;
		if(REPLAY){var ar=LOOPSLIDER.current.values;
			for(i=0;i<ar.length;i+=2){AUDIOTRACK.currentTime=ar[i]; this.play();} return
		}
		else {playICON.classList.remove('fa-pause'); $('.particles').classList.toggle('hidden'); }//$('.visual').classList.add('hidden');
		rythm.stop();  
	///loop
});
/* update sliders //mobil..
LooPlayer.addEventListener('resize', directionAware);
function directionAware() {
 if (window.innerHeight < 250) {volumeControls.style.bottom='33px'; volumeControls.style.left='-298px';  } 
	else if (LooPlayer.offsetTop < 154) {volumeControls.style.bottom='33px'; volumeControls.style.left='-298px';  }
	else {volumeControls.style.bottom='33px'; volumeControls.style.left='-298px';  } 
}
directionAware();
*/
/// VOLUME & PROGRESS SLIDERS..
sliders.forEach(slider => { let pin=slider.querySelector('.pin');  slider.addEventListener('click', window[pin.dataset.method]);  });
function isDraggable(el) { let canDrag=true, classes=Array.from(el.classList);  //// false
	draggableClasses.forEach(draggable => { if (classes.indexOf(draggable) !== -1) canDrag=true;  }); wtf(3,canDrag);
	return canDrag;
}
function inRange(event) { let rangeBox=getRangeBox(event), rect=rangeBox.getBoundingClientRect(), direction=rangeBox.dataset.direction;
	if (direction=='horizontal') {var min=rangeBox.offsetLeft; var max=min+rangeBox.offsetWidth;   if (event.clientX < min || event.clientX > max) return false;  } 
	else {var min=rect.top; var max=min+rangeBox.offsetHeight; if (event.clientY < min || event.clientY > max) return false; }
	return true;
}
function updateProgress() { var current=AUDIOTRACK.currentTime, percent=current / AUDIOTRACK.duration * 100; //Progressbar
	progress.style.width=percent+'%';
	currentTime.textContent=formatTime(current);
}
function updateVolume() {  volumeProgress.style.height=AUDIOTRACK.volume * 100+'%'; //icon size
	if (AUDIOTRACK.volume >= 0.5) {speakerICON.attributes.d.value='M14.667 0v2.747c3.853 1.146 6.666 4.72 6.666 8.946 0 4.227-2.813 7.787-6.666 8.934v2.76C20 22.173 24 17.4 24 11.693 24 5.987 20 1.213 14.667 0zM18 11.693c0-2.36-1.333-4.386-3.333-5.373v10.707c2-.947 3.333-2.987 3.333-5.334zm-18-4v8h5.333L12 22.36V1.027L5.333 7.693H0z';
	} else if (AUDIOTRACK.volume < 0.5 && AUDIOTRACK.volume > 0.05) {speakerICON.attributes.d.value='M0 7.667v8h5.333L12 22.333V1L5.333 7.667M17.333 11.373C17.333 9.013 16 6.987 14 6v10.707c2-.947 3.333-2.987 3.333-5.334z';
	} else if (AUDIOTRACK.volume <= 0.05) {speakerICON.attributes.d.value='M0 7.667v8h5.333L12 22.333V1L5.333 7.667';  }
}
function getRangeBox(event) {  let rangeBox=event.target;   let el=currentlyDragged;
	if (event.type=='click' && isDraggable(event.target)) {rangeBox=event.target.parentElement.parentElement; }
	if (event.type=='mousemove') {rangeBox=el.parentElement.parentElement; } //
	wtf(3,rangeBox);
	return rangeBox;
}
function getCoefficient(event) {  let slider=getRangeBox(event);   let rect=slider.getBoundingClientRect();   let K=0;
	if (slider.dataset.direction=='horizontal') {let offsetX=event.clientX - slider.offsetLeft; let width=slider.clientWidth; K=offsetX / width; } 
	else if (slider.dataset.direction=='vertical') {let height=slider.clientHeight; var offsetY=event.clientY - rect.top; K=1 - offsetY / height; }
	return K;
}
function rewind(event) {  if (inRange(event)) {AUDIOTRACK.currentTime=AUDIOTRACK.duration * getCoefficient(event); }}
function trace(event) {  if (inRange(event)) {AUDIOTRACK.currentTime=getCoefficient(event); }}
function changeVolume(event) {  if (inRange(event)) {AUDIOTRACK.volume=getCoefficient(event);  }}
///
function togglePlay() {
	if (AUDIOTRACK.paused) {
		 playICON.classList.add('fa-pause'); volumeKEY.classList.add('pulsate');	//$('.visual').classList.toggle('hidden'); //
		onStartClick();
		AUDIOTRACK.play();  }
	else {
		 playICON.classList.remove('fa-pause'); //$('.particles').classList.toggle('hidden'); togglePlay();
		volumeKEY.classList.remove('pulsate');//$('.visual').classList.toggle('hidden'); 	//
		onStopClick();
		AUDIOTRACK.pause(); }
}
function makePlay() {  playICON.style.display='block'; /*  loading.style.display='none';  */}
/// load files..into blob
function handleFiles(files){	'use strict'; AUDIOTRACK.src= window.URL.createObjectURL(files[0]); 
	wtf(4,{'blob':AUDIOTRACK});
	$('audioINFO').innerHTML=$('trck').innerHTML=trackName=files[0].name.replace(/\.\w{2,5}$/g, ''); togglePlay();
}
///

/** ACTX */
var AC=new (window.AudioContext || window.webkitAudioContext)()
	, ACnod_source
	, ACnod_highShelf , ACnod_highPass , ACnod_lowShelf , ACnod_lowPass   
	, ACnod_WaveShape_distortion, ACnod_gain, ACnod_Dual, ACnod_panner , ACnod_listener, ACnod_analyser;
function initAC() {	ACnod_source=AC.createMediaElementSource(AUDIOTRACK);
		//enum BiquadFilterType {"lowpass","highpass","bandpass","lowshelf","highshelf","peaking","notch","allpass"}; 
		ACnod_highShelf=AC.createBiquadFilter();  ACnod_lowShelf=AC.createBiquadFilter(); //filters
		ACnod_highPass=AC.createBiquadFilter(); ACnod_lowPass=AC.createBiquadFilter();
		ACnod_highShelf.type="highshelf"; ACnod_highShelf.frequency.value=4700; ACnod_highShelf.gain.value=50;
		ACnod_lowShelf.type="lowshelf"; ACnod_lowShelf.frequency.value=35; ACnod_lowShelf.gain.value=50;
		ACnod_highPass.type="highpass"; ACnod_highPass.frequency.value=800; ACnod_highPass.Q.value=0.7;
		ACnod_lowPass.type="lowpass"; ACnod_lowPass.frequency.value=880; ACnod_lowPass.Q.value=0.7;
		 //shapes distortion 
		ACnod_WaveShape_distortion=AC.createWaveShaper(); 
		ACnod_WaveShape_distortion.curve=makeDistortionCurve(0);
		 // volume
		ACnod_gain=AC.createGain(); ACnod_gain.gain.value=1;
/// VISUALISE
		let  timer;
		ACnod_analyser= AC.createAnalyser(); ACnod_gain.connect(ACnod_analyser);
		const waveform=new Float32Array(ACnod_analyser.frequencyBinCount);
			ACnod_analyser.getFloatTimeDomainData(waveform);
		; (function updateWaveform() {animate(updateWaveform); ACnod_analyser.getFloatTimeDomainData(waveform); })(); /* var timerWf=setTimeout(updateWaveform, 1000 / 60);  */ 
		const scopeCanvas=$('oscilloscope');  scopeCanvas.width=888; scopeCanvas.height=333; waveform.length=444;
		const scopeContext=scopeCanvas.getContext('2d');
		; (function drawOscilloscope() {	animate(drawOscilloscope);//setTimeout(drawOscilloscope, 1000 / 60);clearTimeout(timer);cancelAnimationFrame(request)
				scopeContext.clearRect(0, 0, scopeCanvas.width, scopeCanvas.height);
				scopeContext.beginPath();
				for (let i=0;  i < waveform.length;  i++) {const x=i;  const y=(0.26+waveform[i] / 1) * 2*scopeCanvas.height;
				if (i==0) scopeContext.moveTo(x, y);  else scopeContext.lineTo(x, y); }
				var grad=scopeContext.createLinearGradient(0, 0, 550, 550);
						grad.addColorStop(0, 'red');  grad.addColorStop(0.4, 'yellow');   grad.addColorStop(0.7, 'green');  grad.addColorStop(1, 'blue');
				scopeContext.strokeStyle=grad;
				scopeContext.lineWidth=3;
				scopeContext.stroke();
		})();
		; (function visualize() { ACnod_analyser.fftSize=2048;  //another spectacular
				var bufferLength=ACnod_analyser.fftSize, dataArray=new Uint8Array(bufferLength); wtf(3,bufferLength);
				var draw=function() { drawVisual=animate(draw);//setTimeout(draw, 1000 / 60);clearTimeout(timer)
						//scopeContext.clearRect(0, 0, scopeCanvas.width, scopeCanvas.height); //above does
						ACnod_analyser.getByteTimeDomainData(dataArray);
						var grad=scopeContext.createLinearGradient(50, 50, 550, 550);
						grad.addColorStop(0, 'red');  grad.addColorStop(0.4, 'yellow');   grad.addColorStop(0.7, 'green');  grad.addColorStop(1, 'blue');
						scopeContext.lineWidth=2;
						scopeContext.strokeStyle=grad;
						scopeContext.beginPath();
						var sliceWidth=scopeCanvas.width * 1.0 / bufferLength, x=0;
						for(var i=0;  i < bufferLength;  i++) { var v=dataArray[i] / 128.0, y=v * scopeCanvas.height/2;
								if (i === 0) { scopeContext.moveTo(x, y); } else { scopeContext.lineTo(x, y); }
								x += sliceWidth;
						}
						scopeContext.lineTo(scopeCanvas.width, scopeCanvas.height/2);
						scopeContext.stroke();
				};
				draw();
		})();

//// panner
		ACnod_Dual=AC.createStereoPanner();   ACnod_Dual.pan.value=0; // Create a stereo panner
		ACnod_panner=AC.createPanner();  // Create XYZ-panner
			ACnod_panner.panningModel='HRTF';
			ACnod_panner.distanceModel='inverse'; ACnod_panner.refDistance=1; ACnod_panner.maxDistance=20000; ACnod_panner.rolloffFactor=1;   
			ACnod_panner.coneInnerAngle=360;   ACnod_panner.coneOuterAngle=0;   ACnod_panner.coneOuterGain=0;
			if(ACnod_panner.orientationX) {
				ACnod_panner.orientationX.value=1;  ACnod_panner.orientationY.value=0; ACnod_panner.orientationZ.value=0; }
			else {ACnod_panner.setOrientation(1,0,0); }
			positionPanner();
		//
		ACnod_listener=AC.listener;  // set up listener position information
			if(ACnod_listener.forwardX) {ACnod_listener.forwardX.value=0; ACnod_listener.forwardY.value=0; ACnod_listener.forwardZ.value=-1;
				ACnod_listener.upX.value=0; ACnod_listener.upY.value=1; ACnod_listener.upZ.value=0; } 
			else {ACnod_listener.setOrientation(0,0,-1,0,1,0);  }					
			if(ACnod_listener.positionX) {// ACnod_listener will always be in the same place for this demo
				ACnod_listener.positionX.value=xPos;
				ACnod_listener.positionY.value=yPos;
				ACnod_listener.positionZ.value=zPos-5;  } 
			else {ACnod_listener.setPosition(xPos,yPos,zPos-5); }
			wtf(3,ACnod_listener);
				listenerData.innerHTML='Listener: '+ACnod_listener.positionX.value+','+ACnod_listener.positionY.value+ ','+ACnod_listener.positionZ.value; 		
	/// CONNECT NODES. no buffer?
	ACnod_source
		.connect(ACnod_highShelf).connect(ACnod_lowShelf).connect(ACnod_highPass).connect(ACnod_lowPass)
		.connect(ACnod_gain)
		.connect(ACnod_WaveShape_distortion)
		.connect(ACnod_Dual)
		.connect(ACnod_panner)
		.connect(AC.destination);
}
initAC() ; ///hacks cors?
// slider events<=
function popinfo(v) {$('popy').innerHTML=v;}
$('highShelf_frequency').addEventListener('input',function(){var v=parseInt(this.value);  popinfo(v); ACnod_highShelf.frequency.value= v;  });
$('highShelf_gain').addEventListener('input',function(){var v=parseInt(this.value);  popinfo(v); ACnod_highShelf.gain.value =v;  });
$('lowShelf_frequency').addEventListener('input',function(){var v=parseInt(this.value);  popinfo(v); ACnod_lowShelf.frequency.value =v;  });
$('lowShelf_gain').addEventListener('input',function(){var v=parseInt(this.value);  popinfo(v); ACnod_lowShelf.gain.value =v;  });
$('highPass_frequency').addEventListener('input',function(){var v=parseInt(this.value);  popinfo(v); ACnod_highPass.frequency.value =v;  });
$('highPass_Q').addEventListener('input',function(){var v=parseInt(this.value);  popinfo(v); ACnod_highPass.Q.value =v;  });
$('lowPass_frequency').addEventListener('input',function(){var v=parseInt(this.value);  popinfo(v); ACnod_lowPass.frequency.value =v;  });
$('lowPass_Q').addEventListener('input',function(){var v=parseInt(this.value);  popinfo(v); ACnod_lowPass.Q.value =v;  });
$('distorter').addEventListener('input',function(){var v=parseInt(this.value)*2;  popinfo(v); ACnod_WaveShape_distortion.curve=makeDistortionCurve(v); });
$('gainer').addEventListener('input',function(){var v=this.value;  popinfo(v); ACnod_gain.gain.value =v;  });
$('gainer').addEventListener('dblclick',function(){var v=this.value=1;  popinfo(v); ACnod_gain.gain.value =v;  });
$('stereo').addEventListener('input',function(){var v=this.value;  popinfo(v); ACnod_Dual.pan.value =v;  });
$('pannerZ').addEventListener('input',function(){zPos=parseInt(this.value); positionPanner();  });

/* panner-xy */
// panner will move as the boombox graphic moves around on the screen
function positionPanner() {
	if(ACnod_panner.positionX) {ACnod_panner.positionX.value=xPos;ACnod_panner.positionY.value=yPos;ACnod_panner.positionZ.value=zPos;   }
	else {  ACnod_panner.setPosition(xPos,yPos,zPos); }
	pannerData.innerHTML='Panner:'+xPos+' , '+yPos+', '+zPos;
	wtf(3,{'ACnod_panner!!':ACnod_panner});
}
$('xy').addEventListener('click',function(event){	wtf(3,event.pageX+"-"+event.pageY, event.offsetX+ "-"+event.offsetY);
	$('.dot').style.left=event.offsetX-10+'px' ;
	$('.dot').style.top=event.offsetY-10+'px';
	xPos=100-(100-event.offsetX)/4;
	yPos=100-(100-event.offsetY)/4;
	positionPanner();
	event.preventDefault();
}); 	

/// UPDATE SLIDERS var xranges=document.querySelectorAll('input[name="eqr"]');  xranges.forEach(function(r){r.addEventListener('input',function(){window[this.dataset.filter][this.dataset.param].value=this.value; }); });
			
function makeDistortionCurve(amount) {// http://stackoverflow.com/a/22313408/1090298
	var k=typeof amount==='number' ? amount:0, n_samples=44100, curve=new Float32Array(n_samples), deg=Math.PI/180, i=0, x;
	for(; i<n_samples; ++i){	x=i*2/n_samples-1; curve[i]=(3+k)*x*20*deg/(Math.PI+k*Math.abs(x)); }
	return curve;
};
// 	
function midiMessageReceived( ev ) {
	var cmd=ev.data[0] >> 4;
	var channel=ev.data[0] & 0xf;
	var noteNumber=ev.data[1];
	var velocity=0;
	if (ev.data.length > 2)  velocity=ev.data[2];
	// MIDI noteon with velocity=0 is the same as noteoff
	if ( cmd==8 || ((cmd==9)&&(velocity==0)) ) { noteOff( noteNumber );  // noteoff
	} else if (cmd==9) { noteOn( noteNumber, velocity);  // note on
	} else if (cmd==11) { controller( noteNumber, velocity); // controller message
	} else { }		// probably sysex!
}

/// _drag dom Elements //MAKE THE ABSOLUTE DIV ELEMENT DRAGGABLE WITH DRAGERCHILDNODE..GREAT..
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
	function close_dragElement(e) {	wtf('newdraggedcoord',xPos,yPos,'mouse',e.clientX,e.clientY);
		document.onmouseup=document.onmousemove=null;  }/* stop moving when mouse button is released:*/
}
_dragElement($("LooPlayer"),loading);
///

