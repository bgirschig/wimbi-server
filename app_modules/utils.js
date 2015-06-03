console.log("loading utils.js ...");

// get linear position from values
global.linearPosFromValues = function (vals){
  var min = 1;
  for(var i=1;i<4;i++) min = (vals[i]<vals[min])?i:min;;

  console.log("considering sensors 0 and "+min);
  if(vals[0]==0 || vals[min]==0) return {error:2, msg:"One of the sensors returned an error"}
  if(vals[min]>S.sensors[min].max || vals[0] > S.sensors[0].max ) return {error:3, msg:"One of the sensors returned an out of bounds value"}
  return {x:S.sensors[0].x-vals[0], y:S.sensors[min].y+vals[min], error:null};
}

// device callbacks
global.onDeviceDisconnect = function (){ socketServer.broadcast("deviceStatus,disconnected"); }

// client (iPad) callbacks
global.onClientConnect = function (){
	if(arduino.connected) socketServer.broadcast("deviceStatus,connected");
	else socketServer.broadcast("deviceStatus,disconnected");
}
global.onClientData = function (msg){ console.log(msg); }

global.arrayMax = function(array){var max = array[0]; for(val in array) if(array[val] > max) max = array[val];return max;}
global.truncate = function(val, precision){precision = Math.pow(10,precision); return Math.floor(val*precision)/precision;}
global.tenPow = function(power){return Math.pow(10, power);}
global.print = function(msg){process.stdout.write(msg);}
global.log = function(msg){console.log(msg);}
global.sq = function (val){return val*val;}