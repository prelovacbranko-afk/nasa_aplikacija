const express = require("express");
const webpush = require("web-push");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

const publicVapidKey = "BMDbWRoEMLNqmlTYG6DEDoe8DHOWKLwTjuzDiAfQlCfqQmWBH_7t7sSZWVsHVGQmn7Q0ilPUaM-EY0HZmbIJkek";
const privateVapidKey = "85RIkbMUyNNudQ1CvP_r-C5p3s_W2FVI0QDcDRduGJg";

webpush.setVapidDetails(
  "mailto:tvoj@email.com",
  publicVapidKey,
  privateVapidKey
);

// Fajl gde čuvamo pretplate trajno
const DB_FILE = path.join(__dirname, "subscriptions.json");

// Funkcija za čitanje baza
function getDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
    }
  } catch (e) {
    console.error("Greška pri čitanju baze:", e);
  }
  return { branko: null, marija: null };
}

// Funkcija za čuvanje baze
function saveDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data));
  } catch (e) {
    console.error("Greška pri čuvanju baze:", e);
  }
}

// Prijava uređaja
app.post("/subscribe", (req, res) => {
  const { subscription, role } = req.body;
  const db = getDb();
  
  if (role === "branko") {
    db.branko = subscription;
    console.log("Sačuvana Brankova pretplata!");
  } else if (role === "marija") {
    db.marija = subscription;
    console.log("Sačuvana Marijina pretplata!");
  }
  
  saveDb(db);
  res.status(201).json({ message: "Pretplata uspešna!" });
});

// Marija šalje Branku
app.post("/send-to-branko", (req, res) => {
  const db = getDb();
  if (!db.branko) {
    return res.status(400).json({ error: "Brankov uređaj nije registrovan!" });
  }

  const payload = JSON.stringify({
    title: "Pažnja! 🤍",
    body: "Marija želi tvoju pažnju.",
    icon: "/icon.png"
  });

  webpush.sendNotification(db.branko, payload)
    .then(() => res.status(200).json({ success: true }))
    .catch(err => {
      console.error("Greška pri slanju Branku:", err);
      res.status(500).json({ error: "Greška pri slanju" });
    });
});

// Branko šalje Mariji
app.post("/send-to-marija", (req, res) => {
  const db = getDb();
  if (!db.marija) {
    return res.status(400).json({ error: "Marijin uređaj nije registrovan!" });
  }

  const payload = JSON.stringify({
    title: "Pažnja! 🤍",
    body: "Branko želi tvoju pažnju.",
    icon: "/icon.png"
  });

  webpush.sendNotification(db.marija, payload)
    .then(() => res.status(200).json({ success: true }))
    .catch(err => {
      console.error("Greška pri slanju Mariji:", err);
      res.status(500).json({ error: "Greška pri slanju" });
    });
});

app.use(express.static(path.join(__dirname, "dist")));

app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server radi na portu ${PORT}`));