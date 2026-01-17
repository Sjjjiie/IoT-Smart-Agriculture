from flask import Flask, request, jsonify
from firebase_admin import db

app = Flask(__name__)

# POST sensors from ESP32
@app.route("/api/sensors", methods=["POST"])
def sensors():
    data = request.json
    db.reference("sensors").push(data)
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