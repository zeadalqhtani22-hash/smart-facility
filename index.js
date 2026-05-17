const axios = require("axios");
const express = require("express");
const session = require("express-session");

const db = require("./firebase");
const { ref, set, get, child } = require("firebase/database");
const app = express();
const PORT = process.env.PORT || 3000;
const SHELLY_IP = "192.168.8.100";

app.use(session({
  secret: "smartfacilitysecret",
  resave: false,
  saveUninitialized: true
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const users = [];


function pageLayout(content) {
  return `
<!DOCTYPE html>
<html>
<head>
<title>SIFMS</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<style>
body{
  margin:0;
  font-family:Arial, sans-serif;
  background:#071a33;
  color:white;
}

a{
  text-decoration:none;
  color:white;
}

.auth-page{
  min-height:100vh;
  display:flex;
  justify-content:center;
  align-items:center;
  background:linear-gradient(135deg,#06152b,#0f3b73);
}

.auth-box{
  width:390px;
  background:#10284f;
  padding:35px;
  border-radius:22px;
  box-shadow:0 20px 50px rgba(0,0,0,.4);
}

.logo{
  text-align:center;
  font-size:38px;
  font-weight:bold;
  margin-bottom:5px;
}

.subtitle{
  text-align:center;
  color:#b9c7dd;
  margin-bottom:25px;
}

input{
  width:100%;
  padding:14px;
  margin:10px 0;
  border:none;
  border-radius:10px;
  box-sizing:border-box;
}

button{
  width:100%;
  padding:14px;
  border:none;
  border-radius:10px;
  background:#2563eb;
  color:white;
  font-size:16px;
  cursor:pointer;
  margin-top:10px;
}

button:hover{
  background:#1d4ed8;
}

.small-link{
  text-align:center;
  margin-top:18px;
  color:#cbd5e1;
}

.small-link a{
  color:#60a5fa;
}

.nav{
  background:#071a33;
  padding:20px 40px;
  display:flex;
  justify-content:space-between;
  align-items:center;
  box-shadow:0 2px 12px rgba(0,0,0,.3);
}

.nav-title{
  font-size:25px;
  font-weight:bold;
}

.nav-links{
  display:flex;
  gap:20px;
  align-items:center;
}

.nav-links a{
  font-weight:bold;
  color:#dbeafe;
}

.logout{
  background:#dc2626;
  padding:10px 16px;
  border-radius:8px;
}

.container{
  padding:40px;
}

.hero{
  background:linear-gradient(135deg,#123b7a,#0d9488);
  padding:32px;
  border-radius:22px;
  margin-bottom:30px;
  box-shadow:0 12px 30px rgba(0,0,0,.25);
}

.hero h1{
  font-size:40px;
  margin:0 0 10px 0;
}

.hero p{
  margin:0;
  color:#dbeafe;
  font-size:18px;
}

.cards,
.grid{
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(280px,1fr));
  gap:25px;
}

.card{
  background:white;
  color:#111827;
  border-radius:20px;
  padding:26px;
  box-shadow:0 8px 25px rgba(0,0,0,.25);
}

.card h2,
.card h3{
  color:#071a33;
  margin-top:0;
}

.info{
  display:flex;
  justify-content:space-between;
  margin-bottom:15px;
  padding-bottom:10px;
  border-bottom:1px solid #ddd;
}

.card-btn{
  display:inline-block;
  margin-top:20px;
  background:#071a33;
  color:white;
  padding:12px 18px;
  border-radius:10px;
  font-weight:bold;
}

.value{
  font-size:36px;
  font-weight:bold;
  margin-top:15px;
}

.green{color:#22c55e}
.orange{color:#f59e0b}
.red{color:#ef4444}
.blue{color:#60a5fa}
.card,
.stat-card{
  transition:0.3s ease;
}

.card:hover,
.stat-card:hover{
  transform:translateY(-6px);
  box-shadow:0 16px 35px rgba(0,0,0,.30);
}
.stats-grid{
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
  gap:20px;
  margin:30px 0;
}

.stat-card{
  background:linear-gradient(135deg,#0f172a,#1e3a8a);
  color:white;
  padding:22px;
  border-radius:18px;
  box-shadow:0 10px 25px rgba(0,0,0,.25);
}

.stat-card h3{
  margin:0;
  color:#dbeafe;
  font-size:16px;
}

.stat-card p{
  font-size:32px;
  font-weight:bold;
  margin:12px 0 5px;
}

.stat-card span{
  color:#93c5fd;
  font-size:13px;
}

</style>
</head>

<body>

<div style="width:90%;margin:auto;padding-top:40px;">


</div>
${content}
<script>

const ctx = document.getElementById('energyChart');

new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['8AM', '10AM', '12PM', '2PM', '4PM', '6PM'],
        datasets: [{
            label: 'Energy Consumption',
            data: [12, 19, 9, 15, 22, 17],
            borderColor: "#0f172a",
           backgroundColor: "rgba(15,23,42,0.15)",
            borderWidth: 3,
            tension: 0.4,
            fill: true
        }]
    },

    options: {
        responsive: true
    }
});

</script>
</body>
</html>
`;
}

app.get("/", (req, res) => {
  res.send(pageLayout(`
<div class="auth-page">
  <div class="auth-box">
    <div class="logo">SIFMS</div>
    <div class="subtitle">Smart Integrated Facility Management System</div>

    <h2>Login</h2>

    <form action="/login" method="POST">
      <input type="email" name="email" placeholder="Email address" required>
      <input type="password" name="password" placeholder="Password" required>
      <button type="submit">Login</button>
    </form>

    <div class="small-link">
      Create account? <a href="/signup">Sign up here</a>
    </div>
  </div>
</div>
  `));
});

app.get("/signup", (req, res) => {
  res.send(pageLayout(`
<div class="auth-page">
  <div class="auth-box">
    <div class="logo">SIFMS</div>
    <div class="subtitle">Create Facility Account</div>

    <h2>Create Account</h2>

    <form action="/signup" method="POST">
      <input type="text" name="facility" placeholder="Facility name" required>
      <input type="email" name="email" placeholder="Email address" required>
      <input type="password" name="password" placeholder="Password" required>
      <button type="submit">Create Account</button>
    </form>

    <div class="small-link">
      Already have an account? <a href="/">Login</a>
    </div>
  </div>
</div>
  `));
});

app.post("/signup", (req, res) => {
  const { facility, email, password } = req.body;

  const exists = users.find(user => user.email === email);

  if (exists) {
    return res.send(pageLayout(`
<div class="auth-page">
  <div class="auth-box">
    <h2>Email already exists</h2>
    <div class="small-link"><a href="/">Back to login</a></div>
  </div>
</div>
    `));
  }

  const newUser = {
  facility,
  email,
  password,
  energy: {
    temperature: "N/A",
    humidity: "N/A",
    deviceStatus: "Offline"
  },
 inventory: [
  { shelf: "Shelf 1", product: "Milk", status: "Available", stock: 6 },
  { shelf: "Shelf 2", product: "Water", status: "Available", stock: 40 },
  { shelf: "Shelf 3", product: "Coffee", status: "Available", stock: 15 },
  { shelf: "Shelf 4", product: "Desserts", status: "Available", stock: 10 }
],
  queue: {
    currentQueue: 0,
    crowdLevel: "Low",
    estimatedWaiting: "0 min"
  }
};

users.push(newUser);

set(ref(db, "users/" + email.replace(/\./g, "_")), newUser);

res.redirect("/");

  res.redirect("/");
});

app.post("/login", async (req, res) => {

  const { email, password } = req.body;

  try {

    const snapshot = await get(
      child(
        ref(db),
        "users/" + email.replace(/\./g, "_")
      )
    );

    if (!snapshot.exists()) {

      return res.send(pageLayout(`
<div class="auth-page">
  <div class="auth-box">
    <h2>User Not Found</h2>
    <div class="small-link">
      <a href="/">Try Again</a>
    </div>
  </div>
</div>
      `));

    }

    const user = snapshot.val();

    if (user.password !== password) {

      return res.send(pageLayout(`
<div class="auth-page">
  <div class="auth-box">
    <h2>Wrong Password</h2>
    <div class="small-link">
      <a href="/">Try Again</a>
    </div>
  </div>
</div>
      `));

    }

    req.session.email = user.email;

    res.redirect("/dashboard");

  } catch (error) {

    res.send("Login Error");

  }

});
function getCurrentUser(req) {

  return users.find(
    user => user.email === req.session.email
  );

}
app.get("/dashboard", async (req, res) => {
  const user = await getCurrentUser(req);

  if (!user) {
    return res.redirect("/");
  }

  res.send(pageLayout(`
<div class="nav">
  <div class="nav-title">🚀 SIFMS Dashboard</div>

  <div class="nav-links">
    <a href="/dashboard">🏠 Home</a>
    <a href="/energy">⚡ Energy</a>
    <a href="/inventory">📦 Inventory</a>
    <a href="/queuing">👥 Queuing</a>
    <a class="logout" href="/logout">Logout</a>
  </div>
</div>

<div class="container">

  <div class="hero">
    <h1>Welcome ${user.facility}</h1>

    <p>Smart Integrated Facility Management System</p>

    <div class="stats-grid">

      <div class="stat-card">
        <h3>⚡ Energy Usage</h3>
        <p>4.5 kW</p>
        <span>Current facility consumption</span>
      </div>

      <div class="stat-card">
        <h3>🌡 Temperature</h3>
        <p>24°C</p>
        <span>Average environment temp</span>
      </div>

      <div class="stat-card">
        <h3>📦 Inventory</h3>
        <p>71</p>
        <span>Total available items</span>
      </div>

      <div class="stat-card">
        <h3>👥 Queue</h3>
        <p>12</p>
        <span>Current visitors</span>
      </div> 
</div>

<div class="stat-card" style="
background:linear-gradient(135deg,#3f1d0d,#7c2d12);
border:1px solid rgba(255,255,255,.08);
">

  <h3>💰 Expected Power Cost</h3>

  <p>≈ 2.3K SAR</p>

  <span>Estimated monthly electricity expense</span>

</div>

    </div>

</div>

    
  </div>
  <div style="background:white;color:#111;border-radius:18px;padding:25px;margin-top:45px;">
  <h2>📊 Energy Analytics</h2>
  <div style="
height:320px;
width:100%;
max-width:850px;
margin:35px auto 10px auto;
padding:20px;
background:#f8fafc;
border-radius:18px;
">
    <canvas id="energyChart"></canvas>
</div>
</div>
<div class="card" style="margin:30px 0;">
  <h2>📝 Activity Logs</h2>

  <div class="info">
    <span>09:10 AM</span>
    <strong>Plug 1 turned ON</strong>
  </div>

  <div class="info">
    <span>09:18 AM</span>
    <strong>Milk shelf updated</strong>
  </div>

  <div class="info">
    <span>09:25 AM</span>
    <strong>Temperature status checked</strong>
  </div>

  <div class="info">
    <span>09:30 AM</span>
    <strong>Inventory monitoring active</strong>
  </div>
</div>
  <div id="lowStockAlert"></div>
  <script>
async function checkLowStock() {
  const response = await fetch("https://sifms-1498f-default-rtdb.europe-west1.firebasedatabase.app/inventory.json")
  const data = await response.json();

  const alertBox = document.getElementById("lowStockAlert");

  let alerts = "";

  Object.keys(data).forEach(function(key) {

    const shelf = data[key];

    if (shelf.stock <= 1) {

      alerts += '<div style="background:#ff3b3b;color:white;padding:15px;border-radius:12px;margin-bottom:10px;font-weight:bold;font-size:18px;">';
      alerts += '⚠️ LOW STOCK ALERT: ' + key.toUpperCase() + ' has only ' + shelf.stock + ' item left';
      alerts += '</div>';

    }

  });

  alertBox.innerHTML = alerts;
}

setInterval(checkLowStock, 1000);

checkLowStock();
const energyCanvas = document.getElementById("energyChart");

if (energyCanvas) {
  new Chart(energyCanvas, {
    type: "line",
    data: {
      labels: ["8AM", "10AM", "12PM", "2PM", "4PM", "6PM"],
      datasets: [{
        label: "Energy Consumption kW",
        data: [1.2, 2.1, 3.8, 4.5, 3.2, 2.4],
        borderWidth: 3,
        borderColor: "#1e293b",
backgroundColor: "rgba(30,41,59,0.12)",
pointBackgroundColor: "#0f172a",
pointBorderColor: "#0f172a",
pointRadius: 5,
fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
maintainAspectRatio: false
    }
  });
}
</script>
  <div class="cards">

    <div class="card">
      <h2>⚡ Energy Monitoring</h2>

      <div class="info">
        <span>Temperature</span>
        <strong>${user.energy.temperature}</strong>
      </div>

      <div class="info">
        <span>Humidity</span>
        <strong>${user.energy.humidity}</strong>
      </div>

      <div class="info">
        <span>Device Status</span>
        <strong>${user.energy.deviceStatus}</strong>
      </div>

      <a class="card-btn" href="/energy">Open Energy Panel</a>
    </div>

    <div class="card">
      <h2>📦 Inventory Monitoring</h2>

      ${user.inventory.map(item => `
        <div class="info">
          <span>${item.product}</span>
          <strong>${item.status}</strong>
        </div>
      `).join("")}

      <a class="card-btn" href="/inventory">Open Inventory</a>
    </div>

    <div class="card">
      <h2>👥 Queue Management</h2>

      <div class="info">
        <span>Current Queue</span>
        <strong>${user.queue.currentQueue}</strong>
      </div>

      <div class="info">
        <span>Crowd Level</span>
        <strong>${user.queue.crowdLevel}</strong>
      </div>

      <div class="info">
        <span>Estimated Waiting</span>
        <strong>${user.queue.estimatedWaiting}</strong>
      </div>

      <a class="card-btn" href="/queuing">Open Queue System</a>
    </div>

  </div>
</div>
  `));
});

app.get("/energy", async (req, res) => {
  const user = await getCurrentUser(req);

  if (!user) {
    return res.redirect("/");
  }

  res.send(pageLayout(`
<div class="nav">
  <div class="nav-title">⚡ Energy Management</div>

  <div class="nav-links">
    <a href="/dashboard">🏠 Home</a>
    <a href="/inventory">📦 Inventory</a>
    <a href="/queuing">👥 Queuing</a>
    <a class="logout" href="/logout">Logout</a>
  </div>
</div>

<div class="container">
  <div class="hero">
    <h1>Energy Monitoring</h1>
    <p>Shelly device IP: ${SHELLY_IP}</p>
  </div>

  <div class="grid">
    <div class="cards">

  <div class="card" id="plug1Card">
    <h2>🔌 Plug 1</h2>

    <div class="info">
      <span>Status</span>
      <strong id="plug1Status">Loading...</strong>
    </div>

    <div class="info">
      <span>Power</span>
      <strong id="plug1Power">0 W</strong>
    </div>
    

    <div class="info">
      <span>Voltage</span>
      <strong id="plug1Voltage">0 V</strong>
    </div>

    <div class="info">
      <span>Current</span>
      <strong id="plug1Current">0 A</strong>
    </div>
    <div style="display:flex; gap:10px; margin-top:15px;">

  <button onclick="togglePlug('plug1', true)"
    style="
      flex:1;
      padding:10px;
      border:none;
      border-radius:10px;
      background:#16a34a;
      color:white;
      font-weight:bold;
      cursor:pointer;
    ">
    ON
  </button>

  <button onclick="togglePlug('plug1', false)"
    style="
      flex:1;
      padding:10px;
      border:none;
      border-radius:10px;
      background:#dc2626;
      color:white;
      font-weight:bold;
      cursor:pointer;
    ">
    OFF
  </button>

</div>
  </div>

  <div class="card" id="plug2Card">
    <h2>🔌 Plug 2</h2>

    <div class="info">
      <span>Status</span>
      <strong id="plug2Status">Loading...</strong>
    </div>

    <div class="info">
      <span>Power</span>
      <strong id="plug2Power">0 W</strong>
    </div>

    <div class="info">
      <span>Voltage</span>
      <strong id="plug2Voltage">0 V</strong>
    </div>

    <div class="info">
      <span>Current</span>
      <strong id="plug2Current">0 A</strong>
    </div>
    <div style="display:flex; gap:10px; margin-top:15px;">

  <button onclick="togglePlug('plug2', true)"
    style="
      flex:1;
      padding:10px;
      border:none;
      border-radius:10px;
      background:#16a34a;
      color:white;
      font-weight:bold;
      cursor:pointer;
    ">
    ON
  </button>

  <button onclick="togglePlug('plug2', false)"
    style="
      flex:1;
      padding:10px;
      border:none;
      border-radius:10px;
      background:#dc2626;
      color:white;
      font-weight:bold;
      cursor:pointer;
    ">
    OFF
  </button>

</div>
  </div>

  <div class="card" id="plug3Card">
    <h2>🔌 Plug 3</h2>

    <div class="info">
      <span>Status</span>
      <strong id="plug3Status">Loading...</strong>
    </div>

    <div class="info">
      <span>Power</span>
      <strong id="plug3Power">0 W</strong>
    </div>

    <div class="info">
      <span>Voltage</span>
      <strong id="plug3Voltage">0 V</strong>
    </div>

    <div class="info">
      <span>Current</span>
      <strong id="plug3Current">0 A</strong>
    </div>
    <div style="display:flex; gap:10px; margin-top:15px;">

  <button onclick="togglePlug('plug3', true)"
    style="
      flex:1;
      padding:10px;
      border:none;
      border-radius:10px;
      background:#16a34a;
      color:white;
      font-weight:bold;
      cursor:pointer;
    ">
    ON
  </button>

  <button onclick="togglePlug('plug3', false)"
    style="
      flex:1;
      padding:10px;
      border:none;
      border-radius:10px;
      background:#dc2626;
      color:white;
      font-weight:bold;
      cursor:pointer;
    ">
    OFF
  </button>

</div>
</div>
<div class="card">

  <h2>💡 Light Switch 1</h2>

  <div class="info">
    <span>Status</span>
    <strong id="light1Status">OFF</strong>
  </div>

  <div style="display:flex; gap:10px; margin-top:15px;">

    <button onclick="toggleFakeLight('light1Status', true)"
      style="
        flex:1;
        padding:10px;
        border:none;
        border-radius:10px;
        background:#16a34a;
        color:white;
        font-weight:bold;
        cursor:pointer;
      ">
      ON
    </button>

    <button onclick="toggleFakeLight('light1Status', false)"
      style="
        flex:1;
        padding:10px;
        border:none;
        border-radius:10px;
        background:#dc2626;
        color:white;
        font-weight:bold;
        cursor:pointer;
      ">
      OFF
    </button>

  </div>

</div>



<div class="card">

  <h2>💡 Light Switch 2</h2>

  <div class="info">
    <span>Status</span>
    <strong id="light2Status">OFF</strong>
  </div>

  <div style="display:flex; gap:10px; margin-top:15px;">

    <button onclick="toggleFakeLight('light2Status', true)"
      style="
        flex:1;
        padding:10px;
        border:none;
        border-radius:10px;
        background:#16a34a;
        color:white;
        font-weight:bold;
        cursor:pointer;
      ">
      ON
    </button>

    <button onclick="toggleFakeLight('light2Status', false)"
      style="
        flex:1;
        padding:10px;
        border:none;
        border-radius:10px;
        background:#dc2626;
        color:white;
        font-weight:bold;
        cursor:pointer;
      ">
      OFF
    </button>

  </div>

</div>



<div class="card">

  <h2>💡 Light Switch 3</h2>

  <div class="info">
    <span>Status</span>
    <strong id="light3Status">OFF</strong>
  </div>

  <div style="display:flex; gap:10px; margin-top:15px;">

    <button onclick="toggleFakeLight('light3Status', true)"
      style="
        flex:1;
        padding:10px;
        border:none;
        border-radius:10px;
        background:#16a34a;
        color:white;
        font-weight:bold;
        cursor:pointer;
      ">
      ON
    </button>

    <button onclick="toggleFakeLight('light3Status', false)"
      style="
        flex:1;
        padding:10px;
        border:none;
        border-radius:10px;
        background:#dc2626;
        color:white;
        font-weight:bold;
        cursor:pointer;
      ">
      OFF
    </button>

  </div>

</div>



<script>

function toggleFakeLight(id, state) {

  document.getElementById(id).innerText =
    state ? "ON" : "OFF";

}

</script>
<div class="card" id="ht1Card">
  <h2>🌡️ H&T 1</h2>

  <div class="info">
    <span>Temperature</span>
    <strong id="ht1Temp">Loading...</strong>
  </div>

  <div class="info">
    <span>Humidity</span>
    <strong id="ht1Humidity">Loading...</strong>
  </div>

  <div class="info">
    <span>Status</span>
    <strong id="ht1Status">Checking...</strong>
  </div>
</div>

<div class="card" id="ht2Card">
  <h2>🌡️ H&T 2</h2>

  <div class="info">
    <span>Temperature</span>
    <strong id="ht2Temp">Loading...</strong>
  </div>

  <div class="info">
    <span>Humidity</span>
    <strong id="ht2Humidity">Loading...</strong>
  </div>

  <div class="info">
    <span>Status</span>
    <strong id="ht2Status">Checking...</strong>
  </div>
</div>

<div class="card" id="ht3Card">
  <h2>🌡️ H&T 3</h2>

  <div class="info">
    <span>Temperature</span>
    <strong id="ht3Temp">Loading...</strong>
  </div>

  <div class="info">
    <span>Humidity</span>
    <strong id="ht3Humidity">Loading...</strong>
  </div>

  <div class="info">
    <span>Status</span>
    <strong id="ht3Status">Checking...</strong>
  </div>
</div>
  </div>

</div>

<script>

async function loadShellyData() {

  const response = await fetch('https://sifms-1498f-default-rtdb.europe-west1.firebasedatabase.app/energy.json');
  const data = await response.json();

  const plug1 = data.plugs.plug1;
  const plug2 = data.plugs.plug2;
  const plug3 = data.plugs.plug3;
  const ht1 = data.ht.ht1;
const ht2 = data.ht.ht2;
const ht3 = data.ht.ht3;

document.getElementById("ht1Temp").innerText =
ht1.tC + " °C";

document.getElementById("ht1Humidity").innerText =
ht1.hum + " %";

document.getElementById("ht1Status").innerText =
ht1.tC > 30 ? "🔥 HOT" : "✅ GOOD";

document.getElementById("ht2Temp").innerText =
ht2.tC + " °C";

document.getElementById("ht2Humidity").innerText =
ht2.hum + " %";

document.getElementById("ht2Status").innerText =
ht2.tC > 30 ? "🔥 HOT" : "✅ GOOD";

document.getElementById("ht3Temp").innerText =
ht3.tC + " °C";

document.getElementById("ht3Humidity").innerText =
ht3.hum + " %";

document.getElementById("ht3Status").innerText =
ht3.tC > 30 ? "🔥 HOT" : "✅ GOOD";

  document.getElementById("plug1Status").innerHTML =
  plug1.output
    ? '<span style="color:#22c55e;font-weight:bold;">● ON</span>'
    : '<span style="color:#ef4444;font-weight:bold;">● OFF</span>';

  document.getElementById("plug1Power").innerText =
    plug1.apower + " W";

  document.getElementById("plug1Voltage").innerText =
    plug1.voltage + " V";

  document.getElementById("plug1Current").innerText =
    plug1.current + " A";



  document.getElementById("plug2Status").innerHTML =
  plug2.output
    ? '<span style="color:#22c55e;font-weight:bold;">● ON</span>'
    : '<span style="color:#ef4444;font-weight:bold;">● OFF</span>';

  document.getElementById("plug2Power").innerText =
    plug2.apower + " W";

  document.getElementById("plug2Voltage").innerText =
    plug2.voltage + " V";

  document.getElementById("plug2Current").innerText =
    plug2.current + " A";



  document.getElementById("plug3Status").innerHTML =
  plug3.output
    ? '<span style="color:#22c55e;font-weight:bold;">● ON</span>'
    : '<span style="color:#ef4444;font-weight:bold;">● OFF</span>';

document.getElementById("plug3Power").innerText =
  ((plug3.apower !== undefined ? plug3.apower : 0)) + " W";

document.getElementById("plug3Voltage").innerText =
  ((plug3.voltage !== undefined ? plug3.voltage : 0)) + " V";

document.getElementById("plug3Current").innerText =
  ((plug3.current !== undefined ? plug3.current : 0)) + " A";

}
async function togglePlug(plug, state) {

  await fetch(
    "/toggle-plug/" + plug + "/" + state
  );

  loadShellyData();

}
loadShellyData();
setInterval(loadShellyData, 3000);

</script>
  `));
});

app.get("/energy", async (req, res) => {
 const user = await getCurrentUser(req);

  if (!user) {
    return res.redirect("/");
  }

  res.send(pageLayout(`
<div class="nav">
  <div class="nav-title">📦 Inventory Monitoring</div>

  <div class="nav-links">
    <a href="/dashboard">🏠 Home</a>
    <a href="/energy">⚡ Energy</a>
    <a href="/queuing">👥 Queuing</a>
    <a class="logout" href="/logout">Logout</a>
  </div>
</div>

<div class="container">
  <div class="hero">
    <h1>📦 Smart Inventory System</h1>
    <p>Live shelf monitoring connected with ESP32 Ultrasonic Sensors.</p>
  </div>

  <div id="alertBox" class="card" style="display:none; background:#7f1d1d; color:white; margin-bottom:20px;">
    <h2>⚠️ Low Stock Alert</h2>
    <p id="alertText"></p>
  </div>

  <div class="grid">

  <div class="card">
    <h3>🥛 Shelf 1 - Milk</h3>

    <p>Status:</p>
    <div id="s1" class="value blue">Available</div>

    <p>Stock:</p>
    <div id="stock1" class="value green">6</div>

    <button onclick="resetShelf('shelf1')">
      Reset Shelf 1
    </button>
  </div>



  <div class="card">
    <h3>💧 Shelf 2 - Water</h3>

    <p>Status:</p>
    <div id="s2" class="value blue">Available</div>

    <p>Stock:</p>
    <div id="stock2" class="value green">40</div>

    <button onclick="resetShelf('shelf2')">
      Reset Shelf 2
    </button>
  </div>



  <div class="card">
    <h3>☕ Shelf 3 - Coffee</h3>

    <p>Status:</p>
    <div id="s3" class="value blue">Available</div>

    <p>Stock:</p>
    <div id="stock3" class="value green">15</div>

    <button onclick="resetShelf('shelf3')">
      Reset Shelf 3
    </button>
  </div>



  <div class="card">
    <h3>🍰 Shelf 4 - Desserts</h3>

    <p>Status:</p>
    <div id="s4" class="value blue">Available</div>

    <p>Stock:</p>
    <div id="stock4" class="value green">10</div>

    <button onclick="resetShelf('shelf4')">
      Reset Shelf 4
    </button>
  </div>

</div>
<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
  import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

  const firebaseConfig = {
    apiKey: "AIzaSyBsFkOhhBsUc2WXI1EPl4-gm2ZK9zNIaTI",
    authDomain: "sifms-1498f.firebaseapp.com",
    databaseURL: "https://sifms-1498f-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "sifms-1498f",
    storageBucket: "sifms-1498f.firebasestorage.app",
    messagingSenderId: "718646069018",
    appId: "1:718646069018:web:09854daf0a59481dbe4ea3"
  };

  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);

  const inventoryRef = ref(db, "inventory");

  onValue(inventoryRef, (snapshot) => {
    const data = snapshot.val();

    if (!data) return;

    updateShelf("1", data.shelf1);
    updateShelf("2", data.shelf2);
    updateShelf("3", data.shelf3);

    checkLowStock(data);
  });

  function updateShelf(num, shelf) {
    if (!shelf) return;

    document.getElementById("s" + num).innerText = shelf.status ?? "N/A";
    document.getElementById("stock" + num).innerText = shelf.stock ?? "N/A";

    const stockBox = document.getElementById("stock" + num);

    if (shelf.stock <= 1) {
      stockBox.className = "value red";
    } else if (shelf.stock <= 3) {
      stockBox.className = "value orange";
    } else {
      stockBox.className = "value green";
    }
  }

  function checkLowStock(data) {
    let alerts = [];

    if (data.shelf1 && data.shelf1.stock <= 1) alerts.push("Shelf 1 Milk stock is below 10%");
    if (data.shelf2 && data.shelf2.stock <= 1) alerts.push("Shelf 2 Water stock is below 10%");
    if (data.shelf3 && data.shelf3.stock <= 1) alerts.push("Shelf 3 Juice stock is below 10%");

    const alertBox = document.getElementById("alertBox");
    const alertText = document.getElementById("alertText");

    if (alerts.length > 0) {
      alertBox.style.display = "block";
      alertText.innerHTML = alerts.join("<br>");
    } else {
      alertBox.style.display = "none";
    }
  }

  window.resetShelf = function(shelfName) {

  let amount = 0;

  if (shelfName === "shelf1") amount = 6;
  if (shelfName === "shelf2") amount = 40;
  if (shelfName === "shelf3") amount = 15;
  if (shelfName === "shelf4") amount = 10;

  update(ref(db, "inventory/" + shelfName), {
    stock: amount,
    status: "Available",
    reset: true
  });

}
</script>
  `));
});


app.get("/queuing", async (req, res) => {
 const user = await getCurrentUser(req);
  if (!user) {
    return res.redirect("/");
  }

  res.send(pageLayout(`
<div class="nav">
  <div class="nav-title">👥 Queue Management</div>

  <div class="nav-links">
    <a href="/dashboard">🏠 Home</a>
    <a href="/energy">⚡ Energy</a>
    <a href="/inventory">📦 Inventory</a>
    <a class="logout" href="/logout">Logout</a>
  </div>
</div>

<div class="container">
  <div class="hero">
    <h1>Queue Monitoring</h1>
    <p>Track customer flow and waiting time.</p>
  </div>

  <div class="grid">
    <div class="card">
      <h3>Current Queue</h3>
      <div class="value blue">${user.queue.currentQueue}</div>
    </div>

    <div class="card">
      <h3>Crowd Level</h3>
      <div class="value orange">${user.queue.crowdLevel}</div>
    </div>

    <div class="card">
      <h3>Estimated Waiting</h3>
      <div class="value green">${user.queue.estimatedWaiting}</div>
    </div>
  </div>
</div>
  `));
});

app.get("/api/shelly", async (req, res) => {
  try {
    const response = await fetch(`http://${SHELLY_IP}/rpc/Shelly.GetStatus`);
    const data = await response.json();

    const temperature =
      data["temperature:0"]?.tC ??
      data.temperature?.tC ??
      "N/A";

    const humidity =
      data["humidity:0"]?.rh ??
      data.humidity?.rh ??
      "N/A";

    res.json({
      temperature: temperature === "N/A" ? "N/A" : temperature + "°C",
      humidity: humidity === "N/A" ? "N/A" : humidity + "%",
      status: "Online"
    });

  } catch (error) {
    res.json({
      temperature: "N/A",
      humidity: "N/A",
      status: "Offline"
    });
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});
const shellyDevices = {
  plug1: "192.168.0.33",
  plug2: "192.168.0.149",
  plug3: "192.168.0.160",
  ht1: "192.168.0.115",
  ht2: "192.168.0.238",
  ht3: "192.168.0.77"
};

app.get("/shelly-data", async (req, res) => {
  try {

  const plug1 = await axios.get(
    "http://" + shellyDevices.plug1 + "/rpc/Switch.GetStatus?id=0"
  ).then(r => r.data);

  const plug2 = await axios.get(
    "http://" + shellyDevices.plug2 + "/rpc/Switch.GetStatus?id=0"
  ).then(r => r.data);

  const plug3 = await axios.get(
    "http://" + shellyDevices.plug3 + "/rpc/Switch.GetStatus?id=0"
  ).then(r => r.data);
const ht1 = await axios.get(
  "http://" + shellyDevices.ht1 + "/rpc/Temperature.GetStatus?id=0",
  { timeout: 1500 }
).then(r => r.data).catch(() => ({ tC: "Offline", rh: "-" }));

const ht2 = await axios.get(
  "http://" + shellyDevices.ht2 + "/rpc/Temperature.GetStatus?id=0",
  { timeout: 1500 }
).then(r => r.data).catch(() => ({ tC: "Offline", rh: "-" }));

const ht3 = await axios.get(
  "http://" + shellyDevices.ht3 + "/rpc/Temperature.GetStatus?id=0",
  { timeout: 1500 }
).then(r => r.data).catch(() => ({ tC: "Offline", rh: "-" }));
  res.json({
    success: true,

    plugs: {
      plug1,
      plug2,
      plug3
    } ,
    ht: {
      ht1,
      ht2,
      ht3
}

  });

} catch (error) {

  res.json({
    error: true,
    message: error.message
  });

}
});
app.get("/toggle-plug/:plug/:state", async (req, res) => {

  try {

    const plug = req.params.plug;
    const state = req.params.state;

    const ip = shellyDevices[plug];

    await axios.get(
      "http://" + ip + "/rpc/Switch.Set?id=0&on=" + state
    );

    res.json({
      success: true
    });

  } catch (error) {

    res.json({
      error: true,
      message: error.message
    });

  }

});
async function saveShellyToFirebase() {
  try {
    const response = await axios.get("http://localhost:3000/shelly-data");
    const data = response.data;

    await set(ref(db, "energy"), {
      ...data,
      lastUpdate: new Date().toLocaleString()
    });

    console.log("Shelly data saved to Firebase");
  } catch (error) {
    console.log("Firebase save error:", error.message);
  }
}

setInterval(saveShellyToFirebase, 5000);
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});