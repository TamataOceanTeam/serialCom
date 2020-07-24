/* ARduino Code to receive and send data from Serial Port. */

int timeInterval = 10000;
int start_log = 0;
long lastMsg = 0;
String name = "ESP32-SERIAL";

void setup() {
  Serial.begin(9600);
  delay(10);
  Serial.println("INIT_ESP32");
}

void loop() {
  // Sending data... or information every timeInterval
  long now = millis();
  if (now - lastMsg > timeInterval ) {
    if (start_log) {

      // Push the code here to send DATA SENSORS ( JSON FORMAT )
      Serial.println("Send data... " );
    }
    lastMsg = now;  
  }
  
  if (Serial.available() > 0) {
    String data = Serial.readStringUntil('\n');
    Serial.print( name + " - message received : ");
    Serial.println(data);
    commandManager(data);
  }
}

// Management Command order
int commandManager(String message) {

  if (message == "Init_connection_from_Raspi") {
    Serial.println( name + " - INIT Raspi received ");
    Serial.print( "config start_log = " );
    Serial.println( start_log );
  }
  else if (message == "restart") {
    Serial.println( name + " - RESTART in progress ");
    ESP.restart();
  }
  else if (message == "calibrate") {
    Serial.println( name + " - CALIBRATE in progress ");
  }
  else if (message == "startLog") {
    Serial.println( name + " - Start log received ");
    start_log = 1;
  }

  else if (message == "stopLog") {
    Serial.println( name + " - StopLog received");
    start_log = 0;
  }

  else {
    Serial.println( "Unknown command : " + message );
  }
}
