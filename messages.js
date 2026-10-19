document.addEventListener("DOMContentLoaded", function () {

    /* =========================================================
       VEXORA — MESSAGES
       PREMIUM iOS / TELEGRAM / INSTAGRAM MOTION SYSTEM
       ========================================================= */


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

    if (!user || !user.id) {
        localStorage.removeItem("vexoraUser");
        window.location.href = "index.html";
        return;
    }

    user.username = user.username || "User";

    const currentUserId = Number(user.id);


    /* =========================================================
       ELEMENTS
       ========================================================= */

    const messagesApp =
        document.getElementById("messagesApp");

    const conversationPanel =
        document.getElementById("conversationPanel");

    const chatPanel =
        document.getElementById("chatPanel");

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

    const attachmentButton =
        document.getElementById("attachmentButton");

    const attachmentPanel =
        document.getElementById("attachmentPanel");

    const attachmentItems =
        document.querySelectorAll(".attachment-item");

    const emojiButton =
        document.getElementById("emojiButton");

    const emojiPanel =
        document.getElementById("emojiPanel");


    /* =========================================================
       STATE
       ========================================================= */

    let conversations = [];

    let activeConversationId = null;

    let activeOtherUser = null;

    let messageRefreshTimer = null;

    let conversationRefreshTimer = null;

    let searchTimer = null;

    let firstMessagesLoad = true;

    let renderedMessageIds = new Set();

    let pendingSentMessageId = null;

    let motionSystemInitialized = false;

    let lastRenderedMessageCount = 0;

    let isSendingMessage = false;


      /* =========================================================
       MOBILE LAYOUT CONTROLLER
       ========================================================= */

    function isMobileMessagesLayout() {
        return window.matchMedia("(max-width: 700px)").matches;
    }

    function forceMobileConversationView() {

        if (!messagesApp || !isMobileMessagesLayout()) {
            return;
        }

        messagesApp.classList.add("mobile-chat");

        document.body.classList.add("chat-open");
    }

    function forceMobileConversationList() {

        if (!messagesApp || !isMobileMessagesLayout()) {
            return;
        }

        messagesApp.classList.remove("mobile-chat");

        document.body.classList.remove("chat-open");
    }

    function clearMobileInlineLayout() {

        if (!messagesApp) {
            return;
        }

        messagesApp.classList.remove("mobile-chat");

        document.body.classList.remove("chat-open");

        document.body.style.removeProperty("overflow");
    }

    function syncMobileLayout() {

        if (!messagesApp) {
            return;
        }

        if (!isMobileMessagesLayout()) {

            clearMobileInlineLayout();

            return;
        }

        /*
         * JS NE određuje display/position/width/height.
         *
         * Samo klasa "mobile-chat" određuje da li je
         * otvorena lista ili aktivni chat.
         */

        if (
            activeConversationId &&
            messagesApp.classList.contains("mobile-chat")
        ) {
            return;
        }

        if (!activeConversationId) {
            forceMobileConversationList();
        }
    }
    function injectMotionStyles() {

        if (
            document.getElementById(
                "vexoraMessagesMotion"
            )
        ) {
            return;
        }

        const style =
            document.createElement("style");

        style.id =
            "vexoraMessagesMotion";

        style.textContent = `

            .vexora-motion-layer {
                pointer-events: none;
            }

            .messages-list[data-vexora-rendering="true"]
            .message-row {
                animation: none !important;
            }

            .messages-list
            .message-row.vexora-existing-message {
                animation: none !important;
            }

            .messages-list .message-row {
                transform-origin: center bottom;
                will-change: auto;
            }

            .messages-list .message-bubble,
            .messages-list .shared-post-content,
            .conversation-item .last-message {

                word-break: normal !important;
                overflow-wrap: normal !important;
                hyphens: none !important;
                line-break: auto !important;
            }

            .messages-list .message-bubble {

                white-space: pre-wrap !important;
                overflow: visible !important;
                max-width: 100%;
                text-wrap: wrap;
            }

            .messages-list .message-bubble *,
            .messages-list .shared-post-content * {

                word-break: normal !important;
                overflow-wrap: normal !important;
                hyphens: none !important;
            }

            .message-composer #messageInput,
            .message-composer #messageInput:hover,
            .message-composer #messageInput:focus,
            .message-composer #messageInput:active {

                outline: none !important;
                box-shadow: none !important;
                -webkit-box-shadow: none !important;
                -webkit-appearance: none !important;
                appearance: none !important;
                border: none !important;
            }

            .message-composer #messageInput:focus-visible {

                outline: none !important;
                box-shadow: none !important;
            }

            .messages-list
            .message-row.vexora-new-message {

                animation:
                    vexoraMessageIn
                    .72s
                    cubic-bezier(.16,1,.3,1)
                    both !important;

                transform-origin: bottom center;
                will-change: transform, opacity, filter;
            }

            .messages-list
            .message-row.vexora-new-message.mine {

                animation:
                    vexoraSentMessage
                    .82s
                    cubic-bezier(.16,1,.3,1)
                    both !important;
            }

            .messages-list
            .message-row.vexora-new-message
            .message-bubble {

                animation:
                    vexoraBubbleIn
                    .78s
                    cubic-bezier(.16,1,.3,1)
                    both;
            }

            .messages-list
            .message-row.vexora-new-message.mine
            .message-bubble {

                animation:
                    vexoraSentBubble
                    .92s
                    cubic-bezier(.16,1,.3,1)
                    both;
            }

            .messages-list
            .message-row.vexora-new-message
            .message-image-bubble {

                animation:
                    vexoraImageMessageIn
                    .82s
                    cubic-bezier(.16,1,.3,1)
                    both;

                transform-origin: bottom right;
            }

            .messages-list
            .message-row.vexora-new-message
            .shared-post-card {

                animation:
                    vexoraSharedPostIn
                    .86s
                    cubic-bezier(.16,1,.3,1)
                    both;
            }

            .messages-list
            .message-row.vexora-new-message
            .message-meta {

                animation:
                    vexoraMetaIn
                    .6s
                    cubic-bezier(.16,1,.3,1)
                    both;
            }

            .message-row.vexora-pressed
            .message-bubble {

                transform: scale(.982);
                filter: brightness(.97);

                transition:
                    transform .2s cubic-bezier(.25,.8,.25,1),
                    filter .2s ease;
            }

            .message-row.vexora-pressed
            .message-image-bubble {

                transform: scale(.975);

                transition:
                    transform .2s cubic-bezier(.25,.8,.25,1);
            }

            .message-bubble {

                transition:
                    transform .28s cubic-bezier(.16,1,.3,1),
                    filter .3s ease,
                    box-shadow .35s ease;
            }

            .message-row:hover
            .message-bubble {

                filter: brightness(1.015);
            }

            .message-row.mine:hover
            .message-bubble,
            .message-row.theirs:hover
            .message-bubble {

                transform: translateY(-1px);
            }

            #sendMessageButton {

                position: relative;
                overflow: visible;
                transform: translateZ(0);

                transition:
                    transform .28s cubic-bezier(.16,1,.3,1),
                    filter .35s ease,
                    box-shadow .4s ease;
            }

            #sendMessageButton:hover {

                transform:
                    translateY(-2px)
                    scale(1.045);

                filter: brightness(1.08);
            }

            #sendMessageButton:active {

                transform: scale(.88);
                transition: transform .12s ease;
            }

            #sendMessageButton.vexora-sending {

                animation:
                    vexoraSendButton
                    .88s
                    cubic-bezier(.16,1,.3,1);

                pointer-events: none;
            }

            #sendMessageButton.vexora-sending::before {

                content: "";

                position: absolute;
                inset: -8px;
                border-radius: 50%;

                border:
                    1px solid
                    rgba(118,88,245,.38);

                animation:
                    vexoraSendRing
                    .95s
                    ease-out
                    both;

                pointer-events: none;
            }

            #sendMessageButton.vexora-sending::after {

                content: "";

                position: absolute;
                inset: -3px;
                border-radius: 50%;

                background:
                    rgba(118,88,245,.24);

                filter: blur(8px);
                z-index: -1;

                animation:
                    vexoraSendGlow
                    .9s
                    ease-out
                    both;

                pointer-events: none;
            }

            .message-composer {

                display: flex;
                justify-content: flex-end;
                align-items: center;

                transition:
                    transform .48s cubic-bezier(.16,1,.3,1),
                    filter .48s ease;
            }

            .message-composer
            .composer-shell {

                position: relative;
                width: min(360px,100%);
                max-width: 100%;
                min-height: 48px;
                border-radius: 26px !important;
                box-sizing: border-box;
                overflow: visible;
                transform-origin: right center;

                transition:
                    width .68s cubic-bezier(.16,1,.3,1),
                    min-width .68s cubic-bezier(.16,1,.3,1),
                    max-width .68s cubic-bezier(.16,1,.3,1),
                    min-height .42s cubic-bezier(.16,1,.3,1),
                    transform .48s cubic-bezier(.16,1,.3,1),
                    box-shadow .48s ease,
                    border-color .45s ease,
                    background .48s ease;
            }

            .message-composer:not(.vexora-typing)
            .composer-shell {

                width: min(330px,100%);
                transform: scale(.985);
            }

            .message-composer.vexora-typing
            .composer-shell {

                width: 100%;
                max-width: 100%;

                transform:
                    translateX(0)
                    scale(1.006);

                animation:
                    vexoraComposerExpand
                    .78s
                    cubic-bezier(.16,1,.3,1)
                    both;
            }

            .message-composer.vexora-typing {

                transform: translateY(-1px);
            }

            #messageInput {

                transition:
                    min-height .42s cubic-bezier(.16,1,.3,1),
                    height .42s cubic-bezier(.16,1,.3,1),
                    padding .42s cubic-bezier(.16,1,.3,1),
                    background .35s ease;

                outline: none !important;
                border: none !important;
            }

            .message-composer button {

                transition:
                    transform .3s cubic-bezier(.16,1,.3,1),
                    filter .35s ease,
                    opacity .3s ease;
            }

            .message-composer button:hover {

                transform:
                    translateY(-1px)
                    scale(1.045);

                filter: brightness(1.06);
            }

            .message-composer button:active {

                transform: scale(.88);
            }

            .conversation-item {

                transform: translateZ(0);

                will-change:
                    transform,
                    opacity,
                    filter;

                transition:
                    transform .38s cubic-bezier(.16,1,.3,1),
                    filter .35s ease,
                    background .35s ease,
                    box-shadow .35s ease;
            }

            .conversation-item:hover {

                transform: translateX(3px);
                filter: brightness(1.02);
            }

            .conversation-item:active {

                transform:
                    translateX(2px)
                    scale(.985);

                transition: transform .12s ease;
            }

            .user-avatar,
            .shared-post-avatar {

                transform: translateZ(0);

                transition:
                    transform .42s cubic-bezier(.16,1,.3,1),
                    filter .42s ease,
                    box-shadow .42s ease;
            }

            .conversation-item:hover
            .user-avatar {

                transform: scale(1.055);
            }

            .shared-post-card {

                cursor: pointer;

                transition:
                    transform .42s cubic-bezier(.16,1,.3,1),
                    box-shadow .48s ease,
                    filter .42s ease;
            }

            .shared-post-card:hover {

                transform:
                    translateY(-3px)
                    scale(1.008);

                filter: brightness(1.035);
            }

            .shared-post-card:active {

                transform: scale(.975);
            }

            .message-image {

                transition:
                    transform .65s cubic-bezier(.16,1,.3,1),
                    filter .45s ease;
            }

            .message-image:hover {

                transform: scale(1.018);
                filter: brightness(1.045);
            }

            .chat-empty {

                animation:
                    vexoraEmptyEnter
                    .72s
                    cubic-bezier(.16,1,.3,1)
                    both;
            }

            .conversation-search input,
            .chat-search-bar input,
            #userSearchInput {

                transition:
                    transform .38s cubic-bezier(.16,1,.3,1),
                    box-shadow .42s ease,
                    border-color .38s ease,
                    background .38s ease;
            }

            .conversation-search input:focus,
            .chat-search-bar input:focus,
            #userSearchInput:focus {

                transform:
                    translateY(-1px)
                    scale(1.008);
            }

            .chat-header {

                transition:
                    transform .42s cubic-bezier(.16,1,.3,1),
                    filter .4s ease;
            }

            .chat-header:hover {

                filter: brightness(1.015);
            }


            /* =====================================================
               MOBILE SAFETY OVERRIDE
               ===================================================== */

            @media (max-width:700px) {

                #messagesApp.mobile-chat {

                    display: block !important;
                    position: relative !important;
                    width: 100% !important;
                    height: calc(100dvh - 184px) !important;
                    min-height: 420px !important;
                    grid-template-columns: 1fr !important;
                    overflow: hidden !important;
                }

                #messagesApp.mobile-chat
                .conversation-panel {

                    display: none !important;
                    visibility: hidden !important;
                    pointer-events: none !important;
                }

                #messagesApp.mobile-chat
                .chat-panel {

                    display: flex !important;
                    visibility: visible !important;
                    pointer-events: auto !important;

                    position: relative !important;

                    width: 100% !important;
                    height: 100% !important;

                    min-width: 0 !important;
                    min-height: 0 !important;

                    flex-direction: column !important;
                }

                #messagesApp:not(.mobile-chat)
                .conversation-panel {

                    display: flex !important;
                    visibility: visible !important;
                    pointer-events: auto !important;

                    position: absolute !important;
                    inset: 0 !important;

                    width: 100% !important;
                    height: 100% !important;
                }

                #messagesApp:not(.mobile-chat)
                .chat-panel {

                    display: none !important;
                    visibility: hidden !important;
                    pointer-events: none !important;
                }

                #messagesApp.mobile-chat
                .active-chat {

                    display: flex !important;
                    width: 100% !important;
                    height: 100% !important;
                    min-width: 0 !important;
                    min-height: 0 !important;

                    flex-direction: column !important;
                    overflow: hidden !important;
                }

                #messagesApp.mobile-chat
                .messages-list {

                    flex: 1 1 auto !important;
                    width: 100% !important;
                    min-width: 0 !important;
                    min-height: 0 !important;
                    height: auto !important;

                    overflow-x: hidden !important;
                    overflow-y: auto !important;
                }
            }


            @keyframes vexoraMessageIn {

                0% {
                    opacity: 0;
                    transform:
                        translateY(13px)
                        translateX(-6px)
                        scale(.95);
                    filter: blur(4px);
                }

                55% {
                    opacity: 1;
                    transform:
                        translateY(-2px)
                        translateX(0)
                        scale(1.01);
                    filter: blur(0);
                }

                78% {
                    transform:
                        translateY(.5px)
                        scale(.997);
                }

                100% {
                    opacity: 1;
                    transform:
                        translateY(0)
                        translateX(0)
                        scale(1);
                    filter: blur(0);
                }
            }

            @keyframes vexoraSentMessage {

                0% {
                    opacity: 0;
                    transform:
                        translate3d(30px,15px,0)
                        scale(.79);
                    filter: blur(5px);
                }

                45% {
                    opacity: 1;
                    transform:
                        translate3d(-4px,-3px,0)
                        scale(1.04);
                    filter: blur(0);
                }

                68% {
                    transform:
                        translate3d(1px,0,0)
                        scale(.99);
                }

                84% {
                    transform:
                        translate3d(0,0,0)
                        scale(1.005);
                }

                100% {
                    opacity: 1;
                    transform:
                        translate3d(0,0,0)
                        scale(1);
                }
            }

            @keyframes vexoraBubbleIn {

                0% {
                    opacity: 0;
                    transform:
                        scale(.9)
                        translateY(5px);
                }

                50% {
                    opacity: 1;
                    transform:
                        scale(1.025)
                        translateY(-1px);
                }

                75% {
                    transform: scale(.994);
                }

                100% {
                    opacity: 1;
                    transform:
                        scale(1)
                        translateY(0);
                }
            }

            @keyframes vexoraSentBubble {

                0% {
                    transform:
                        scale(.79)
                        translateX(9px);

                    box-shadow:
                        0 0 0
                        rgba(118,88,245,0);
                }

                40% {
                    transform:
                        scale(1.04)
                        translateX(-1px);

                    box-shadow:
                        0 0 30px
                        rgba(118,88,245,.25),
                        0 7px 22px
                        rgba(118,88,245,.15);
                }

                67% {
                    transform: scale(.992);
                }

                84% {
                    transform: scale(1.006);
                }

                100% {
                    transform: scale(1);

                    box-shadow:
                        0 3px 11px
                        rgba(118,88,245,.16);
                }
            }

            @keyframes vexoraImageMessageIn {

                0% {
                    opacity: 0;
                    transform:
                        translate3d(27px,14px,0)
                        scale(.82);

                    filter:
                        blur(4px)
                        brightness(.8);
                }

                55% {
                    opacity: 1;
                    transform:
                        translate3d(-2px,-1px,0)
                        scale(1.026);

                    filter:
                        blur(0)
                        brightness(1.03);
                }

                78% {
                    transform:
                        translate3d(0,0,0)
                        scale(.997);
                }

                100% {
                    opacity: 1;
                    transform:
                        translate3d(0,0,0)
                        scale(1);

                    filter:
                        blur(0)
                        brightness(1);
                }
            }

            @keyframes vexoraSharedPostIn {

                0% {
                    opacity: 0;
                    transform:
                        translateY(14px)
                        scale(.92);

                    filter: blur(4px);
                }

                58% {
                    opacity: 1;
                    transform:
                        translateY(-2px)
                        scale(1.014);

                    filter: blur(0);
                }

                78% {
                    transform:
                        translateY(.5px)
                        scale(.998);
                }

                100% {
                    opacity: 1;
                    transform:
                        translateY(0)
                        scale(1);
                }
            }

            @keyframes vexoraMetaIn {

                0% {
                    opacity: 0;
                    transform: translateY(4px);
                }

                100% {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            @keyframes vexoraSendButton {

                0% {
                    transform:
                        scale(1)
                        rotate(0);
                }

                18% {
                    transform:
                        scale(.82)
                        rotate(-8deg);
                }

                42% {
                    transform:
                        scale(1.14)
                        rotate(4deg);
                }

                62% {
                    transform:
                        scale(.96)
                        rotate(0);
                }

                78% {
                    transform:
                        scale(1.025)
                        rotate(0);
                }

                100% {
                    transform:
                        scale(1)
                        rotate(0);
                }
            }

            @keyframes vexoraSendRing {

                0% {
                    opacity: 0;
                    transform: scale(.6);
                }

                30% {
                    opacity: 1;
                }

                100% {
                    opacity: 0;
                    transform: scale(1.45);
                }
            }

            @keyframes vexoraSendGlow {

                0% {
                    opacity: 0;
                    transform: scale(.68);
                }

                42% {
                    opacity: 1;
                }

                100% {
                    opacity: 0;
                    transform: scale(1.42);
                }
            }

            @keyframes vexoraComposerExpand {

                0% {
                    opacity: .9;

                    transform:
                        translateX(13px)
                        scaleX(.91)
                        scaleY(.98);

                    filter: blur(.6px);
                }

                42% {
                    opacity: 1;

                    transform:
                        translateX(-3px)
                        scaleX(1.018)
                        scaleY(1.005);

                    filter: blur(0);
                }

                67% {
                    transform:
                        translateX(1px)
                        scaleX(.997)
                        scaleY(1);
                }

                84% {
                    transform:
                        translateX(0)
                        scaleX(1.004)
                        scaleY(1);
                }

                100% {
                    opacity: 1;

                    transform:
                        translateX(0)
                        scaleX(1)
                        scaleY(1);

                    filter: blur(0);
                }
            }

            @keyframes vexoraEmptyEnter {

                0% {
                    opacity: 0;
                    transform:
                        translateY(11px)
                        scale(.95);
                }

                60% {
                    opacity: 1;
                    transform:
                        translateY(-1px)
                        scale(1.008);
                }

                100% {
                    opacity: 1;
                    transform:
                        translateY(0)
                        scale(1);
                }
            }

            @keyframes vexoraToolButtonFloat {

                0% {
                    transform:
                        translateY(0)
                        scale(1);
                }

                42% {
                    transform:
                        translateY(-3px)
                        scale(1.07);
                }

                72% {
                    transform:
                        translateY(1px)
                        scale(.99);
                }

                100% {
                    transform:
                        translateY(0)
                        scale(1);
                }
            }

            @keyframes vexoraConversationOpen {

                0% {
                    opacity: .6;
                    transform:
                        translateX(-7px)
                        scale(.985);
                }

                55% {
                    transform:
                        translateX(2px)
                        scale(1.008);
                }

                100% {
                    opacity: 1;
                    transform:
                        translateX(0)
                        scale(1);
                }
            }

            @keyframes vexoraConversationNew {

                0% {
                    opacity: 0;
                    transform:
                        translateY(-11px)
                        scale(.95);
                }

                55% {
                    opacity: 1;
                    transform:
                        translateY(2px)
                        scale(1.015);
                }

                78% {
                    transform:
                        translateY(-.5px)
                        scale(.998);
                }

                100% {
                    opacity: 1;
                    transform:
                        translateY(0)
                        scale(1);
                }
            }

            @keyframes vexoraUnreadPop {

                0% {
                    transform:
                        scale(.45)
                        rotate(-8deg);
                    opacity: .25;
                }

                48% {
                    transform:
                        scale(1.2)
                        rotate(3deg);
                    opacity: 1;
                }

                72% {
                    transform:
                        scale(.96)
                        rotate(0);
                }

                100% {
                    transform:
                        scale(1)
                        rotate(0);
                    opacity: 1;
                }
            }

            @keyframes vexoraPanelOpen {

                0% {
                    opacity: 0;
                    transform:
                        translateY(11px)
                        scale(.92);
                    filter: blur(4px);
                }

                58% {
                    opacity: 1;
                    transform:
                        translateY(-2px)
                        scale(1.015);
                    filter: blur(0);
                }

                100% {
                    opacity: 1;
                    transform:
                        translateY(0)
                        scale(1);
                    filter: blur(0);
                }
            }

            @keyframes vexoraModalFade {

                from {
                    opacity: 0;
                }

                to {
                    opacity: 1;
                }
            }

            @keyframes vexoraModalBox {

                0% {
                    opacity: 0;
                    transform:
                        translateY(20px)
                        scale(.91);
                    filter: blur(5px);
                }

                62% {
                    opacity: 1;
                    transform:
                        translateY(-3px)
                        scale(1.015);
                    filter: blur(0);
                }

                82% {
                    transform:
                        translateY(.5px)
                        scale(.998);
                }

                100% {
                    opacity: 1;
                    transform:
                        translateY(0)
                        scale(1);
                }
            }

            @media (prefers-reduced-motion: reduce) {

                *,
                *::before,
                *::after {

                    animation-duration:
                        .01ms !important;

                    animation-iteration-count:
                        1 !important;

                    transition-duration:
                        .01ms !important;

                    scroll-behavior:
                        auto !important;
                }
            }
        `;

        document.head.appendChild(style);
    }


    /* =========================================================
       MOTION HELPERS
       ========================================================= */

    function triggerClass(
        element,
        className,
        duration = 700
    ) {

        if (!element) {
            return;
        }

        element.classList.remove(
            className
        );

        void element.offsetWidth;

        element.classList.add(
            className
        );

        window.setTimeout(
            function () {

                element.classList.remove(
                    className
                );

            },
            duration
        );
    }


    function animateSendButton() {

        if (!sendMessageButton) {
            return;
        }

        triggerClass(
            sendMessageButton,
            "vexora-sending",
            950
        );
    }


    function animateComposerSuccess() {

        const shell =
            document.querySelector(
                ".composer-shell"
            );

        if (!shell) {
            return;
        }

        triggerClass(
            shell,
            "vexora-send-success",
            760
        );
    }


    function animateConversation(
        conversationId
    ) {

        const item =
            document.querySelector(
                `.conversation-item[data-conversation-id="${conversationId}"]`
            );

        if (!item) {
            return;
        }

        triggerClass(
            item,
            "vexora-opened",
            700
        );
    }


    function animateUnreadBadge() {

        if (navUnread) {

            triggerClass(
                navUnread,
                "vexora-unread-pop",
                900
            );
        }
    }

    async function loadUnreadCount() {

        if (!navUnread) {
            return;
        }

        try {
            const response = await fetch(
                `/api/messages/unread-count?userId=${encodeURIComponent(currentUserId)}`
            );

            const data = await response.json();
            const count = Number(data.unread || 0);

            navUnread.textContent = count > 99 ? "99+" : String(count);
            navUnread.hidden = count === 0;

            if (count > 0) {
                animateUnreadBadge();
            }
        } catch (error) {
            navUnread.hidden = true;
            console.error("Unread messages error:", error);
        }
    }


    /* =========================================================
       COMPOSER
       ========================================================= */

    function updateComposerState(
        animate = true
    ) {

        if (!messageInput) {
            return;
        }

        const composer =
            document.querySelector(
                ".message-composer"
            );

        if (!composer) {
            return;
        }

        const hasText =
            messageInput.value.trim().length > 0;

        const wasTyping =
            composer.classList.contains(
                "vexora-typing"
            );


        if (hasText) {

            composer.classList.remove(
                "vexora-composer-collapsing"
            );

            composer.classList.add(
                "vexora-typing"
            );

            if (
                !wasTyping &&
                animate
            ) {

                triggerClass(
                    composer,
                    "vexora-composer-expanding",
                    900
                );
            }

        } else {

            composer.classList.remove(
                "vexora-typing"
            );

            composer.classList.remove(
                "vexora-composer-expanding"
            );

            if (
                wasTyping &&
                animate
            ) {

                triggerClass(
                    composer,
                    "vexora-composer-collapsing",
                    680
                );
            }
        }
    }


    /* =========================================================
       PRESS EFFECTS
       ========================================================= */

    function addMessagePressEffects() {

        if (!messagesList) {
            return;
        }

        messagesList.addEventListener(
            "pointerdown",
            function (event) {

                const row =
                    event.target.closest(
                        ".message-row"
                    );

                if (!row) {
                    return;
                }

                row.classList.add(
                    "vexora-pressed"
                );
            },
            { passive: true }
        );

        messagesList.addEventListener("click", async function (event) {
            const button = event.target.closest("[data-message-reaction]");
            if (button) {
                if (button.disabled) return;
                button.disabled = true;
                try {
                    const response = await fetch(`/api/messages/${encodeURIComponent(button.dataset.messageId)}/reaction`, {
                        method: "POST", headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ userId: currentUserId, emoji: button.dataset.emoji })
                    });
                    const data = await response.json();
                    if (!response.ok || !data.success) throw new Error(data.message || "Could not save reaction.");
                    await loadMessages();
                } catch (reactionError) {
                    console.error("Message reaction error:", reactionError);
                    button.disabled = false;
                }
                return;
            }
            const row = event.target.closest(".message-row");
            if (!row || !event.target.closest(".message-bubble, .message-image-bubble, .shared-post-content")) return;
            const wasOpen = row.classList.contains("reaction-open");
            messagesList.querySelectorAll(".message-row.reaction-open").forEach(item => item.classList.remove("reaction-open"));
            if (!wasOpen) row.classList.add("reaction-open");
        });


        const clearPressed =
            function () {

                document
                    .querySelectorAll(
                        ".message-row.vexora-pressed"
                    )
                    .forEach(
                        function (row) {

                            row.classList.remove(
                                "vexora-pressed"
                            );
                        }
                    );
            };


        document.addEventListener(
            "pointerup",
            clearPressed,
            { passive: true }
        );

        document.addEventListener(
            "pointercancel",
            clearPressed,
            { passive: true }
        );
    }


    /* =========================================================
       COMPOSER MOTION
       ========================================================= */

    function addComposerMotion() {

        if (!messageInput) {
            return;
        }

        messageInput.addEventListener(
            "focus",
            function () {

                if (messagesApp) {

                    messagesApp.classList.add(
                        "vexora-composer-focused"
                    );
                }

                updateComposerState(true);
            }
        );


        messageInput.addEventListener(
            "blur",
            function () {

                if (messagesApp) {

                    messagesApp.classList.remove(
                        "vexora-composer-focused"
                    );
                }
            }
        );


        updateComposerState(false);
    }


    /* =========================================================
       PANEL MOTION
       ========================================================= */

    function addPanelMotion() {

        if (attachmentPanel) {

            const observer =
                new MutationObserver(
                    function () {

                        if (
                            !attachmentPanel.hidden
                        ) {

                            triggerClass(
                                attachmentPanel,
                                "vexora-panel-opening",
                                550
                            );
                        }
                    }
                );

            observer.observe(
                attachmentPanel,
                {
                    attributes: true,
                    attributeFilter: [
                        "hidden"
                    ]
                }
            );
        }


        if (emojiPanel) {

            const observer =
                new MutationObserver(
                    function () {

                        if (
                            !emojiPanel.hidden
                        ) {

                            triggerClass(
                                emojiPanel,
                                "vexora-panel-opening",
                                550
                            );
                        }
                    }
                );

            observer.observe(
                emojiPanel,
                {
                    attributes: true,
                    attributeFilter: [
                        "hidden"
                    ]
                }
            );
        }
    }


    function initializeMotionSystem() {

        if (motionSystemInitialized) {
            return;
        }

        motionSystemInitialized = true;

        injectMotionStyles();

        addMessagePressEffects();

        addComposerMotion();

        addPanelMotion();
    }


    initializeMotionSystem();


    /* =========================================================
       MESSAGE SCROLL
       ========================================================= */

    function setupMessagesScroll() {

        if (!messagesList) {
            return;
        }

        messagesList.style.setProperty(
            "overflow-y",
            "auto",
            "important"
        );

        messagesList.style.setProperty(
            "overflow-x",
            "hidden",
            "important"
        );

        messagesList.style.setProperty(
            "min-height",
            "0",
            "important"
        );

        messagesList.style.setProperty(
            "box-sizing",
            "border-box",
            "important"
        );

        messagesList.style.setProperty(
            "scroll-behavior",
            "auto",
            "important"
        );

        messagesList.style.setProperty(
            "overscroll-behavior",
            "contain",
            "important"
        );

        messagesList.style.setProperty(
            "touch-action",
            "pan-y",
            "important"
        );


        /*
            IMPORTANT:

            Do NOT force height:100%.

            On mobile this can make the messages area fight
            with the header + composer and produce broken
            layouts.

            Flexbox controls the height instead.
        */

        messagesList.style.removeProperty(
            "height"
        );

        messagesList.style.removeProperty(
            "max-height"
        );
    }


    function scrollMessagesToBottom(
        smooth = false
    ) {

        if (!messagesList) {
            return;
        }

        setupMessagesScroll();

        const scrollPosition =
            messagesList.scrollHeight;

        if (smooth) {

            messagesList.scrollTo({
                top: scrollPosition,
                behavior: "smooth"
            });

        } else {

            messagesList.scrollTop =
                scrollPosition;
        }
    }


    function isMessagesNearBottom(
        threshold = 120
    ) {

        if (!messagesList) {
            return true;
        }

        const distance =
            messagesList.scrollHeight -
            messagesList.scrollTop -
            messagesList.clientHeight;

        return distance <= threshold;
    }


    setupMessagesScroll();


    /* =========================================================
       IMAGE INPUT
       ========================================================= */

    const imageInput =
        document.createElement("input");

    imageInput.type =
        "file";

    imageInput.accept =
        "image/jpeg,image/png,image/webp,image/gif";

    imageInput.hidden =
        true;

    document.body.appendChild(
        imageInput
    );


    /* =========================================================
       HELPERS
       ========================================================= */

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


    function setAvatar(
        element,
        avatar,
        username
    ) {

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
            Math.floor(
                difference / 1000
            );

        if (seconds < 60) {
            return "now";
        }

        const minutes =
            Math.floor(
                seconds / 60
            );

        if (minutes < 60) {
            return minutes + "m";
        }

        const hours =
            Math.floor(
                minutes / 60
            );

        if (hours < 24) {
            return hours + "h";
        }

        const days =
            Math.floor(
                hours / 24
            );

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

        if (!isMobileMessagesLayout()) {
            return;
        }

        forceMobileConversationView();
    }

    function hideMobileChat() {

        if (!isMobileMessagesLayout()) {
            return;
        }

        forceMobileConversationList();
    }
    /* =========================================================
       CONVERSATIONS
       ========================================================= */

    async function loadConversations(
        preserveActive = true
    ) {

        try {

            const response =
                await fetch(
                    "/api/messages/conversations?userId=" +
                    encodeURIComponent(
                        currentUserId
                    )
                );

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Could not load conversations."
                );
            }

            const previousConversationIds =
                new Set(
                    conversations.map(
                        function (conversation) {

                            return Number(
                                conversation.id
                            );
                        }
                    )
                );

            conversations =
                Array.isArray(
                    data.conversations
                )
                    ? data.conversations
                    : [];

            renderConversations(
                previousConversationIds
            );

            if (
                preserveActive &&
                activeConversationId
            ) {

                const active =
                    conversations.find(
                        function (conversation) {

                            return Number(
                                conversation.id
                            ) ===
                            Number(
                                activeConversationId
                            );
                        }
                    );

                if (active) {

                    activeOtherUser = {

                        id:
                            active.other_user_id,

                        username:
                            active.other_username,

                        avatar:
                            active.other_avatar
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
                    <div class="conversation-error">
                        <div class="empty-icon">!</div>
                        <strong>Inbox temporarily unavailable</strong>
                        <span>We could not refresh your conversations. Your messages are still safe.</span>
                        <button type="button" id="retryConversations">Try again</button>
                    </div>
                `;

                const retryButton = document.getElementById("retryConversations");

                if (retryButton) {
                    retryButton.addEventListener("click", function () {
                        loadConversations(preserveActive);
                    });
                }
            }
        }
    }


    function renderConversations(
        previousConversationIds = new Set()
    ) {

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
                            conversation.other_username ||
                            ""
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

                    const isNew =
                        !previousConversationIds.has(
                            Number(conversation.id)
                        );

                    return `
                        <button
                            class="conversation-item ${isActive ? "active" : ""} ${isNew ? "vexora-new-conversation" : ""}"
                            type="button"
                            data-conversation-id="${conversation.id}"
                        >

                            <div
                                class="user-avatar"
                                data-avatar="${escapeHTML(conversation.other_avatar || "")}"
                                data-username="${escapeHTML(username)}"
                            >
                                ${escapeHTML(
                                    getInitial(username)
                                )}
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


    /* =========================================================
       OPEN CONVERSATION
       ========================================================= */

    async function openConversation(
        conversationId
    ) {

        if (!conversationId) {
            return;
        }

        activeConversationId =
            Number(conversationId);

        firstMessagesLoad =
            true;

        renderedMessageIds =
            new Set();

        pendingSentMessageId =
            null;


        const conversation =
            conversations.find(
                function (item) {

                    return Number(item.id) ===
                        Number(conversationId);
                }
            );


        if (conversation) {

            activeOtherUser = {

                id:
                    conversation.other_user_id,

                username:
                    conversation.other_username,

                avatar:
                    conversation.other_avatar
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


        /*
            SWITCH TO CHAT BEFORE loading messages.

            This is important on mobile. The user should
            immediately get the full-screen chat instead
            of seeing the old two-column layout.
        */

        showMobileChat();


        renderConversations();

        animateConversation(
            conversationId
        );

        setupMessagesScroll();


        await loadMessages();

        await markAsRead();

        await loadConversations();


        /*
            loadConversations() rerenders the list, but
            must NEVER bring the list back over the chat.
        */



        if (messageInput) {

            // Avoid forcing the mobile keyboard open during chat navigation.
            // The user can tap the composer when ready to type.
            if (!window.matchMedia("(max-width: 700px)").matches) {
                messageInput.focus();
            }

            updateComposerState(false);

            autoResizeTextarea();
        }
    }


    /* =========================================================
       LOAD MESSAGES
       ========================================================= */

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

                messagesList.removeAttribute(
                    "data-vexora-rendering"
                );

                messagesList.innerHTML = `
                    <div class="messages-empty">
                        Could not load messages.
                    </div>
                `;
            }
        }
    }


    /* =========================================================
       OPEN SHARED POST
       ========================================================= */

    function openSharedPost(
        postId
    ) {

        if (!postId) {
            return;
        }

        window.location.href =
            "dashboard.html?postId=" +
            encodeURIComponent(postId);
    }


    /* =========================================================
       RENDER SHARED POST
       ========================================================= */

    function renderSharedPost(
        sharedPost
    ) {

        if (!sharedPost) {
            return "";
        }

        const username =
            sharedPost.username ||
            "User";

        const avatar =
            sharedPost.avatar ||
            "";

        const content =
            sharedPost.content ||
            "";

        const imageUrl =
            sharedPost.image_url ||
            "";

        const videoUrl =
            sharedPost.video_url ||
            "";

        const postId =
            sharedPost.id ||
            "";

        let mediaHTML = "";


        if (imageUrl) {

            mediaHTML = `
                <div class="shared-post-media">

                    <img
                        class="shared-post-image"
                        src="${escapeHTML(imageUrl)}"
                        alt="Shared post"
                        loading="lazy"
                    >

                </div>
            `;

        } else if (videoUrl) {

            mediaHTML = `
                <div class="shared-post-media">

                    <video
                        class="shared-post-video"
                        src="${escapeHTML(videoUrl)}"
                        controls
                        preload="metadata"
                    ></video>

                </div>
            `;
        }


        return `
            <div
                class="shared-post-card"
                data-post-id="${escapeHTML(postId)}"
                role="button"
                tabindex="0"
                title="Open post"
            >

                <div class="shared-post-header">

                    <div
                        class="shared-post-avatar"
                        ${
                            avatar
                                ? `style="background-image:url('${escapeHTML(avatar)}')"`
                                : ""
                        }
                    >
                        ${
                            avatar
                                ? ""
                                : escapeHTML(
                                    getInitial(username)
                                )
                        }
                    </div>

                    <div class="shared-post-author">

                        <strong>
                            ${escapeHTML(username)}
                        </strong>

                        <span class="shared-post-label">
                            @${escapeHTML(username)}
                        </span>

                    </div>

                </div>

                <div class="shared-post-label-main">
                    <span>↗</span>
                    Shared post
                </div>

                ${
                    content
                        ? `
                            <div class="shared-post-content">
                                ${escapeHTML(content)}
                            </div>
                        `
                        : ""
                }

                ${
                    mediaHTML
                        ? mediaHTML
                        : `
                            <div class="shared-post-empty">
                                This post has no media.
                            </div>
                        `
                }

                <div class="shared-post-footer">

                    <span>
                        Shared through Vexora
                    </span>

                </div>

            </div>
        `;
    }


    /* =========================================================
       RENDER MESSAGES
       ========================================================= */

    function renderMessages(
        messages
    ) {

        if (!messagesList) {
            return;
        }

        setupMessagesScroll();


        const previousScrollTop =
            messagesList.scrollTop;

        const previousScrollHeight =
            messagesList.scrollHeight;

        const previousClientHeight =
            messagesList.clientHeight;

        const wasNearBottom =
            previousScrollHeight -
            previousScrollTop -
            previousClientHeight <=
            120;


        if (!messages.length) {

            messagesList.removeAttribute(
                "data-vexora-rendering"
            );

            messagesList.innerHTML = `
                <div class="messages-empty">
                    No messages yet.<br>
                    Send the first message.
                </div>
            `;

            renderedMessageIds =
                new Set();

            firstMessagesLoad =
                false;

            lastRenderedMessageCount =
                0;

            requestAnimationFrame(
                function () {

                    setupMessagesScroll();

                    messagesList.scrollTop =
                        0;
                }
            );

            return;
        }


        const newMessageIds =
            new Set();


        messages.forEach(
            function (message) {

                const messageId =
                    String(
                        message.id || ""
                    );

                if (
                    messageId &&
                    !renderedMessageIds.has(
                        messageId
                    )
                ) {

                    if (!firstMessagesLoad) {

                        newMessageIds.add(
                            messageId
                        );
                    }
                }
            }
        );


        if (pendingSentMessageId) {

            newMessageIds.add(
                String(
                    pendingSentMessageId
                )
            );
        }


        messagesList.dataset.vexoraRendering =
            "true";


        messagesList.innerHTML =
            messages.map(
                function (message) {

                    const mine =
                        Number(message.sender_id) ===
                        currentUserId;

                    const hasImage =
                        Boolean(
                            message.image_url
                        );

                    const hasText =
                        Boolean(
                            message.content &&
                            message.content.trim()
                        );

                    const hasSharedPost =
                        Boolean(
                            message.shared_post
                        );

                    const messageId =
                        String(
                            message.id || ""
                        );

                    const shouldAnimate =
                        newMessageIds.has(
                            messageId
                        );

                    let messageClasses =
                        "message-row";


                    if (mine) {
                        messageClasses +=
                            " mine";
                    } else {
                        messageClasses +=
                            " theirs";
                    }


                    if (shouldAnimate) {

                        messageClasses +=
                            " vexora-new-message";

                    } else {

                        messageClasses +=
                            " vexora-existing-message";
                    }


                    if (
                        pendingSentMessageId &&
                        String(
                            pendingSentMessageId
                        ) ===
                        messageId
                    ) {

                        messageClasses +=
                            " vexora-just-sent";
                    }


                    let messageParts =
                        "";


                    if (hasSharedPost) {

                        messageParts += `
                            <div class="message-part shared-post-part">

                                ${renderSharedPost(
                                    message.shared_post
                                )}

                            </div>
                        `;
                    }


                    if (hasImage) {

                        messageParts += `
                            <div class="message-part image-part">

                                <div class="message-image-bubble">

                                    <img
                                        class="message-image"
                                        src="${escapeHTML(message.image_url)}"
                                        alt="Photo"
                                        loading="lazy"
                                    >

                                </div>

                            </div>
                        `;
                    }


                    if (hasText) {

                        const messageText =
                            message.content.trim();

                        messageParts += `
                            <div class="message-part text-part">

                                <div class="message-bubble">${escapeHTML(
                                    messageText
                                )}</div>

                            </div>
                        `;
                    }


                    if (!messageParts) {

                        messageParts = `
                            <div class="message-part text-part">

                                <div class="message-bubble message-empty-bubble">
                                    Message
                                </div>

                            </div>
                        `;
                    }


                    return `
                        <div
                            class="${messageClasses}"
                            data-message-id="${escapeHTML(messageId)}"
                        >

                            <div class="message-content">

                                <div class="message-body">

                                    ${messageParts}

                                </div>

                                <div class="message-reactions" aria-label="Message reactions">
                                    <div class="message-reaction-picker" role="group" aria-label="Choose a reaction">
                                        ${["❤️", "😂", "😮", "😢", "🔥", "👍"].map(function (emoji) {
                                            const reaction = (message.reactions || []).find(function (item) { return item.emoji === emoji; });
                                            return `<button type="button" class="message-reaction-option${reaction && reaction.mine ? " is-mine" : ""}" data-message-reaction data-message-id="${escapeHTML(messageId)}" data-emoji="${emoji}" aria-label="React with ${emoji}" aria-pressed="${Boolean(reaction && reaction.mine)}">${emoji}</button>`;
                                        }).join("")}
                                    </div>
                                    <div class="message-reaction-summary">
                                        ${(message.reactions || []).map(function (item) {
                                            return `<span class="message-reaction-count${item.mine ? " is-mine" : ""}" aria-label="${item.count} reactions: ${escapeHTML(item.emoji)}">${escapeHTML(item.emoji)}${item.count > 1 ? ` ${item.count}` : ""}</span>`;
                                        }).join("")}
                                    </div>
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


        setupMessagesScroll();


        requestAnimationFrame(
            function () {

                messagesList.removeAttribute(
                    "data-vexora-rendering"
                );

                const animatedRows =
                    messagesList.querySelectorAll(
                        ".vexora-new-message"
                    );

                animatedRows.forEach(
                    function (row) {

                        row.style.willChange =
                            "transform, opacity, filter";

                        window.setTimeout(
                            function () {

                                row.style.willChange =
                                    "";

                            },
                            1100
                        );
                    }
                );
            }
        );


        if (firstMessagesLoad) {

            renderedMessageIds =
                new Set(
                    messages
                        .map(
                            function (message) {

                                return String(
                                    message.id || ""
                                );
                            }
                        )
                        .filter(Boolean)
                );

            lastRenderedMessageCount =
                messages.length;

            requestAnimationFrame(
                function () {

                    requestAnimationFrame(
                        function () {

                            scrollMessagesToBottom(
                                false
                            );

                            firstMessagesLoad =
                                false;

                            pendingSentMessageId =
                                null;
                        }
                    );
                }
            );

            return;
        }


        if (wasNearBottom) {

            requestAnimationFrame(
                function () {

                    scrollMessagesToBottom(
                        false
                    );
                }
            );

        } else {

            const newScrollHeight =
                messagesList.scrollHeight;

            const heightDifference =
                newScrollHeight -
                previousScrollHeight;

            const targetScrollTop =
                previousScrollTop +
                Math.max(
                    0,
                    heightDifference
                );

            requestAnimationFrame(
                function () {

                    messagesList.scrollTop =
                        targetScrollTop;
                }
            );
        }


        requestAnimationFrame(
            function () {

                requestAnimationFrame(
                    function () {

                        renderedMessageIds =
                            new Set(
                                messages
                                    .map(
                                        function (message) {

                                            return String(
                                                message.id || ""
                                            );
                                        }
                                    )
                                    .filter(Boolean)
                            );

                        lastRenderedMessageCount =
                            messages.length;

                        pendingSentMessageId =
                            null;
                    }
                );
            }
        );
    }


    /* =========================================================
       SHARED POST CLICK
       ========================================================= */

    if (messagesList) {

        messagesList.addEventListener(
            "click",
            function (event) {

                const sharedPost =
                    event.target.closest(
                        ".shared-post-card"
                    );

                if (!sharedPost) {
                    return;
                }

                if (
                    event.target.closest(
                        ".shared-post-video"
                    )
                ) {
                    return;
                }

                const postId =
                    sharedPost.dataset.postId;

                if (!postId) {
                    return;
                }

                triggerClass(
                    sharedPost,
                    "vexora-shared-post-click",
                    550
                );

                window.setTimeout(
                    function () {

                        openSharedPost(
                            postId
                        );

                    },
                    180
                );
            }
        );


        messagesList.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key !== "Enter" &&
                    event.key !== " "
                ) {
                    return;
                }

                const sharedPost =
                    event.target.closest(
                        ".shared-post-card"
                    );

                if (!sharedPost) {
                    return;
                }

                event.preventDefault();

                const postId =
                    sharedPost.dataset.postId;

                if (!postId) {
                    return;
                }

                openSharedPost(
                    postId
                );
            }
        );
    }


    /* =========================================================
       SEND TEXT MESSAGE
       ========================================================= */

    async function sendMessage() {

        if (isSendingMessage) {
            return;
        }

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


        isSendingMessage =
            true;

        animateSendButton();


        if (sendMessageButton) {

            sendMessageButton.disabled =
                true;
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


            if (
                data.message &&
                data.message.id
            ) {

                pendingSentMessageId =
                    data.message.id;

            } else if (
                data.messageId
            ) {

                pendingSentMessageId =
                    data.messageId;

            } else if (
                data.id
            ) {

                pendingSentMessageId =
                    data.id;
            }


            messageInput.value = "";

            autoResizeTextarea();

            updateComposerState(true);

            animateComposerSuccess();


            const composer =
                document.querySelector(
                    ".message-composer"
                );

            if (composer) {

                composer.classList.remove(
                    "vexora-typing"
                );
            }


            if (data.conversationId) {

                activeConversationId =
                    Number(
                        data.conversationId
                    );
            }


            firstMessagesLoad =
                !renderedMessageIds.size;


            await loadMessages();

            await loadConversations();



            if (messageInput) {

                messageInput.focus();

                updateComposerState(false);
            }

        } catch (error) {

            console.error(
                "Send message error:",
                error
            );

            pendingSentMessageId =
                null;

            alert(
                error.message ||
                "Could not send message."
            );

        } finally {

            if (sendMessageButton) {

                window.setTimeout(
                    function () {

                        sendMessageButton.disabled =
                            false;

                        isSendingMessage =
                            false;

                    },
                    260
                );

            } else {

                isSendingMessage =
                    false;
            }
        }
    }


    /* =========================================================
       SEND IMAGE MESSAGE
       ========================================================= */

    async function sendImageMessage(
        file
    ) {

        if (
            !activeOtherUser ||
            !activeOtherUser.id
        ) {

            alert(
                "Open a conversation first."
            );

            return;
        }

        if (!file) {
            return;
        }

        const maxFileSize =
            8 * 1024 * 1024;

        if (file.size > maxFileSize) {

            alert(
                "Image cannot be larger than 8 MB."
            );

            imageInput.value =
                "";

            return;
        }

        if (!file.type.startsWith("image/")) {

            alert(
                "Please select an image."
            );

            imageInput.value =
                "";

            return;
        }


        animateSendButton();


        if (attachmentButton) {
            attachmentButton.disabled =
                true;
        }

        if (sendMessageButton) {
            sendMessageButton.disabled =
                true;
        }


        try {

            const imageData =
                await new Promise(
                    function (
                        resolve,
                        reject
                    ) {

                        const reader =
                            new FileReader();

                        reader.onload =
                            function () {

                                resolve(
                                    reader.result
                                );
                            };

                        reader.onerror =
                            function () {

                                reject(
                                    new Error(
                                        "Could not read image."
                                    )
                                );
                            };

                        reader.readAsDataURL(
                            file
                        );
                    }
                );


            const response =
                await fetch(
                    "/api/messages/image",
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

                            imageData:
                                imageData
                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Could not send image."
                );
            }


            if (
                data.message &&
                data.message.id
            ) {

                pendingSentMessageId =
                    data.message.id;

            } else if (
                data.messageId
            ) {

                pendingSentMessageId =
                    data.messageId;

            } else if (
                data.id
            ) {

                pendingSentMessageId =
                    data.id;
            }


            if (data.conversationId) {

                activeConversationId =
                    Number(
                        data.conversationId
                    );
            }


            imageInput.value =
                "";

            closePanels();

            firstMessagesLoad =
                false;

            animateComposerSuccess();


            await loadMessages();

            await loadConversations();


            if (isMobileMessagesLayout()) {
                forceMobileConversationView();
            }

        } catch (error) {

            console.error(
                "Send image error:",
                error
            );

            pendingSentMessageId =
                null;

            alert(
                error.message ||
                "Could not send image."
            );

        } finally {

            if (attachmentButton) {

                attachmentButton.disabled =
                    false;
            }

            if (sendMessageButton) {

                window.setTimeout(
                    function () {

                        sendMessageButton.disabled =
                            false;

                    },
                    260
                );
            }
        }
    }


    /* =========================================================
       READ
       ========================================================= */

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


    /* =========================================================
       NEW CHAT
       ========================================================= */

    function closePanels() {
        if (attachmentPanel) attachmentPanel.hidden = true;
        if (emojiPanel) emojiPanel.hidden = true;
    }


    function openNewChat() {

        closePanels();

        if (!newChatModal) {
            return;
        }

        newChatModal.hidden =
            false;

        if (userSearchInput) {

            userSearchInput.value =
                "";
        }

        if (userSearchResults) {

            userSearchResults.innerHTML = `
                <div class="search-hint">
                    Loading people you follow...
                </div>
            `;
        }

        searchUsers();

        setTimeout(
            function () {

                if (userSearchInput) {

                    userSearchInput.focus();
                }

            },
            140
        );
    }


    function closeNewChatModal() {

        if (newChatModal) {

            newChatModal.hidden =
                true;
        }
    }


    /* =========================================================
       USER SEARCH
       ========================================================= */

    async function searchUsers() {

        if (
            !userSearchInput ||
            !userSearchResults
        ) {
            return;
        }

        const query =
            userSearchInput.value.trim();

        userSearchResults.innerHTML = `
            <div class="search-hint">
                ${query ? "Searching..." : "Loading people you follow..."}
            </div>
        `;


        try {

            const response =
                await fetch(
                    query
                        ? "/api/users?username=" + encodeURIComponent(query)
                        : "/api/users?currentUserId=" + encodeURIComponent(currentUserId) + "&forMessaging=1"
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

                users =
                    data;

            } else if (
                Array.isArray(data.users)
            ) {

                users =
                    data.users;

            } else if (data.user) {

                users = [
                    data.user
                ];
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


            const followedUsers = users.filter(function (foundUser) {
                return Number(foundUser.isFollowing) === 1;
            });
            const otherUsers = users.filter(function (foundUser) {
                return Number(foundUser.isFollowing) !== 1;
            });
            const groups = query
                ? [{ title: "People", users: users }]
                : [
                    ...(followedUsers.length ? [{ title: "People you follow", users: followedUsers }] : []),
                    { title: followedUsers.length ? "Everyone else" : "People on Vexora", users: otherUsers }
                ];

            userSearchResults.innerHTML = groups.map(function (group) {
                const groupHeading = `<div class="user-group-title">${group.title}</div>`;
                const userItems = group.users.map(function (foundUser) {

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
                    }).join("");
                return groupHeading + userItems;
            }).join("");


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


    /* =========================================================
       START CONVERSATION
       ========================================================= */

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


            renderedMessageIds =
                new Set();

            pendingSentMessageId =
                null;


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


    /* =========================================================
       TEXTAREA
       ========================================================= */

    function autoResizeTextarea() {

        if (!messageInput) {
            return;
        }

        messageInput.style.height =
            "auto";

        const maxHeight =
            isMobileMessagesLayout()
                ? 140
                : 180;

        const newHeight =
            Math.min(
                messageInput.scrollHeight,
                maxHeight
            );

        messageInput.style.height =
            newHeight + "px";

        messageInput.style.overflowY =
            messageInput.scrollHeight >
            maxHeight
                ? "auto"
                : "hidden";
    }


    if (messageInput) {

        messageInput.addEventListener(
            "input",
            function () {

                autoResizeTextarea();

                updateComposerState(true);
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


    /* =========================================================
       SEND BUTTON
       ========================================================= */

    if (sendMessageButton) {

        sendMessageButton.addEventListener(
            "click",
            function () {

                sendMessage();
            }
        );
    }


    /* =========================================================
       ATTACHMENT BUTTON
       ========================================================= */

    if (attachmentButton) {

        attachmentButton.addEventListener(
            "click",
            function () {

                if (!attachmentPanel) {
                    return;
                }

                if (attachmentPanel.hidden) {

                    if (emojiPanel) {

                        emojiPanel.hidden =
                            true;
                    }

                    attachmentPanel.hidden =
                        false;

                } else {

                    attachmentPanel.hidden =
                        true;
                }
            }
        );
    }


    /* =========================================================
       PHOTO BUTTON
       ========================================================= */

    if (attachmentItems.length > 0) {

        attachmentItems[0].addEventListener(
            "click",
            function () {

                closePanels();

                imageInput.click();
            }
        );
    }


    /* =========================================================
       IMAGE SELECTED
       ========================================================= */

    imageInput.addEventListener(
        "change",
        function () {

            const file =
                imageInput.files &&
                imageInput.files[0];

            if (!file) {
                return;
            }

            sendImageMessage(
                file
            );
        }
    );


    /* =========================================================
       EMOJI BUTTON
       ========================================================= */

    if (emojiButton) {

        emojiButton.addEventListener(
            "click",
            function () {

                if (!emojiPanel) {
                    return;
                }

                if (attachmentPanel) {

                    attachmentPanel.hidden =
                        true;
                }

                emojiPanel.hidden =
                    !emojiPanel.hidden;
            }
        );
    }


    /* =========================================================
       EMOJI SELECTION
       ========================================================= */

    document
        .querySelectorAll(
            ".emoji-grid button"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        if (!messageInput) {
                            return;
                        }

                        const emoji =
                            button.textContent;

                        const start =
                            messageInput.selectionStart;

                        const end =
                            messageInput.selectionEnd;

                        const value =
                            messageInput.value;

                        messageInput.value =
                            value.slice(
                                0,
                                start
                            ) +
                            emoji +
                            value.slice(
                                end
                            );

                        messageInput.focus();

                        const cursor =
                            start +
                            emoji.length;

                        messageInput.setSelectionRange(
                            cursor,
                            cursor
                        );

                        autoResizeTextarea();

                        updateComposerState(true);
                    }
                );
            }
        );


    /* =========================================================
       SEARCH CHATS
       ========================================================= */

    if (conversationSearch) {

        conversationSearch.addEventListener(
            "input",
            function () {

                renderConversations();
            }
        );
    }


    /* =========================================================
       USER SEARCH INPUT
       ========================================================= */

    if (userSearchInput) {

        userSearchInput.addEventListener(
            "input",
            function () {

                clearTimeout(
                    searchTimer
                );

                searchTimer =
                    setTimeout(
                        searchUsers,
                        300
                    );
            }
        );
    }


    /* =========================================================
       BUTTONS
       ========================================================= */

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


    /* =========================================================
       MOBILE BACK
       ========================================================= */

    if (mobileBack) {

        mobileBack.addEventListener(
            "click",
            function (event) {

                event.preventDefault();
                event.stopPropagation();

                /*
                    Clear focus first so the mobile keyboard
                    does not keep the chat viewport resized.
                */

                if (document.activeElement) {
                    document.activeElement.blur();
                }

                closePanels();

                hideMobileChat();

                /*
                    Keep the conversation selected internally,
                    but show the conversation list.
                */

                renderConversations();

            }
        );
    }


    /* =========================================================
       TOP BACK
       ========================================================= */

    if (backButton) {

        backButton.addEventListener(
            "click",
            function () {

                window.location.href =
                    "dashboard.html";
            }
        );
    }


    /* =========================================================
       LOGOUT
       ========================================================= */

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


    /* =========================================================
       ESC
       ========================================================= */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape"
            ) {

                if (
                    newChatModal &&
                    !newChatModal.hidden
                ) {

                    closeNewChatModal();

                    return;
                }

                closePanels();

                if (
                    isMobileMessagesLayout() &&
                    messagesApp &&
                    messagesApp.classList.contains(
                        "mobile-chat"
                    )
                ) {

                    hideMobileChat();
                }
            }
        }
    );


    /* =========================================================
       REFRESH
       ========================================================= */

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

                    await loadMessages();

                    await markAsRead();
                }

            },
            2000
        );


    /* =========================================================
       INITIAL START
       ========================================================= */

    syncMobileLayout();

    setupMessagesScroll();

    autoResizeTextarea();

    updateComposerState(false);

    loadConversations();

    loadUnreadCount();


    /*
        Final safety pass after browser has completed
        initial layout.
    */

    requestAnimationFrame(
        function () {

            syncMobileLayout();

            requestAnimationFrame(
                function () {

                    syncMobileLayout();

                }
            );
        }
    );

});
