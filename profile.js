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

    const homeLinks =
        document.querySelectorAll(
            'a[href="dashboard.html"]'
        );


    homeLinks.forEach(
        function (link) {

            link.addEventListener(
                "click",
                function () {

                    window.location.href =
                        "dashboard.html";

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


        actions.appendChild(
            likeButton
        );

        actions.appendChild(
            commentButton
        );


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

        commentButton.addEventListener(
            "click",
            async function () {

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

    await loadProfile();

    await loadProfilePosts();

});
