document.addEventListener("DOMContentLoaded", function () {
    const user = (() => {
        try { return JSON.parse(localStorage.getItem("vexoraUser") || "null"); }
        catch (error) { return null; }
    })();

    const rail = document.getElementById("vexStoryRail");
    const composer = document.getElementById("vexStoryComposer");
    const viewer = document.getElementById("vexStoryViewer");
    if (!rail || !composer || !viewer || !user?.id) return;

    const textInput = document.getElementById("vexStoryText");
    const fileInput = document.getElementById("vexStoryFile");
    const preview = document.getElementById("vexStoryPreview");
    const error = document.getElementById("vexStoryError");
    const publishButton = document.getElementById("vexPublishStory");
    const counter = document.getElementById("vexStoryCounter");
    const createButton = document.getElementById("vexCreateStory");
    const composerTitle = document.getElementById("vexStoryComposerTitle");
    const shareStoryButton = document.getElementById("vexShareStory");
    const editStoryButton = document.getElementById("vexEditStory");
    const deleteStoryButton = document.getElementById("vexDeleteStory");
    let mediaData = "";
    let mediaKind = "";
    let previewUrl = "";
    let stories = [];
    let groups = [];
    let activeIndex = 0;
    let storyTimer = 0;
    let expiryTimer = 0;
    let editingStoryId = null;
    const requestedStoryId = new URLSearchParams(window.location.search).get("story");
    let sharedStoryOpened = false;

    function initial(name) { return (name || "V").trim().charAt(0).toUpperCase() || "V"; }
    function safeAvatar(element, avatar, name) {
        element.textContent = initial(name);
        if (avatar) {
            element.style.backgroundImage = `url("${String(avatar).replace(/["\\]/g, "")}")`;
            element.classList.add("has-image");
        } else {
            element.style.backgroundImage = "";
            element.classList.remove("has-image");
        }
    }
    function storyExpiry(story) {
        const value = String(story.expires_at || "").replace(" ", "T");
        return Date.parse(/[zZ]|[+-]\d\d:\d\d$/.test(value) ? value : value + "Z");
    }
    function closeComposer() {
        composer.hidden = true;
        document.body.classList.remove("vex-story-modal-open");
    }
    function openComposer(story = null) {
        error.textContent = "";
        editingStoryId = story ? Number(story.id) : null;
        composerTitle.textContent = story ? "Edit your story" : "Create a story";
        publishButton.innerHTML = story ? "Save changes <span>✓</span>" : "Share story <span>↗</span>";
        textInput.value = story?.content || "";
        counter.textContent = `${textInput.value.length} / 300`;
        composer.hidden = false;
        document.body.classList.add("vex-story-modal-open");
        window.setTimeout(() => textInput.focus(), 60);
    }
    function closeViewer() {
        window.clearTimeout(storyTimer);
        viewer.hidden = true;
        document.body.classList.remove("vex-story-modal-open");
        document.getElementById("vexStoryViewerContent").replaceChildren();
    }

    async function loadStories() {
        try {
            const response = await fetch(`/api/stories?userId=${encodeURIComponent(user.id)}`);
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.message || "Could not load stories.");
            stories = Array.isArray(data.stories) ? data.stories.filter(item => storyExpiry(item) > Date.now()) : [];
            groups = [];
            const byUser = new Map();
            stories.forEach((story, index) => {
                const key = String(story.user_id);
                if (!byUser.has(key)) {
                    const group = { userId: key, username: story.username, avatar: story.avatar, indices: [] };
                    groups.push(group);
                    byUser.set(key, group);
                }
                byUser.get(key).indices.push(index);
            });
            renderRail();
            scheduleExpiryRefresh();
            if (requestedStoryId && !sharedStoryOpened) {
                let sharedIndex = stories.findIndex(story => String(story.id) === requestedStoryId);
                if (sharedIndex === -1) {
                    try {
                        const sharedResponse = await fetch(`/api/stories/${encodeURIComponent(requestedStoryId)}`);
                        const sharedData = await sharedResponse.json();
                        if (sharedResponse.ok && sharedData.success && sharedData.story) {
                            stories.push(sharedData.story);
                            sharedIndex = stories.length - 1;
                        }
                    } catch (shareLoadError) { console.warn("Shared story could not be opened:", shareLoadError); }
                }
                if (sharedIndex !== -1) {
                    sharedStoryOpened = true;
                    openViewer(sharedIndex);
                    window.history.replaceState({}, "", window.location.pathname);
                }
            }
        } catch (loadError) {
            console.warn("Stories could not be loaded:", loadError.message);
            rail.querySelector(".vex-stories-loading")?.remove();
        }
    }

    function scheduleExpiryRefresh() {
        window.clearTimeout(expiryTimer);
        const next = stories.reduce((earliest, story) => Math.min(earliest, storyExpiry(story)), Infinity);
        if (Number.isFinite(next)) expiryTimer = window.setTimeout(loadStories, Math.max(1000, next - Date.now() + 250));
    }

    function renderRail() {
        rail.replaceChildren();
        rail.appendChild(createButton);
        const userStory = stories.find(story => Number(story.user_id) === Number(user.id));
        safeAvatar(document.getElementById("vexStoryCreateAvatar"), user.avatar, user.username);
        if (userStory) createButton.classList.add("has-active-story");
        else createButton.classList.remove("has-active-story");

        groups.forEach(group => {
            const item = document.createElement("button");
            item.type = "button";
            item.className = "vex-story-person" + (Number(group.userId) === Number(user.id) ? " own-story" : "");
            item.setAttribute("aria-label", `View ${group.username}'s story`);
            const avatar = document.createElement("span");
            avatar.className = "vex-story-avatar";
            safeAvatar(avatar, group.avatar, group.username);
            const label = document.createElement("span");
            label.className = "vex-story-name";
            label.textContent = Number(group.userId) === Number(user.id) ? "Your story" : group.username;
            item.append(avatar, label);
            item.addEventListener("click", () => openViewer(group.indices[0]));
            rail.appendChild(item);
        });
        if (!groups.length) {
            const empty = document.createElement("span");
            empty.className = "vex-stories-loading";
            empty.textContent = "Stories from people you follow will show up here.";
            rail.appendChild(empty);
        }
    }

    function openViewer(index) {
        activeIndex = index;
        showStory();
        viewer.hidden = false;
        document.body.classList.add("vex-story-modal-open");
    }

    function showStory() {
        window.clearTimeout(storyTimer);
        const story = stories[activeIndex];
        if (!story || storyExpiry(story) <= Date.now()) {
            if (activeIndex + 1 < stories.length) { activeIndex += 1; showStory(); }
            else closeViewer();
            return;
        }
        safeAvatar(document.getElementById("vexStoryViewerAvatar"), story.avatar, story.username);
        document.getElementById("vexStoryViewerName").textContent = story.username || "Vexora user";
        const ownStory = Number(story.user_id) === Number(user.id);
        editStoryButton.hidden = !ownStory;
        deleteStoryButton.hidden = !ownStory;
        const remaining = Math.max(0, storyExpiry(story) - Date.now());
        const hours = Math.floor(remaining / 3600000);
        const minutes = Math.max(1, Math.ceil((remaining % 3600000) / 60000));
        document.getElementById("vexStoryViewerTime").textContent = hours ? `Expires in ${hours}h ${minutes}m` : `Expires in ${minutes}m`;
        const content = document.getElementById("vexStoryViewerContent");
        content.replaceChildren();
        if (story.image_url) {
            const image = document.createElement("img");
            image.src = story.image_url;
            image.alt = `Story by ${story.username}`;
            content.appendChild(image);
        } else if (story.video_url) {
            const video = document.createElement("video");
            video.src = story.video_url;
            video.autoplay = true;
            video.muted = true;
            video.loop = true;
            video.playsInline = true;
            video.controls = true;
            content.appendChild(video);
        }
        if (story.content) {
            const caption = document.createElement("p");
            caption.textContent = story.content;
            content.appendChild(caption);
        }
        const progress = document.getElementById("vexStoryProgress");
        progress.style.animation = "none";
        void progress.offsetWidth;
        const displayDuration = Math.min(6000, Math.max(1000, remaining));
        progress.style.animation = `vexStoryProgress ${displayDuration}ms linear forwards`;
        storyTimer = window.setTimeout(nextStory, displayDuration);
    }

    function nextStory() {
        if (activeIndex + 1 >= stories.length) { closeViewer(); return; }
        activeIndex += 1;
        showStory();
    }

    async function shareStory(story) {
        const url = new URL("dashboard.html", window.location.href);
        url.searchParams.set("story", story.id);
        const details = { title: `${story.username}'s Vexora story`, text: story.content || `See ${story.username}'s story on Vexora`, url: url.href };
        try {
            if (navigator.share) await navigator.share(details);
            else {
                await navigator.clipboard.writeText(url.href);
                shareStoryButton.textContent = "✓";
                window.setTimeout(() => { shareStoryButton.textContent = "↗"; }, 1400);
            }
        } catch (shareError) {
            if (shareError.name === "AbortError") return;
            try {
                await navigator.clipboard.writeText(url.href);
                shareStoryButton.textContent = "✓";
                window.setTimeout(() => { shareStoryButton.textContent = "↗"; }, 1400);
            } catch (copyError) { console.warn("Story link could not be copied:", copyError); }
        }
    }

    function resetMedia(clearFileInput = true) {
        mediaData = "";
        mediaKind = "";
        if (clearFileInput) fileInput.value = "";
        preview.replaceChildren();
        preview.hidden = true;
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        previewUrl = "";
    }

    createButton.addEventListener("click", () => openComposer());
    composer.addEventListener("click", event => { if (event.target === composer) closeComposer(); });
    composer.querySelector("[data-close-story]").addEventListener("click", closeComposer);
    viewer.querySelector("[data-close-viewer]").addEventListener("click", closeViewer);
    viewer.addEventListener("click", event => { if (event.target === viewer) closeViewer(); });
    document.getElementById("vexStoryNext").addEventListener("click", nextStory);
    shareStoryButton.addEventListener("click", () => { const story = stories[activeIndex]; if (story) shareStory(story); });
    editStoryButton.addEventListener("click", () => {
        const story = stories[activeIndex];
        if (!story || Number(story.user_id) !== Number(user.id)) return;
        closeViewer();
        openComposer(story);
    });
    deleteStoryButton.addEventListener("click", async () => {
        const story = stories[activeIndex];
        if (!story || Number(story.user_id) !== Number(user.id) || !window.confirm("Delete this story?")) return;
        try {
            const response = await fetch(`/api/stories/${encodeURIComponent(story.id)}?userId=${encodeURIComponent(user.id)}`, { method: "DELETE" });
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.message || "Could not delete story.");
            closeViewer();
            await loadStories();
        } catch (deleteError) {
            error.textContent = deleteError.message || "Could not delete story.";
        }
    });
    document.addEventListener("keydown", event => {
        if (event.key === "Escape") { closeComposer(); closeViewer(); }
        if (event.key === "ArrowRight" && !viewer.hidden) nextStory();
    });

    textInput.addEventListener("input", () => { counter.textContent = `${textInput.value.length} / 300`; });
    fileInput.addEventListener("change", () => {
        const file = fileInput.files?.[0];
        resetMedia(false);
        if (!file) return;
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");
        if ((!isImage && !isVideo) || file.size > 20 * 1024 * 1024 || (isImage && file.size > 8 * 1024 * 1024)) {
            error.textContent = "Choose an image under 8 MB or video under 20 MB.";
            fileInput.value = "";
            return;
        }
        mediaKind = isImage ? "image" : "video";
        previewUrl = URL.createObjectURL(file);
        const media = document.createElement(isImage ? "img" : "video");
        media.src = previewUrl;
        media.alt = isImage ? "Story preview" : "";
        if (isVideo) { media.muted = true; media.playsInline = true; media.controls = true; }
        preview.appendChild(media);
        preview.hidden = false;
        const reader = new FileReader();
        reader.onload = () => { mediaData = String(reader.result || ""); };
        reader.onerror = () => { error.textContent = "Could not read that file."; resetMedia(); };
        reader.readAsDataURL(file);
    });

    publishButton.addEventListener("click", async () => {
        const content = textInput.value.trim();
        if (!content && !mediaData && !editingStoryId) { error.textContent = "Add a thought, photo or video first."; return; }
        if (fileInput.files?.length && !mediaData) { error.textContent = "Your media is still loading."; return; }
        publishButton.disabled = true;
        publishButton.classList.add("is-loading");
        error.textContent = "";
        try {
            const payload = { userId: user.id, content };
            if (mediaKind === "image") payload.imageData = mediaData;
            if (mediaKind === "video") payload.videoData = mediaData;
            const response = await fetch(editingStoryId ? `/api/stories/${encodeURIComponent(editingStoryId)}` : "/api/stories", { method: editingStoryId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.message || "Could not share story.");
            closeComposer();
            editingStoryId = null;
            textInput.value = "";
            counter.textContent = "0 / 300";
            resetMedia();
            await loadStories();
        } catch (publishError) {
            error.textContent = publishError.message || "Could not share story.";
        } finally {
            publishButton.disabled = false;
            publishButton.classList.remove("is-loading");
        }
    });

    loadStories();
    window.setInterval(loadStories, 60 * 1000);
});
