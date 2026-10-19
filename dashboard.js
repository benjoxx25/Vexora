document.addEventListener("DOMContentLoaded", function () {

    // ==========================
    // CURRENT USER
    // ==========================

    const savedUser =
        localStorage.getItem("vexoraUser");


    if (!savedUser) {

        window.location.href =
            "index.html";

        return;

    }


    let user;


    try {

        user =
            JSON.parse(savedUser);

    } catch (error) {

        localStorage.removeItem(
            "vexoraUser"
        );

        window.location.href =
            "index.html";

        return;

    }


    if (
        !user ||
        !user.id
    ) {

        localStorage.removeItem(
            "vexoraUser"
        );

        window.location.href =
            "index.html";

        return;

    }

    user.username = user.username || "User";


    // ==========================
    // HELPERS
    // ==========================

    function getInitial(username) {

        return (username || "U")
            .charAt(0)
            .toUpperCase();

    }


    function setAvatar(
        element,
        avatar,
        username
    ) {

        if (!element) {
            return;
        }


        if (avatar) {

            element.textContent =
                "";

            element.style.backgroundImage =
                `url("${avatar}")`;

            element.style.backgroundSize =
                "cover";

            element.style.backgroundPosition =
                "center";

            element.style.backgroundRepeat =
                "no-repeat";

        } else {

            element.style.backgroundImage =
                "";

            element.style.backgroundSize =
                "";

            element.style.backgroundPosition =
                "";

            element.style.backgroundRepeat =
                "";

            element.textContent =
                getInitial(username);

        }

    }


    function formatDate(dateString) {

        if (!dateString) {
            return "Recently";
        }


        let date;


        try {

            const normalized =
                String(dateString).includes("T")
                    ? String(dateString)
                    : String(dateString).replace(
                        " ",
                        "T"
                    );


            date =
                new Date(
                    normalized.endsWith("Z")
                        ? normalized
                        : normalized + "Z"
                );

        } catch (error) {

            return "Recently";

        }


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "Recently";

        }


        const now =
            new Date();


        const seconds =
            Math.floor(
                (now - date) / 1000
            );


        if (seconds < 60) {
            return "Just now";
        }


        const minutes =
            Math.floor(
                seconds / 60
            );


        if (minutes < 60) {

            return minutes +
                (
                    minutes === 1
                        ? " minute ago"
                        : " minutes ago"
                );

        }


        const hours =
            Math.floor(
                minutes / 60
            );


        if (hours < 24) {

            return hours +
                (
                    hours === 1
                        ? " hour ago"
                        : " hours ago"
                );

        }


        const days =
            Math.floor(
                hours / 24
            );


        if (days < 7) {

            return days +
                (
                    days === 1
                        ? " day ago"
                        : " days ago"
                );

        }


        return date.toLocaleDateString();

    }


    function createElement(
        tag,
        className,
        text
    ) {

        const element =
            document.createElement(
                tag
            );


        if (className) {

            element.className =
                className;

        }


        if (text !== undefined) {

            element.textContent =
                text;

        }


        return element;

    }


    // ==========================
    // GO TO PROFILE
    // ==========================

    function openUserProfile(userId) {

        if (!userId) {
            return;
        }


        window.location.href =
            `profile.html?userId=${encodeURIComponent(userId)}`;

    }


    function openOwnProfile() {

        window.location.href =
            "profile.html";

    }


    // ==========================
    // USER DATA
    // ==========================

    document
        .querySelectorAll(".current-username")
        .forEach(function (element) {

            element.textContent =
                user.username;

        });


    const topUsername =
        document.getElementById(
            "topUsername"
        );


    const topAvatar =
        document.getElementById(
            "topAvatar"
        );


    const currentUsername =
        document.getElementById(
            "currentUsername"
        );


    const currentUsernameTag =
        document.getElementById(
            "currentUsernameTag"
        );


    const currentAvatar =
        document.getElementById(
            "currentAvatar"
        );


    const createPostAvatar =
        document.getElementById(
            "createPostAvatar"
        );


    const modalAvatar =
        document.getElementById(
            "modalAvatar"
        );


    const modalUsername =
        document.getElementById(
            "modalUsername"
        );


    if (topUsername) {

        topUsername.textContent =
            user.username;

    }


    setAvatar(
        topAvatar,
        user.avatar || "",
        user.username
    );


    if (currentUsername) {

        currentUsername.textContent =
            user.username;

    }


    if (currentUsernameTag) {

        currentUsernameTag.textContent =
            user.username;

    }


    setAvatar(
        currentAvatar,
        user.avatar || "",
        user.username
    );


    setAvatar(
        createPostAvatar,
        user.avatar || "",
        user.username
    );


    setAvatar(
        modalAvatar,
        user.avatar || "",
        user.username
    );


    if (modalUsername) {

        modalUsername.textContent =
            user.username;

    }


    // ==========================
    // PROFILE NAVIGATION
    // ==========================

    const topProfileButton =
        document.getElementById(
            "topProfileButton"
        );


    const viewProfileButton =
        document.getElementById(
            "viewProfileButton"
        );


    if (topProfileButton) {

        topProfileButton.addEventListener(
            "click",
            function () {

                openOwnProfile();

            }
        );
    }


    if (viewProfileButton) {

        viewProfileButton.addEventListener(
            "click",
            function () {

                openOwnProfile();

            }
        );

    }


    // ==========================
    // LOGOUT
    // ==========================

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            function () {

                localStorage.removeItem(
                    "vexoraUser"
                );

                window.location.href =
                    "index.html";

            }
            );

    }


    // ==========================
    // LOAD USER STATS
    // ==========================

    async function loadUserStats() {

        try {

            const response =
                await fetch(
                    `/api/users/${user.id}/stats`
                );


            const data =
                await response.json();


            if (
                !response.ok ||
                !data.success
            ) {

                return;

            }


            const followerCount =
                document.getElementById(
                    "followerCount"
                );


            const followingCount =
                document.getElementById(
                    "followingCount"
                );


            if (followerCount) {

                followerCount.textContent =
                    data.followers || 0;

            }


            if (followingCount) {

                followingCount.textContent =
                    data.following || 0;

            }


            const currentUsernameElement =
                document.getElementById(
                    "currentUsername"
                );


            if (
                currentUsernameElement &&
                data.user &&
                data.user.username
            ) {

                currentUsernameElement.textContent =
                    data.user.username;

            }


            if (
                data.user &&
                typeof data.user.avatar === "string"
            ) {

                user.avatar =
                    data.user.avatar || "";

                localStorage.setItem(
                    "vexoraUser",
                    JSON.stringify(user)
                );


                setAvatar(
                    topAvatar,
                    user.avatar,
                    user.username
                );


                setAvatar(
                    currentAvatar,
                    user.avatar,
                    user.username
                );


                setAvatar(
                    createPostAvatar,
                    user.avatar,
                    user.username
                );


                setAvatar(
                    modalAvatar,
                    user.avatar,
                    user.username
                );

            }


        } catch (error) {

            console.error(
                "Could not load user stats:",
                error
            );

        }

    }


    // ==========================
    // LOAD SUGGESTIONS
    // ==========================

    async function loadSuggestions() {

        const suggestionsList =
            document.getElementById(
                "suggestionsList"
            );


        if (!suggestionsList) {
            return;
        }


        suggestionsList.innerHTML = `
            <div class="suggestion-loading">
                Loading users...
            </div>
        `;


        try {

            const response =
                await fetch(
                    `/api/users?currentUserId=${encodeURIComponent(user.id)}`
                );


            const data =
                await response.json();


            if (
                !response.ok ||
                !data.success
            ) {

                suggestionsList.innerHTML = `
                    <div class="suggestion-loading">
                        Could not load users.
                    </div>
                `;

                return;

            }


            const users =
                Array.isArray(data.users)
                    ? data.users
                    : [];


            suggestionsList.innerHTML =
                "";


            if (users.length === 0) {

                suggestionsList.innerHTML = `
                    <div class="suggestion-loading">
                        No other users yet.
                    </div>
                `;

                return;

            }


            users
                .slice(0, 5)
                .forEach(function (suggestedUser) {

                    const suggestion =
                        document.createElement(
                            "div"
                        );


                    suggestion.className =
                        "suggestion";


                    const avatar =
                        createElement(
                            "div",
                            "suggestion-avatar",
                            getInitial(
                                suggestedUser.username
                            )
                        );


                    const colors = [
                        "purple",
                        "blue",
                        "pink"
                    ];


                    avatar.classList.add(
                        colors[
                            Number(suggestedUser.id) %
                            colors.length
                        ]
                    );


                    setAvatar(
                        avatar,
                        suggestedUser.avatar || "",
                        suggestedUser.username
                    );


                    const info =
                        document.createElement(
                            "div"
                        );


                    info.className =
                        "suggestion-info";


                    const name =
                        createElement(
                            "strong",
                            "",
                            suggestedUser.username
                        );


                    name.style.cursor =
                        "pointer";


                    const followers =
                        createElement(
                            "span",
                            "",
                            `${suggestedUser.followers || 0} followers`
                        );


                    info.appendChild(
                        name
                    );


                    info.appendChild(
                        followers
                    );


                    const followButton =
                        createElement(
                            "button",
                            "follow-button",
                            suggestedUser.isFollowing
                                ? "Following"
                                : "Follow"
                        );


                    followButton.type =
                        "button";


                    suggestion.appendChild(
                        avatar
                    );


                    suggestion.appendChild(
                        info
                    );


                    suggestion.appendChild(
                        followButton
                    );


                    suggestionsList.appendChild(
                        suggestion
                    );


                    avatar.addEventListener(
                        "click",
                        function () {

                            openUserProfile(
                                suggestedUser.id
                            );

                        }
                    );


                    name.addEventListener(
                        "click",
                        function () {

                            openUserProfile(
                                suggestedUser.id
                            );

                        }
                    );


                    followButton.addEventListener(
                        "click",
                        async function () {

                            followButton.disabled =
                                true;


                            const oldText =
                                followButton.textContent;


                            followButton.textContent =
                                "Loading...";


                            try {

                                const response =
                                    await fetch(
                                        `/api/users/${suggestedUser.id}/follow`,
                                        {
                                            method: "POST",

                                            headers: {
                                                "Content-Type":
                                                    "application/json"
                                            },

                                            body:
                                                JSON.stringify({
                                                    followerId:
                                                        user.id
                                                })
                                        }
                                    );


                                const data =
                                    await response.json();


                                if (
                                    !response.ok ||
                                    !data.success
                                ) {

                                    alert(
                                        data.message ||
                                        "Could not update follow."
                                    );


                                    followButton.textContent =
                                        oldText;


                                    return;

                                }


                                suggestedUser.isFollowing =
                                    data.following;


                                suggestedUser.followers =
                                    data.followers;


                                followButton.textContent =
                                    data.following
                                        ? "Following"
                                        : "Follow";


                                followers.textContent =
                                    `${data.followers || 0} followers`;


                                await loadUserStats();

                                await loadNotificationCount();


                            } catch (error) {

                                console.error(
                                    "Follow error:",
                                    error
                                );


                                alert(
                                    "Could not connect to the Vexora server."
                                );


                                followButton.textContent =
                                    oldText;

                            } finally {

                                followButton.disabled =
                                    false;

                            }

                        }
                    );

                });


        } catch (error) {

            console.error(
                "Could not load suggestions:",
                error
            );


            suggestionsList.innerHTML = `
                <div class="suggestion-loading">
                    Could not connect to the server.
                </div>
            `;

        }

    }


    // ==========================
    // NOTIFICATIONS
    // ==========================

    const notificationsNavButton =
        document.getElementById(
            "notificationsNavButton"
        );


    const notificationsPanel =
        document.getElementById(
            "notificationsPanel"
        );


    const notificationBadge =
        document.getElementById(
            "notificationBadge"
        );


    const notificationUnreadText =
        document.getElementById(
            "notificationUnreadText"
        );


    const notificationsList =
        document.getElementById(
            "notificationsList"
        );


    const markAllNotificationsReadButton =
        document.getElementById(
            "markAllNotificationsRead"
        );


    function updateNotificationBadge(
        unreadCount
    ) {

        const count =
            Number(unreadCount) || 0;


        if (!notificationBadge) {
            return;
        }


        if (count > 0) {

            notificationBadge.textContent =
                count > 99
                    ? "99+"
                    : String(count);

            notificationBadge.style.display =
                "inline-flex";

        } else {

            notificationBadge.textContent =
                "0";

            notificationBadge.style.display =
                "none";

        }


        if (notificationUnreadText) {

            notificationUnreadText.textContent =
                count > 0
                    ? `${count} unread notification${count === 1 ? "" : "s"}`
                    : "No new notifications";

        }

    }


    async function loadNotificationCount() {

        try {

            const response =
                await fetch(
                    `/api/notifications/unread-count?userId=${encodeURIComponent(user.id)}`
                );


            const data =
                await response.json();


            if (
                !response.ok ||
                !data.success
            ) {

                return;

            }


            updateNotificationBadge(
                data.unread || 0
            );


        } catch (error) {

            console.error(
                "Could not load notification count:",
                error
            );

        }

    }


    function formatNotificationMessage(
        notification
    ) {

        const actor =
            notification.actor_username ||
            notification.username ||
            "Someone";


        const type =
            String(
                notification.type || ""
            ).toLowerCase();


        if (type === "like") {

            return `${actor} liked your post.`;

        }


        if (type === "comment") {

            return `${actor} commented on your post.`;

        }


        if (type === "reply") {

            return `${actor} replied to your comment.`;

        }


        if (type === "follow") {

            return `${actor} started following you.`;

        }


        if (type === "mention") {

            return `${actor} mentioned you.`;

        }


        return `${actor} interacted with you.`;

    }


    function getNotificationIcon(
        notification
    ) {

        const type =
            String(
                notification.type || ""
            ).toLowerCase();


        if (type === "like") {
            return "♥";
        }


        if (type === "comment") {
            return "💬";
        }


        if (type === "reply") {
            return "↩";
        }


        if (type === "follow") {
            return "♙";
        }


        if (type === "mention") {
            return "@";
        }


        return "♡";

    }


    function renderNotifications(
        notifications
    ) {

        if (!notificationsList) {
            return;
        }


        notificationsList.innerHTML =
            "";


        if (
            !Array.isArray(notifications) ||
            notifications.length === 0
        ) {

            const empty =
                createElement(
                    "div",
                    "notifications-empty"
                );


            const icon =
                createElement(
                    "div",
                    "notifications-empty-icon",
                    "♡"
                );


            const title =
                createElement(
                    "strong",
                    "",
                    "No notifications yet"
                );


            const description =
                createElement(
                    "span",
                    "",
                    "When someone interacts with you, it will appear here."
                );


            empty.appendChild(
                icon
            );


            empty.appendChild(
                title
            );


            empty.appendChild(
                description
            );


            notificationsList.appendChild(
                empty
            );


            return;

        }


        notifications.forEach(
            function (notification) {

                const item =
                    createElement(
                        "div",
                        "notification-item"
                    );


                if (
                    !Number(
                        notification.is_read
                    )
                ) {

                    item.classList.add(
                        "unread"
                    );

                }


                item.dataset.notificationId =
                    notification.id;


                const avatar =
                    createElement(
                        "div",
                        "notification-avatar",
                        getInitial(
                            notification.actor_username ||
                            notification.username
                        )
                    );


                setAvatar(
                    avatar,
                    notification.actor_avatar ||
                    notification.avatar ||
                    "",
                    notification.actor_username ||
                    notification.username
                );


                const content =
                    createElement(
                        "div",
                        "notification-content"
                    );


                const message =
                    createElement(
                        "div",
                        "notification-message",
                        formatNotificationMessage(
                            notification
                        )
                    );


                const time =
                    createElement(
                        "span",
                        "notification-time",
                        formatDate(
                            notification.created_at
                        )
                    );


                content.appendChild(
                    message
                );


                content.appendChild(
                    time
                );


                const icon =
                    createElement(
                        "div",
                        "notification-icon",
                        getNotificationIcon(
                            notification
                        )
                    );


                item.appendChild(
                    avatar
                );


                item.appendChild(
                    content
                );


                item.appendChild(
                    icon
                );


                notificationsList.appendChild(
                    item
                );


                item.addEventListener(
                    "click",
                    async function () {

                        await markNotificationRead(
                            notification.id
                        );


                        if (
                            notification.post_id
                        ) {

                            window.location.href =
                                `dashboard.html?postId=${encodeURIComponent(notification.post_id)}`;

                            return;

                        }


                        if (
                            notification.actor_id
                        ) {

                            openUserProfile(
                                notification.actor_id
                            );

                        }

                    }
                );

            }
        );

    }


    async function loadNotifications() {

        if (!notificationsList) {
            return;
        }


        notificationsList.innerHTML = `
            <div class="notifications-empty">
                <div class="notifications-empty-icon">
                    …
                </div>

                <strong>
                    Loading notifications...
                </strong>

                <span>
                    Please wait.
                </span>
            </div>
        `;


        try {

            const response =
                await fetch(
                    `/api/notifications?userId=${encodeURIComponent(user.id)}`
                );


            const data =
                await response.json();


            if (
                !response.ok ||
                !data.success
            ) {

                notificationsList.innerHTML = `
                    <div class="notifications-empty">
                        <div class="notifications-empty-icon">
                            !
                        </div>

                        <strong>
                            Could not load notifications
                        </strong>

                        <span>
                            Please try again.
                        </span>
                    </div>
                `;

                return;

            }


            renderNotifications(
                Array.isArray(data.notifications)
                    ? data.notifications
                    : []
            );


            updateNotificationBadge(
                data.unread || 0
            );


        } catch (error) {

            console.error(
                "Could not load notifications:",
                error
            );


            notificationsList.innerHTML = `
                <div class="notifications-empty">
                    <div class="notifications-empty-icon">
                        !
                    </div>

                    <strong>
                        Could not connect to the server
                    </strong>

                    <span>
                        Please try again.
                    </span>
                </div>
            `;

        }

    }


    async function markNotificationRead(
        notificationId
    ) {

        if (!notificationId) {
            return;
        }


        try {

            const response =
                await fetch(
                    `/api/notifications/${encodeURIComponent(notificationId)}/read`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                userId:
                                    user.id
                            })
                    }
                );


            const data =
                await response.json();


            if (
                !response.ok ||
                !data.success
            ) {

                return;

            }


            const item =
                document.querySelector(
                    `.notification-item[data-notification-id="${CSS.escape(String(notificationId))}"]`
                );


            if (item) {

                item.classList.remove(
                    "unread"
                );

            }


            await loadNotificationCount();


        } catch (error) {

            console.error(
                "Could not mark notification as read:",
                error
            );

        }

    }


    async function markAllNotificationsRead() {

        if (
            markAllNotificationsReadButton
        ) {

            markAllNotificationsReadButton.disabled =
                true;

        }


        try {

            const response =
                await fetch(
                    "/api/notifications/read-all",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                userId:
                                    user.id
                            })
                    }
                );


            const data =
                await response.json();


            if (
                !response.ok ||
                !data.success
            ) {

                alert(
                    data.message ||
                    "Could not mark notifications as read."
                );


                return;

            }


            document
                .querySelectorAll(
                    ".notification-item.unread"
                )
                .forEach(
                    function (item) {

                        item.classList.remove(
                            "unread"
                        );

                    }
                );


            updateNotificationBadge(
                0
            );


        } catch (error) {

            console.error(
                "Could not mark all notifications as read:",
                error
            );


            alert(
                "Could not connect to the Vexora server."
            );

        } finally {

            if (
                markAllNotificationsReadButton
            ) {

                markAllNotificationsReadButton.disabled =
                    false;

            }

        }

    }


    function toggleNotificationsPanel() {

        if (!notificationsPanel) {
            return;
        }


        const isHidden =
            notificationsPanel.style.display ===
            "none" ||
            notificationsPanel.style.display ===
            "";


        if (isHidden) {

            notificationsPanel.style.display =
                "block";


            loadNotifications();

        } else {

            notificationsPanel.style.display =
                "none";

        }

    }


    // Keep the sidebar notification link as normal page navigation.
    // The old click handler prevented navigation, and a stray redirect
    // immediately below it forced every dashboard visit to notifications.


    if (
        markAllNotificationsReadButton
    ) {

        markAllNotificationsReadButton.addEventListener(
            "click",
            function () {

                markAllNotificationsRead();

            }
        );

    }


    document.addEventListener(
        "click",
        function (event) {

            if (
                !notificationsPanel ||
                !notificationsNavButton
            ) {

                return;

            }


            if (
                notificationsPanel.style.display ===
                "none"
            ) {

                return;

            }


            if (
                notificationsPanel.contains(
                    event.target
                ) ||
                notificationsNavButton.contains(
                    event.target
                )
            ) {

                return;

            }


            notificationsPanel.style.display =
                "none";

        }
    );


    // ==========================
    // NOTIFICATION POLLING
    // ==========================

    loadNotificationCount();


    setInterval(
        function () {

            loadNotificationCount();

        },
        10000
    );


    // ==========================
    // VEXORA SHARE MODAL
    // ==========================

    let shareModal = null;
    let shareUsers = [];
    let shareSelectedUser = null;
    let shareCurrentPost = null;


    function closeShareModal() {

        if (!shareModal) {
            return;
        }


        shareModal.remove();

        shareModal =
            null;

        shareUsers =
            [];

        shareSelectedUser =
            null;

        shareCurrentPost =
            null;

    }


    function createShareModal() {

        if (shareModal) {

            return shareModal;

        }


        const overlay =
            document.createElement(
                "div"
            );


        overlay.className =
            "vexora-share-modal";


        overlay.style.position =
            "fixed";


        overlay.style.inset =
            "0";


        overlay.style.background =
            "rgba(0, 0, 0, 0.72)";


        overlay.style.display =
            "flex";


        overlay.style.alignItems =
            "center";


        overlay.style.justifyContent =
            "center";


        overlay.style.padding =
            "20px";


        overlay.style.zIndex =
            "20000";


        const modal =
            document.createElement(
                "div"
            );


        modal.style.width =
            "100%";


        modal.style.maxWidth =
            "430px";


        modal.style.maxHeight =
            "80vh";


        modal.style.overflow =
            "hidden";


        modal.style.background =
            "#17171d";


        modal.style.border =
            "1px solid rgba(255,255,255,0.08)";


        modal.style.borderRadius =
            "18px";


        modal.style.boxShadow =
            "0 20px 70px rgba(0,0,0,0.45)";


        modal.style.display =
            "flex";


        modal.style.flexDirection =
            "column";


        const header =
            document.createElement(
                "div"
            );


        header.style.display =
            "flex";


        header.style.alignItems =
            "center";


        header.style.justifyContent =
            "space-between";


        header.style.padding =
            "18px";


        header.style.borderBottom =
            "1px solid rgba(255,255,255,0.07)";


        const title =
            createElement(
                "strong",
                "",
                "Share on Vexora"
            );


        title.style.color =
            "#ffffff";


        title.style.fontSize =
            "18px";


        const closeButton =
            createElement(
                "button",
                "",
                "×"
            );


        closeButton.type =
            "button";


        closeButton.style.border =
            "0";


        closeButton.style.background =
            "transparent";


        closeButton.style.color =
            "#aaa";


        closeButton.style.fontSize =
            "28px";


        closeButton.style.cursor =
            "pointer";


        closeButton.addEventListener(
            "click",
            closeShareModal
        );


        header.appendChild(
            title
        );


        header.appendChild(
            closeButton
        );


        const preview =
            document.createElement(
                "div"
            );


        preview.style.padding =
            "14px 18px";


        preview.style.borderBottom =
            "1px solid rgba(255,255,255,0.07)";


        const previewLabel =
            createElement(
                "span",
                "",
                "Send this post to:"
            );


        previewLabel.style.color =
            "#aaa";


        previewLabel.style.fontSize =
            "13px";


        const postPreview =
            document.createElement(
                "div"
            );


        postPreview.style.marginTop =
            "10px";


        postPreview.style.padding =
            "12px";


        postPreview.style.background =
            "rgba(255,255,255,0.04)";


        postPreview.style.borderRadius =
            "12px";


        postPreview.style.color =
            "#fff";


        if (
            shareCurrentPost &&
            shareCurrentPost.username
        ) {

            postPreview.textContent =
                `@${shareCurrentPost.username}` +
                (
                    shareCurrentPost.content
                        ? ` · ${shareCurrentPost.content}`
                        : " · Post"
                );

        } else {

            postPreview.textContent =
                "Vexora post";

        }


        preview.appendChild(
            previewLabel
        );


        preview.appendChild(
            postPreview
        );


        const search =
            document.createElement(
                "input"
            );


        search.type =
            "text";


        search.placeholder =
            "Search users...";


        search.style.margin =
            "14px 18px 8px";


        search.style.padding =
            "12px 14px";


        search.style.borderRadius =
            "10px";


        search.style.border =
            "1px solid rgba(255,255,255,0.08)";


        search.style.background =
            "rgba(255,255,255,0.04)";


        search.style.color =
            "#fff";


        search.style.outline =
            "none";


        const results =
            document.createElement(
                "div"
            );


        results.style.overflowY =
            "auto";


        results.style.padding =
            "4px 18px 14px";


        results.style.minHeight =
            "120px";


        results.style.maxHeight =
            "320px";


        const sendButton =
            createElement(
                "button",
                "",
                "Send post"
            );


        sendButton.type =
            "button";


        sendButton.disabled =
            true;


        sendButton.style.margin =
            "0 18px 18px";


        sendButton.style.padding =
            "12px";


        sendButton.style.border =
            "0";


        sendButton.style.borderRadius =
            "10px";


        sendButton.style.background =
            "#7c5cff";


        sendButton.style.color =
            "#fff";


        sendButton.style.fontWeight =
            "700";


        sendButton.style.cursor =
            "pointer";


        function renderShareUsers(
            users
        ) {

            results.innerHTML =
                "";


            if (
                !Array.isArray(users) ||
                users.length === 0
            ) {

                results.appendChild(
                    createElement(
                        "div",
                        "",
                        "No users found."
                    )
                );


                results.lastElementChild.style.color =
                    "#888";


                results.lastElementChild.style.padding =
                    "16px 4px";


                return;

            }


            users.forEach(
                function (shareUser) {

                    const item =
                        document.createElement(
                            "button"
                        );


                    item.type =
                        "button";


                    item.style.width =
                        "100%";


                    item.style.display =
                        "flex";


                    item.style.alignItems =
                        "center";


                    item.style.gap =
                        "12px";


                    item.style.padding =
                        "10px";


                    item.style.border =
                        "1px solid transparent";


                    item.style.borderRadius =
                        "10px";


                    item.style.background =
                        "transparent";


                    item.style.color =
                        "#fff";


                    item.style.cursor =
                        "pointer";


                    const avatar =
                        createElement(
                            "div",
                            "",
                            getInitial(
                                shareUser.username
                            )
                        );


                    avatar.style.width =
                        "42px";


                    avatar.style.height =
                        "42px";


                    avatar.style.minWidth =
                        "42px";


                    avatar.style.borderRadius =
                        "50%";


                    avatar.style.display =
                        "flex";


                    avatar.style.alignItems =
                        "center";


                    avatar.style.justifyContent =
                        "center";


                    avatar.style.background =
                        "linear-gradient(135deg,#7c5cff,#ff4fa3)";


                    avatar.style.fontWeight =
                        "700";


                    setAvatar(
                        avatar,
                        shareUser.avatar || "",
                        shareUser.username
                    );


                    const info =
                        document.createElement(
                            "div"
                        );


                    info.style.textAlign =
                        "left";


                    const username =
                        createElement(
                            "strong",
                            "",
                            `@${shareUser.username}`
                        );


                    username.style.display =
                        "block";


                    const bio =
                        createElement(
                            "span",
                            "",
                            shareUser.bio ||
                            "Vexora user"
                        );


                    bio.style.display =
                        "block";


                    bio.style.color =
                        "#888";


                    bio.style.fontSize =
                        "12px";


                    bio.style.marginTop =
                        "3px";


                    info.appendChild(
                        username
                    );


                    info.appendChild(
                        bio
                    );


                    item.appendChild(
                        avatar
                    );


                    item.appendChild(
                        info
                    );


                    item.addEventListener(
                        "click",
                        function () {

                            shareSelectedUser =
                                shareUser;


                            document
                                .querySelectorAll(
                                    ".vexora-share-modal-user-selected"
                                )
                                .forEach(
                                    function (selected) {

                                        selected.classList.remove(
                                            "vexora-share-modal-user-selected"
                                        );

                                        selected.style.background =
                                            "transparent";

                                        selected.style.borderColor =
                                            "transparent";

                                    }
                                );


                            item.classList.add(
                                "vexora-share-modal-user-selected"
                            );


                            item.style.background =
                                "rgba(124,92,255,0.14)";


                            item.style.borderColor =
                                "rgba(124,92,255,0.5)";


                            sendButton.disabled =
                                false;

                        }
                    );


                    results.appendChild(
                        item
                    );

                }
            );

        }


        async function loadShareUsers(
            query
        ) {

            results.innerHTML = "";


            results.appendChild(
                createElement(
                    "div",
                    "",
                    "Loading users..."
                )
            );


            results.firstElementChild.style.color =
                "#888";


            try {

                const url =
                    query
                        ? `/api/users?username=${encodeURIComponent(query)}`
                        : `/api/users?currentUserId=${encodeURIComponent(user.id)}`;


                const response =
                    await fetch(
                        url
                    );


                const data =
                    await response.json();


                if (
                    !response.ok ||
                    !data.success
                ) {

                    renderShareUsers(
                        []
                    );

                    return;

                }


                shareUsers =
                    Array.isArray(data.users)
                        ? data.users.filter(
                            function (shareUser) {

                                return Number(
                                    shareUser.id
                                ) !== Number(
                                    user.id
                                );

                            }
                        )
                        : [];


                renderShareUsers(
                    shareUsers
                );


            } catch (error) {

                console.error(
                    "Could not load share users:",
                    error
                );


                results.innerHTML =
                    "";


                const errorElement =
                    createElement(
                        "div",
                        "",
                        "Could not connect to the server."
                    );


                errorElement.style.color =
                    "#ff7777";


                errorElement.style.padding =
                    "16px 4px";


                results.appendChild(
                    errorElement
                );

            }

        }


        search.addEventListener(
            "input",
            function () {

                const query =
                    search.value.trim();


                if (!query) {

                    loadShareUsers(
                        ""
                    );

                    return;

                }


                loadShareUsers(
                    query
                );

            }
        );


        sendButton.addEventListener(
            "click",
            async function () {

                if (
                    !shareCurrentPost ||
                    !shareCurrentPost.id ||
                    !shareSelectedUser
                ) {

                    return;

                }


                sendButton.disabled =
                    true;


                sendButton.textContent =
                    "Sending...";


                try {

                    const response =
                        await fetch(
                            "/api/messages",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify({
                                        userId:
                                            user.id,

                                        recipientId:
                                            shareSelectedUser.id,

                                        content:
                                            "",

                                        sharedPostId:
                                            shareCurrentPost.id
                                    })
                            }
                        );


                    const data =
                        await response.json();


                    if (
                        !response.ok ||
                        !data.success
                    ) {

                        alert(
                            data.message ||
                            "Could not share the post."
                        );


                        return;

                    }


                    // FIX:
                    // Save the username before closeShareModal()
                    // resets shareSelectedUser to null.

                    const recipientUsername =
                        shareSelectedUser.username;


                    closeShareModal();


                    alert(
                        `Post sent to @${recipientUsername}.`
                    );


                } catch (error) {

                    console.error(
                        "Share post error:",
                        error
                    );


                    alert(
                        "Could not connect to the Vexora server."
                    );

                } finally {

                    if (sendButton) {

                        sendButton.disabled =
                            false;

                        sendButton.textContent =
                            "Send post";

                    }

                }

            }
        );


        modal.appendChild(
            header
        );


        modal.appendChild(
            preview
        );


        modal.appendChild(
            search
        );


        modal.appendChild(
            results
        );


        modal.appendChild(
            sendButton
        );


        overlay.appendChild(
            modal
        );


        overlay.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    overlay
                ) {

                    closeShareModal();

                }

            }
        );


        document.body.appendChild(
            overlay
        );


        shareModal =
            overlay;


        loadShareUsers(
            ""
        );


        return overlay;

    }


    function openShareModal(
        post
    ) {

        if (!post) {
            return;
        }


        closeShareModal();


        shareCurrentPost =
            post;


        createShareModal();

    }


    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape" &&
                shareModal
            ) {

                closeShareModal();

            }

        }
    );


