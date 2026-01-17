import json
import requests
from firebase_admin import db

ESP32_CONTROL_URL = "http://34.28.197.110:5000/api/control"

def start_manual_control_listener():
    ref = db.reference("manual_control")

    def listener(event):
        if event.data is None:
            return

        print(f"✨ Dashboard Update Detected: {event.data}")

    ref.listen(listener)