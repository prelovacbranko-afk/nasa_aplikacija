self.addEventListener("push", (e) => {
  const data = e.data ? e.data.json() : {};

  const options = {
    body: data.body || "Marija želi pažnju!",
    icon: data.icon || "/icon.png",
    badge: "/icon.png",
    vibrate: [200, 100, 200]
  };

  e.waitUntil(
    self.registration.showNotification(data.title || "Pažnja!", options)
  );
});