// ==========================
// CREATE POST MODAL
// ==========================

const postModal = document.getElementById("postModal");
const openPostModal = document.getElementById("openPostModal");
const openPostModal2 = document.getElementById("openPostModal2");
const openPostModal3 = document.getElementById("openPostModal3");
const openPhotoModal = document.getElementById("openPhotoModal");
const closePostModal = document.getElementById("closePostModal");

const postText = document.getElementById("postText");
const characterCount = document.getElementById("characterCount");
const publishPost = document.getElementById("publishPost");

const postImageInput = document.getElementById("postImageInput");
const choosePostImage = document.getElementById("choosePostImage");
const postImagePreview = document.getElementById("postImagePreview");
const postImagePreviewImg = document.getElementById("postImagePreviewImg");
const removePostImage = document.getElementById("removePostImage");

const postVideoInput = document.getElementById("postVideoInput");
const choosePostVideo = document.getElementById("choosePostVideo");
const postVideoPreview = document.getElementById("postVideoPreview");
const postVideoPreviewVideo = document.getElementById("postVideoPreviewVideo");
const removePostVideo = document.getElementById("removePostVideo");

let selectedPostImage = "";
let selectedPostVideo = "";
let publishingPost = false;


// ==========================
// MODAL VISIBILITY
// ==========================

