/*
***********************************
testRTCAudio functions
***********************************
The following set of functions do the actual work to open an RTC AUDIO stream with whatever devices 
are set as default (if any). This results in the mic being used to collect output for the playback
device.
*/

function testRTCAudioCheckInputVolumeLevel() { //Function which reads the volume level of the RTC stream and changes a visual accordingly
	navigator.mediaDevices.getUserMedia({ audio: true }).then(function(stream) {
		audioContext = new AudioContext();
		analyser = audioContext.createAnalyser();
		microphone = audioContext.createMediaStreamSource(stream);
		javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);
		analyser.smoothingTimeConstant = 0.8;
		analyser.fftSize = 1024;
		microphone.connect(analyser);
		analyser.connect(javascriptNode);
		javascriptNode.connect(audioContext.destination);
		javascriptNode.onaudioprocess = function() {
			var array = new Uint8Array(analyser.frequencyBinCount);
			analyser.getByteFrequencyData(array);
			var values = 0;

			var length = array.length;
			for (var i = 0; i < length; i++) {
			values += (array[i]);
			}

			var average = values / length;

			if(Math.round(average)>15) {
				console.log(Math.round(average));
				document.getElementById("imgDeviceStatusInputLevel").style.height = Math.round(average)-5;
				}
			}
		})
	
	.catch(function(err) {
		return false;
		});
	}

function testRTCAudio() { //Function which initiates audio devices, starts a stream and calls testRTCAudioHandleSuccess() to test your audio
	testRTCAudioCheckInputVolumeLevel();
	navigator.mediaDevices.getUserMedia(constraints).then(testRTCAudioHandleSuccess).catch(testRTCAudioHandleError);
	document.getElementById('gum-local').play();
	}

function testRTCAudioHandleSuccess(stream) { //Function which runs the stream 
	const audioTracks = stream.getAudioTracks();
	console.log('Got stream with constraints:', constraints);
	console.log('Using audio device: ' + audioTracks[0].label);
	stream.oninactive = function() {
		console.log('Stream ended');
		};
	window.stream = stream; // make variable available to browser console
	audio.srcObject = stream;
	}

function testRTCAudioHandleError(error) { //Function which logs an error if testRTCAudio fails.
	const errorMessage = 'navigator.MediaDevices.getUserMedia error: ' + error.message + ' ' + error.name;
	console.log(errorMessage);
	alert(errorMessage);
	}


/*
***********************************
Audio device permissions
***********************************
Set of functions to trigger dialogue to enable microphone access. 
Nick Freear, 16-Sep-2020.

* https://gist.github.com/nfreear/4fccbc1d3091aa71254a7262b113a23b
* https://developers.google.com/web/fundamentals/media/recording-audio/#ask_permission_to_use_microphone_responsibly
* https://emojipedia.org/search/?q=mic
*/

async function launchBrowserMicrophoneAllowPrompt () {
	try { // Initiate the browser prompt.
		const res = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
		console.warn('Mic perm:', 'allow:', res);
		return res;
		} 
	catch (err) {
		console.warn('Mic perm:', 'block:', err); // "DOMException: Permission denied"
		return false;
		}
	}

async function queryBrowserMicrophonePermission () {
	const result = await navigator.permissions.query({ name: 'microphone' });
	
	if (result.state == 'granted') {
		} else if (result.state == 'prompt') {

		} else if (result.state == 'denied') {
			if (document.getElementById("stepWarningSettingsInfo").innerHTML == "") {
				
				showIssue("audioinput", "<font color='red'>" + document.getElementById("Error0").innerHTML + "<font>");	
				showIssue("audiooutput", "<font color='red'>" + document.getElementById("Error1").innerHTML + "<font>");	
			}
		}

	result.onchange = ev => {
		console.warn('Mic perm:', 'onchange:', ev);
		};

	console.warn('Mic perm:', 'state:', result.state, result);
	return result;
	}

/*
***********************************
UI / Logic functions
***********************************
Set of functions to support the steps/flows and holding the logic when to make options available
*/

