from flask import Flask, request, jsonify
import time
import firebase_admin
from firebase_admin import credentials, db

# ================= FIREBASE =================
cred = credentials.Certificate("../credentials/firebase-key.json")
firebase_admin.initialize_app(cred, {
    "databaseURL": "https://agricultureiot-e0eff-default-rtdb.asia-southeast1.firebasedatabase.app"
})

print("✅ Firebase initialized")

# ================= FLASK APP =================
app = Flask(__name__)

@app.route("/api/sensors", methods=["POST"])
def receive_sensor_data():
    try:
        data = request.get_json()
        timestamp = int(time.time())

        ref = db.reference("/")
        ref.child("latest").set(data)
        ref.child("sensor_readings").child(str(timestamp)).set(data)

        return jsonify({"status": "success"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/")
def health_check():
    return "Smart Agriculture Backend Running", 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)