function forcePostModalVisible() {

    if (!postModal) {
        console.error("Vexora: #postModal was not found.");
        return;
    }

    postModal.classList.add("active");

    // Ovo garantuje prikaz čak i ako dashboard.css
    // nema ili drugačije definiše .post-modal.active.
    postModal.style.display = "flex";
    postModal.style.visibility = "visible";
    postModal.style.opacity = "1";
    postModal.style.pointerEvents = "auto";
    postModal.style.zIndex = "99999";

    const box = postModal.querySelector(".post-modal-box");

    if (box) {
        box.style.transform = "translateY(0) scale(1)";
        box.style.opacity = "1";
    }

    document.body.style.overflow = "hidden";

    setTimeout(function () {

        if (postText) {
            postText.focus();
        }

    }, 100);

}


function closeCreatePost() {

    if (!postModal) {
        return;
    }

    postModal.classList.remove("active");

    postModal.style.opacity = "0";
    postModal.style.visibility = "hidden";
    postModal.style.pointerEvents = "none";

    setTimeout(function () {

        if (!postModal.classList.contains("active")) {
            postModal.style.display = "none";
        }

    }, 180);

    document.body.style.overflow = "";

    resetPostImage();
    resetPostVideo();

    if (postText) {
        postText.value = "";
    }

    updateCharacterCount();

}