function execStep(stepId) { //Function which does the visuals for each step + triggers the logic/tests
	// Functions does all the logic for executing a step and doing the UI. 
	// Returns: boolean
	// Parameter 1: integer : Step number (1 2 or 3)
	// Parameter 2: 

	if (stepId < 1 || stepId > 3){
		return false;
		}

	var activeStepDivName = "titleBox_step" + stepId;
	var overlayToUnGrey = "stepOverlay" + stepId;
	
	// Reset everything, 
	showDiv("titleBox_step1", 0);
	showDiv("titleBox_step2", 0);
	showDiv("titleBox_step3", 0);
	document.getElementById('buttonStep1').className = 'buttonInactive';
	document.getElementById('buttonStep1').disabled  = true;
	document.getElementById('buttonStep2').className = 'buttonInactive';
	document.getElementById('buttonStep2').disabled  = true;
	document.getElementById('buttonStep3a').className = 'buttonInactive';
	document.getElementById('buttonStep3a').disabled  = true;
	document.getElementById('buttonStep3b').className = 'buttonInactive';
	document.getElementById('buttonStep3b').disabled  = true;
	document.getElementById('buttonStep3_1').className = 'buttonInactive';
	document.getElementById('buttonStep3_1').disabled  = true;
	
	//Set the step active visually
	showDiv(activeStepDivName, 1);
	//Remove opacity from the relevant division
	//document.getElementById(overlayToUnGrey).style.opacity = 100;

	if (stepId == 1){
		document.getElementById('buttonStep2').className = 'buttonActive';
		document.getElementById('buttonStep2').disabled  = false;
		document.getElementById("stepOverlay2").style.opacity = 100;
		document.getElementById("stepOverlay2").style.backgroundColor = "transparent";	
		document.getElementById("stepWarningSettings").style.display = "none";
		//document.getElementById("stepWarningSettingsInfo").innerHTML = "";
		
		setTimeout(function(){
			if (document.getElementById("stepWarningSettingsInfo").innerHTML == "") {
				execStep(2); // Wait for theclick event to be finished before initiating step 2 to make sure not already an issue occured.
				}
		}, 500);
		
		
		}
	
	if (stepId == 2){
		document.getElementById("imgDeviceStatusInput").src = "media/icon_progress.gif";
		document.getElementById("imgDeviceStatusOutput").src = "media/icon_progress.gif";
		document.getElementById("stepWarningSettings").style.display = "none";
		document.getElementById("stepWarningSettingsInfo").innerHTML = "";
		document.getElementById("enableTestAudioStep").checked = false;
		enableTestAudioStep();
		
		getDefaultDevice("audioinput", "deviceInputDefaultInfoText");
		getDefaultDevice("audiooutput", "deviceOutputDefaultInfoText");
		triggerCheck();
		}

	if (stepId == 3){
		document.getElementById('buttonStep3a').className = 'buttonActive';
		document.getElementById('buttonStep3a').disabled  = false;
		document.getElementById('buttonStep3b').className = 'buttonActive';
		document.getElementById('buttonStep3b').disabled  = false;
		document.getElementById('buttonStep3_1').className = 'buttonActive';
		document.getElementById('buttonStep3_1').disabled  = false;
		document.getElementById("stepOverlay3").style.opacity = 100;
		document.getElementById("stepOverlay3").style.backgroundColor = "transparent";	
		document.getElementById('buttonStep2').className = 'buttonActive';
		document.getElementById('buttonStep2').disabled  = false;
		testRTCAudio();
		document.getElementById('buttonStep3a').style.display = "none";	
		document.getElementById('buttonStep3b').style.display = "block";
		document.getElementById('buttonStep3a').onclick = function() {toggleAudioTest()};		
		}		

	return true;
	}

function toggleAudioTest() { //Function which stops and starts the audio test
	// Functions//Function which stops and starts the audio test
	// Returns: boolean
	// Parameter 1: <none>
	if (document.getElementById('buttonStep3a').style.display == "none") {
		//We are playing sound and should stop it and enable the test sound button
		document.getElementById('gum-local').pause();
		document.getElementById('buttonStep3a').style.display = "block";	
		document.getElementById('buttonStep3b').style.display = "none";
		}
	else {
		//We are not sound and should start it and enable the stop sound button
		document.getElementById('gum-local').play();
		document.getElementById('buttonStep3a').style.display = "none";	
		document.getElementById('buttonStep3b').style.display = "block";
		}
	}
	
