document.addEventListener("DOMContentLoaded", function () {
    const savedUser = localStorage.getItem("vexoraUser");

    if (!savedUser) {
        window.location.href = "index.html";
        return;
    }

    let user;

    try {
        user = JSON.parse(savedUser);
    } catch (error) {
        localStorage.removeItem("vexoraUser");
        window.location.href = "index.html";
        return;
    }

    if (!user || !user.id) {
        window.location.href = "index.html";
        return;
    }

    const input = document.getElementById("peopleSearch");
    const results = document.getElementById("peopleResults");
    const title = document.getElementById("resultsTitle");
    const count = document.getElementById("resultsCount");
    let timer = null;

    function initial(username) {
        return (username || "U").charAt(0).toUpperCase();
    }

    function setAvatar(element, avatar, username) {
        if (avatar) {
            element.textContent = "";
            element.style.backgroundImage = `url("${avatar}")`;
        } else {
            element.textContent = initial(username);
        }
    }

    function renderUsers(users) {
        results.innerHTML = "";
        count.textContent = users.length ? `${users.length} people` : "";

        if (!users.length) {
            results.innerHTML = '<div class="search-empty">No people found. Try another username.</div>';
            return;
        }

        users.forEach(function (person, index) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "person-result";
            button.style.animationDelay = `${index * 45}ms`;

            const avatar = document.createElement("div");
            avatar.className = "person-avatar";
            setAvatar(avatar, person.avatar || "", person.username);

            const info = document.createElement("div");
            info.className = "person-info";
            info.innerHTML = `<strong>${escapeHTML(person.username || "User")}</strong><span>${escapeHTML(person.bio || "Vexora member")}</span>`;

            button.appendChild(avatar);
            button.appendChild(info);
            button.addEventListener("click", function () {
                window.location.href = `profile.html?userId=${encodeURIComponent(person.id)}`;
            });
            results.appendChild(button);
        });
    }

    function escapeHTML(value) {
        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    async function searchPeople(query) {
        results.innerHTML = '<div class="search-loading">Searching Vexora...</div>';
        title.textContent = query ? `Results for “${query}”` : "Suggested for you";

        try {
            const endpoint = query
                ? `/api/users?username=${encodeURIComponent(query)}`
                : `/api/users?currentUserId=${encodeURIComponent(user.id)}`;
            const response = await fetch(endpoint);
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Search failed.");
            }

            renderUsers((data.users || []).filter(function (person) {
                return Number(person.id) !== Number(user.id);
            }));
        } catch (error) {
            console.error("Search error:", error);
            results.innerHTML = '<div class="search-empty">Search is temporarily unavailable. Try again.</div>';
        }
    }

    input.addEventListener("input", function () {
        clearTimeout(timer);
        timer = setTimeout(function () {
            searchPeople(input.value.trim());
        }, 240);
    });

    document.addEventListener("keydown", function (event) {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
            event.preventDefault();
            input.focus();
        }
    });

    document.getElementById("logoutButton").addEventListener("click", function () {
        localStorage.removeItem("vexoraUser");
    });

    searchPeople("");
});