// ==========================
// RESET IMAGE
// ==========================

function resetPostImage() {

    selectedPostImage = "";

    if (postImageInput) {
        postImageInput.value = "";
    }

    if (postImagePreviewImg) {
        postImagePreviewImg.removeAttribute("src");
    }

    if (postImagePreview) {
        postImagePreview.style.display = "none";
        postImagePreview.style.opacity = "0";
        postImagePreview.style.transform = "translateY(8px)";
    }

}


// ==========================
// RESET VIDEO
// ==========================

function resetPostVideo() {

    selectedPostVideo = "";

    if (postVideoInput) {
        postVideoInput.value = "";
    }

    if (postVideoPreviewVideo) {

        postVideoPreviewVideo.pause();
        postVideoPreviewVideo.removeAttribute("src");
        postVideoPreviewVideo.load();

    }

    if (postVideoPreview) {
        postVideoPreview.style.display = "none";
        postVideoPreview.style.opacity = "0";
        postVideoPreview.style.transform = "translateY(8px)";
    }

}


// ==========================
// CHARACTER COUNT
// ==========================

function updateCharacterCount() {

    if (!postText || !characterCount) {
        return;
    }

    const length = postText.value.length;

    characterCount.textContent =
        `${length} / 500`;

}


// ==========================
// OPEN MODAL BUTTONS
// ==========================

function openCreatePost(event) {

    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    if (!postModal) {
        console.error("Vexora: post modal not found.");
        return;
    }

    // Reset previous draft.
    if (postText) {
        postText.value = "";
    }

    resetPostImage();
    resetPostVideo();
    updateCharacterCount();

    forcePostModalVisible();

}


// Use one common handler.
// This also prevents accidental form submission.

[
    openPostModal,
    openPostModal2,
    openPostModal3,
    openPhotoModal
].forEach(function (button) {

    if (!button) {
        return;
    }

    button.type = "button";

    button.addEventListener(
        "click",
        openCreatePost
    );

});


