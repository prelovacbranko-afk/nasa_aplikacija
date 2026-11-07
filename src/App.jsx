import { useEffect } from "react";
import "./App.css";

const PUBLIC_VAPID_KEY = "TVOJ_PUBLIC_VAPID_KEY"; // Isti public key kao na backendu
const BACKEND_URL = "https://tvoj-backend-demo.render.com"; // Tvoj public URL

function App() {
  useEffect(() => {
    // Registracija Service Workera i Push Pretplate na iOS-u
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.register("/sw.js").then(async (reg) => {
        // Traženje dozvole za notifikacije
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          let sub = await reg.pushManager.getSubscription();
          if (!sub) {
            sub = await reg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: PUBLIC_VAPID_KEY
            });
          }
          // Slanje pretplate na backend
          await fetch(`${BACKEND_URL}/subscribe`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(sub)
          });
        }
      });
    }
  }, []);

  const handleAttentionClick = async () => {
    try {
      await fetch(`${BACKEND_URL}/send-attention`, {
        method: "POST"
      });
    } catch (err) {
      console.error("Greška pri slanju:", err);
    }
  };

  return (
    <main className="home-screen">
      <button className="settings-button" aria-label="Opcije">
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
        <span className="attention-text">Klikni za pažnju</span>
      </div>
    </main>
  );
}

export default App;