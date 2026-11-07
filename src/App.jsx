import React, { useEffect, useState, useRef } from "react";
import "./App.css";

const BACKEND_URL = "https://nasa-aplikacija.onrender.com";

function App() {
  const [pin, setPin] = useState(localStorage.getItem("app_pin") || null);
  const [inputPin, setInputPin] = useState("");
  // Generišemo jedinstveni ID za ovaj uređaj da server zna ko je poslao
  const deviceIdRef = useRef(localStorage.getItem("device_id") || Math.random().toString(36).substring(7));

  useEffect(() => {
    if (!localStorage.getItem("device_id")) {
      localStorage.setItem("device_id", deviceIdRef.current);
    }
  }, []);

  // Povezivanje na sobu
  const joinRoom = async (enteredPin) => {
    try {
      const res = await fetch(`${BACKEND_URL}/join-room`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: enteredPin, deviceId: deviceIdRef.current })
      });

      if (res.ok) {
        localStorage.setItem("app_pin", enteredPin);
        setPin(enteredPin);
      } else {
        alert("Greška pri povezivanju na sobu.");
      }
    } catch (err) {
      console.error("Greška:", err);
      alert("Serverska greška.");
    }
  };

  // Pozadinski detektor (proverava svake 2 sekunde da li je stigla pažnja)
  useEffect(() => {
    if (!pin) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/check-attention/${pin}/${deviceIdRef.current}`);
        const data = await res.json();
        
        if (data.triggered) {
          // Vibracija ako uređaj podržava
          if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
          alert("🤍 Stigla ti je pažnja! Neko misli na tebe.");
        }
      } catch (err) {
        // Ignorisati tihe greške mreže u pozadini
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [pin]);

  // Klik na dugme - slanje pažnje
  const handleAttentionClick = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/send-attention`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin, deviceId: deviceIdRef.current })
      });
      
      if (res.ok) {
        alert("Pažnja poslata! 🤍");
      } else {
        alert("Greška pri slanju.");
      }
    } catch (err) {
      console.error("Greška:", err);
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
          onClick={() => { if(inputPin.trim()) joinRoom(inputPin.trim()); else alert("Unesi PIN!"); }} 
          style={{ padding: "12px 25px", fontSize: "16px", background: "#E91E63", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" }}
        >
          Poveži se
        </button>
      </div>
    );
  }

  return (
    <main className="home-screen">
      <button className="settings-button" aria-label="Opcije" onClick={() => { localStorage.clear(); setPin(null); }}>
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