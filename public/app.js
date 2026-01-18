import { auth, db } from "./config.js";
import {
  ref,
  onValue,
  update,
  query,
  orderByKey,
  limitToLast
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/* ===================== DOM ===================== */
const rainStatus = document.getElementById("rainStatus");
const rainStatusIcon = document.getElementById("rainStatusIcon");
const soilStatus = document.getElementById("soilStatus");
const soilStatusIcon = document.getElementById("soilStatusIcon");

const gateSwitch = document.getElementById("gateSwitch");
const roofSwitch = document.getElementById("roofSwitch");

/* ===================== STATE ===================== */
let isUpdatingFromBackend = false;

/* ===================== CHART HELPERS ===================== */
function addDataToChart(chart, label, rawValue) {
  // Convert 0–4095 → 0–100%
  const percentage = Math.round((1 - rawValue / 4095) * 100);

  if (chart.data.labels.length >= 20) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
  }

  chart.data.labels.push(label);
  chart.data.datasets[0].data.push(percentage);
  chart.update();
}

/* ===================== CHARTS ===================== */
const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
        padding: {
            bottom: 25, // This pushes the x-axis labels upward into the box
            left: 10,
            right: 10
        }
    },
    scales: {
        x: {
            ticks: {
                font: { size: 10 },
                maxRotation: 45,
                minRotation: 45
            }
        },
        y: {
            beginAtZero: true,
            min: 0,
            max: 100, // Force the scale to stay within 0-100%
            ticks: {
                callback: function(value) {
                    return value + "%"; // Adds the % symbol to the axis
                }
            }
        }
    }
};

const rainChart = new Chart(document.getElementById("rainChart"), {
    type: "line",
    data: {
        labels: [],
        datasets: [{
            label: "Rain Value (%)",
            data: [],
            borderColor: "#2196F3",
            backgroundColor: "rgba(33,150,243,0.2)",
            fill: true,
            tension: 0.3
        }]
    },
    options: commonOptions
});

const soilChart = new Chart(document.getElementById("soilChart"), {
    type: "line",
    data: {
        labels: [],
        datasets: [{
            label: "Soil Moisture (%)",
            data: [],
            borderColor: "#4CAF50",
            backgroundColor: "rgba(76,175,80,0.2)",
            fill: true,
            tension: 0.3
        }]
    },
    options: commonOptions
});

/* ===================== 1️⃣ LOAD HISTORY ONCE ===================== */
const historyRef = query(
  ref(db, "sensor_readings"),
  orderByKey(),
  limitToLast(20)
);

onValue(historyRef, (snap) => {
    const data = snap.val();
    if (!data) return;

    rainChart.data.labels = [];
    rainChart.data.datasets[0].data = [];
    soilChart.data.labels = [];
    soilChart.data.datasets[0].data = [];

    Object.keys(data).sort().forEach(ts => {
        const d = data[ts];
        const time = new Date(Number(ts) * 1000).toLocaleTimeString();

        // Convert raw values to percentage here for historical data
        const rainPct = Math.round((1 - (d.rainValue ?? 4095) / 4095) * 100);
        const soilPct = Math.round((1 - (d.soilValue ?? 4095) / 4095) * 100);

        rainChart.data.labels.push(time);
        rainChart.data.datasets[0].data.push(rainPct);

        soilChart.data.labels.push(time);
        soilChart.data.datasets[0].data.push(soilPct);
    });

    rainChart.update();
    soilChart.update();
});

/* ===================== 2️⃣ LIVE DATA ===================== */
onValue(ref(db, "latest"), (snap) => {
  const data = snap.val();
  if (!data) return;

  isUpdatingFromBackend = true;

  // Actuator sync
  if (gateSwitch) gateSwitch.checked = data.servoGateAngle > 0;
  if (roofSwitch) roofSwitch.checked = data.servoRoofAngle > 0;

  const time = new Date(data.timestamp * 1000).toLocaleTimeString();

  rainStatus.innerText = data.rainStatus ?? "Unknown";
  soilStatus.innerText = data.soilStatus ?? "Unknown";

  rainStatusIcon.innerText = data.rainStatus === "Raining" ? "☔️" : "🌤";
  soilStatusIcon.innerText = data.soilStatus === "Wet" ? "💦" : "🔥";

  addDataToChart(rainChart, time, data.rainValue ?? 0);
  addDataToChart(soilChart, time, data.soilValue ?? 0);

  isUpdatingFromBackend = false;
});

/* ===================== 3️⃣ MANUAL CONTROL ===================== */
window.setGate = (state) => {
  if (isUpdatingFromBackend || !auth.currentUser) return;

  update(ref(db, "manual_control"), {
    gateState: state ? "ON" : "OFF",
    updatedAt: Date.now()
  });
};

window.setRoof = (state) => {
  if (isUpdatingFromBackend || !auth.currentUser) return;

  update(ref(db, "manual_control"), {
    roofState: state ? "ON" : "OFF",
    updatedAt: Date.now()
  });
};

/* ===================== LOGOUT ===================== */
window.logout = () => {
  document.getElementById("logoutModal").style.display = "flex";
};

window.confirmLogout = () => {
  signOut(auth).then(() => {
    window.location.href = "login.html";
  });
};

window.cancelLogout = () => {
  document.getElementById("logoutModal").style.display = "none";
};
