#include <WiFi.h>
#include <HTTPClient.h>
#include <ESP32Servo.h>
#include <ArduinoJson.h>

/* ================= WIFI SETTINGS ================= */
const char* WIFI_SSID     = "Wokwi-GUEST";
const char* WIFI_PASSWORD = "";

/* ================= BACKEND API ENDPOINTS ================= */
const char* API_URL         = "http://34.28.197.110:5000/api/sensors";
const char* API_CONTROL_URL = "http://34.28.197.110:5000/api/manual_control";

/* ================= PIN ASSIGNMENTS ================= */
#define RAIN_ANALOG  34
#define SOIL_ANALOG  35
#define SERVO_GATE   25
#define SERVO_ROOF   26

/* ================= THRESHOLDS ================= */
#define SOIL_WET_THRESHOLD 2500
#define RAIN_THRESHOLD     2500

/* ================= GLOBAL OBJECTS ================= */
Servo waterGate;
Servo roofCover;

/* ================= TIMING CONTROL ================= */
unsigned long previousMillis = 0;
const long interval          = 5000; 

unsigned long controlMillis  = 0;
const long controlInterval   = 2000; 

int lastGateState = -1;
int lastRoofState = -1;

/* ================= SETUP ================= */
void setup() {
  Serial.begin(115200);

  // Initialize Sensors
  pinMode(RAIN_ANALOG, INPUT);
  pinMode(SOIL_ANALOG, INPUT);

  // Initialize Servos
  waterGate.attach(SERVO_GATE);
  roofCover.attach(SERVO_ROOF);

  // Default positions (Closed)
  waterGate.write(0);
  roofCover.write(0);

  // Connect to WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\n✅ Wi-Fi connected");
}

/* ================= MANUAL CONTROL CALLBACK ================= */
void manualControlCallback() {
  HTTPClient http;
  http.begin(API_CONTROL_URL);
  int httpCode = http.GET();

  if (httpCode == 200) {
    String payload = http.getString();
    DynamicJsonDocument doc(1024);
    deserializeJson(doc, payload);

    int gateState = doc["gateState"];
    int roofState = doc["roofState"];

    // Only apply if state changes
    if (gateState != lastGateState || roofState != lastRoofState) {
      int gateAngle = (gateState == 1) ? 180 : 0;
      int roofAngle = (roofState == 1) ? 180 : 0;

      waterGate.write(gateAngle);
      roofCover.write(roofAngle);

      Serial.println("🛠 Manual control applied:");
      Serial.print("  Gate state: "); Serial.println(gateState);
      Serial.print("  Roof state: "); Serial.println(roofState);

      lastGateState = gateState;
      lastRoofState = roofState;
    }
  }

  http.end();
}


/* ================= MAIN LOOP ================= */
void loop() {
  unsigned long currentMillis = millis();

  // --- Task 1: Read and Send Sensor Data ---
  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;

    int soilValue = analogRead(SOIL_ANALOG);
    int rainValue = analogRead(RAIN_ANALOG);

    String soilStatus = (soilValue < SOIL_WET_THRESHOLD) ? "Wet" : "Dry";
    String rainStatus = (rainValue < RAIN_THRESHOLD) ? "Raining" : "Not raining";

    // Automatic logic (Servos open if wet/raining)
    int gateAngle = (soilValue < SOIL_WET_THRESHOLD) ? 180 : 0;
    int roofAngle = (rainValue < RAIN_THRESHOLD) ? 180 : 0;

    waterGate.write(gateAngle);
    roofCover.write(roofAngle);

    // Prepare JSON Payload
    StaticJsonDocument<256> doc;
    doc["soilValue"]       = soilValue;
    doc["soilStatus"]      = soilStatus;
    doc["rainValue"]       = rainValue;
    doc["rainStatus"]      = rainStatus;
    doc["servoGateAngle"]  = gateAngle;
    doc["servoRoofAngle"]  = roofAngle;

    String payload;
    serializeJson(doc, payload);

    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(API_URL);
      http.addHeader("Content-Type", "application/json");

      int httpResponseCode = http.POST(payload);

      Serial.print("📡 Sensor Update Status: ");
      Serial.println(httpResponseCode);
      Serial.println("   Data: " + payload);

      http.end();
    }
  }

  // --- Task 2: Check for Manual Control Overrides ---
  if (currentMillis - controlMillis >= controlInterval) {
    controlMillis = currentMillis;
    manualControlCallback();
  }
}