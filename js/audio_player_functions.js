//Constants that reference html/css classes and ids
var CUSTOM_PLAYER = '.audio-embed';

var TOGGLE_PLAY_BTN = '.play-pause';
var PLAY = '.play';
var PAUSE = '.pause';

var TOGGLE_MUTE_BTN = '.volume';

var LEFT_TIME = "#left-time";
var RIGHT_TIME = "#right-time";

var PROGRESS_BAR = '.progress-bar';
var PROGRESS_FILL = '.progress';
var MUTE = '.on';
var UNMUTE = '.mute';

var TRACKLINK = '.track-link';

//Callback to let us know that all elements of the page have loaded
$(document).ready(function(){
  	SC.initialize({
  		client_id: "2f765d6aec36d2937fb0a3777f5d83b6"
  	});

	//For each custom player found in the page, do the following
	$(CUSTOM_PLAYER).each(function(){

		//This flag will be used throughout 
		//lets us know when the soundcloud player is ready
		var ready = false;

		//The sound object loaded from the API
		var sound;

		//This flag lets us know if the player has been started before
		var hasStarted = false;

		//stores the size of the audio file on once the player is ready
		var duration;

		//Get references to everything we need!
		var btnPlay = $(this).find(TOGGLE_PLAY_BTN);
		var btnMute = $(this).find(TOGGLE_MUTE_BTN);

		var play = $(this).find(PLAY);
		var pause = $(this).find(PAUSE);

		var mute = $(this).find(MUTE);
		var unmute = $(this).find(UNMUTE);

		var progressBar = $(this).find(PROGRESS_BAR);
		var progressFill = progressBar.find(PROGRESS_FILL);

		var leftTime = $(this).find(LEFT_TIME);
		var rightTime = $(this).find(RIGHT_TIME);

		var trackLink = $(this).find(TRACKLINK);

		SC.stream(trackLink.text(), function(snd){
			sound = snd;
			duration = sound.getDuration();

			leftTime.html(msToTime(0));
			rightTime.html("-" + msToTime(duration));

			ready = true;
		});

		//current hack because I can't seem to find API referene to bind an event to positionChange
		//could possibly use ontimedcomments function for now which seems to update every second or so and properly works as documented in API
		var timer = setInterval(function(){
			if(ready){
				if(sound.getState() === "playing"){
					var currentPosition = sound.getCurrentPosition();

					leftTime.html(msToTime(currentPosition));
					rightTime.html("-" + msToTime(duration - currentPosition));
					
					//update the progress bar based on percentage
					progressFill.css('width', ((currentPosition/duration) * 100) + '%');
				}
			}
		}, 500);

		//Toggle play/pause button
		btnPlay.click(function(){
			//only allow interaction if the soundcloud player is ready
			if(ready){
				//if it is paused
				if(sound.getState() !== "playing"){
					//tell the widget to play and display the "pause" icon
					sound.play();
					// 'mySound', {
					// 	whileplaying: function(){

					// 		leftTime.html(msToTime(this.position));
					// 		rightTime.html("-" + msToTime(duration - this.position));

					// 		progressFill.css('width', ((this.position / duration) * 100) + '%');
					// 	}
					// });

					play.css('display', 'none');
					pause.css('display', 'inline');

					hasStarted = true;
				}
				else{ //if it's playing
					//tell the widget to pause and display the "play" icon 
					sound.pause();
					play.css('display', 'inline');
					pause.css('display', 'none');
				}
			}
		});

		//Toggle mute/unmute button
		btnMute.click(function(){
			//only allow interaction if the widget is ready
			if(ready)
			{
				if(sound.getVolume() > 0.99){
					//set the volume to zero and display the "muted" icon
					sound.setVolume(0);
					mute.css('display', 'none');
					unmute.css('display', 'inline');
				}else{//if the volume is not full (in our case, it will be zero)
					//set the volume to 1 (full) and display the "unmuted" icon
					sound.setVolume(1);
					mute.css('display', 'inline');
					unmute.css('display', 'none');
				}
			}
		});

		//When the progress bar is clicked
		progressBar.click(function(e){

			//If the audio file has been started before
			if(hasStarted){
				//Get the start position of this element
				var offset = $(this).offset();
				var width = $(this).width();

				//Get the x position relative to this element
				var x = (e.pageX - offset.left);
				var percentage = x/width;

				//Set the fill width based on click position
				progressFill.css('width', (percentage * 100) + '%');

				//Tell the widget to seek to the appropriate position in the track
				sound.seek(duration * percentage);

				//Update the visible time stamps to the track position
				var position = duration * percentage;
				leftTime.html(msToTime(position));
				rightTime.html("-" + msToTime(duration - position));
			}
		});
	});
});

//Convert milliseconds into 00:00
function msToTime(duration) {
    var seconds = parseInt((duration/1000)%60);
    var minutes = parseInt((duration/(1000*60))%60);

    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return minutes + ":" + seconds;
}