// echo -> green
// trigger -> yellow

#define SENSORCOUNT 4
#define VALUESCOUNT 5
#define STARTPIN 2

int values[VALUESCOUNT];
int currentSensor, nextMeasure, time;

void setup(){
  Serial.begin(115200);
  for(int i=0; i<SENSORCOUNT; i++){
    pinMode(STARTPIN+(2*i), OUTPUT);  // trigger
    pinMode(STARTPIN+(2*i)+1, INPUT); // echo 
  }
  currentSensor = 0;
  nextMeasure = 0;
}

void loop() {
  time = millis();
  
  // ask for values from ultrasonics if delay has passed
  if(time>=nextMeasure){
    currentSensor = (currentSensor+1)%SENSORCOUNT;
    values[currentSensor] = getDist(currentSensor);//**/ 0;
    nextMeasure = time+30;
  }
  
  // last value is the piezzo
  values[SENSORCOUNT] = analogRead(A0);

  // send values
  for(int i=0; i<VALUESCOUNT; i++) sendVal(values[i]);
  closeValGroup();
}

// communication utils
void sendVal(long val){Serial.write(val);Serial.write(val>>8);}
void closeValGroup(){ Serial.write(255);Serial.write(255); }

// HC-SR04 utils
int getDist(int which){
  int trig = STARTPIN+(2*which);
  int echo = STARTPIN+(2*which)+1;
  
  digitalWrite(trig, LOW);
  delayMicroseconds(2);
  digitalWrite(trig, HIGH);
  delayMicroseconds(10);
  digitalWrite(trig, LOW);
  return pulseIn(echo, HIGH, 8500);
}
