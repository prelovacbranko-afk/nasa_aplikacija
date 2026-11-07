const express = require("express");
const webpush = require("web-push");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Tvoji VAPID ključevi (zameniti pravim ključevima iz generisanja)
const publicVapidKey = "BMDbWRoEMLNqmlTYG6DEDoe8DHOWKLwTjuzDiAfQlCfqQmWBH_7t7sSZWVsHVGQmn7Q0ilPUaM-EY0HZmbIJkek";
const privateVapidKey = "85RIkbMUyNNudQ1CvP_r-C5p3s_W2FVI0QDcDRduGJg";

webpush.setVapidDetails(
  "mailto:tvoj@email.com",
  publicVapidKey,
  privateVapidKey
);

// Niz pretplata (čuvanje pretplate za uređaje)
let subscriptions = [];

// Ruta gde frontend šalje informaciju za Push pretplatu
app.post("/subscribe", (req, res) => {
  const subscription = req.body;
  
  // Izbegavamo duplikate
  const exists = subscriptions.some(s => s.endpoint === subscription.endpoint);
  if (!exists) {
    subscriptions.push(subscription);
  }
  
  res.status(201).json({ message: "Pretplata uspešna!" });
});

// Ruta koju ona okida kada klikne "Klikni za pažnju"
app.post("/send-attention", (req, res) => {
  const payload = JSON.stringify({
    title: "Marija želi pažnju! 🤍",
    body: "Kliknula je na dugme u vašoj svemirskoj aplikaciji.",
    icon: "/icon.png"
  });

  // Šalje notifikaciju svim registrovanim uređajima
  Promise.all(
    subscriptions.map(sub =>
      webpush.sendNotification(sub, payload).catch(err => {
        console.error("Greška pri slanju notifikacije:", err);
      })
    )
  );

  res.status(200).json({ success: true });
});

// --- DODATO: Serviranje Vite/React frontenda ---
app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server radi na portu ${PORT}`));