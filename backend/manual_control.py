import json
import requests
from firebase_admin import db

ESP32_CONTROL_URL = "http://34.28.197.110:5000/api/control"

def start_manual_control_listener():
    ref = db.reference("manual_control")

    def listener(event):
        if event.data is None:
            return

        payload = {
            "servoGate": int(event.data.get("servoGate", 0)),
            "servoRoof": int(event.data.get("servoRoof", 0))
        }

        print("🎮 Manual control received:", payload)

        response = requests.post(ESP32_CONTROL_URL, json=payload)
        print("📤 Sent to ESP32, status:", response.status_code)

    ref.listen(listener)