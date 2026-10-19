document.addEventListener("DOMContentLoaded", async function () {

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


    let currentUser;


    try {

        currentUser =
            JSON.parse(savedUser);

    } catch (error) {

        localStorage.removeItem(
            "vexoraUser"
        );

        window.location.href =
            "index.html";

        return;

    }


    if (!currentUser.id) {

        localStorage.removeItem(
            "vexoraUser"
        );

        window.location.href =
            "index.html";

        return;

    }


    // ==========================
    // WHICH PROFILE?
    // ==========================

    const urlParams =
        new URLSearchParams(
            window.location.search
        );


    const requestedUserId =
        Number(
            urlParams.get("userId")
        );


    const profileUserId =
        requestedUserId ||
        Number(currentUser.id);


    const isOwnProfile =
        Number(profileUserId) ===
        Number(currentUser.id);


    let profileUser = null;


    // ==========================
    // AVATAR STATE
    // ==========================

    let selectedAvatar =
        currentUser.avatar || "";


    let originalAvatar =
        currentUser.avatar || "";


    // ==========================
    // ELEMENTS
    // ==========================

    const profileUsername =
        document.getElementById(
            "profileUsername"
        );


    const profileTag =
        document.getElementById(
            "profileTag"
        );


    const profileAvatar =
        document.getElementById(
            "profileAvatar"
        );


    const topUsername =
        document.getElementById(
            "topUsername"
        );


    const topAvatar =
        document.getElementById(
            "topAvatar"
        );

    const profileNotificationNumber =
        document.getElementById(
            "profileNotificationNumber"
        );

    async function loadProfileNotificationCount() {
        if (!profileNotificationNumber) {
            return;
        }

        try {
            const response = await fetch(
                `/api/notifications/unread-count?userId=${encodeURIComponent(currentUser.id)}`
            );
            const data = await response.json();
            const count = Number(data.unread || data.unreadCount || data.count || 0);

            profileNotificationNumber.textContent = count > 99 ? "99+" : String(count);
            profileNotificationNumber.hidden = count === 0;
        } catch (error) {
            profileNotificationNumber.hidden = true;
        }
    }

    loadProfileNotificationCount();


    const editUsername =
        document.getElementById(
            "editUsername"
        );


    const editBio =
        document.getElementById(
            "editBio"
        );


    const profileBio =
        document.getElementById(
            "profileBio"
        );


    const postCount =
        document.getElementById(
            "postCount"
        );


    const followerCount =
        document.getElementById(
            "followerCount"
        );


    const followingCount =
        document.getElementById(
            "followingCount"
        );

    const relationshipsModal = document.getElementById("relationshipsModal");
    const relationshipsTitle = document.getElementById("relationshipsTitle");
    const relationshipsList = document.getElementById("relationshipsList");

    async function openRelationships(type) {
        if (!relationshipsModal || !relationshipsList) return;
        relationshipsTitle.textContent = type === "following" ? "Following" : "Followers";
        relationshipsList.replaceChildren();
        const loading = document.createElement("p");
        loading.className = "relationships-state";
        loading.textContent = "Loading people…";
        relationshipsList.appendChild(loading);
        relationshipsModal.hidden = false;
        document.body.classList.add("relationships-open");

        try {
            const response = await fetch(`/api/users/${encodeURIComponent(profileUserId)}/relations?type=${type}&viewerId=${encodeURIComponent(currentUser.id)}`);
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.message || "Could not load this list.");
            relationshipsList.replaceChildren();
            if (!data.users.length) {
                const empty = document.createElement("p");
                empty.className = "relationships-state";
                empty.textContent = type === "following" ? "This profile is not following anyone yet." : "No followers yet.";
                relationshipsList.appendChild(empty);
                return;
            }

            data.users.forEach(person => {
                const row = document.createElement("div");
                row.className = "relationship-row";
                const avatar = document.createElement("span");
                avatar.className = "relationship-avatar";
                avatar.textContent = (person.username || "V").charAt(0).toUpperCase();
                if (person.avatar) avatar.style.backgroundImage = `url("${String(person.avatar).replace(/["\\]/g, "")}")`;

                const identity = document.createElement("button");
                identity.type = "button";
                identity.className = "relationship-identity";
                const name = document.createElement("strong");
                name.textContent = person.username || "Vexora user";
                const bio = document.createElement("span");
                bio.textContent = person.bio || `@${person.username || "user"}`;
                identity.append(name, bio);
                identity.addEventListener("click", () => {
                    window.location.href = `profile.html?userId=${encodeURIComponent(person.id)}`;
                });
                row.append(avatar, identity);

                if (Number(person.id) !== Number(currentUser.id)) {
                    const follow = document.createElement("button");
                    follow.type = "button";
                    follow.className = "relationship-follow" + (person.isFollowing ? " following" : "");
                    follow.textContent = person.isFollowing ? "Following" : "Follow";
                    follow.setAttribute("aria-pressed", person.isFollowing ? "true" : "false");
                    follow.addEventListener("click", async () => {
                        if (follow.disabled) return;
                        follow.disabled = true;
                        try {
                            const result = await fetch(`/api/users/${encodeURIComponent(person.id)}/follow`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ followerId: currentUser.id })
                            });
                            const resultData = await result.json();
                            if (!result.ok || !resultData.success) throw new Error(resultData.message || "Could not update follow.");
                            person.isFollowing = Boolean(resultData.following);
                            follow.textContent = person.isFollowing ? "Following" : "Follow";
                            follow.classList.toggle("following", person.isFollowing);
                            follow.setAttribute("aria-pressed", person.isFollowing ? "true" : "false");
                        } catch (followError) {
                            follow.title = followError.message;
                        } finally {
                            follow.disabled = false;
                        }
                    });
                    row.appendChild(follow);
                }
                relationshipsList.appendChild(row);
            });
        } catch (error) {
            relationshipsList.replaceChildren();
            const failed = document.createElement("p");
            failed.className = "relationships-state";
            failed.textContent = error.message || "Could not load this list.";
            relationshipsList.appendChild(failed);
        }
    }

    const openFollowers = document.getElementById("openFollowers");
    const openFollowing = document.getElementById("openFollowing");
    const closeRelationships = document.getElementById("closeRelationships");
    openFollowers?.addEventListener("click", () => openRelationships("followers"));
    openFollowing?.addEventListener("click", () => openRelationships("following"));
    closeRelationships?.addEventListener("click", () => {
        relationshipsModal.hidden = true;
        document.body.classList.remove("relationships-open");
    });
    relationshipsModal?.addEventListener("click", event => {
        if (event.target === relationshipsModal) {
            relationshipsModal.hidden = true;
            document.body.classList.remove("relationships-open");
        }
    });
    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && relationshipsModal && !relationshipsModal.hidden) {
            relationshipsModal.hidden = true;
            document.body.classList.remove("relationships-open");
        }
    });


    const profileModal =
        document.getElementById(
            "profileModal"
        );


    const editProfileButton =
        document.getElementById(
            "editProfileButton"
        );


    const closeProfileModal =
        document.getElementById(
            "closeProfileModal"
        );


    const saveProfile =
        document.getElementById(
            "saveProfile"
        );


    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    const createPostButton =
        document.getElementById(
            "createPostButton"
        );


    const topProfileButton =
        document.querySelector(
            ".profile-button"
        );


    const profileMainInfo =
        document.querySelector(
            ".profile-name-row"
        );


    // ==========================
    // AVATAR ELEMENTS
    // ==========================

    const avatarInput =
        document.getElementById(
            "avatarInput"
        );


    const avatarPreview =
        document.getElementById(
            "avatarPreview"
        );


    const removeAvatar =
        document.getElementById(
            "removeAvatar"
        );


    // ==========================
    // HELPERS
    // ==========================

    function getInitial(username) {

        return (
            username ||
            "U"
        )
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
                getInitial(
                    username
                );

        }

    }


    function formatDate(dateString) {

        if (!dateString) {
            return "Recently";
        }


        const date =
            new Date(
                dateString.replace(
                    " ",
                    "T"
                ) + "Z"
            );


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


    function goHome() {

        window.location.href =
            "dashboard.html";

    }


    // ==========================
    // RESIZE AVATAR
    // ==========================

    function processAvatar(file) {

        return new Promise(
            function (resolve, reject) {

                const reader =
                    new FileReader();


                reader.onload =
                    function (event) {

                        const image =
                            new Image();


                        image.onload =
                            function () {

                                const maxSize =
                                    512;


                                const largestSide =
                                    Math.max(
                                        image.width,
                                        image.height
                                    );


                                const scale =
                                    Math.min(
                                        1,
                                        maxSize /
                                        largestSide
                                    );


                                const canvas =
                                    document.createElement(
                                        "canvas"
                                    );


                                canvas.width =
                                    Math.max(
                                        1,
                                        Math.round(
                                            image.width *
                                            scale
                                        )
                                    );


                                canvas.height =
                                    Math.max(
                                        1,
                                        Math.round(
                                            image.height *
                                            scale
                                        )
                                    );


                                const context =
                                    canvas.getContext(
                                        "2d"
                                    );


                                context.drawImage(
                                    image,
                                    0,
                                    0,
                                    canvas.width,
                                    canvas.height
                                );


                                const result =
                                    canvas.toDataURL(
                                        "image/jpeg",
                                        0.82
                                    );


                                resolve(result);

                            };


                        image.onerror =
                            function () {

                                reject(
                                    new Error(
                                        "Could not read image."
                                    )
                                );

                            };


                        image.src =
                            event.target.result;

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

    }


    // ==========================
    // AVATAR INPUT
    // ==========================

    if (avatarInput) {

        avatarInput.addEventListener(
            "change",
            async function () {

                const file =
                    avatarInput.files &&
                    avatarInput.files[0];


                if (!file) {
                    return;
                }


                if (
                    !file.type.startsWith(
                        "image/"
                    )
                ) {

                    alert(
                        "Please select an image."
                    );

                    avatarInput.value =
                        "";

                    return;

                }


                try {

                    avatarInput.disabled =
                        true;


                    selectedAvatar =
                        await processAvatar(
                            file
                        );


                    setAvatar(
                        avatarPreview,
                        selectedAvatar,
                        currentUser.username
                    );


                } catch (error) {

                    console.error(
                        "Avatar processing error:",
                        error
                    );


                    alert(
                        "Could not process this image."
                    );


                } finally {

                    avatarInput.disabled =
                        false;

                }

            }
        );

    }


    // ==========================
    // REMOVE AVATAR
    // ==========================

    if (removeAvatar) {

        removeAvatar.addEventListener(
            "click",
            function () {

                selectedAvatar =
                    "";


                if (avatarInput) {

                    avatarInput.value =
                        "";

                }


                setAvatar(
                    avatarPreview,
                    "",
                    editUsername
                        ? editUsername.value
                        : currentUser.username
                );

            }
        );

    }


    // ==========================
    // PROFILE NAVIGATION
    // ==========================

    const profileNavigationLinks =
        document.querySelectorAll(
            ".sidebar nav a, .sidebar-bottom a"
        );

    profileNavigationLinks.forEach(
        function (link) {
            link.addEventListener(
                "click",
                function () {
                    link.classList.add("profile-nav-leaving");
                }
            );
        }
    );


    // ==========================
    // LOGOUT
    // ==========================

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
    // TOP PROFILE BUTTON
    // ==========================

    if (topProfileButton) {

        topProfileButton.addEventListener(
            "click",
            function () {

                if (isOwnProfile) {

                    window.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    });

                } else {

                    window.location.href =
                        "profile.html";

                }

            }
        );

    }


    // ==========================
    // CREATE POST
    // ==========================

    if (createPostButton) {

        createPostButton.addEventListener(
            "click",
            function () {

                goHome();

            }
        );

    }


    // ==========================
    // LOAD PROFILE
    // ==========================

    async function loadProfile() {

        try {

            const response =
                await fetch(
                    `/api/users/${profileUserId}/profile`
                );


            const data =
                await response.json();


            if (
                !response.ok ||
                !data.success
            ) {

                alert(
                    data.message ||
                    "Could not load profile."
                );

                goHome();

                return;

            }


            profileUser =
                data.user;


            // ==========================
            // PROFILE UI
            // ==========================

            const username =
                profileUser.username ||
                "User";


            const bio =
                profileUser.bio ||
                "Welcome to my Vexora profile.";


            const avatar =
                profileUser.avatar ||
                "";


            const initial =
                getInitial(
                    username
                );


            if (profileUsername) {

                profileUsername.textContent =
                    username;

            }


            if (profileTag) {

                profileTag.textContent =
                    "@" + username;

            }


            if (profileAvatar) {

                setAvatar(
                    profileAvatar,
                    avatar,
                    username
                );

            }


            // ==========================
            // TOPBAR
            // ==========================

            if (topUsername) {

                topUsername.textContent =
                    currentUser.username;

            }


            if (topAvatar) {

                setAvatar(
                    topAvatar,
                    currentUser.avatar ||
                    "",
                    currentUser.username
                );

            }


            // ==========================
            // BIO
            // ==========================

            if (profileBio) {

                profileBio.textContent =
                    bio;

            }


            // ==========================
            // STATS
            // ==========================

            if (postCount) {

                postCount.textContent =
                    data.stats.posts;

            }


            if (followerCount) {

                followerCount.textContent =
                    data.stats.followers;

            }


            if (followingCount) {

                followingCount.textContent =
                    data.stats.following;

            }


            // ==========================
            // OWN PROFILE
            // ==========================

            if (isOwnProfile) {

                currentUser.username =
                    profileUser.username;


                currentUser.bio =
                    profileUser.bio ||
                    "";


                currentUser.avatar =
                    profileUser.avatar ||
                    "";


                localStorage.setItem(
                    "vexoraUser",
                    JSON.stringify(
                        currentUser
                    )
                );


                selectedAvatar =
                    currentUser.avatar;


                originalAvatar =
                    currentUser.avatar;


                if (editProfileButton) {

                    editProfileButton.style.display =
                        "inline-flex";

                }


                if (editUsername) {

                    editUsername.value =
                        username;

                }


                if (editBio) {

                    editBio.value =
                        profileUser.bio ||
                        "";

                }

            } else {

                // ==========================
                // OTHER PROFILE
                // ==========================

                if (editProfileButton) {

                    editProfileButton.style.display =
                        "none";

                }


                if (profileModal) {

                    profileModal.classList.remove(
                        "active"
                    );

                }


                createFollowButton();

                await loadFollowStatus();

            }


        } catch (error) {

            console.error(
                "Could not load profile:",
                error
            );


            alert(
                "Could not connect to the Vexora server."
            );

        }

    }


    // ==========================
    // FOLLOW BUTTON
    // ==========================

    let followButton = null;


    function createFollowButton() {

        if (
            isOwnProfile ||
            !profileMainInfo
        ) {

            return;

        }


        followButton =
            document.createElement(
                "button"
            );


        followButton.type =
            "button";


        followButton.className =
            "edit-profile follow-profile-button";


        followButton.textContent =
            "Follow";


        profileMainInfo.appendChild(
            followButton
        );


        followButton.addEventListener(
            "click",
            async function () {

                if (!followButton) {
                    return;
                }


                followButton.disabled =
                    true;


                const oldText =
                    followButton.textContent;


                followButton.textContent =
                    "Loading...";


                try {

                    const response =
                        await fetch(
                            `/api/users/${profileUserId}/follow`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify({
                                        followerId:
                                            currentUser.id
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


                    followButton.textContent =
                        data.following
                            ? "Following"
                            : "Follow";


                    if (followerCount) {

                        followerCount.textContent =
                            data.followers;

                    }


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

    }


    // ==========================
    // CHECK FOLLOW STATUS
    // ==========================

    async function loadFollowStatus() {

        if (
            isOwnProfile ||
            !followButton
        ) {

            return;

        }


        try {

            const response =
                await fetch(
                    `/api/users?currentUserId=${currentUser.id}`
                );


            const data =
                await response.json();


            if (
                !response.ok ||
                !data.success
            ) {

                return;

            }


            const users =
                Array.isArray(
                    data.users
                )
                    ? data.users
                    : [];


            const target =
                users.find(
                    function (item) {

                        return Number(
                            item.id
                        ) ===
                        Number(
                            profileUserId
                        );

                    }
                );


            if (target) {

                followButton.textContent =
                    target.isFollowing
                        ? "Following"
                        : "Follow";

            }

        } catch (error) {

            console.error(
                "Could not check follow status:",
                error
            );

        }

    }


    // ==========================
    // LOAD PROFILE POSTS
    // ==========================

    async function loadProfilePosts() {

        const postsContainer =
            document.getElementById(
                "profilePosts"
            );


        if (!postsContainer) {
            return;
        }


        postsContainer.innerHTML =
            '<div class="no-posts">Loading posts...</div>';


        try {

            const response =
                await fetch(
                    `/api/posts?userId=${profileUserId}`
                );


            const data =
                await response.json();


            if (
                !response.ok ||
                !data.success
            ) {

                postsContainer.innerHTML =
                    '<div class="no-posts">Could not load posts.</div>';

                return;

            }


            const allPosts =
                Array.isArray(
                    data.posts
                )
                    ? data.posts
                    : [];


            const userPosts =
                allPosts.filter(
                    function (post) {

                        return Number(
                            post.user_id
                        ) ===
                        Number(
                            profileUserId
                        );

                    }
                );


            if (postCount) {

                postCount.textContent =
                    userPosts.length;

            }


            if (
                userPosts.length === 0
            ) {

                postsContainer.innerHTML =
                    isOwnProfile
                        ? '<div class="no-posts">You haven\'t posted anything yet.</div>'
                        : '<div class="no-posts">This user hasn\'t posted anything yet.</div>';

                return;

            }


            postsContainer.innerHTML =
                "";


            userPosts.forEach(
                function (post) {

                    const article =
                        createProfilePost(
                            post
                        );


                    postsContainer.appendChild(
                        article
                    );

                }
            );


        } catch (error) {

            console.error(
                "Could not load profile posts:",
                error
            );


            postsContainer.innerHTML =
                '<div class="no-posts">Could not connect to the Vexora server.</div>';

        }

    }


    // ==========================
    // CREATE PROFILE POST
    // ==========================

    function createProfilePost(post) {

        const article =
            document.createElement(
                "article"
            );


        article.className =
            "profile-post";


        article.dataset.postId =
            post.id;


        // HEADER

        const header =
            createElement(
                "div",
                "profile-post-header"
            );


        const avatar =
            createElement(
                "div",
                "profile-post-avatar"
            );


        setAvatar(
            avatar,
            post.avatar || "",
            post.username
        );


        const userInfo =
            createElement(
                "div",
                "profile-post-user"
            );


        const name =
            createElement(
                "strong",
                "",
                post.username
            );


        const time =
            createElement(
                "span",
                "",
                formatDate(
                    post.created_at
                )
            );


        userInfo.appendChild(
            name
        );

        userInfo.appendChild(
            time
        );


        header.appendChild(
            avatar
        );

        header.appendChild(
            userInfo
        );


        // CONTENT

        const content =
            createElement(
                "div",
                "profile-post-content",
                post.content
            );


        // STATS

        const stats =
            createElement(
                "div",
                "profile-post-stats",
                `♡ ${post.likes || 0} likes · ${post.comments || 0} comments`
            );


        // ACTIONS

        const actions =
            createElement(
                "div",
                "profile-post-actions"
            );


        const likeButton =
            createElement(
                "button",
                "profile-like-button"
            );


        likeButton.type =
            "button";


        updateProfileLikeButton(
            likeButton,
            post.liked
        );


        const commentButton =
            createElement(
                "button",
                "profile-comment-button",
                "💬 Comments"
            );


        commentButton.type =
            "button";

        const shareButton =
            createElement(
                "button",
                "profile-share-button",
                "↗ Share"
            );

        shareButton.type =
            "button";


        actions.appendChild(
            likeButton
        );

        actions.appendChild(
            commentButton
        );

        actions.appendChild(
            shareButton
        );

        const commentsPanel =
            createElement(
                "div",
                "profile-comments"
            );

        commentsPanel.hidden = true;

        const commentsList =
            createElement(
                "div",
                "profile-comments-list"
            );

        const commentComposer =
            createElement(
                "div",
                "profile-comment-composer"
            );

        const commentInput =
            document.createElement(
                "input"
            );

        commentInput.className = "profile-comment-input";
        commentInput.maxLength = 300;
        commentInput.placeholder = "Write a comment...";

        const sendComment =
            createElement(
                "button",
                "profile-send-comment",
                "Send"
            );

        sendComment.type = "button";
        commentComposer.appendChild(commentInput);
        commentComposer.appendChild(sendComment);
        commentsPanel.appendChild(commentsList);
        commentsPanel.appendChild(commentComposer);


        // DELETE

        if (isOwnProfile) {

            const deleteButton =
                createElement(
                    "button",
                    "profile-delete-button",
                    "Delete"
                );


            deleteButton.type =
                "button";


            actions.appendChild(
                deleteButton
            );


            deleteButton.addEventListener(
                "click",
                async function () {

                    const confirmed =
                        confirm(
                            "Do you want to delete this post?"
                        );


                    if (!confirmed) {
                        return;
                    }


                    deleteButton.disabled =
                        true;


                    deleteButton.textContent =
                        "Deleting...";


                    try {

                        const response =
                            await fetch(
                                `/api/posts/${post.id}`,
                                {
                                    method: "DELETE",

                                    headers: {
                                        "Content-Type":
                                            "application/json"
                                    },

                                    body:
                                        JSON.stringify({
                                            userId:
                                                currentUser.id
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


                            deleteButton.disabled =
                                false;


                            deleteButton.textContent =
                                "Delete";


                            return;

                        }


                        article.remove();


                        await loadProfile();


                        await loadProfilePosts();


                    } catch (error) {

                        console.error(
                            "Delete error:",
                            error
                        );


                        alert(
                            "Could not connect to the Vexora server."
                        );


                        deleteButton.disabled =
                            false;


                        deleteButton.textContent =
                            "Delete";

                    }

                }
            );

        }


        article.appendChild(
            header
        );

        article.appendChild(
            content
        );

        article.appendChild(
            stats
        );

        article.appendChild(
            actions
        );

        article.appendChild(
            commentsPanel
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
                                            currentUser.id
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


                    updateProfileLikeButton(
                        likeButton,
                        data.liked
                    );


                    stats.textContent =
                        `♡ ${data.likes} likes · ${post.comments || 0} comments`;


                } catch (error) {

                    console.error(
                        "Profile like error:",
                        error
                    );

                } finally {

                    likeButton.disabled =
                        false;

                }

            }
        );


        // ==========================
        // COMMENTS
        // ==========================

        async function loadProfileComments() {
            commentsPanel.hidden = false;
            commentsList.innerHTML = '<div class="profile-comments-loading">Loading comments...</div>';

            try {
                const response = await fetch(
                    `/api/posts/${post.id}/comments?userId=${encodeURIComponent(currentUser.id)}`
                );
                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(data.message || "Could not load comments.");
                }

                const comments = Array.isArray(data.comments) ? data.comments : [];
                commentsList.innerHTML = "";

                if (!comments.length) {
                    commentsList.innerHTML = '<div class="profile-comments-empty">No comments yet. Start the conversation.</div>';
                    return;
                }

                comments.forEach(function (comment) {
                    const item = createElement("article", "profile-comment");
                    const avatar = createElement("div", "profile-comment-avatar", getInitial(comment.username));
                    const body = createElement("div", "profile-comment-body");
                    const meta = createElement("div", "profile-comment-meta", `@${comment.username || "user"}`);
                    const text = createElement("p", "profile-comment-text", comment.content || "");

                    setAvatar(avatar, comment.avatar || "", comment.username);
                    body.appendChild(meta);
                    body.appendChild(text);
                    item.appendChild(avatar);
                    item.appendChild(body);
                    commentsList.appendChild(item);
                });
            } catch (error) {
                console.error("Could not load profile comments:", error);
                commentsList.innerHTML = '<div class="profile-comments-empty">Comments are temporarily unavailable.</div>';
            }
        }

        commentButton.addEventListener(
            "click",
            function () {
                if (commentsPanel.hidden) {
                    loadProfileComments();
                } else {
                    commentsPanel.hidden = true;
                }
            }
        );

        sendComment.addEventListener(
            "click",
            async function () {
                const content = commentInput.value.trim();

                if (!content) {
                    commentInput.focus();
                    return;
                }

                sendComment.disabled = true;

                try {
                    const response = await fetch(
                        `/api/posts/${post.id}/comments`,
                        {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                userId: currentUser.id,
                                content: content
                            })
                        }
                    );
                    const data = await response.json();

                    if (!response.ok || !data.success) {
                        throw new Error(data.message || "Could not add comment.");
                    }

                    commentInput.value = "";
                    post.comments = Number(post.comments || 0) + 1;
                    stats.textContent = `♡ ${post.likes || 0} likes · ${post.comments} comments`;
                    await loadProfileComments();
                } catch (error) {
                    console.error("Profile comment error:", error);
                } finally {
                    sendComment.disabled = false;
                }
            }
        );

        commentInput.addEventListener(
            "keydown",
            function (event) {
                if (event.key === "Enter") {
                    event.preventDefault();
                    sendComment.click();
                }
            }
        );

        shareButton.addEventListener(
            "click",
            async function () {
                const shareUrl = `${window.location.origin}/dashboard.html?postId=${encodeURIComponent(post.id)}`;
                const originalText = shareButton.textContent;

                try {
                    if (navigator.share) {
                        await navigator.share({ title: "Vexora post", url: shareUrl });
                    } else {
                        await navigator.clipboard.writeText(shareUrl);
                    }

                    shareButton.textContent = "✓ Copied";
                    window.setTimeout(function () {
                        shareButton.textContent = originalText;
                    }, 1400);
                } catch (error) {
                    console.error("Profile share error:", error);
                }
            }
        );

        commentButton.addEventListener(
            "click",
            async function () {

                return;

                try {

                    const response =
                        await fetch(
                            `/api/posts/${post.id}/comments`
                        );


                    const data =
                        await response.json();


                    if (
                        !response.ok ||
                        !data.success
                    ) {

                        return;

                    }


                    if (
                        !data.comments ||
                        data.comments.length === 0
                    ) {

                        alert(
                            "No comments yet."
                        );

                        return;

                    }


                    const commentsText =
                        data.comments
                            .map(
                                function (comment) {

                                    return (
                                        "@" +
                                        comment.username +
                                        ": " +
                                        comment.content
                                    );

                                }
                            )
                            .join("\n");


                    alert(
                        commentsText
                    );


                } catch (error) {

                    console.error(
                        "Could not load comments:",
                        error
                    );

                }

            }
        );


        // ==========================
        // OPEN POST USER PROFILE
        // ==========================

        avatar.addEventListener(
            "click",
            function () {

                if (
                    Number(post.user_id) ===
                    Number(currentUser.id)
                ) {

                    window.location.href =
                        "profile.html";

                } else {

                    window.location.href =
                        `profile.html?userId=${post.user_id}`;

                }

            }
        );


        name.addEventListener(
            "click",
            function () {

                if (
                    Number(post.user_id) ===
                    Number(currentUser.id)
                ) {

                    window.location.href =
                        "profile.html";

                } else {

                    window.location.href =
                        `profile.html?userId=${post.user_id}`;

                }

            }
        );


        return article;

    }


    // ==========================
    // PROFILE LIKE BUTTON
    // ==========================

    function updateProfileLikeButton(
        button,
        liked
    ) {

        button.innerHTML =
            liked
                ? "♥ Liked"
                : "♡ Like";


        button.classList.toggle(
            "liked",
            Boolean(liked)
        );

    }


    // ==========================
    // EDIT PROFILE
    // ==========================

    if (
        editProfileButton &&
        profileModal &&
        isOwnProfile
    ) {

        editProfileButton.addEventListener(
            "click",
            function () {

                if (editUsername) {

                    editUsername.value =
                        currentUser.username ||
                        "";

                }


                if (editBio) {

                    editBio.value =
                        currentUser.bio ||
                        "";

                }


                selectedAvatar =
                    currentUser.avatar ||
                    "";


                originalAvatar =
                    currentUser.avatar ||
                    "";


                if (avatarInput) {

                    avatarInput.value =
                        "";

                }


                setAvatar(
                    avatarPreview,
                    selectedAvatar,
                    currentUser.username
                );


                profileModal.classList.add(
                    "active"
                );

            }
        );

    }


    // ==========================
    // CLOSE PROFILE MODAL
    // ==========================

    if (
        closeProfileModal &&
        profileModal
    ) {

        closeProfileModal.addEventListener(
            "click",
            function () {

                selectedAvatar =
                    originalAvatar;


                profileModal.classList.remove(
                    "active"
                );

            }
        );

    }


    if (profileModal) {

        profileModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    profileModal
                ) {

                    selectedAvatar =
                        originalAvatar;


                    profileModal.classList.remove(
                        "active"
                    );

                }

            }
        );

    }


    // ==========================
    // ESC CLOSE
    // ==========================

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape" &&
                profileModal &&
                profileModal.classList.contains(
                    "active"
                )
            ) {

                selectedAvatar =
                    originalAvatar;


                profileModal.classList.remove(
                    "active"
                );

            }

        }
    );


    // ==========================
    // SAVE PROFILE
    // ==========================

    if (
        saveProfile &&
        isOwnProfile
    ) {

        saveProfile.addEventListener(
            "click",
            async function () {

                const newUsername =
                    editUsername
                        ? editUsername.value.trim()
                        : "";


                const newBio =
                    editBio
                        ? editBio.value.trim()
                        : "";


                if (!newUsername) {

                    alert(
                        "Username cannot be empty."
                    );

                    return;

                }


                if (
                    newUsername.length >
                    30
                ) {

                    alert(
                        "Username cannot be longer than 30 characters."
                    );

                    return;

                }


                if (
                    newBio.length >
                    160
                ) {

                    alert(
                        "Bio cannot be longer than 160 characters."
                    );

                    return;

                }


                saveProfile.disabled =
                    true;


                saveProfile.textContent =
                    "Saving...";


                try {

                    const response =
                        await fetch(
                            `/api/users/${currentUser.id}/profile`,
                            {
                                method: "PUT",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify({
                                        username:
                                            newUsername,

                                        bio:
                                            newBio,

                                        avatar:
                                            selectedAvatar
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
                            "Could not update profile."
                        );

                        return;

                    }


                    currentUser.username =
                        data.user.username;


                    currentUser.bio =
                        data.user.bio ||
                        "";


                    currentUser.avatar =
                        data.user.avatar ||
                        "";


                    localStorage.setItem(
                        "vexoraUser",
                        JSON.stringify(
                            currentUser
                        )
                    );


                    profileUser =
                        data.user;


                    selectedAvatar =
                        currentUser.avatar;


                    originalAvatar =
                        currentUser.avatar;


                    if (profileUsername) {

                        profileUsername.textContent =
                            data.user.username;

                    }


                    if (profileTag) {

                        profileTag.textContent =
                            "@" +
                            data.user.username;

                    }


                    if (profileAvatar) {

                        setAvatar(
                            profileAvatar,
                            data.user.avatar ||
                            "",
                            data.user.username
                        );

                    }


                    if (topUsername) {

                        topUsername.textContent =
                            data.user.username;

                    }


                    if (topAvatar) {

                        setAvatar(
                            topAvatar,
                            data.user.avatar ||
                            "",
                            data.user.username
                        );

                    }


                    if (avatarPreview) {

                        setAvatar(
                            avatarPreview,
                            data.user.avatar ||
                            "",
                            data.user.username
                        );

                    }


                    if (profileBio) {

                        profileBio.textContent =
                            data.user.bio ||
                            "Welcome to my Vexora profile.";

                    }


                    profileModal.classList.remove(
                        "active"
                    );


                    await loadProfilePosts();


                    alert(
                        "Profile updated successfully!"
                    );


                } catch (error) {

                    console.error(
                        "Profile update error:",
                        error
                    );


                    alert(
                        "Could not connect to the Vexora server."
                    );

                } finally {

                    saveProfile.disabled =
                        false;


                    saveProfile.textContent =
                        "Save";

                }

            }
        );

    }


    // ==========================
    // LOAD EVERYTHING
    // ==========================

    const shareProfileButton = document.getElementById("shareProfileButton");
    if (shareProfileButton) {
        shareProfileButton.addEventListener("click", async function () {
            const link = new URL("profile.html", window.location.href);
            link.searchParams.set("userId", String(profileUserId));
            try {
                if (navigator.share) {
                    await navigator.share({ title: `Vexora profile`, text: `Follow ${profileTag?.textContent || "this profile"} on Vexora`, url: link.href });
                } else {
                    await navigator.clipboard.writeText(link.href);
                    const oldText = shareProfileButton.textContent;
                    shareProfileButton.textContent = "✓ Copied";
                    window.setTimeout(() => { shareProfileButton.textContent = oldText; }, 1500);
                }
            } catch (shareError) {
                if (shareError.name !== "AbortError") console.error("Profile share error:", shareError);
            }
        });
    }

    await loadProfile();

    await loadProfilePosts();

});
