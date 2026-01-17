import json
import requests
from firebase_admin import db

ESP32_CONTROL_URL = "http://34.28.197.110:5000/api/control"

def start_manual_control_listener():
    ref = db.reference("manual_control")

    def listener(event):
        if event.data is None:
            return

        # Extract the strings "ON" or "OFF" directly
        gate_val = event.data.get("gateState", "OFF")
        roof_val = event.data.get("roofState", "OFF")

        # Convert to 1 (ON) or 0 (OFF) for the ESP32 API
        payload = {
            "gateState": 1 if gate_val == "ON" else 0,
            "roofState": 1 if roof_val == "ON" else 0
        }

        print(f"🎮 Manual control received: Gate={gate_val}, Roof={roof_val}")

        try:
            # Post the strings to your backend API
            response = requests.post(ESP32_CONTROL_URL, json=payload)
            print("📤 API Response Status:", response.status_code)
        except Exception as e:
            print("❌ Connection error:", e)

    ref.listen(listener)