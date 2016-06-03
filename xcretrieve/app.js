'use strict';

var latlon_ddmm = document.getElementById("latlon_ddmm");
var latlon_dec = document.getElementById("latlon_dec");
var accuracy = document.getElementById("accuracy");
var timestamp = document.getElementById("timestamp");
var altitude = document.getElementById("locationAltitude");
var altitudeAccuracy = document.getElementById("locationAltitudeAccuracy");
var elementMainContent = document.getElementById("mainContent");
var spinner = document.getElementById("spinner");


var coords = null;

var options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
};

var updateData = function () {
  if (!coords)
    return;

  var latLon = new LatLon(coords.latitude, coords.longitude);
  var d = new Date();

  document.getElementById("locationCoords").innerHTML = 'Koordinātes: ' + latLon.toString('dm', 4);
  accuracy.innerHTML = '(±' + parseFloat(coords.accuracy).toFixed(0) + 'm)';
  altitude.innerHTML = coords.altitude ? 'Augstums: ' + parseFloat(coords.altitude).toFixed(1) + 'm' : '';
  altitudeAccuracy.innerHTML = coords.altitudeAccuracy ? '(±' + parseFloat(coords.altitudeAccuracy).toFixed(0) + 'm)' : '';
  timestamp.innerHTML = d.toLocaleString();

  
  var e = document.getElementById("inputRetrieveAction");
  var inputRetrieveAction = e.options[e.selectedIndex].value;
  var buttonOpenTextApp = document.getElementById("buttonOpenTextApp");
  setSMSLink(buttonOpenTextApp,
    '#' + pilotNrElement.value + ': ' + inputRetrieveAction + ' ' +
    latLon.toString('dm', 4)
    + ' [' + d.getHours() + ':' + d.getMinutes() + ']'
  );

  if (e.selectedIndex > 0 || !latLon) {
    buttonOpenTextApp.classList.remove('disabled');
  }
  else {
    buttonOpenTextApp.classList.add('disabled');
  }

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

function setSMSLink(element, text) {
  if (mobileOperatingSystem === 'ios') {
    element.setAttribute("href", "sms:&body=" + text);
  } else {
    element.setAttribute("href", "sms:?body=" + text);
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


var onPilotNoChange = function () {
  localStorage.setItem("pilotNo", JSON.stringify({ timestamp: new Date(), value: pilotNrElement.value }));
  updateData();
}
var onInputRetrieveActionChange = function () {
  updateData();
}


var pilotNrElement = document.getElementById("inputPilotNo");

var storedPilotNo = {}

try {
  storedPilotNo = JSON.parse(localStorage.getItem("pilotNo"));
  storedPilotNo.timestamp = new Date(storedPilotNo.timestamp);
} catch (e) {
  console.error(e);
}

var validTimeStamp = new Date();
validTimeStamp.setDate(validTimeStamp.getDate() - 5);

if (storedPilotNo && storedPilotNo.timestamp && validTimeStamp < storedPilotNo.timestamp) {
  pilotNrElement.value = storedPilotNo.value;
  updateData();
}
