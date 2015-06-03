function Sensor(x, y, max){
	this.a = 1;
	this.b = 0;
	this.calibrated = false;
	this.max = max;
	this.values = [];
	
	this.calVals = [];
	this.lastComputed = 0;
}
Sensor.prototype.record = function(val){
	if(val>0){
		val = this.getDist(val);
		if(val < this.max || this.max == null || !this.calibrated) this.values.push(val);
	}
}

Sensor.prototype.combineVals = function(){
	var t = 0;
	for(key in this.values) t += this.values[key];
	this.lastComputed = t/this.values.length;

	this.values = [];
	return this.lastComputed;
}
Sensor.prototype.calibrate = function(calPoints){
	this.calVals.push({dist:calPoints[this.calVals.length], val:this.lastComputed});

	if(this.calVals.length>=2){
		this.a = (this.calVals[0].dist-this.calVals[1].dist)/(this.calVals[0].val-this.calVals[1].val);
		this.b = this.calVals[0].dist-(this.a*this.calVals[0].val);
		this.calibrated = true;
	}
}
Sensor.prototype.getDist = function(val){ return (this.a*val)+this.b; }

module.exports = Sensor;