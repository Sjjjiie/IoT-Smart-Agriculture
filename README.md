# 🌱 IoT Smart Agriculture System

An **IoT-based Smart Agriculture System** that integrates sensors, actuators, a cloud backend, and a web dashboard to monitor environmental conditions and remotely control agricultural infrastructure.  
The system is designed with **ESP32 (Arduino)**, **Python backend**, **Firebase**, and a **web-based dashboard**, deployed on **Google Cloud Platform (GCP)**.

---

## 📂 Repository Structure

```text
IoT-Smart-Agriculture/
│
├── public/          # Web dashboard (HTML, CSS, JavaScript)
│   └── app.js
│   └── auth.js
│   └── index.html
│   └── login.html
│   └── style.css
│
├── backend/         # Backend services (Python, Flask, Firebase, HTTP APIs)
│   ├── main.py
│   └── ...
│
├── wokwi/           # ESP32 Arduino firmware (Wokwi simulation / .ino files)
│   └── sketch.ino
│
├── requirements.txt
└── README.md
```

## ⚙️ System Architecture Overview

The system is composed of three main layers:

### 1️⃣ Device Layer (ESP32)
- Environmental sensors (e.g. rain sensor, water level sensor)
- Actuators (servo motors for gate and roof control)
- Executes **local decision logic**
- Communicates with backend via **HTTP**

### 2️⃣ Backend Layer (Cloud)
- Hosted on **Google Cloud Platform (GCP) VM**
- Processes sensor data
- Stores data in **Firebase Realtime Database**
- Handles manual control commands
- Exposes REST APIs for ESP32 and Dashboard

### 3️⃣ Presentation Layer (Dashboard)
- Web-based dashboard
- Displays real-time sensor data
- Allows manual actuator control
- User authentication and access control

---

## 🔄 System Flow

1. **Prepare hardware**
   - Connect ESP32, sensors, and actuators
   - Or simulate using Wokwi

2. **Run Arduino firmware**
   - Upload `.ino` firmware to ESP32
   - Update the API_URL and API_CONTROL_URL variables with your GCP VM external IP address
   - ESP32 starts sending sensor data and polling control commands

3. **Configure GCP**
   - Create a Compute Engine VM
   - Set firewall rules (HTTP / Custom ports) to allow traffic on HTTP and port 5000
   - Assign external IP
   - Note: If you stop and restart your VM, the external IP address will change. You must update the IP in your Arduino firmware every time this happens unless you promote it to a Static IP in the GCP console

4. **Run backend services**
   - Backend listens for ESP32 requests
   - Syncs data with Firebase
   - Processes manual and automatic control logic

5. **Open dashboard**
   - Users sign up or log in
   - Monitor sensor data
   - Control actuators remotely

---

## 🚀 Deployment on GCP VM

> ### ⚠️ Important Note on IP Addresses
> Standard GCP VM instances use **ephemeral** external IP addresses. If you **Stop** and **Start** your VM, the IP address will change. You must perform the following steps:
> 1.  **Check the new External IP** in the Google Cloud Console.
> 2.  **Update the variables** `API_URL` and `API_CONTROL_URL` in your `sketch.ino` file with the new IP address.
> 3.  **Re-upload or restart** your ESP32 simulation to reconnect to the server.

```bash
# Clone Repository
git clone https://github.com/Sjjjiie/IoT-Smart-Agriculture.git
cd IoT-Smart-Agriculture

 # Create Python Virtual Environment
python3 -m venv venv
source venv/bin/activate

# Install Dependencies
pip install firebase-admin
pip install Flask

# Configure Firebase Credentials
mkdir -p credentials
nano credentials/firebase-key.json
# Paste your Firebase service account JSON key into this file

# Run Backend Service
PYTHONPATH=. python3 backend/main.py

# Updating Backend Code (Optional)
git pull origin master
source venv/bin/activate
PYTHONPATH=. python3 backend/main.py
```
## 🧠 Features

#### 🌡 Sensor Monitoring
* **Rain detection**: Monitors environmental rainfall through a rain module sensor.
* **Soil Moisture monitoring**: Continuously tracks the water content in the soil to manage irrigation.
* **Real-time data updates**: Synchronizes sensor readings instantly via the Firebase Realtime Database.

#### 🤖 Automatic Control
* **Local logic on ESP32**: Handles critical decision-making directly on the edge device to ensure low latency and reliability.
* **Threshold-based action**: Determines states based on predefined levels, which are set at 2500 for rain and soil conditions.
* **Actuator automation**: Controls a water tap servo and a roof servo automatically based on real-time sensor data.

#### 🎮 Manual Control
* **Web dashboard override**: Allows users to take control of the farm actuators from any remote location via a browser.
* **Manual gate and roof control**: Uses specific functions which are `window.setGate` and `window.setRoof` to send "ON" or "OFF" commands.
* **Efficient updates**: Implements logic which is a check for state changes so that actuators only move when the new state is different from the last saved state.

#### 🔐 Security Implementation
* **HTTPS communication**: Encrypts data moving between the ESP32, GCP, and Firebase using SSL/TLS protocols.
* **Firebase Hosting SSL**: Provides a secure connection and an automatic SSL certificate for the web dashboard domain.
* **Firebase Authentication**: Restricts dashboard access to registered users through email and password login.
* **Access control**: Implements database rules which are `auth != null` to ensure only authenticated users can read or write data.
* **Secure key handling**: Protects private service account keys by storing them in a dedicated credentials folder.

#### ☁ Cloud Integration
* **Google Cloud Platform VM**: Hosts the Python Flask backend on a Compute Engine instance to act as a central communication hub.
* **Firebase Realtime Database**: Stores latest readings, historical data, and manual commands in an unstructured NoSQL format.
* **Scalable architecture**: Utilizes a modular design which is divided into Perception, Network, Processing, and Application layers.

## 🛠 Technologies Used
ESP32 / Arduino

Python (Flask)

Firebase Realtime Database

Firebase Authentication

Google Cloud Platform (Compute Engine)

HTML, CSS, JavaScript

Wokwi Simulator
* **Hardware**: ESP32 Microcontroller and Wokwi Simulator
* **Backend**: Python (Flask) and Firebase Admin SDK
* **Cloud & Database**: Firebase Realtime Database, Firebase Authentication, and Google Cloud Platform.
* **Frontend**: HTML5, CSS3, JavaScript (ES6), and Chart.js for data visualization.
