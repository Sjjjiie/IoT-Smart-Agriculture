from threading import Thread
from firebase_admin import credentials, initialize_app, db
from https_to_firebase import app  # Flask app
from manual_control import start_manual_control_listener

import os

# ----------------------------
# Firebase init
# ----------------------------
cred = credentials.Certificate("../credentials/firebase-key.json")
initialize_app(cred, {
    "databaseURL": "https://agricultureiot-e0eff-default-rtdb.asia-southeast1.firebasedatabase.app/"
})

# ----------------------------
# Run manual control listener
# ----------------------------
if __name__ == "__main__":
    # Start listener thread
    listener_thread = Thread(target=start_manual_control_listener, daemon=True)
    listener_thread.start()

    # Run Flask app
    app.run(host="0.0.0.0", port=5000)