// ==========================
// CLOSE MODAL
// ==========================

if (closePostModal) {

    closePostModal.type = "button";

    closePostModal.addEventListener(
        "click",
        function (event) {

            event.preventDefault();
            event.stopPropagation();

            closeCreatePost();

        }
    );

}


if (postModal) {

    postModal.addEventListener(
        "click",
        function (event) {

            if (event.target === postModal) {
                closeCreatePost();
            }

        }
    );

}


// ==========================
// ESCAPE
// ==========================

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape" &&
            postModal &&
            postModal.classList.contains("active")
        ) {

            closeCreatePost();

        }

    }
);


// ==========================
// CHARACTER INPUT
// ==========================

if (postText) {

    postText.addEventListener(
        "input",
        updateCharacterCount
    );

}


// ==========================
// CHOOSE IMAGE
// ==========================

if (choosePostImage && postImageInput) {

    choosePostImage.type = "button";

    choosePostImage.addEventListener(
        "click",
        function (event) {

            event.preventDefault();
            event.stopPropagation();

            postImageInput.click();

        }
    );

}


// ==========================
// IMAGE CHANGE
// ==========================

if (postImageInput) {

    postImageInput.addEventListener(
        "change",
        function () {

            const file =
                postImageInput.files &&
                postImageInput.files[0];

            if (!file) {
                return;
            }

            const allowedTypes = [
                "image/jpeg",
                "image/png",
                "image/webp",
                "image/gif"
            ];

            if (!allowedTypes.includes(file.type)) {

                alert(
                    "Please choose a JPG, PNG, WEBP or GIF image."
                );

                resetPostImage();
                return;

            }

            const maxSize = 8 * 1024 * 1024;

            if (file.size > maxSize) {

                alert(
                    "Image cannot be larger than 8 MB."
                );

                resetPostImage();
                return;

            }

            // Image and video cannot be selected together.
            resetPostVideo();

            const reader = new FileReader();

            reader.onload = function (event) {

                selectedPostImage =
                    String(event.target.result || "");

                if (!selectedPostImage) {
                    resetPostImage();
                    return;
                }

                if (postImagePreviewImg) {

                    postImagePreviewImg.src =
                        selectedPostImage;

                }

                if (postImagePreview) {

                    postImagePreview.style.display =
                        "block";

                    postImagePreview.style.opacity =
                        "0";

                    postImagePreview.style.transform =
                        "translateY(8px)";

                    requestAnimationFrame(
                        function () {

                            postImagePreview.style.transition =
                                "opacity .25s ease, transform .25s ease";

                            postImagePreview.style.opacity =
                                "1";

                            postImagePreview.style.transform =
                                "translateY(0)";

                        }
                    );

                }

            };

            reader.onerror = function () {

                alert(
                    "Could not read the image."
                );

                resetPostImage();

            };

            reader.readAsDataURL(file);

        }
    );

}


// ==========================
// REMOVE IMAGE
// ==========================

if (removePostImage) {

    removePostImage.type = "button";

    removePostImage.addEventListener(
        "click",
        function (event) {

            event.preventDefault();
            event.stopPropagation();

            resetPostImage();

        }
    );

}


// ==========================
// CHOOSE VIDEO
// ==========================

if (choosePostVideo && postVideoInput) {

    choosePostVideo.type = "button";

    choosePostVideo.addEventListener(
        "click",
        function (event) {

            event.preventDefault();
            event.stopPropagation();

            postVideoInput.click();

        }
    );

}


// ==========================
// VIDEO CHANGE
// ==========================

if (postVideoInput) {

    postVideoInput.addEventListener(
        "change",
        function () {

            const file =
                postVideoInput.files &&
                postVideoInput.files[0];

            if (!file) {
                return;
            }

            const allowedTypes = [
                "video/mp4",
                "video/webm",
                "video/ogg"
            ];

            if (!allowedTypes.includes(file.type)) {

                alert(
                    "Please choose an MP4, WEBM or OGG video."
                );

                resetPostVideo();
                return;

            }

            const maxSize =
                20 * 1024 * 1024;

            if (file.size > maxSize) {

                alert(
                    "Video cannot be larger than 20 MB."
                );

                resetPostVideo();
                return;

            }

            // Image and video cannot be selected together.
            resetPostImage();

            const reader =
                new FileReader();

            reader.onload =
                function (event) {

                    selectedPostVideo =
                        String(
                            event.target.result || ""
                        );

                    if (
                        !selectedPostVideo
                    ) {

                        resetPostVideo();
                        return;

                    }

                    if (
                        postVideoPreviewVideo
                    ) {

                        postVideoPreviewVideo.src =
                            selectedPostVideo;

                        postVideoPreviewVideo.load();

                    }

                    if (
                        postVideoPreview
                    ) {

                        postVideoPreview.style.display =
                            "block";

                        postVideoPreview.style.opacity =
                            "0";

                        postVideoPreview.style.transform =
                            "translateY(8px)";

                        requestAnimationFrame(
                            function () {

                                postVideoPreview.style.transition =
                                    "opacity .25s ease, transform .25s ease";

                                postVideoPreview.style.opacity =
                                    "1";

                                postVideoPreview.style.transform =
                                    "translateY(0)";

                            }
                        );

                    }

                };

            reader.onerror =
                function () {

                    alert(
                        "Could not read the video."
                    );

                    resetPostVideo();

                };

            reader.readAsDataURL(file);

        }
    );

}


// ==========================
// REMOVE VIDEO
// ==========================

if (removePostVideo) {

    removePostVideo.type = "button";

    removePostVideo.addEventListener(
        "click",
        function (event) {

            event.preventDefault();
            event.stopPropagation();

            resetPostVideo();

        }
    );

}


// ==========================
// PUBLISH POST
// ==========================

if (publishPost) {

    publishPost.type = "button";

    publishPost.addEventListener(
        "click",
        async function (event) {

            event.preventDefault();
            event.stopPropagation();

            if (publishingPost) {
                return;
            }

            const text =
                postText
                    ? postText.value.trim()
                    : "";

            const imageData =
                selectedPostImage || "";

            const videoData =
                selectedPostVideo || "";

            // Nothing selected.
            if (
                !text &&
                !imageData &&
                !videoData
            ) {

                alert(
                    "Write something or choose an image or video first."
                );

                if (postText) {
                    postText.focus();
                }

                return;

            }

            if (text.length > 500) {

                alert(
                    "Post cannot be longer than 500 characters."
                );

                return;

            }

            if (imageData && videoData) {

                alert(
                    "Choose either an image or a video, not both."
                );

                return;

            }

            publishingPost = true;

            publishPost.disabled = true;
            publishPost.textContent = "Publishing...";

            publishPost.style.transform =
                "scale(.98)";

            try {

                const payload = {
                    userId: Number(user.id),
                    content: text,
                    imageData: imageData,
                    videoData: videoData
                };

                console.log(
                    "Vexora: publishing post",
                    {
                        userId: payload.userId,
                        contentLength: text.length,
                        hasImage: Boolean(imageData),
                        hasVideo: Boolean(videoData)
                    }
                );

                const response =
                    await fetch(
                        "/api/posts",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type":
                                    "application/json"
                            },
                            body:
                                JSON.stringify(payload)
                        }
                    );

                let data;

                try {
                    data =
                        await response.json();
                } catch (jsonError) {

                    throw new Error(
                        `Server returned invalid JSON (${response.status}).`
                    );

                }

                if (
                    !response.ok ||
                    !data ||
                    !data.success
                ) {

                    throw new Error(
                        data &&
                        data.message
                            ? data.message
                            : "Could not publish post."
                    );

                }

                // Success state.
                publishPost.textContent =
                    "Published ✓";

                publishPost.style.transform =
                    "scale(1.04)";

                // Clear form.
                if (postText) {
                    postText.value = "";
                }

                resetPostImage();
                resetPostVideo();
                updateCharacterCount();

                // Close after a tiny success animation.
                setTimeout(
                    function () {
                        closeCreatePost();
                    },
                    180
                );

                // Reload feed.
                await loadPosts();

                // Update profile stats.
                await loadUserStats();

                console.log(
                    "Vexora: post published successfully.",
                    data
                );

            } catch (error) {

                console.error(
                    "Vexora publish error:",
                    error
                );

                alert(
                    error &&
                    error.message
                        ? error.message
                        : "Could not connect to the Vexora server."
                );

            } finally {

                publishingPost = false;

                publishPost.disabled =
                    false;

                publishPost.textContent =
                    "Publish";

                publishPost.style.transform =
                    "";

            }

        }
    );

}


// ==========================
// INITIAL MODAL STATE
// ==========================

if (postModal) {

    // Prevent the modal from being accidentally visible
    // before the user clicks Create.
    if (
        !postModal.classList.contains("active")
    ) {

        postModal.style.display =
            "none";

        postModal.style.visibility =
            "hidden";

        postModal.style.opacity =
            "0";

        postModal.style.pointerEvents =
            "none";

    }

}