function enableTestAudioStep() { //Function which enables step 3 audiotest irrespective of default devices 
	// Functions enables the UI of step 3 to do the audio tsst when the checkbox is checked to be able to test audio despite not having a headset. 
	// Returns: boolean
	// Parameter 1: <none>
	if (document.getElementById("enableTestAudioStep").checked == true) {
		document.getElementById("stepOverlay3").style.opacity = 100;
		document.getElementById("stepOverlay3").style.backgroundColor = "transparent";		
		document.getElementById('buttonStep3a').className = 'buttonActive';
		document.getElementById('buttonStep3a').disabled  = false;
		document.getElementById('buttonStep3b').className = 'buttonActive';
		document.getElementById('buttonStep3b').disabled  = false;
		document.getElementById('buttonStep3_1').className = 'buttonActive';
		document.getElementById('buttonStep3_1').disabled  = false;
		}
	else {
		document.getElementById("stepOverlay3").style.opacity = 0.3;
		document.getElementById("stepOverlay3").style.backgroundColor = "#ffffff";		
		document.getElementById('buttonStep3a').className = 'buttonInactive';
		document.getElementById('buttonStep3a').disabled  = true;
		document.getElementById('buttonStep3b').className = 'buttonInactive';
		document.getElementById('buttonStep3b').disabled  = true;
		document.getElementById('buttonStep3_1').className = 'buttonInactive';
		document.getElementById('buttonStep3_1').disabled  = true;		
		}
	return true;
	}

function showIssue(deviceType, warningString) { //Function which renders the warning dialogue when wrong devices are detected and renders indication of issues
	//Functions changes the visuals for an error situation. Called by getDefaultDevice.
	// Returns: boolean, true is success
	// Parameter 1: string : audioinput - or - audiooutput
	// Parameter 2: string : The text to show in the warning dialogue indicating what is wrong
	if (deviceType == "audioinput") { var image2update = "imgDeviceStatusInput"; }
	if (deviceType == "audiooutput") { var image2update = "imgDeviceStatusOutput"; }
	document.getElementById(image2update).src = "media/icon_nok.gif";
	document.getElementById("stepWarningSettings").style.display = "block";
	document.getElementById("stepWarningSettingsInfo").innerHTML = document.getElementById("stepWarningSettingsInfo").innerHTML + "<ul><li>" + warningString + "</li></ul>";	
	return true;
	}

function showDiv(divId, toggleValue) { // Shows / hides a div to support UI execStep()
	// Functions shows or hides a division
	// Returns: boolean
	// Parameter 1: string : division ID to show or hides
	// Parameter 2: integer : 1=show, 2=hide  (defaults to 1)
	var x = document.getElementById(divId);

	if (toggleValue == 0) {
		x.style.display = "none";
		}
	else {
		x.style.display = "block";
		}
}

function triggerCheck() { // Is called by execStep and iniates the checks after the devices are detemined with a timed delay (as getusermedia might take a few seconds)
	// Functions to check the devices found and decide if audio test is advised.
	// Returns: boolean
	// Parameter 1: string : division ID to show or hides
	// Parameter 2: integer : 1=show, 2=hide  (defaults to 1)
	setTimeout(function(){
		validateDefaultDevices("audioinput"); // Calls the checks the value for the input device.
		}, 2000);
	setTimeout(function(){
		validateDefaultDevices("audiooutput"); // Calls the checks the value for the output device.
		}, 3000);
	setTimeout(function(){ 
		// If no error was rendered then we can enable the audio test step!
		if (document.getElementById("stepWarningSettingsInfo").innerHTML.trim() == "")
			{
			document.getElementById('buttonStep3a').className = 'buttonActive';
			document.getElementById('buttonStep3a').disabled  = false;
			document.getElementById('buttonStep3b').className = 'buttonActive';
			document.getElementById('buttonStep3b').disabled  = false;
			document.getElementById('buttonStep3_1').className = 'buttonActive';
			document.getElementById('buttonStep3_1').disabled  = false;
			document.getElementById("stepOverlay3").style.opacity = 100;
			document.getElementById("stepOverlay3").style.backgroundColor = "transparent";	
			document.getElementById('buttonStep2').className = 'buttonActive';
			document.getElementById('buttonStep2').disabled  = false;
			}
		else {
			document.getElementById('buttonStep2').className = 'buttonActive';
			document.getElementById('buttonStep2').disabled  = false;			
			}
		}, 3200);	
	return true
	}

