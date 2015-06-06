// requires
require('./app_modules/utils.js');
var config = require('./app_modules/config.js');
var geom = require('./app_modules/geom.js');
var Sensor = require('./app_modules/sensor.js');

var arduino = require('arduinoConnect');
var socketServer = require('socketServer');
var fs = require('fs');


// internal
var piezoTrack;
var record;
var sensors;
var allowTap;

function init(){
    console.log(
      '\033[2J',
      '//////////////////////////////////////////////////////////////////\n',
      'tapwoodServer 0.0.1\n\n',
      'features:\n',
      '  - communication with tapwood ipad\n',
      '  - communication with arduino ultrasonics-code\n',
      '  - calibration procedure\n',
      '  - save calibration\n',
      '//////////////////////////////////////////////////////////////////\n\n');

    // server config
    socketServer.init({
      onClientConnect:onClientConnect,
      onClientData:onClientData,
      serverPort: config.serverPort,
      verbose: true,
    })

    // arduino config
    config.arduinoConfig.onDeviceConnect = onDeviceConnect,
    config.arduinoConfig.onDeviceDisconnect = onDeviceDisconnect,
    config.arduinoConfig.onDeviceData = onData,
    arduino.connect(config.arduinoConfig);
    
    // init vars
    piezoTrack = [];
    record = false;
    sensors = [];
    allowTap = true;

    // create sensors (x,y,max,id) /!\ couter-clockwise
    sensors.push(new Sensor(82, 18.5, 147, sensors.length));
    sensors.push(new Sensor(79, 1, 145, sensors.length));
    sensors.push(new Sensor(72.5, -17, 135, sensors.length));
    sensors.push(new Sensor(71.9, -35.5, 136, sensors.length));
}

function onDeviceConnect(){
  socketServer.broadcast("deviceStatus,connected");
  console.log("connected to arduino\n");

  console.log(
  "\n\n========================================================\n",
  "---- Calibration --------------------------\n");

  if(config.useCalibration==null){
    // process.exit();
    // start calibration.
    process.stdin.on('data', onInput);
    console.log(
      "for each sensor, you will be asked to place an object at 10 or 100cm from the sensor, then hit enter. for example:",
      "\tcalibrate [0]10cm (Hit enter when ready)\nmeans: place an object at 10cm from sensor 0",
      "-------------------------------------------\n\n"
    );

    calibrateStep();
  }
  else{
    var parsed = JSON.parse(fs.readFileSync("saved/"+config.useCalibration+".json", "utf8"));
    
    console.log("loaded calibration from file:");
    for(key in parsed){
      sensors[key].a = parsed[key].a;
      sensors[key].b = parsed[key].b;
      sensors[key].calibrated = true;
      console.log("["+key+"] a:" + parsed[key].a + " b:" + parsed[key].b);
    }
    calDone = true;
    console.log("========================================================\n");
  }
}

// records raw data.
function onData(data, err){
  if(err==null){
    var piezoVal = Math.abs(data[sensors.length]-500);
    
    if(record){
      for(key in sensors) sensors[key].record(data[key]);
      piezoTrack.push(piezoVal);
    }

    // if piezo is > treshold and allowTap is true, measure
    else if(piezoVal>config.piezoTreshold && calDone && allowTap){
      measure(onTap, 15, isStillTap);
      allowTap = false; setTimeout(function(){allowTap=true;}, 200);
    }
  }
}

// 'loop' should be a function returning whether or not we continue measuring
function measure(callBack, delay, loop){
  record = true;
  setTimeout(function(){
    // stop recording, return values
    if(loop==undefined || !loop()){
      record = false;
      for(key in sensors) sensors[key].combineVals();
      callBack();
    }

    // continue recording
    else if(loop!=undefined && loop()) measure(callBack, delay, loop);
  }, delay);
}

// check if we are still 'hearing' the tap
function isStillTap(){
  var max = arrayMax(piezoTrack); piezoTrack = [];
  return (max==undefined || max>config.piezoTreshold);
}

function onTap(){
  // log measured distances (after average and conversion to cm)
  for(key in sensors) console.log("["+key+"] "+sensors[key].lastComputed);
  console.log(/* spacer */);

  // send computed position;
  pos = geom.posFromSensors(sensors);
  if(pos!=null && pos.error==null){
    console.log("====> tap result: "+pos.x+", "+pos.y);
    socketServer.broadcast(pos.x+","+pos.y);
  }

  // reset piezo track
  piezoTrack = [];
}


////////////////////////////////////////////////////////////////////// CALIBRATION
var calStep = -1;
var calDone = false;
var calPoints = [10,100];

onInput = function(data){
  if(!record && calStep<8){
    console.log("recording...");
    measure(onCalibration, 1000);
  }
}
calibrateStep = function(){
  calStep++;
  print("calibrate ["+Math.floor(calStep/2)+"]"+calPoints[calStep%calPoints.length]+"cm (Hit enter when ready)");
}
onCalibration = function(){
  var currentCal = Math.floor(calStep/2);

  sensors[currentCal].calibrate(calPoints);
  
  if(calStep<sensors.length*2-1) calibrateStep();
  else{
    calStep++; // get out of calibration mode
    calDone = true;
    
    // json
    var saved = "[\n";
    for(key in sensors) saved += '  {"a":'+sensors[key].a+', "b":'+sensors[key].b+'},\n';
    saved = saved.substring(0,saved.length-2) + "\n]\n";

    fs.writeFile("saved/calibration_"+Date.now()+".json", saved, "utf8");
    console.log("\ncalibration has been saved:\n"+saved);
    console.log("========================================================\n\n");
  }
}

onClientData = function (msg){ print(msg); }
////////////////////////////////////////////////////////////////////////////

init(); // start everything

