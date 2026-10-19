document.addEventListener("DOMContentLoaded", function () {
    const raw = localStorage.getItem("vexoraUser");
    if (!raw) { window.location.href = "index.html"; return; }
    let user;
    try {
        user = JSON.parse(raw);
    } catch (error) {
        localStorage.removeItem("vexoraUser");
        window.location.href = "index.html";
        return;
    }
    if (!user || !user.id) {
        localStorage.removeItem("vexoraUser");
        window.location.href = "index.html";
        return;
    }
    const list = document.getElementById("notificationList");

    function format(notification) {
        const actor = notification.actor_username || notification.username || "Someone";
        const type = String(notification.type || "").toLowerCase();
        if (type === "like") return `${actor} liked your post.`;
        if (type === "comment") return `${actor} commented on your post.`;
        if (type === "follow") return `${actor} started following you.`;
        return `${actor} interacted with you.`;
    }

    async function load() {
        try {
            const response = await fetch(`/api/notifications?userId=${encodeURIComponent(user.id)}`);
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.message || "Could not load notifications.");
            list.innerHTML = "";
            if (!data.notifications || !data.notifications.length) {
                list.innerHTML = '<div class="search-empty">No notifications yet.</div>';
                return;
            }
            data.notifications.forEach(function (notification, index) {
                const item = document.createElement("button");
                item.type = "button";
                item.className = `notification-page-item ${Number(notification.is_read) ? "" : "unread"}`;
                item.style.animationDelay = `${index * 45}ms`;
                const icon = document.createElement("span"); icon.className = "notification-page-icon"; icon.textContent = notification.type === "like" ? "\u2665" : "\u2661"; const details = document.createElement("span"); const message = document.createElement("strong"); message.textContent = format(notification); const time = document.createElement("small"); time.textContent = notification.created_at || "Recently"; details.append(message, time); item.append(icon, details);
                item.addEventListener("click", async function () {
                    await fetch(`/api/notifications/${encodeURIComponent(notification.id)}/read`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: user.id }) });
                    item.classList.remove("unread");
                });
                list.appendChild(item);
            });
        } catch (error) {
            console.error("Notifications error:", error);
            list.innerHTML = '<div class="search-empty">Notifications are temporarily unavailable.</div>';
        }
    }

    document.getElementById("markAll").addEventListener("click", async function () {
        await fetch("/api/notifications/read-all", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: user.id }) });
        document.querySelectorAll(".notification-page-item.unread").forEach(function (item) { item.classList.remove("unread"); });
    });
    document.getElementById("logoutButton").addEventListener("click", function () { localStorage.removeItem("vexoraUser"); });
    load();
});
