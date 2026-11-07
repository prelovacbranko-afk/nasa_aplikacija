const express = require("express");
const webpush = require("web-push");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const publicVapidKey = "BMDbWRoEMLNqmlTYG6DEDoe8DHOWKLwTjuzDiAfQlCfqQmWBH_7t7sSZWVsHVGQmn7Q0ilPUaM-EY0HZmbIJkek";
const privateVapidKey = "85RIkbMUyNNudQ1CvP_r-C5p3s_W2FVI0QDcDRduGJg";

webpush.setVapidDetails(
  "mailto:admin@nasa-aplikacija.com",
  publicVapidKey,
  privateVapidKey
);

// Čuvamo uređaje sortirane po PIN-u: { "1234": [sub1, sub2] }
let rooms = {};

// Prijava uređaja preko PIN-a
app.post("/subscribe", (req, res) => {
  const { subscription, pin } = req.body;
  if (!subscription || !pin) {
    return res.status(400).json({ error: "Nedostaje subscription ili PIN" });
  }

  if (!rooms[pin]) {
    rooms[pin] = [];
  }

  // Sprečavamo dupliranje istog uređaja u istoj sobi
  rooms[pin] = rooms[pin].filter(sub => sub.endpoint !== subscription.endpoint);
  rooms[pin].push(subscription);

  // Zadržavamo maksimalno 2 uređaja po PIN-u
  if (rooms[pin].length > 2) {
    rooms[pin].shift();
  }

  console.log(`Uređaj uspešno prijavljen na PIN: ${pin}. Ukupno uređaja u sobi: ${rooms[pin].length}`);
  res.status(201).json({ message: "Pretplata uspešna!" });
});

// Slanje notifikacije drugom uređaju u istoj sobi
app.post("/send-attention", (req, res) => {
  const { pin, subscription: senderSub } = req.body;
  
  if (!rooms[pin] || rooms[pin].length < 2) {
    return res.status(400).json({ error: "Drugi uređaj još uvek nije povezan sa ovim PIN-om!" });
  }

  // Nađi onaj drugi uređaj koji NIJE pošiljalac
  const targetDevice = rooms[pin].find(sub => sub.endpoint !== senderSub.endpoint) || rooms[pin][0];

  const payload = JSON.stringify({
    title: "Pažnja! 🤍",
    body: "Neko želi tvoju pažnju.",
    icon: "/icon.png"
  });

  webpush.sendNotification(targetDevice, payload)
    .then(() => res.status(200).json({ success: true }))
    .catch(err => {
      console.error("Greška pri slanju:", err);
      res.status(500).json({ error: "Greška pri slanju notifikacije" });
    });
});

app.use(express.static(path.join(__dirname, "dist")));

app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server radi na portu ${PORT}`));