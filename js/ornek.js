console.clear();
// instigate our audio context for cross browser
const AudioContext = window.AudioContext || window.webkitAudioContext;
let AC;
const audioElement = document.querySelector('audio');// load some sound
let track;
const playButton = document.querySelector('.tape-controls-play');
playButton.addEventListener('click', function() {/// play/pause audio
  if(!AC) { init();	}	
	if (AC.state === 'suspended') { AC.resume();	}// check if context is in suspended state (autoplay policy)
	if (this.dataset.playing === 'false') {		audioElement.play();		this.dataset.playing = 'true';	// if track is playing pause it
	} else if (this.dataset.playing === 'true') {		audioElement.pause();		this.dataset.playing = 'false';	}
	let state = this.getAttribute('aria-checked') === "true" ? true : false;
	this.setAttribute( 'aria-checked', state ? "false" : "true" );
}, false);
// if track ends
audioElement.addEventListener('ended', () => {
	playButton.dataset.playing = 'false'; playButton.setAttribute( "aria-checked", "false" );}, false);
function init() {
	AC = new AudioContext();
	track = AC.createMediaElementSource(audioElement);
	// volume
	const gainNode = AC.createGain();
	const volumeControl = document.querySelector('[data-action="volume"]');
	volumeControl.addEventListener('input', function() {gainNode.gain.value = this.value;}, false);
	// panning
	const pannerOptions = { pan: 0 };
	const panner = new StereoPannerNode(AC, pannerOptions);
	const pannerControl = document.querySelector('[data-action="panner"]');
	pannerControl.addEventListener('input', function() {panner.pan.value = this.value;}, false);
	// connect our graph
	track.connect(gainNode).connect(panner).connect(AC.destination);
}