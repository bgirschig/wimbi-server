This is an old version of the tapwood server, made for the sonar technology, which was abandonned.

# tapwood server

###calibration
- linear correlation calibration for each sensor
- save calibration in json format
- load previous calibration

###trilateration
- ...


###Ultrasonics_code
Arduino-side code.
Loops though all ultrasonic sensors as fast as possible while keeping them from interferring with each-other.
Because the piezzo needs a faster read-rate, values are sent way more often than the 'ultrasonic loop' rate.
