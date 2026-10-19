document.addEventListener("DOMContentLoaded", function () {
    const pageName = window.location.pathname.split("/").pop() || "index.html";

    if (pageName !== "index.html") {
        const pages = [
            { file: "dashboard.html", label: "Home", icon: "⌂" },
            { file: "search.html", label: "Search", icon: "⌕" },
            { file: "notifications.html", label: "Activity", icon: "♡" },
            { file: "messages.html", label: "Messages", icon: "✉" },
            { file: "profile.html", label: "Profile", icon: "♙" }
        ];
        const mobileNav = document.createElement("nav");
        mobileNav.className = "vex-mobile-nav";
        mobileNav.setAttribute("aria-label", "Main navigation");

        pages.forEach(function (page) {
            const link = document.createElement("a");
            link.href = page.file;
            link.className = page.file === pageName ? "active" : "";
            link.setAttribute("aria-label", page.label);
            if (page.file === pageName) link.setAttribute("aria-current", "page");

            const icon = document.createElement("span");
            icon.className = "vex-mobile-nav-icon";
            icon.setAttribute("aria-hidden", "true");
            icon.textContent = page.icon;

            const label = document.createElement("span");
            label.className = "vex-mobile-nav-label";
            label.textContent = page.label;

            link.append(icon, label);
            mobileNav.appendChild(link);
        });

        document.body.appendChild(mobileNav);
    }

    document.addEventListener("click", function (event) {
        const link = event.target.closest("a[href]");

        if (!link || link.target === "_blank") {
            return;
        }

        const href = link.getAttribute("href");

        if (!href || href.startsWith("#") || href.startsWith("http")) {
            return;
        }

        if (!/^(index|dashboard|messages|profile|search|notifications)\.html(?:#.*)?(?:\?.*)?$/.test(href)) {
            return;
        }

        event.preventDefault();
        window.location.assign(href);
    }, true);
});
