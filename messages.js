document.addEventListener("DOMContentLoaded", function () {

    /* =========================
       USER
    ========================= */

    const savedUser =
        localStorage.getItem("vexoraUser");

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

    if (!user || !user.id || !user.username) {
        localStorage.removeItem("vexoraUser");
        window.location.href = "index.html";
        return;
    }

    const currentUserId = Number(user.id);


    /* =========================
       ELEMENTS
    ========================= */

    const messagesApp =
        document.getElementById("messagesApp");

    const conversationList =
        document.getElementById("conversationList");

    const conversationSearch =
        document.getElementById("conversationSearch");

    const chatEmpty =
        document.getElementById("chatEmpty");

    const activeChat =
        document.getElementById("activeChat");

    const messagesList =
        document.getElementById("messagesList");

    const chatUserAvatar =
        document.getElementById("chatUserAvatar");

    const chatUsername =
        document.getElementById("chatUsername");

    const chatStatus =
        document.getElementById("chatStatus");

    const messageInput =
        document.getElementById("messageInput");

    const sendMessageButton =
        document.getElementById("sendMessageButton");

    const newChatModal =
        document.getElementById("newChatModal");

    const newChatButton =
        document.getElementById("newChatButton");

    const emptyNewChat =
        document.getElementById("emptyNewChat");

    const chatEmptyNewButton =
        document.getElementById("chatEmptyNewButton");

    const closeNewChat =
        document.getElementById("closeNewChat");

    const userSearchInput =
        document.getElementById("userSearchInput");

    const userSearchResults =
        document.getElementById("userSearchResults");

    const mobileBack =
        document.getElementById("mobileBack");

    const backButton =
        document.getElementById("backButton");

    const navUnread =
        document.getElementById("navUnread");

    const chatCount =
        document.getElementById("chatCount");


    /* =========================
       STATE
    ========================= */

    let conversations = [];

    let activeConversationId = null;

    let activeOtherUser = null;

    let messageRefreshTimer = null;

    let conversationRefreshTimer = null;

    let searchTimer = null;


    /* =========================
       HELPERS
    ========================= */

    function escapeHTML(value) {

        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    function getInitial(username) {

        return (username || "U")
            .charAt(0)
            .toUpperCase();

    }


    function setAvatar(element, avatar, username) {

        if (!element) {
            return;
        }

        if (avatar) {

            element.textContent = "";

            element.style.backgroundImage =
                `url("${avatar}")`;

            element.style.backgroundSize =
                "cover";

            element.style.backgroundPosition =
                "center";

            element.style.backgroundRepeat =
                "no-repeat";

        } else {

            element.style.backgroundImage = "";

            element.style.backgroundSize = "";

            element.style.backgroundPosition = "";

            element.style.backgroundRepeat = "";

            element.textContent =
                getInitial(username);

        }

    }


    function formatTime(dateString) {

        if (!dateString) {
            return "";
        }

        const date =
            new Date(
                dateString.replace(" ", "T") + "Z"
            );

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        const now =
            new Date();

        const difference =
            now - date;

        const seconds =
            Math.floor(difference / 1000);

        if (seconds < 60) {
            return "now";
        }

        const minutes =
            Math.floor(seconds / 60);

        if (minutes < 60) {
            return minutes + "m";
        }

        const hours =
            Math.floor(minutes / 60);

        if (hours < 24) {
            return hours + "h";
        }

        const days =
            Math.floor(hours / 24);

        if (days < 7) {
            return days + "d";
        }

        return date.toLocaleDateString(
            undefined,
            {
                month: "short",
                day: "numeric"
            }
        );

    }


    function formatMessageTime(dateString) {

        if (!dateString) {
            return "";
        }

        const date =
            new Date(
                dateString.replace(" ", "T") + "Z"
            );

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        return date.toLocaleTimeString(
            undefined,
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    }


    function showMobileChat() {

        if (messagesApp) {
            messagesApp.classList.add("mobile-chat");
        }

        document.body.classList.add("chat-open");

    }


    function hideMobileChat() {

        if (messagesApp) {
            messagesApp.classList.remove("mobile-chat");
        }

        document.body.classList.remove("chat-open");

    }


    /* =========================
       UNREAD
    ========================= */

    async function loadUnreadCount() {

        try {

            const response =
                await fetch(
                    "/api/messages/unread-count?userId=" +
                    encodeURIComponent(currentUserId)
                );

            const data =
                await response.json();

            if (!response.ok) {
                return;
            }

            const unread =
                Number(data.unread) || 0;

            if (!navUnread) {
                return;
            }

            if (unread > 0) {

                navUnread.textContent =
                    unread > 99
                        ? "99+"
                        : unread;

                navUnread.style.display =
                    "flex";

            } else {

                navUnread.style.display =
                    "none";

            }

        } catch (error) {

            console.error(
                "Unread messages error:",
                error
            );

        }

    }


    /* =========================
       CONVERSATIONS
    ========================= */

    async function loadConversations(
        preserveActive = true
    ) {

        try {

            const response =
                await fetch(
                    "/api/messages/conversations?userId=" +
                    encodeURIComponent(currentUserId)
                );

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Could not load conversations."
                );

            }

            conversations =
                Array.isArray(data.conversations)
                    ? data.conversations
                    : [];

            renderConversations();

            if (
                preserveActive &&
                activeConversationId
            ) {

                const active =
                    conversations.find(
                        function (conversation) {

                            return Number(
                                conversation.id
                            ) === Number(
                                activeConversationId
                            );

                        }
                    );

                if (active) {

                    activeOtherUser = {
                        id: active.other_user_id,
                        username: active.other_username,
                        avatar: active.other_avatar
                    };

                }

            }

            loadUnreadCount();

        } catch (error) {

            console.error(
                "Conversations error:",
                error
            );

            if (conversationList) {

                conversationList.innerHTML = `
                    <div class="search-hint">
                        Could not load conversations.
                    </div>
                `;

            }

        }

    }


    function renderConversations() {

        if (!conversationList) {
            return;
        }

        const query =
            conversationSearch
                ? conversationSearch.value
                    .trim()
                    .toLowerCase()
                : "";

        let filtered =
            conversations;

        if (query) {

            filtered =
                conversations.filter(
                    function (conversation) {

                        return (
                            conversation.other_username || ""
                        )
                            .toLowerCase()
                            .includes(query);

                    }
                );

        }

        if (chatCount) {

            chatCount.textContent =
                conversations.length === 1
                    ? "1 conversation"
                    : `${conversations.length} conversations`;

        }

        if (filtered.length === 0) {

            if (query) {

                conversationList.innerHTML = `
                    <div class="search-hint">
                        No chats found.
                    </div>
                `;

            } else {

                conversationList.innerHTML = `
                    <div class="empty-conversations">

                        <div class="empty-icon">
                            ✉
                        </div>

                        <strong>
                            No conversations yet
                        </strong>

                        <span>
                            Start a new chat with someone.
                        </span>

                        <button
                            type="button"
                            id="emptyNewChatDynamic"
                        >
                            New message
                        </button>

                    </div>
                `;

                const button =
                    document.getElementById(
                        "emptyNewChatDynamic"
                    );

                if (button) {

                    button.addEventListener(
                        "click",
                        openNewChat
                    );

                }

            }

            return;

        }


        conversationList.innerHTML =
            filtered.map(
                function (conversation) {

                    const isActive =
                        Number(conversation.id) ===
                        Number(activeConversationId);

                    const unread =
                        Number(
                            conversation.unread_count
                        ) || 0;

                    const username =
                        conversation.other_username ||
                        "User";

                    const lastMessage =
                        conversation.last_message ||
                        "No messages yet";

                    return `
                        <button
                            class="conversation-item ${isActive ? "active" : ""}"
                            type="button"
                            data-conversation-id="${conversation.id}"
                        >

                            <div
                                class="user-avatar"
                                data-avatar="${escapeHTML(conversation.other_avatar || "")}"
                                data-username="${escapeHTML(username)}"
                            >
                                ${escapeHTML(getInitial(username))}
                            </div>

                            <div class="conversation-info">

                                <div class="conversation-info-top">

                                    <strong>
                                        ${escapeHTML(username)}
                                    </strong>

                                    <span class="conversation-time">
                                        ${escapeHTML(
                                            formatTime(
                                                conversation.last_message_time
                                            )
                                        )}
                                    </span>

                                </div>

                                <div class="last-message">
                                    ${escapeHTML(lastMessage)}
                                </div>

                            </div>

                            ${
                                unread > 0
                                    ? `
                                        <div class="conversation-unread">
                                            ${unread > 99 ? "99+" : unread}
                                        </div>
                                    `
                                    : ""
                            }

                        </button>
                    `;

                }
            )
            .join("");


        document
            .querySelectorAll(".conversation-item")
            .forEach(
                function (button) {

                    const conversationId =
                        Number(
                            button.dataset.conversationId
                        );

                    button.addEventListener(
                        "click",
                        function () {

                            openConversation(
                                conversationId
                            );

                        }
                    );

                }
            );


        document
            .querySelectorAll(
                ".conversation-item .user-avatar"
            )
            .forEach(
                function (avatar) {

                    const image =
                        avatar.dataset.avatar;

                    const username =
                        avatar.dataset.username;

                    setAvatar(
                        avatar,
                        image,
                        username
                    );

                }
            );

    }


    /* =========================
       OPEN CONVERSATION
    ========================= */

    async function openConversation(
        conversationId
    ) {

        activeConversationId =
            Number(conversationId);

        const conversation =
            conversations.find(
                function (item) {

                    return Number(item.id) ===
                        Number(conversationId);

                }
            );

        if (conversation) {

            activeOtherUser = {
                id: conversation.other_user_id,
                username: conversation.other_username,
                avatar: conversation.other_avatar
            };

        }

        if (chatEmpty) {
            chatEmpty.hidden = true;
        }

        if (activeChat) {
            activeChat.hidden = false;
        }

        if (activeOtherUser) {

            if (chatUsername) {

                chatUsername.textContent =
                    activeOtherUser.username ||
                    "User";

            }

            if (chatStatus) {

                chatStatus.textContent =
                    "@" +
                    (
                        activeOtherUser.username ||
                        "user"
                    );

            }

            setAvatar(
                chatUserAvatar,
                activeOtherUser.avatar || "",
                activeOtherUser.username
            );

        }

        showMobileChat();

        renderConversations();

        await loadMessages();

        await markAsRead();

        await loadConversations();

        if (messageInput) {
            messageInput.focus();
        }

    }


    /* =========================
       LOAD MESSAGES
    ========================= */

    async function loadMessages() {

        if (!activeConversationId) {
            return;
        }

        try {

            const response =
                await fetch(
                    `/api/messages/${activeConversationId}?userId=${encodeURIComponent(currentUserId)}`
                );

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Could not load messages."
                );

            }

            if (data.conversation?.otherUser) {

                activeOtherUser =
                    data.conversation.otherUser;

                if (chatUsername) {

                    chatUsername.textContent =
                        activeOtherUser.username ||
                        "User";

                }

                if (chatStatus) {

                    chatStatus.textContent =
                        "@" +
                        (
                            activeOtherUser.username ||
                            "user"
                        );

                }

                setAvatar(
                    chatUserAvatar,
                    activeOtherUser.avatar || "",
                    activeOtherUser.username
                );

            }

            renderMessages(
                Array.isArray(data.messages)
                    ? data.messages
                    : []
            );

        } catch (error) {

            console.error(
                "Messages error:",
                error
            );

            if (messagesList) {

                messagesList.innerHTML = `
                    <div class="messages-empty">
                        Could not load messages.
                    </div>
                `;

            }

        }

    }


    function renderMessages(messages) {

        if (!messagesList) {
            return;
        }

        if (!messages.length) {

            messagesList.innerHTML = `
                <div class="messages-empty">
                    No messages yet.<br>
                    Send the first message.
                </div>
            `;

            return;

        }

        messagesList.innerHTML =
            messages.map(
                function (message) {

                    const mine =
                        Number(message.sender_id) ===
                        currentUserId;

                    return `
                        <div
                            class="message-row ${mine ? "mine" : "theirs"}"
                        >

                            <div class="message-content">

                                <div class="message-bubble">
                                    ${escapeHTML(
                                        message.content
                                    )}
                                </div>

                                <div class="message-meta">
                                    ${escapeHTML(
                                        formatMessageTime(
                                            message.created_at
                                        )
                                    )}
                                    ${
                                        mine &&
                                        Number(message.is_read) === 1
                                            ? " · Seen"
                                            : ""
                                    }
                                </div>

                            </div>

                        </div>
                    `;

                }
            )
            .join("");

        messagesList.scrollTop =
            messagesList.scrollHeight;

    }


    /* =========================
       SEND MESSAGE
    ========================= */

    async function sendMessage() {

        if (
            !activeOtherUser ||
            !activeOtherUser.id
        ) {
            return;
        }

        if (!messageInput) {
            return;
        }

        const content =
            messageInput.value.trim();

        if (!content) {
            return;
        }

        if (content.length > 2000) {

            alert(
                "Message cannot be longer than 2000 characters."
            );

            return;

        }

        if (sendMessageButton) {
            sendMessageButton.disabled = true;
        }

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

                        body: JSON.stringify({
                            userId:
                                currentUserId,

                            recipientId:
                                Number(
                                    activeOtherUser.id
                                ),

                            content:
                                content
                        })
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Could not send message."
                );

            }

            messageInput.value = "";

            autoResizeTextarea();

            if (data.conversationId) {

                activeConversationId =
                    Number(
                        data.conversationId
                    );

            }

            await loadMessages();

            await loadConversations();

            messageInput.focus();

        } catch (error) {

            console.error(
                "Send message error:",
                error
            );

            alert(
                error.message ||
                "Could not send message."
            );

        } finally {

            if (sendMessageButton) {
                sendMessageButton.disabled = false;
            }

        }

    }


    /* =========================
       READ
    ========================= */

    async function markAsRead() {

        if (!activeConversationId) {
            return;
        }

        try {

            await fetch(
                `/api/messages/${activeConversationId}/read`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        userId:
                            currentUserId
                    })
                }
            );

            loadUnreadCount();

        } catch (error) {

            console.error(
                "Mark read error:",
                error
            );

        }

    }


    /* =========================
       NEW CHAT
    ========================= */

    function openNewChat() {

        if (!newChatModal) {
            return;
        }

        newChatModal.hidden =
            false;

        if (userSearchInput) {
            userSearchInput.value = "";
        }

        if (userSearchResults) {

            userSearchResults.innerHTML = `
                <div class="search-hint">
                    Type a username to search.
                </div>
            `;

        }

        setTimeout(
            function () {

                if (userSearchInput) {
                    userSearchInput.focus();
                }

            },
            50
        );

    }


    function closeNewChatModal() {

        if (newChatModal) {
            newChatModal.hidden =
                true;
        }

    }


    /* =========================
       USER SEARCH
    ========================= */

    async function searchUsers() {

        if (!userSearchInput || !userSearchResults) {
            return;
        }

        const query =
            userSearchInput.value.trim();

        if (!query) {

            userSearchResults.innerHTML = `
                <div class="search-hint">
                    Type a username to search.
                </div>
            `;

            return;

        }

        userSearchResults.innerHTML = `
            <div class="search-hint">
                Searching...
            </div>
        `;

        try {

            const response =
                await fetch(
                    "/api/users?username=" +
                    encodeURIComponent(query)
                );

            const data =
                await response.json();

            if (
                !response.ok &&
                response.status !== 404
            ) {

                throw new Error(
                    data.message ||
                    "Search failed."
                );

            }

            let users = [];

            if (Array.isArray(data)) {

                users = data;

            } else if (
                Array.isArray(data.users)
            ) {

                users = data.users;

            } else if (data.user) {

                users = [data.user];

            }

            users =
                users.filter(
                    function (foundUser) {

                        return Number(
                            foundUser.id
                        ) !== currentUserId;

                    }
                );

            if (!users.length) {

                userSearchResults.innerHTML = `
                    <div class="search-hint">
                        No users found.
                    </div>
                `;

                return;

            }

            userSearchResults.innerHTML =
                users.map(
                    function (foundUser) {

                        const username =
                            foundUser.username ||
                            "User";

                        return `
                            <button
                                type="button"
                                class="user-result"
                                data-user-id="${foundUser.id}"
                            >

                                <div
                                    class="user-avatar"
                                    data-avatar="${escapeHTML(foundUser.avatar || "")}"
                                    data-username="${escapeHTML(username)}"
                                >
                                    ${escapeHTML(
                                        getInitial(username)
                                    )}
                                </div>

                                <div class="user-result-info">

                                    <strong>
                                        ${escapeHTML(username)}
                                    </strong>

                                    <span>
                                        @${escapeHTML(username)}
                                    </span>

                                </div>

                            </button>
                        `;

                    }
                )
                .join("");

            document
                .querySelectorAll(".user-result")
                .forEach(
                    function (button) {

                        const userId =
                            Number(
                                button.dataset.userId
                            );

                        button.addEventListener(
                            "click",
                            function () {

                                startConversation(
                                    userId
                                );

                            }
                        );

                    }
                );

            document
                .querySelectorAll(
                    ".user-result .user-avatar"
                )
                .forEach(
                    function (avatar) {

                        setAvatar(
                            avatar,
                            avatar.dataset.avatar,
                            avatar.dataset.username
                        );

                    }
                );

        } catch (error) {

            console.error(
                "User search error:",
                error
            );

            userSearchResults.innerHTML = `
                <div class="search-hint">
                    Search failed. Try again.
                </div>
            `;

        }

    }


    /* =========================
       START CONVERSATION
    ========================= */

    async function startConversation(
        otherUserId
    ) {

        try {

            const response =
                await fetch(
                    "/api/messages/conversations",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            userId:
                                currentUserId,

                            otherUserId:
                                Number(
                                    otherUserId
                                )
                        })
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Could not start conversation."
                );

            }

            closeNewChatModal();

            activeConversationId =
                Number(
                    data.conversation.id
                );

            activeOtherUser =
                data.conversation.otherUser;

            await loadConversations(
                false
            );

            await openConversation(
                activeConversationId
            );

        } catch (error) {

            console.error(
                "Start conversation error:",
                error
            );

            alert(
                error.message ||
                "Could not start conversation."
            );

        }

    }


    /* =========================
       TEXTAREA
    ========================= */

    function autoResizeTextarea() {

        if (!messageInput) {
            return;
        }

        messageInput.style.height =
            "auto";

        messageInput.style.height =
            Math.min(
                messageInput.scrollHeight,
                130
            ) + "px";

    }


    if (messageInput) {

        messageInput.addEventListener(
            "input",
            function () {

                autoResizeTextarea();

            }
        );


        messageInput.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Enter" &&
                    !event.shiftKey
                ) {

                    event.preventDefault();

                    sendMessage();

                }

            }
        );

    }


    if (sendMessageButton) {

        sendMessageButton.addEventListener(
            "click",
            sendMessage
        );

    }


    /* =========================
       SEARCH CHATS
    ========================= */

    if (conversationSearch) {

        conversationSearch.addEventListener(
            "input",
            function () {

                renderConversations();

            }
        );

    }


    /* =========================
       USER SEARCH INPUT
    ========================= */

    if (userSearchInput) {

        userSearchInput.addEventListener(
            "input",
            function () {

                clearTimeout(searchTimer);

                searchTimer =
                    setTimeout(
                        searchUsers,
                        300
                    );

            }
        );

    }


    /* =========================
       BUTTONS
    ========================= */

    if (newChatButton) {

        newChatButton.addEventListener(
            "click",
            openNewChat
        );

    }


    if (emptyNewChat) {

        emptyNewChat.addEventListener(
            "click",
            openNewChat
        );

    }


    if (chatEmptyNewButton) {

        chatEmptyNewButton.addEventListener(
            "click",
            openNewChat
        );

    }


    if (closeNewChat) {

        closeNewChat.addEventListener(
            "click",
            closeNewChatModal
        );

    }


    if (newChatModal) {

        newChatModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    newChatModal
                ) {

                    closeNewChatModal();

                }

            }
        );

    }


    if (mobileBack) {

        mobileBack.addEventListener(
            "click",
            function () {

                hideMobileChat();

            }
        );

    }


    if (backButton) {

        backButton.addEventListener(
            "click",
            function () {

                window.location.href =
                    "dashboard.html";

            }
        );

    }


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

            }
        );

    }


    /* =========================
       ESC MODAL
    ========================= */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape" &&
                newChatModal &&
                !newChatModal.hidden
            ) {

                closeNewChatModal();

            }

        }
    );


    /* =========================
       REFRESH
    ========================= */

    conversationRefreshTimer =
        setInterval(
            async function () {

                await loadConversations();

                await loadUnreadCount();

            },
            5000
        );


    messageRefreshTimer =
        setInterval(
            async function () {

                if (activeConversationId) {

                    await loadMessages();

                    await markAsRead();

                }

            },
            2000
        );


    /* =========================
       START
    ========================= */

    loadConversations();

    loadUnreadCount();

});
