import { auth, db } from "./config.js";
import {
  ref,
  onValue,
  set,
  query,
  orderByKey,
  limitToLast
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/* ===================== DOM ELEMENTS ===================== */
const rainStatus = document.getElementById("rainStatus");
const rainStatusIcon = document.getElementById("rainStatusIcon");
const soilStatus = document.getElementById("soilStatus");
const soilStatusIcon = document.getElementById("soilStatusIcon");

const gateSwitch = document.getElementById("gateSwitch");
const roofSwitch = document.getElementById("roofSwitch");

/* ===================== STATE ===================== */
let isUpdatingFromBackend = false;

/* ===================== CHARTS ===================== */
const rainChart = new Chart(document.getElementById("rainChart"), {
  type: "line",
  data: {
    labels: [],
    datasets: [{
      label: "Rain Sensor Value",
      data: [],
      borderColor: "#2196F3",
      backgroundColor: "rgba(33,150,243,0.2)",
      tension: 0.3
    }]
  },
options: {
    responsive: true,
    maintainAspectRatio: false,
    // Add layout padding to keep labels inside the white box
    layout: {
      padding: {
        bottom: 20, 
        left: 10,
        right: 10
      }
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: 10
          },
          maxRotation: 45,
          minRotation: 45,
          autoSkip: true,
          maxTicksLimit: 10 
        }
      },
      y: {
        beginAtZero: true,
        min: 0,
        max: 100, // Fixed at 100%
        title: {
          display: true,
          text: "Moisture Level (%)"
        },
        ticks: {
          font: { size: 11 },
          // Append the % sign to the axis labels
          callback: function(value) {
            return value + "%";
          }
        }
      }
    }
  }
});

const soilChart = new Chart(document.getElementById("soilChart"), {
  type: "line",
  data: {
    labels: [],
    datasets: [{
      label: "Soil Moisture Value",
      data: [],
      borderColor: "#4CAF50",
      backgroundColor: "rgba(76,175,80,0.2)",
      tension: 0.3
    }]
  },
options: {
    responsive: true,
    maintainAspectRatio: false,
    // Add layout padding to keep labels inside the white box
    layout: {
      padding: {
        bottom: 20, 
        left: 10,
        right: 10
      }
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: 10 
          },
          maxRotation: 45,
          minRotation: 45,
          autoSkip: true,
          maxTicksLimit: 10 
        }
      },
      y: {
        beginAtZero: true,
        min: 0,
        max: 100, // Fixed at 100%
        title: {
          display: true,
          text: "Moisture Level (%)"
        },
        ticks: {
          font: { size: 11 },
          // Append the % sign to the axis labels
          callback: function(value) {
            return value + "%";
          }
        }
      }
    }
  }
});

/* ===================== HELPERS ===================== */
function addDataToChart(chart, label, rawValue) {
  // Convert 4095-0 range to 0-100% (Higher % = Wetter)
  const percentage = Math.round((1 - rawValue / 4095) * 100);

  if (chart.data.labels.length >= 20) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
  }
  chart.data.labels.push(label);
  chart.data.datasets[0].data.push(percentage);
  chart.update();
}

/* ===================== LIVE SENSOR DATA ===================== */
onValue(ref(db, "latest"), (snap) => {
  const data = snap.val();
  if (!data) return;

  const now = new Date().toLocaleTimeString();

  const rainValue = data.rainValue ?? 4095;
  const rainText = data.rainStatus ?? "Not Raining";

  const soilValue = data.soilValue ?? 4095;
  const soilText = data.soilStatus ?? "Dry";

  rainStatus.innerText = rainText;
  soilStatus.innerText = soilText;

  // Rain icon
  rainStatusIcon.innerText =
    rainText === "Raining" ? "☔️" : "🌤";

  // Soil icon
  soilStatusIcon.innerText =
    soilText === "Wet" ? "💦" : "🔥";

  addDataToChart(rainChart, now, rainValue);
  addDataToChart(soilChart, now, soilValue);
});

/* ===================== ACTUATOR STATUS FROM ESP32 ===================== */
onValue(ref(db, "latest"), (snap) => {
  const outputs = snap.val();
  if (!outputs) return;

  isUpdatingFromBackend = true;

  gateSwitch.checked = outputs.servoGateAngle > 0;
  roofSwitch.checked = outputs.servoRoofAngle > 0;

  isUpdatingFromBackend = false;
});

/* ===================== MANUAL CONTROL (USER → FIREBASE) ===================== */
window.setGate = (state) => {
  if (isUpdatingFromBackend) return;
  
  // Check if user is actually logged in before writing
  if (!auth.currentUser) {
    console.error("You must be logged in to control the gate.");
    return;
  }

  update(ref(db, "manual_control"), { gateState: state ? "ON" : "OFF" })
    .catch(err => console.error("Write failed:", err));
};

window.setRoof = (state) => {
  if (isUpdatingFromBackend) return;

  if (!auth.currentUser) {
    console.error("You must be logged in to control the roof.");
    return;
  }

  update(ref(db, "manual_control"), { roofState: state ? "ON" : "OFF" })
    .catch(err => console.error("Write failed:", err));
};

/* ===================== HISTORICAL DATA ===================== */
const historyRef = query(
  ref(db, "sensor_readings"),
  orderByKey(),
  limitToLast(50)
);

onValue(historyRef, (snap) => {
  const data = snap.val();
  if (!data) return;

  Object.keys(data).sort().forEach(ts => {
    const d = data[ts];
    const time = new Date(Number(ts)).toLocaleTimeString();

    addDataToChart(rainChart, time, d.rainValue ?? 4095);
    addDataToChart(soilChart, time, d.soilValue ?? 4095);
  });
});

window.logout = function () {
  // Only show the custom modal
  document.getElementById("logoutModal").style.display = "flex";
};

window.confirmLogout = function () {
  signOut(auth).then(() => {
    window.location.href = "login.html";
  }).catch((error) => {
    console.error("Logout Error:", error);
  });
};

window.cancelLogout = function () {
  document.getElementById("logoutModal").style.display = "none";
};