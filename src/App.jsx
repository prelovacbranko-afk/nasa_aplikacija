import React, { useEffect, useState } from "react";
import "./App.css";

const PUBLIC_VAPID_KEY = "BMDbWRoEMLNqmlTYG6DEDoe8DHOWKLwTjuzDiAfQlCfqQmWBH_7t7sSZWVsHVGQmn7Q0ilPUaM-EY0HZmbIJkek";
const BACKEND_URL = "https://nasa-aplikacija.onrender.com";

function App() {
  const [role, setRole] = useState(localStorage.getItem("app_role") || null);

  const selectRole = async (selectedRole) => {
    localStorage.setItem("app_role", selectedRole);
    setRole(selectedRole);

    if ("serviceWorker" in navigator && "PushManager" in window) {
      const reg = await navigator.serviceWorker.register("/sw.js");
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        let sub = await reg.pushManager.getSubscription();
        if (!sub) {
          sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: PUBLIC_VAPID_KEY
          });
        }
        await fetch(`${BACKEND_URL}/subscribe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscription: sub, role: selectedRole })
        });
      }
    }
  };

  const handleAttentionClick = async () => {
    // Ako je Marija ulogovana, šalje Branku. Ako je Branko, šalje Mariji.
    const endpoint = role === "marija" ? "/send-to-branko" : "/send-to-marija";
    try {
      const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: "POST"
      });
      const data = await res.json();
      if (data.success) {
        alert("Pažnja poslata! 🤍");
      } else {
        alert("Greška: " + (data.error || "Proveri da li je drugi uređaj registrovan"));
      }
    } catch (err) {
      console.error("Greška pri slanju:", err);
    }
  };

  if (!role) {
    return (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh", background: "#000", color: "#fff", gap: "20px" }}>
        <h2>Ko koristi ovaj telefon?</h2>
        <button onClick={() => selectRole("branko")} style={{ padding: "15px 30px", fontSize: "18px", background: "#2196F3", color: "#fff", border: "none", borderRadius: "10px" }}>
          Ja sam Branko
        </button>
        <button onClick={() => selectRole("marija")} style={{ padding: "15px 30px", fontSize: "18px", background: "#E91E63", color: "#fff", border: "none", borderRadius: "10px" }}>
          Ja sam Marija
        </button>
      </div>
    );
  }

  return (
    <main className="home-screen">
      <button className="settings-button" aria-label="Opcije" onClick={() => { localStorage.clear(); setRole(null); }}>
        ⚙
      </button>

      <div className="comets-layer">
        <span className="comet c1"></span>
        <span className="comet c2"></span>
        <span className="comet c3"></span>
        <span className="supernova s1"></span>
        <span className="supernova s2"></span>
        <span className="supernova s3"></span>
      </div>

      <div className="couple-stage">
        <img
          className="couple-photo"
          src="/images/slika1.jpeg"
          alt="Naša fotografija"
        />
      </div>

      <div className="dust-overlay"></div>

      <div className="attention-wrapper" onClick={handleAttentionClick}>
        <span className="attention-text">
          {role === "marija" ? "Pošalji pažnju Branku 🤍" : "Pošalji pažnju Mariji 🤍"}
        </span>
      </div>
    </main>
  );
}

export default App;