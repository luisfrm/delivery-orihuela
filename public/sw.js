self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {}
  const { title, body, url } = data

  event.waitUntil(
    self.registration.showNotification(title ?? "Delivery LosLatinos", {
      body: body ?? "",
      icon: "/icon.png",
      badge: "/icon.png",
      data: { url: url ?? "/" },
    })
  )
})

// When the user clicks the notification, open the relevant URL
self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const url = event.notification.data?.url ?? "/"
  event.waitUntil(clients.openWindow(url))
})
