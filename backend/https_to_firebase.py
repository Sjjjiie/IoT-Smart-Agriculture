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

    timestamp = data.get("timestamp_unix") 
    if not timestamp:
        timestamp = int(time.time())

    db.reference("latest").set({
        **data,
        "timestamp": timestamp
    })

    db.reference("sensor_readings").child(str(timestamp)).set(data)

    return jsonify({"status": "success"}), 200

# ESP32 polls this to get manual control
@app.route("/api/manual_control", methods=["GET"])
def manual_control():
    control = db.reference("manual_control").get()
    
    if control is None:
        return jsonify({}), 200
    
    payload = {}
    if "gateState" in control:
        payload["gateState"] = 1 if control["gateState"] == "ON" else 0
    if "roofState" in control:
        payload["roofState"] = 1 if control["roofState"] == "ON" else 0
    
    return jsonify(payload), 200

# Route to accept control from the listener and store it
@app.route("/api/control", methods=["POST"])
def control():
    data = request.json
    # Changed from "esp_control" to "manual_control"
    db.reference("manual_control").update(data)
    return jsonify({"status": "ok"}), 200