var 
	AC, ACnod_source
	, ACnod_highShelf , ACnod_highPass , ACnod_lowShelf , ACnod_lowPass   
	, ACnod_WaveShape_distortion, ACnod_gain, ACnod_Dual, ACnod_panner , ACnod_listener, ACnod_analyser;
let xPos=100, yPos =100 , zPos =100; /* let xPos=Math.floor( window.innerWidth/2), yPos=Math.floor(window.innerHeight/2), zPos=300; */

function initAC() {
		AC=new (window.AudioContext || window.webkitAudioContext)();
		ACnod_source=AC.createMediaElementSource(DOM.AUDIOPLAYER);wtf(5,DOM.AUDIOPLAYER);
		///enum BiquadFilterType {"lowpass","highpass","bandpass","lowshelf","highshelf","peaking","notch","allpass"}; 
		ACnod_highShelf=AC.createBiquadFilter();  ACnod_lowShelf=AC.createBiquadFilter(); //filters
		ACnod_highPass=AC.createBiquadFilter(); ACnod_lowPass=AC.createBiquadFilter();
		ACnod_highShelf.type="highshelf"; ACnod_highShelf.frequency.value=4700; ACnod_highShelf.gain.value=50;
		ACnod_lowShelf.type="lowshelf"; ACnod_lowShelf.frequency.value=35; ACnod_lowShelf.gain.value=50;
		ACnod_highPass.type="highpass"; ACnod_highPass.frequency.value=800; ACnod_highPass.Q.value=0.7;
		ACnod_lowPass.type="lowpass"; ACnod_lowPass.frequency.value=880; ACnod_lowPass.Q.value=0.7;
		 ///shapes distortion 
		ACnod_WaveShape_distortion=AC.createWaveShaper(); 
		ACnod_WaveShape_distortion.curve=makeDistortionCurve(0);
		 /// volume
		ACnod_gain=AC.createGain();	ACnod_gain.gain.setValueAtTime(1, AC.currentTime + 2); //ACnod_gain.gain.value=1;
		
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
				var bufferLength=ACnod_analyser.fftSize, dataArray=new Uint8Array(bufferLength); //console.log(bufferLength);
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
			//console.log(ACnod_listener);
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
//initAC() ; ///hacks cors?
// slider events<=
function popinfo(v) {$('popy').innerHTML=v;}
function bindControlEvents() {
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
$('audioVolume').addEventListener('input',function(){var v=this.value/100;  popinfo(v); DOM.AUDIOPLAYER.volume=v; WIN.volumeValue=v;  });
$('pannerZ').addEventListener('input',function(){zPos=parseInt(this.value); positionPanner();  });
}
bindControlEvents();

/* panner-xy */
// panner will move as the boombox graphic moves around on the screen
function positionPanner() {
	if(ACnod_panner.positionX) {ACnod_panner.positionX.value=xPos;ACnod_panner.positionY.value=yPos;ACnod_panner.positionZ.value=zPos;   }
	else {  ACnod_panner.setPosition(xPos,yPos,zPos); }
	pannerData.innerHTML='Panner:'+xPos+' , '+yPos+', '+zPos;
	wtf(3,{'ACnod_panner!!':ACnod_panner});
}
$('xy').addEventListener('click',function(event){	//console.log(event.pageX+"-"+event.pageY, event.offsetX+ "-"+event.offsetY);
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

