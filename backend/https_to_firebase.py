import time
from flask import Flask, request, jsonify
from firebase_admin import db

app = Flask(__name__)

# POST sensors from ESP32
@app.route("/api/sensors", methods=["POST"])
def sensors():
    data = request.json
    if not data:
        return jsonify({"status": "error", "message": "No data received"}), 400

    # Get unix timestamp from the incoming data or generate one locally
    # Based on your image, the keys are Unix timestamps like 1768634850
    timestamp = data.get("timestamp_unix") 
    if not timestamp:
        timestamp = int(time.time())

    # 1. Update the 'latest' node: This overwrites previous data so only 
    # the current reading exists here for the dashboard cards.
    db.reference("latest").set(data)

    # 2. Save to 'sensor_readings': This uses the timestamp as the child key
    # to store historical data for your graphs.
    db.reference("sensor_readings").child(str(timestamp)).set(data)

    return jsonify({"status": "success"}), 200


# ESP32 polls this to get manual control
@app.route("/api/manual_control", methods=["GET"])
def manual_control():
    control = db.reference("esp_control").get()
    if control is None:
        control = {"servoGate": 0, "servoRoof": 0}
    return jsonify(control), 200

# route to accept control from backend and store for ESP32
@app.route("/api/control", methods=["POST"])
def control():
    data = request.json
    db.reference("esp_control").set(data)
    return jsonify({"status": "ok"}), 200