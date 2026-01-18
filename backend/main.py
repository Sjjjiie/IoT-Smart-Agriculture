from threading import Thread
import os
from firebase_admin import credentials, initialize_app, db
from https_to_firebase import app  # Flask app
from manual_control import start_manual_control_listener  # your listener

# ----------------------------
# Firebase initialization
# ----------------------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) 
KEY_PATH = os.path.join(BASE_DIR, "credentials", "firebase-key.json") 
cred = credentials.Certificate(KEY_PATH)
initialize_app(cred, {
    "databaseURL": "https://agricultureiot-e0eff-default-rtdb.asia-southeast1.firebasedatabase.app/"
})

# ----------------------------
# Start manual control listener
# ----------------------------
if __name__ == "__main__":
    listener_thread = Thread(target=start_manual_control_listener, daemon=True)
    listener_thread.start()

    # ----------------------------
    # Run Flask backend
    # ----------------------------
    app.run(host="0.0.0.0", port=5000, debug=True)
