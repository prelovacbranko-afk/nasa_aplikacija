const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Sobe: { "1234": { lastAction: timestamp, sender: "id" } }
let rooms = {};

// Prijava na PIN sobu
app.post("/join-room", (req, res) => {
  const { pin, deviceId } = req.body;
  if (!pin || !deviceId) {
    return res.status(400).json({ error: "Nedostaje PIN ili ID uređaja" });
  }
  
  if (!rooms[pin]) {
    rooms[pin] = { lastAction: 0, sender: null, devices: [] };
  }

  if (!rooms[pin].devices.includes(deviceId)) {
    rooms[pin].devices.push(deviceId);
  }

  res.status(200).json({ success: true });
});

// Slanje pažnje
app.post("/send-attention", (req, res) => {
  const { pin, deviceId } = req.body;
  if (!rooms[pin]) {
    rooms[pin] = { lastAction: 0, sender: null, devices: [] };
  }

  rooms[pin].lastAction = Date.now();
  rooms[pin].sender = deviceId;

  console.log(`Primljena pažnja u sobi ${pin} od uređaja ${deviceId}`);
  res.status(200).json({ success: true });
});

// Provera statusa (Long polling / interval)
app.get("/check-attention/:pin/:deviceId", (req, res) => {
  const { pin, deviceId } = req.params;
  const room = rooms[pin];

  if (!room) {
    return res.status(200).json({ triggered: false });
  }

  // Ako je akcija bila u poslednjih 3 sekunde, i poslao ju je DRUGI uređaj
  const isRecent = (Date.now() - room.lastAction) < 3000;
  const triggered = isRecent && room.sender !== deviceId;

  res.status(200).json({ triggered });
});

app.use(express.static(path.join(__dirname, "dist")));

app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server radi na portu ${PORT}`));