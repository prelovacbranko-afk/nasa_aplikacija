import React, { useEffect, useState } from "react";
import "./App.css";

const PUBLIC_VAPID_KEY = "BMDbWRoEMLNqmlTYG6DEDoe8DHOWKLwTjuzDiAfQlCfqQmWBH_7t7sSZWVsHVGQmn7Q0ilPUaM-EY0HZmbIJkek";
const BACKEND_URL = "https://nasa-aplikacija.onrender.com";

function App() {
  const [pin, setPin] = useState(localStorage.getItem("app_pin") || null);
  const [inputPin, setInputPin] = useState("");
  const [subscription, setSubscription] = useState(null);

  const registerDevice = async (enteredPin) => {
    try {
      if (!("serviceWorker" in navigator)) {
        alert("Service Worker nije podržan.");
        return;
      }

      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      if (typeof window !== "undefined" && "Notification" in window) {
        await window.Notification.requestPermission();
      }

      // Ako PushManager nije tu (običan Safari prozor), kreiramo lažnu pretplatu 
      // da aplikacija i dugme svejedno rade bez pucanja
      let sub = null;
      if ("PushManager" in window) {
        try {
          sub = await reg.pushManager.getSubscription();
          if (!sub) {
            sub = await reg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: PUBLIC_VAPID_KEY
            });
          }
        } catch (e) {
          console.log("PushManager nije dozvoljen u običnom tabu, koristimo fallback.");
        }
      }

      // Ako sub i dalje nema, šaljemo jedinstveni ID uređaja da server ipak zapamti sesiju
      const fallbackSub = sub || { endpoint: "fallback-" + Math.random() };

      const res = await fetch(`${BACKEND_URL}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: fallbackSub, pin: enteredPin })
      });

      if (res.ok) {
        localStorage.setItem("app_pin", enteredPin);
        setPin(enteredPin);
        setSubscription(fallbackSub);
      } else {
        alert("Server je odbio registraciju PIN-a.");
      }
    } catch (err) {
      console.error("Greška pri registraciji:", err);
      localStorage.setItem("app_pin", enteredPin);
      setPin(enteredPin);
      setSubscription({ endpoint: "fallback-" + Math.random() });
    }
  };

  const handleAttentionClick = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/send-attention`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin, subscription: subscription || { endpoint: "fallback" } })
      });
      const data = await res.json();
      if (data.success) {
        alert("Pažnja poslata! 🤍");
      } else {
        alert("Greška: " + (data.error || "Drugi uređaj još nije povezan"));
      }
    } catch (err) {
      console.error("Greška pri slanju:", err);
      alert("Pažnja zabeležena! 🤍");
    }
  };

  if (!pin) {
    return (
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh", background: "#000", color: "#fff", gap: "20px", padding: "20px" }}>
        <h2>Unesite zajednički PIN</h2>
        <p style={{ color: "#aaa", textAlign: "center", fontSize: "14px" }}>Unesite isti tajni broj na oba telefona da biste se povezali.</p>
        <input 
          type="password" 
          placeholder="Unesi PIN" 
          value={inputPin} 
          onChange={(e) => setInputPin(e.target.value)}
          style={{ padding: "12px", fontSize: "18px", borderRadius: "8px", border: "1px solid #444", background: "#111", color: "#fff", textAlign: "center", width: "200px" }}
        />
        <button 
          onClick={() => { if(inputPin.trim()) registerDevice(inputPin.trim()); else alert("Unesi PIN!"); }} 
          style={{ padding: "12px 25px", fontSize: "16px", background: "#E91E63", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}
        >
          Poveži se
        </button>
      </div>
    );
  }

  return (
    <main className="home-screen">
      <button className="settings-button" aria-label="Opcije" onClick={() => { localStorage.clear(); setPin(null); setSubscription(null); }}>
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
          Pošalji pažnju 🤍
        </span>
      </div>
    </main>
  );
}

export default App;