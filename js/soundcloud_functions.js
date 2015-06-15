//Constants that reference html/css classes and ids
var CUSTOM_PLAYER = '.audio-embed';
var FRAME = '.widget';

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

//Callback to let us know that all elements of the page have loaded
//	Note: normally you may find yourself using "ready" instead of "load"
//	We use load because it's essential for the soundcloud API interaction with the iframe
$(window).load(function(){
	//For each custom player found in the page, do the following
	$(CUSTOM_PLAYER).each(function(){

		//This flag will be used throughout 
		//lets us know when the soundcloud player is ready
		var ready = false;

		//This flag lets us know if the player has been started before
		var hasStarted = false;

		//stores the size of the audio file on once the player is ready
		var duration;

		//Get references to everything we need!
		var frame = $(this).find(FRAME)[0];
		var widget = SC.Widget(frame);

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

		//Callback for when the soundcloud player is ready
		widget.bind(SC.Widget.Events.READY, function(){

			//let the rest of our elements know they can be safely interacted with
			ready = true;

			//store the duration of the audio file and update visual elements
			widget.getDuration(function(timeInMilliseconds){
				duration = timeInMilliseconds;

				//progressBar.html("0%");
				leftTime.html(msToTime(0));
				rightTime.html("-" + msToTime(duration));
			});
		});

		//Callback that fires as the soundcloud player updates
		widget.bind(SC.Widget.Events.PLAY_PROGRESS, function(progress) {

			//update current time and time remaining indicators based on current progress
			leftTime.html(msToTime(progress.currentPosition));
			rightTime.html("-" + msToTime(duration - progress.currentPosition));
			
			//update the progress bar based on percentage
			progressFill.css('width', (progress.relativePosition * 100) + '%');
		});

		//Toggle play/pause button
		btnPlay.click(function(){
			//only allow interaction if the soundcloud player is ready
			if(ready)
			{
				//query the player's paused state
				widget.isPaused(function(paused){
					//if it is paused
					if(paused){
						//tell the widget to play and display the "pause" icon
						widget.play();
						play.css('display', 'none');
						pause.css('display', 'inline');

						hasStarted = true;
					}
					else{ //if it's playing
						//tell the widget to pause and display the "play" icon 
						widget.pause();
						play.css('display', 'inline');
						pause.css('display', 'none');
					}
				});
			}
		});

		//Toggle mute/unmute button
		btnMute.click(function(){
			//only allow interaction if the widget is ready
			if(ready)
			{
				//query the player's current volume
				widget.getVolume(function(volume){
					//if the volume is ~1 (full volume)
					if(volume >= 0.99){
						//set the volume to zero and display the "muted" icon
						widget.setVolume(0);
						mute.css('display', 'none');
						unmute.css('display', 'inline');
					}else{//if the volume is not full (in our case, it will be zero)
						//set the volume to 1 (full) and display the "unmuted" icon
						widget.setVolume(1);
						mute.css('display', 'inline');
						unmute.css('display', 'none');
					}
				});
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
				widget.seekTo(duration * percentage);

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