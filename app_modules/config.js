config = {}

config.serverPort = 11999;

config.arduinoConfig = {
	MSB: "last",
	baudrate: 115200,
	vendorId: 0x2341,	    // arduino
	productId: 0x0043,    	// arduino uno (set to null to allow any arduino);
	reconnectDelay: 5000,
	verbose: false,
	expectedVals: 5,		// 4 ultrasonics + 1 piezo
}

config.piezoTreshold = 30;

config.useCalibration = null;
config.useCalibration = "calibration_3";
calibrationDelay = 1000;

module.exports = config;