function validateDefaultDevices(deviceType) { // Logic to determine if there is an issue condition with the audio device selected.
	// Functions to determine if there is an issue condition with the audio device selected and populates the warning dialogue
	// Returns: boolean
	// Parameter 1: string : audioinput - or - audiooutput to be checked.
	if (deviceType == "audioinput") {
		if (document.getElementById("deviceInputDefaultInfoText").innerHTML == "" ) {
			showIssue("audioinput", document.getElementById("Error2").innerHTML);
			return true;
			}

		str2check = document.getElementById("deviceInputDefaultInfoText").innerHTML;
		if (str2check.includes("Realtek")) {
			showIssue("audioinput", document.getElementById("Error3").innerHTML);
			return true;
			}

		document.getElementById("imgDeviceStatusInput").src = "media/icon_ok.gif";
		return true;
	}

	if (deviceType == "audiooutput") {
		if (document.getElementById("deviceOutputDefaultInfoText").innerHTML == "") {
			showIssue("audiooutput", document.getElementById("Error4").innerHTML);
			return true;
			}

		str2check = document.getElementById("deviceOutputDefaultInfoText").innerHTML;
		if (str2check.includes("Realtek")) {
			showIssue("audiooutput", document.getElementById("Error5").innerHTML);
			return true;
			}
		if (str2check.includes("Display")) {
			showIssue("audiooutput", document.getElementById("Error6").innerHTML);
			return true;
			}
	
		document.getElementById("imgDeviceStatusOutput").src = "media/icon_ok.gif";
		return true;		
	}

	return true;
	}

function getDefaultDevice(deviceType, spanToPopulate ) { //Functions collects the input or output audio device set up as "default" on the OS and writes the value to the designated span object
	//Functions collects the input or output audio device set up as "default" and writes the value to the designated span object
	// Returns: boolean, true is successfully written value to span, otherwise error
	// Parameter 1: string : audioinput - or - audiooutput - or - video
	// Parameter 2: string : the DOM id of the span to write the value to

	document.getElementById(spanToPopulate).innerHTML = "";
	const constraints = {'video': false, 'audio': true}
	
	if (!navigator.mediaDevices?.enumerateDevices) {
		showIssue(deviceType, "Technical ERROR: EnumerateDevices() not supported.");
		return false;
		} 
	else {
		navigator.mediaDevices
		.enumerateDevices()
		.then((devices) => {
			console.log(devices); 
			devices.forEach((device) => {
				if (`${device.kind}` != "videoinput") {
					if (`${device.label}` == "" && document.getElementById("stepWarningSettingsInfo").innerHTML == "") {
						//If label is Null this indicates that no permission was given in the browser for accessing the microfoon (could be a popup)
						showIssue(deviceType, "<font color='red'>" + document.getElementById("Error0").innerHTML + "<font>");
						return true;
					}

					if (`${device.kind}` == deviceType) {
						var device_string = `${device.label}`;		
						if (device_string.startsWith("Default") || device_string.startsWith("Standaard")) {
							document.getElementById(spanToPopulate).innerHTML = `${device.label}`;
							return true;
							}
						}
				}
				});
			})
		.catch((err) => {
			console.error(`${err.name}: ${err.message}`);
			return false;
			});
		}
		
	return true;
	}

/*
***********************************
UI / Language functions
***********************************
Set of functions to support dual language
*/
function updateContent(langData) { //Function which updates all DOM elements with the value per key i.e. dual language support
	//Function which updates all DOM elements with the value per key i.e. dual language support
	// Returns: boolean, true is successfull, happy coding :-D
	// Parameter 1: <none>

	document.querySelectorAll('[data-i18n]').forEach(element => {
		const key = element.getAttribute('data-i18n');
		element.textContent = langData[key];
		});
		
	//Buttons do not like to be updated with element.textContent.. so we do the buttons seperately.
	document.getElementById("buttonStep1").value = langData["buttonStep1"];
	document.getElementById("buttonStep2").value = langData["buttonStep2"];
	document.getElementById("buttonStep3a").value = langData["buttonStep3a"];
	document.getElementById("buttonStep3b").value = langData["buttonStep3b"];	
	document.getElementById("buttonStep3_1").value = langData["buttonStep3_1"];
	return true;
	}

async function fetchLanguageData(lang) { // Function which gets the browser language and loads the appropriate lang json file.
	//Function which gets the browser language and loads the appropriate lang json file.
	// Returns: the json object. 
	// Parameter 1: <none>

	const response = await fetch(`lang/${lang}.json`);
	return response.json();
	}
	