updateCharacterCount();


    // ==========================
    // LOAD POSTS
    // ==========================

    async function loadPosts() {

        const feed =
            document.querySelector(
                ".feed"
            );


        if (!feed) {
            return;
        }


        try {

            const response =
                await fetch(
                    `/api/posts?userId=${encodeURIComponent(user.id)}`
                );


            const data =
                await response.json();


            if (
                !response.ok ||
                !data.success
            ) {

                console.error(
                    "Could not load posts:",
                    data.message || "Unknown error"
                );


                return;

            }


            feed.querySelectorAll(
                ".real-post"
            ).forEach(function (post) {

                post.remove();

            });


            feed.querySelectorAll(
                ".demo-post"
            ).forEach(function (post) {

                post.remove();

            });


            feed.querySelectorAll(
                ".no-posts-feed"
            ).forEach(function (element) {

                element.remove();

            });


            const posts =
                Array.isArray(data.posts)
                    ? data.posts
                    : [];


            if (posts.length === 0) {

                const empty =
                    createElement(
                        "div",
                        "no-posts-feed",
                        "No posts yet. Be the first to post!"
                    );


                feed.appendChild(
                    empty
                );


                return;

            }


            posts.forEach(
                function (post) {

                    const article =
                        createPostElement(
                            post
                        );


                    feed.appendChild(
                        article
                    );

                }
            );


            const postIdFromUrl =
                new URLSearchParams(
                    window.location.search
                ).get("postId");


            if (postIdFromUrl) {

                setTimeout(
                    function () {

                        const targetPost =
                            document.querySelector(
                                `article[data-post-id="${CSS.escape(String(postIdFromUrl))}"]`
                            );


                        if (targetPost) {

                            targetPost.scrollIntoView({
                                behavior: "smooth",
                                block: "center"
                            });


                            targetPost.classList.add(
                                "notification-target-post"
                            );


                            setTimeout(
                                function () {

                                    targetPost.classList.remove(
                                        "notification-target-post"
                                    );

                                },
                                2500
                            );

                        }

                    },
                    100
                );

            }


        } catch (error) {

            console.error(
                "Could not load posts:",
                error
            );

        }

    }


    // ==========================
    // CREATE POST ELEMENT
    // ==========================

    function createPostElement(post) {

        const article =
            document.createElement(
                "article"
            );


        article.className =
            "post real-post";


        article.dataset.postId =
            post.id;


        // ==========================
        // HEADER
        // ==========================

        const header =
            createElement(
                "div",
                "post-header"
            );

        article.appendChild(
            header
        );


        const postUser =
            createElement(
                "div",
                "post-user"
            );


        const avatar =
            createElement(
                "div",
                "post-avatar purple",
                getInitial(
                    post.username
                )
            );


        setAvatar(
            avatar,
            post.avatar || "",
            post.username
        );


        avatar.style.cursor =
            "pointer";


        const userInfo =
            createElement(
                "div"
            );


        const username =
            createElement(
                "strong",
                "",
                post.username || "User"
            );


        username.style.cursor =
            "pointer";


        const time =
            createElement(
                "span",
                "",
                formatDate(
                    post.created_at
                ) +
                " · 🌎"
            );


        userInfo.appendChild(
            username
        );


        userInfo.appendChild(
            time
        );


        postUser.appendChild(
            avatar
        );


        postUser.appendChild(
            userInfo
        );


        const more =
            createElement(
                "button",
                "more",
                "•••"
            );


        more.type =
            "button";


        header.appendChild(
            postUser
        );


        header.appendChild(
            more
        );


        avatar.addEventListener(
            "click",
            function () {

                openUserProfile(
                    post.user_id
                );

            }
        );


        username.addEventListener(
            "click",
            function () {

                openUserProfile(
                    post.user_id
                );

            }
        );


        // ==========================
        // POST CONTENT
        // ==========================

        if (post.content) {

            const content =
                createElement(
                    "div",
                    "post-text",
                    post.content
                );


            article.appendChild(
                content
            );

        }


        // ==========================
        // POST IMAGE
        // ==========================

        if (post.image_url) {

            const imageWrapper =
                createElement(
                    "div",
                    "post-image-wrapper"
                );


            const image =
                document.createElement(
                    "img"
                );


            image.className =
                "post-image";


            image.src =
                post.image_url;


            image.alt =
                `Post by @${post.username || "user"}`;


            image.loading =
                "lazy";


            image.addEventListener(
                "click",
                function () {

                    openImageViewer(
                        post.image_url
                    );

                }
            );


            imageWrapper.appendChild(
                image
            );


            article.appendChild(
                imageWrapper
            );

        }


        // ==========================
        // POST VIDEO
        // ==========================

        if (
            post.video_url &&
            !post.image_url
        ) {

            const videoWrapper =
                createElement(
                    "div",
                    "post-video-wrapper"
                );


            const video =
                document.createElement(
                    "video"
                );


            video.className =
                "post-video";


            video.src =
                post.video_url;


            video.controls =
                true;


            video.playsInline =
                true;


            video.preload =
                "metadata";


            video.setAttribute(
                "aria-label",
                `Video post by @${post.username || "user"}`
            );


            videoWrapper.appendChild(
                video
            );


            article.appendChild(
                videoWrapper
            );

        }


        // ==========================
        // STATS
        // ==========================

        const stats =
            createElement(
                "div",
                "post-stats"
            );


        const likeCount =
            createElement(
                "span",
                "like-count",
                `♡ ${post.likes || 0} likes`
            );


        const commentCount =
            createElement(
                "span",
                "comment-count",
                `${post.comments || 0} comments`
            );


        stats.appendChild(
            likeCount
        );


        stats.appendChild(
            commentCount
        );


        // ==========================
        // ACTIONS
        // ==========================

        const actions =
            createElement(
                "div",
                "post-actions"
            );


        const likeButton =
            createElement(
                "button",
                "like-button"
            );


        likeButton.type =
            "button";


        const commentButton =
            createElement(
                "button",
                "comment-button"
            );


        commentButton.type =
            "button";


        const shareButton =
            createElement(
                "button",
                "share-button"
            );


        shareButton.type =
            "button";


        updateLikeButton(
            likeButton,
            Boolean(post.liked)
        );


        const commentIcon =
            createElement(
                "span",
                "",
                "♧"
            );


        const commentText =
            createElement(
                "span",
                "",
                "Comment"
            );


        commentButton.appendChild(
            commentIcon
        );


        commentButton.appendChild(
            commentText
        );


        const shareIcon =
            createElement(
                "span",
                "",
                "↗"
            );


        const shareText =
            createElement(
                "span",
                "",
                "Share"
            );


        shareButton.appendChild(
            shareIcon
        );


        shareButton.appendChild(
            shareText
        );


        actions.appendChild(
            likeButton
        );


        actions.appendChild(
            commentButton
        );


        actions.appendChild(
            shareButton
        );


        // ==========================
        // COMMENTS
        // ==========================

        const commentsSection =
            createElement(
                "div",
                "comments-section"
            );


        commentsSection.style.display =
            "none";


        const commentsList =
            createElement(
                "div",
                "comments-list"
            );


        const commentInputArea =
            createElement(
                "div",
                "comment-input-area"
            );


        const commentInput =
            document.createElement(
                "input"
            );


        commentInput.type =
            "text";


        commentInput.className =
            "comment-input";


        commentInput.placeholder =
            "Write a comment...";


        commentInput.maxLength =
            300;


        const sendComment =
            createElement(
                "button",
                "send-comment",
                "Send"
            );


        sendComment.type =
            "button";


        commentInputArea.appendChild(
            commentInput
        );


        commentInputArea.appendChild(
            sendComment
        );


        commentsSection.appendChild(
            commentsList
        );


        commentsSection.appendChild(
            commentInputArea
        );


        // ==========================
        // APPEND
        // ==========================

        article.appendChild(
            stats
        );


        article.appendChild(
            actions
        );


        article.appendChild(
            commentsSection
        );


        // ==========================
        // LIKE
        // ==========================

        likeButton.addEventListener(
            "click",
            async function () {

                likeButton.disabled =
                    true;


                try {

                    const response =
                        await fetch(
                            `/api/posts/${post.id}/like`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify({
                                        userId:
                                            user.id
                                    })
                            }
                        );


                    const data =
                        await response.json();


                    if (
                        !response.ok ||
                        !data.success
                    ) {

                        alert(
                            data.message ||
                            "Could not update like."
                        );


                        return;

                    }


                    post.liked =
                        data.liked;


                    post.likes =
                        data.likes;


                    updateLikeButton(
                        likeButton,
                        data.liked
                    );


                    likeCount.textContent =
                        `♡ ${data.likes || 0} likes`;


                    await loadNotificationCount();


                } catch (error) {

                    console.error(
                        "Like error:",
                        error
                    );


                    alert(
                        "Could not connect to the Vexora server."
                    );

                } finally {

                    likeButton.disabled =
                        false;

                }

            }
        );


        // ==========================
        // LOAD COMMENTS
        // ==========================

        async function loadComments() {

            try {

                const response =
                    await fetch(
                        `/api/posts/${post.id}/comments?userId=${encodeURIComponent(user.id)}`
                    );


                const data =
                    await response.json();


                if (
                    !response.ok ||
                    !data.success
                ) {

                    return;

                }


                commentsList.innerHTML =
                    "";


                const comments =
                    Array.isArray(data.comments)
                        ? data.comments
                        : [];


                if (comments.length === 0) {

                    const empty =
                        createElement(
                            "div",
                            "no-comments",
                            "No comments yet."
                        );


                    commentsList.appendChild(
                        empty
                    );


                    return;

                }


                const commentMap =
                    new Map();


                comments.forEach(
                    function (comment) {

                        comment.replies = [];


                        commentMap.set(
                            Number(comment.id),
                            comment
                        );

                    }
                );


                const rootComments =
                    [];


                comments.forEach(
                    function (comment) {

                        if (
                            comment.parent_id !== null &&
                            comment.parent_id !== undefined &&
                            commentMap.has(
                                Number(
                                    comment.parent_id
                                )
                            )
                        ) {

                            commentMap
                                .get(
                                    Number(
                                        comment.parent_id
                                    )
                                )
                                .replies
                                .push(
                                    comment
                                );

                        } else {

                            rootComments.push(
                                comment
                            );

                        }

                    }
                );


                function renderComment(
                    comment,
                    depth
                ) {

                    const wrapper =
                        createElement(
                            "div",
                            "comment-thread"
                        );


                    const commentElement =
                        createElement(
                            "div",
                            "comment"
                        );


                    commentElement.dataset.commentId =
                        comment.id;


                    if (depth > 0) {

                        commentElement.classList.add(
                            "comment-reply"
                        );

                    }


                    const topRow =
                        createElement(
                            "div",
                            "comment-top-row"
                        );


                    const commentAvatar =
                        createElement(
                            "div",
                            "comment-avatar",
                            getInitial(
                                comment.username
                            )
                        );


                    setAvatar(
                        commentAvatar,
                        comment.avatar || "",
                        comment.username
                    );


                    commentAvatar.style.cursor =
                        "pointer";


                    commentAvatar.addEventListener(
                        "click",
                        function () {

                            openCommentProfile(
                                comment
                            );

                        }
                    );


                    const commentContent =
                        createElement(
                            "div",
                            "comment-content"
                        );


                    const usernameElement =
                        createElement(
                            "strong",
                            "comment-username",
                            comment.username ||
                            "User"
                        );


                    usernameElement.style.cursor =
                        "pointer";


                    usernameElement.addEventListener(
                        "click",
                        function () {

                            openCommentProfile(
                                comment
                            );

                        }
                    );


                    const contentElement =
                        createElement(
                            "span",
                            "comment-content-text",
                            comment.content || ""
                        );


                    commentContent.appendChild(
                        usernameElement
                    );


                    commentContent.appendChild(
                        contentElement
                    );


                    const commentActions =
                        createElement(
                            "div",
                            "comment-actions"
                        );


                    const commentLikeButton =
                        createElement(
                            "button",
                            "comment-like-button"
                        );


                    commentLikeButton.type =
                        "button";


                    function updateCommentLikeButton() {

                        commentLikeButton.innerHTML =
                            "";


                        const icon =
                            createElement(
                                "span",
                                "",
                                comment.liked
                                    ? "♥"
                                    : "♡"
                            );


                        const count =
                            createElement(
                                "span",
                                "",
                                String(
                                    comment.likes || 0
                                )
                            );


                        commentLikeButton.appendChild(
                            icon
                        );


                        commentLikeButton.appendChild(
                            count
                        );


                        commentLikeButton.classList.toggle(
                            "liked",
                            Boolean(
                                comment.liked
                            )
                        );

                    }


                    updateCommentLikeButton();


                    commentLikeButton.addEventListener(
                        "click",
                        async function () {

                            commentLikeButton.disabled =
                                true;


                            try {

                                const response =
                                    await fetch(
                                        `/api/comments/${comment.id}/like`,
                                        {
                                            method: "POST",

                                            headers: {
                                                "Content-Type":
                                                    "application/json"
                                            },

                                            body:
                                                JSON.stringify({
                                                    userId:
                                                        user.id
                                                })
                                        }
                                    );


                                const data =
                                    await response.json();


                                if (
                                    !response.ok ||
                                    !data.success
                                ) {

                                    alert(
                                        data.message ||
                                        "Could not update comment like."
                                    );


                                    return;

                                }


                                comment.liked =
                                    data.liked;


                                comment.likes =
                                    data.likes;


                                updateCommentLikeButton();


                                await loadNotificationCount();


                            } catch (error) {

                                console.error(
                                    "Comment like error:",
                                    error
                                );


                                alert(
                                    "Could not connect to the Vexora server."
                                );

                            } finally {

                                commentLikeButton.disabled =
                                    false;

                            }

                        }
                    );


                    const replyButton =
                        createElement(
                            "button",
                            "comment-reply-button",
                            "Reply"
                        );


                    replyButton.type =
                        "button";


                    commentActions.appendChild(
                        commentLikeButton
                    );


                    commentActions.appendChild(
                        replyButton
                    );


                    topRow.appendChild(
                        commentAvatar
                    );


                    topRow.appendChild(
                        commentContent
                    );


                    commentContent.appendChild(
                        commentActions
                    );


                    commentElement.appendChild(
                        topRow
                    );


                    const replyForm =
                        createElement(
                            "div",
                            "reply-form"
                        );


                    replyForm.style.display =
                        "none";


                    const replyInput =
                        document.createElement(
                            "input"
                        );


                    replyInput.type =
                        "text";


                    replyInput.maxLength =
                        300;


                    replyInput.placeholder =
                        `Reply to @${comment.username || "user"}...`;


                    replyInput.className =
                        "reply-input";


                    const sendReply =
                        createElement(
                            "button",
                            "send-reply",
                            "Reply"
                        );


                    sendReply.type =
                        "button";


                    const cancelReply =
                        createElement(
                            "button",
                            "cancel-reply",
                            "Cancel"
                        );


                    cancelReply.type =
                        "button";


                    replyForm.appendChild(
                        replyInput
                    );


                    replyForm.appendChild(
                        sendReply
                    );


                    replyForm.appendChild(
                        cancelReply
                    );


                    commentElement.appendChild(
                        replyForm
                    );


                    replyButton.addEventListener(
                        "click",
                        function () {

                            const hidden =
                                replyForm.style.display ===
                                "none";


                            replyForm.style.display =
                                hidden
                                    ? "flex"
                                    : "none";


                            if (hidden) {

                                replyInput.focus();

                            }

                        }
                    );


                    cancelReply.addEventListener(
                        "click",
                        function () {

                            replyForm.style.display =
                                "none";


                            replyInput.value =
                                "";

                        }
                    );


                    async function sendReplyMessage() {

                        const text =
                            replyInput.value.trim();


                        if (!text) {

                            replyInput.focus();

                            return;

                        }


                        if (text.length > 300) {

                            alert(
                                "Reply cannot be longer than 300 characters."
                            );


                            return;

                        }


                        sendReply.disabled =
                            true;


                        cancelReply.disabled =
                            true;


                        replyInput.disabled =
                            true;


                        sendReply.textContent =
                            "Sending...";


                        try {

                            const response =
                                await fetch(
                                    `/api/posts/${post.id}/comments`,
                                    {
                                        method: "POST",

                                        headers: {
                                            "Content-Type":
                                                "application/json"
                                        },

                                        body:
                                            JSON.stringify({
                                                userId:
                                                    user.id,

                                                content:
                                                    text,

                                                parentId:
                                                    comment.id
                                            })
                                    }
                                );


                            const data =
                                await response.json();


                            if (
                                !response.ok ||
                                !data.success
                            ) {

                                alert(
                                    data.message ||
                                    "Could not add reply."
                                );


                                return;

                            }


                            replyInput.value =
                                "";


                            replyForm.style.display =
                                "none";


                            await loadComments();


                            commentCount.textContent =
                                `${commentsList.querySelectorAll(".comment").length} comments`;


                            await loadNotificationCount();


                        } catch (error) {

                            console.error(
                                "Reply error:",
                                error
                            );


                            alert(
                                "Could not connect to the Vexora server."
                            );

                        } finally {

                            sendReply.disabled =
                                false;


                            cancelReply.disabled =
                                false;


                            replyInput.disabled =
                                false;


                            sendReply.textContent =
                                "Reply";

                        }

                    }


                    sendReply.addEventListener(
                        "click",
                        sendReplyMessage
                    );


                    replyInput.addEventListener(
                        "keydown",
                        function (event) {

                            if (
                                event.key ===
                                "Enter"
                            ) {

                                event.preventDefault();

                                sendReplyMessage();

                            }

                        }
                    );


                    wrapper.appendChild(
                        commentElement
                    );


                    if (
                        Array.isArray(
                            comment.replies
                        ) &&
                        comment.replies.length > 0
                    ) {

                        const replies =
                            createElement(
                                "div",
                                "comment-replies"
                            );


                        comment.replies.forEach(
                            function (reply) {

                                replies.appendChild(
                                    renderComment(
                                        reply,
                                        depth + 1
                                    )
                                );

                            }
                        );


                        wrapper.appendChild(
                            replies
                        );

                    }


                    return wrapper;

                }


                function openCommentProfile(comment) {

                    if (
                        comment &&
                        comment.user_id
                    ) {

                        openUserProfile(
                            comment.user_id
                        );

                        return;

                    }


                    if (
                        !comment ||
                        !comment.username
                    ) {

                        return;

                    }


                    fetch(
                        `/api/users?username=${encodeURIComponent(comment.username)}`
                    )
                        .then(
                            function (response) {
                                return response.json();
                            }
                        )
                        .then(
                            function (data) {

                                if (
                                    data.success &&
                                    data.user
                                ) {

                                    openUserProfile(
                                        data.user.id
                                    );

                                }

                            }
                        )
                        .catch(
                            function (error) {

                                console.error(
                                    "Could not open comment profile:",
                                    error
                                );

                            }
                        );

                }


                rootComments.forEach(
                    function (comment) {

                        commentsList.appendChild(
                            renderComment(
                                comment,
                                0
                            )
                        );

                    }
                );


            } catch (error) {

                console.error(
                    "Could not load comments:",
                    error
                );

            }

        }


        // ==========================
        // OPEN COMMENTS
        // ==========================

        commentButton.addEventListener(
            "click",
            async function () {

                const isHidden =
                    commentsSection.style.display ===
                    "none";


                if (isHidden) {

                    commentsSection.style.display =
                        "block";


                    await loadComments();


                    commentInput.focus();

                } else {

                    commentsSection.style.display =
                        "none";

                }

            }
        );


        // ==========================
        // SEND COMMENT
        // ==========================

        async function sendCommentMessage() {

            const text =
                commentInput.value.trim();


            if (!text) {

                commentInput.focus();

                return;

            }


            if (text.length > 300) {

                alert(
                    "Comment cannot be longer than 300 characters."
                );


                return;

            }


            sendComment.disabled =
                true;


            commentInput.disabled =
                true;


            sendComment.textContent =
                "Sending...";


            try {

                const response =
                    await fetch(
                        `/api/posts/${post.id}/comments`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    userId:
                                        user.id,

                                    content:
                                        text
                                })
                        }
                    );


                const data =
                    await response.json();


                if (
                    !response.ok ||
                    !data.success
                ) {

                    alert(
                        data.message ||
                        "Could not add comment."
                    );


                    return;

                }


                commentInput.value =
                    "";


                await loadComments();


                commentCount.textContent =
                    `${commentsList.querySelectorAll(".comment").length} comments`;


                await loadNotificationCount();


            } catch (error) {

                console.error(
                    "Comment error:",
                    error
                );


                alert(
                    "Could not connect to the Vexora server."
                );

            } finally {

                sendComment.disabled =
                    false;


                commentInput.disabled =
                    false;


                sendComment.textContent =
                    "Send";

            }

        }


        sendComment.addEventListener(
            "click",
            sendCommentMessage
        );


        commentInput.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key ===
                    "Enter"
                ) {

                    event.preventDefault();

                    sendCommentMessage();

                }

            }
        );


        // ==========================
        // SHARE
        // ==========================

        shareButton.addEventListener(
            "click",
            function () {

                openShareModal(
                    post
                );

            }
        );


        // ==========================
        // MORE BUTTON
        // ==========================

        more.addEventListener(
            "click",
            function () {

                if (
                    Number(post.user_id) ===
                    Number(user.id)
                ) {

                    const deletePost =
                        confirm(
                            "Do you want to delete this post?"
                        );


                    if (deletePost) {

                        deletePostFromServer(
                            post.id,
                            article
                        );

                    }

                } else {

                    alert(
                        "You can only delete your own posts."
                    );

                }

            }
        );


        return article;

    }


    // ==========================
    // IMAGE VIEWER
    // ==========================

    function openImageViewer(
        imageUrl
    ) {

        if (!imageUrl) {
            return;
        }


        const viewer =
            document.createElement(
                "div"
            );


        viewer.className =
            "vexora-image-viewer";


        const image =
            document.createElement(
                "img"
            );


        image.src =
            imageUrl;


        image.alt =
            "Vexora post image";


        image.className =
            "vexora-image-viewer-image";


        const close =
            createElement(
                "button",
                "vexora-image-viewer-close",
                "×"
            );


        close.type =
            "button";


        viewer.appendChild(
            image
        );


        viewer.appendChild(
            close
        );


        document.body.appendChild(
            viewer
        );


        function closeViewer() {

            viewer.remove();

            document.removeEventListener(
                "keydown",
                handleEscape
            );

        }


        function handleEscape(
            event
        ) {

            if (
                event.key ===
                "Escape"
            ) {

                closeViewer();

            }

        }


        close.addEventListener(
            "click",
            closeViewer
        );


        viewer.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    viewer
                ) {

                    closeViewer();

                }

            }
        );


        document.addEventListener(
            "keydown",
            handleEscape
        );

    }


    // ==========================
    // LIKE BUTTON UI
    // ==========================

    function updateLikeButton(
        button,
        liked
    ) {

        button.innerHTML =
            "";


        const icon =
            createElement(
                "span",
                "",
                liked
                    ? "♥"
                    : "♡"
            );


        const text =
            createElement(
                "span",
                "",
                liked
                    ? "Liked"
                    : "Like"
            );


        button.appendChild(
            icon
        );


        button.appendChild(
            text
        );


        button.classList.toggle(
            "liked",
            Boolean(liked)
        );

    }


    // ==========================
    // DELETE POST
    // ==========================

    async function deletePostFromServer(
        postId,
        article
    ) {

        try {

            const response =
                await fetch(
                    `/api/posts/${postId}`,
                    {
                        method: "DELETE",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                userId:
                                    user.id
                            })
                    }
                );


            const data =
                await response.json();


            if (
                !response.ok ||
                !data.success
            ) {

                alert(
                    data.message ||
                    "Could not delete post."
                );


                return;

            }


            article.remove();


            await loadUserStats();


            const feed =
                document.querySelector(
                    ".feed"
                );


            if (
                feed &&
                !feed.querySelector(
                    ".real-post"
                )
            ) {

                const empty =
                    createElement(
                        "div",
                        "no-posts-feed",
                        "No posts yet. Be the first to post!"
                    );


                feed.appendChild(
                    empty
                );

            }


        } catch (error) {

            console.error(
                "Delete error:",
                error
            );


            alert(
                "Could not connect to the Vexora server."
            );

        }

    }


    // ==========================
    // LIVE USER SEARCH
    // ==========================

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    const searchResults =
        document.getElementById(
            "searchResults"
        );


    let searchRequestId = 0;


    function clearSearchResults() {

        if (!searchResults) {
            return;
        }


        searchResults.innerHTML =
            "";

    }


    function renderLiveSearchResults(
        users
    ) {

        if (!searchResults) {
            return;
        }


        searchResults.innerHTML =
            "";


        if (
            !Array.isArray(users) ||
            users.length === 0
        ) {

            const empty =
                createElement(
                    "div",
                    "vexora-search-empty",
                    "No users found."
                );


            searchResults.appendChild(
                empty
            );


            return;

        }


        users
            .slice(0, 8)
            .forEach(function (searchedUser) {

                const result =
                    document.createElement(
                        "button"
                    );


                result.type =
                    "button";


                result.className =
                    "vexora-search-result";


                const avatar =
                    createElement(
                        "div",
                        "vexora-search-avatar",
                        getInitial(
                            searchedUser.username
                        )
                    );


                setAvatar(
                    avatar,
                    searchedUser.avatar || "",
                    searchedUser.username
                );


                const info =
                    document.createElement(
                        "div"
                    );


                const username =
                    createElement(
                        "strong",
                        "",
                        "@" +
                        (
                            searchedUser.username ||
                            "user"
                        )
                    );


                const bio =
                    createElement(
                        "span",
                        "",
                        searchedUser.bio ||
                        "View profile"
                    );


                info.appendChild(
                    username
                );


                info.appendChild(
                    bio
                );


                result.appendChild(
                    avatar
                );


                result.appendChild(
                    info
                );


                result.addEventListener(
                    "click",
                    function () {

                        openUserProfile(
                            searchedUser.id
                        );

                    }
                );


                searchResults.appendChild(
                    result
                );

            });

    }


    async function loadLiveSearchResults(
        query
    ) {

        const requestId =
            ++searchRequestId;


        const normalizedQuery =
            String(query || "")
                .trim()
                .toLowerCase();


        if (!normalizedQuery) {

            clearSearchResults();

            return;

        }


        if (!searchResults) {
            return;
        }


        searchResults.innerHTML = `
            <div class="vexora-search-empty">
                Searching...
            </div>
        `;


        try {

            const response =
                await fetch(
                    `/api/users?username=${encodeURIComponent(normalizedQuery)}`
                );


            const data =
                await response.json();


            if (
                requestId !==
                searchRequestId
            ) {

                return;

            }


            if (
                !response.ok ||
                !data.success
            ) {

                searchResults.innerHTML = `
                    <div class="vexora-search-empty">
                        Could not search users.
                    </div>
                `;


                return;

            }


            const users =
                Array.isArray(data.users)
                    ? data.users
                    : [];


            const prefixMatches =
                users.filter(
                    function (searchedUser) {

                        return String(
                            searchedUser.username || ""
                        )
                            .toLowerCase()
                            .startsWith(
                                normalizedQuery
                            );

                    }
                );


            renderLiveSearchResults(
                prefixMatches
            );


        } catch (error) {

            if (
                requestId !==
                searchRequestId
            ) {

                return;

            }


            console.error(
                "Live search error:",
                error
            );


            searchResults.innerHTML = `
                <div class="vexora-search-empty">
                    Could not connect to the Vexora server.
                </div>
            `;

        }

    }


    if (searchInput) {

        searchInput.addEventListener(
            "input",
            function () {

                loadLiveSearchResults(
                    searchInput.value
                );

            }
        );

    }


    // ==========================
    // START
    // ==========================

    loadUserStats();

    loadSuggestions();

    loadPosts();

    if (window.location.hash === "#search") {
        window.setTimeout(openSearch, 80);
    }

    if (window.location.hash === "#notifications") {
        window.setTimeout(toggleNotificationsPanel, 80);
    }

});
