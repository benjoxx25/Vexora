document.addEventListener("DOMContentLoaded", function () {
    const glassTargets = document.querySelectorAll(
        ".profile-header, .profile-post, .profile-card, .suggestions, .create-post, .post-card, .notifications-panel, .messages-app, .conversation-item, .new-chat-box"
    );

    glassTargets.forEach(function (element) {
        element.classList.add("glass-follow");
    });

    let frame = null;
    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;

    function updatePointer() {
        glassTargets.forEach(function (element) {
            const bounds = element.getBoundingClientRect();
            const localX = ((pointerX - bounds.left) / Math.max(bounds.width, 1)) * 100;
            const localY = ((pointerY - bounds.top) / Math.max(bounds.height, 1)) * 100;

            element.style.setProperty("--glass-x", `${localX}%`);
            element.style.setProperty("--glass-y", `${localY}%`);
        });

        frame = null;
    }

    document.addEventListener("pointermove", function (event) {
        pointerX = event.clientX;
        pointerY = event.clientY;

        if (!frame) {
            frame = requestAnimationFrame(updatePointer);
        }
    }, { passive: true });

    window.addEventListener("resize", function () {
        if (!frame) {
            frame = requestAnimationFrame(updatePointer);
        }
    });

    updatePointer();
});
