'use strict';

window.addEventListener('load', function (e) {

  window.applicationCache.addEventListener('updateready', function (e) {
    if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
      window.location.reload();
    }
  }, false);

}, false);

var getInputRetrieveAction = function () {
  var radios = document.getElementsByName('inputRetrieveAction');
  for (var i = 0; i < radios.length; i++) {
    if (radios[i].checked) {
      return radios[i].value;
    }
  }
  return null;
};

var latlon_ddmm = document.getElementById("latlon_ddmm");
var latlon_dec = document.getElementById("latlon_dec");
var accuracy = document.getElementById("accuracy");
var timestamp = document.getElementById("timestamp");
var altitude = document.getElementById("locationAltitude");
var altitudeAccuracy = document.getElementById("locationAltitudeAccuracy");
var elementMainContent = document.getElementById("mainContent");
var spinner = document.getElementById("spinner");
var pilotNrElement = document.getElementById("inputPilotNo");
var retirevePhoneNoElement = document.getElementById("retirevePhoneNo");


var coords = null;

var hasError = false;
var quietError = true;
var options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
};

function pad(num, padgingStr) {
  var s = padgingStr + num;
  return s.substr(s.length - padgingStr.length);
}
var showError = function (errorText) {
  if (!quietError) {
    document.getElementById("error").classList.remove("hidden");
    document.getElementById("error").focus();
    document.getElementById("error-text").innerHTML = errorText;
  }
  hasError = true;
}
var hideError = function () {
  document.getElementById("error").classList.add("hidden");
  hasError = false;
  quietError = true;
}

var pilotId = '';
var inputRetrieveAction = null;
var validate = function () {
  if (pilotId.trim() === '') {
    showError("Ievadi sacensību dalībnieka kārtas numuru");
    return false;
  }
  if (inputRetrieveAction == null) {
    showError("Izvēlies ziņu ko sūtīt");
    return false;
  }

  hideError();
  return true;
}

var updateData = function () {
  pilotId = pilotNrElement.value;
  inputRetrieveAction = getInputRetrieveAction();

  validate();

  var body = '';
  var buttonOpenTextApp = document.getElementById("buttonOpenTextApp");

  if (coords) {
    var latLon = new LatLon(coords.latitude, coords.longitude);
    var d = new Date();

    document.getElementById("locationCoords").innerHTML = 'Koordinātes: ' + latLon.toString('dm', 4);
    accuracy.innerHTML = '(±' + parseFloat(coords.accuracy).toFixed(0) + 'm)';
    altitude.innerHTML = coords.altitude ? 'Augstums: ' + parseFloat(coords.altitude).toFixed(1) + 'm' : '';
    altitudeAccuracy.innerHTML = coords.altitudeAccuracy ? '(±' + parseFloat(coords.altitudeAccuracy).toFixed(0) + 'm)' : '';
    timestamp.innerHTML = d.toLocaleString();
    
    body = pilotNrElement.value + ': ';

		var coordText = latLon.toString('dm', 4);
		
		switch (inputRetrieveAction) {
			case "RETRIEVE": 
				body += coordText;
				break;
			case "RETRIEVE FAST": 
				body += coordText + " R";
				break;
			case "OK": 
				body += "OK";
				break;
			default:
				body += inputRetrieveAction +" "+coordText;
		}
    
    /*body = pilotNrElement.value + ': ' + (inputRetrieveAction != null ? inputRetrieveAction : '');
    */
    
    //+ ' [' + pad(d.getHours(), '00') + ':' + pad(d.getMinutes(), '00') + ']';

    /*
    if (inputRetrieveAction == null || !latLon) {
      buttonOpenTextApp.classList.remove('disabled');
    }
    else {
      buttonOpenTextApp.classList.add('disabled');
    }
    */
  }
  setSMSLink(buttonOpenTextApp, body, retirevePhoneNoElement.value);
  document.getElementById("textBody").innerHTML = body;

};

var getMobileOperatingSystem = function () {
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;

  if (userAgent.match(/iPad/i) || userAgent.match(/iPhone/i) || userAgent.match(/iPod/i)) {
    return 'ios';
  } else if (userAgent.match(/Android/i)) {
    return 'android';
  };
  return 'unknown'
};

var mobileOperatingSystem = getMobileOperatingSystem();

function showSpinner(show) {
  if (show) {
    spinner.classList.remove("hidden");
    elementMainContent.classList.add("hidden");
  }
  else {
    spinner.classList.add("hidden");
    elementMainContent.classList.remove("hidden");
  }
}
showSpinner(true);

function setSMSLink(element, text, phone) {
  if (hasError) {
    element.removeAttribute("href");
  }
  else {
    var uriText = encodeURI(text);
    if (mobileOperatingSystem === 'ios') {
      element.setAttribute("href", "sms:"+phone+"&body=" + uriText);
    } else {
      element.setAttribute("href", "sms:"+phone+"?body=" + uriText);
    }
  }
}


function showPosition(pos) {
  showSpinner(false);
  coords = pos.coords;
  //  setSMSLink(latlon_dec,parseFloat(coords.latitude).toFixed(6) +' '+parseFloat(coords.longitude).toFixed(7), d);
  updateData();
};

function onError(err) {
  coords = undefined;
  updateData();
  showSpinner(false);
};

function getLocation() {
  if (navigator.geolocation) {
    var options = { enableHighAccuracy: true, timeout: 5000, maximumAge: 0, desiredAccuracy: 0, frequency: 0 };
    navigator.geolocation.watchPosition(showPosition, onError, options);
  }
}

getLocation();

var onPilotNoChange = function() {
  localStorage.setItem("pilotNo", JSON.stringify({ timestamp: new Date(), value: pilotNrElement.value }));
  updateData();  
}

var onRetrievePhoneNoChange = function () {
  localStorage.setItem("retirevePhoneNo", retirevePhoneNoElement.value);
  updateData();
}
var onInputRetrieveActionChange = function () {
  updateData();
}

var storedPilotNo = {}
try {
  storedPilotNo = JSON.parse(localStorage.getItem("pilotNo"));
  storedPilotNo.timestamp = new Date(storedPilotNo.timestamp);  
} catch (e) {
  console.log(e);
}

var storedRetrievePhoneNo = localStorage.getItem("retirevePhoneNo");

var validTimeStamp = new Date();
validTimeStamp.setDate(validTimeStamp.getDate() - 5);

if (storedRetrievePhoneNo)
{
  retirevePhoneNoElement.value = storedRetrievePhoneNo; 
}

if (storedPilotNo && storedPilotNo.timestamp && validTimeStamp < storedPilotNo.timestamp) {
  pilotNrElement.value = storedPilotNo.value;
  updateData();
}

var inputRetrieveActions = document.getElementsByName('inputRetrieveAction');
for (var i = 0; i < inputRetrieveActions.length; i++){
  var element = inputRetrieveActions[i];
  element.addEventListener("click", updateData);
}

var openSmsApp = function () {
  quietError = false;
  return validate();
}

var showHelpText = function(object, show) {
  var helpTextId = object.getAttribute('id') + '-HelpText';
  var helpTextElement = document.getElementById(helpTextId);
  if (helpTextElement){
    if (show) {
      helpTextElement.classList.remove("hidden");
    }
    else {
      helpTextElement.classList.add("hidden");
    }
  }
    
}

validate();
