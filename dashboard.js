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
        !user.id ||
        !user.username
    ) {

        localStorage.removeItem(
            "vexoraUser"
        );

        window.location.href =
            "index.html";

        return;

    }


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


    const initial =
        getInitial(
            user.username
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


            // Refresh avatar from server

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


                    // OPEN PROFILE

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


                    // FOLLOW / UNFOLLOW

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
    // CREATE POST MODAL
    // ==========================

    const postModal =
        document.getElementById(
            "postModal"
        );


    const openPostModal =
        document.getElementById(
            "openPostModal"
        );


    const openPostModal2 =
        document.getElementById(
            "openPostModal2"
        );


    const openPostModal3 =
        document.getElementById(
            "openPostModal3"
        );


    const openPhotoModal =
        document.getElementById(
            "openPhotoModal"
        );


    const closePostModal =
        document.getElementById(
            "closePostModal"
        );


    const postText =
        document.getElementById(
            "postText"
        );


    const characterCount =
        document.getElementById(
            "characterCount"
        );


    const publishPost =
        document.getElementById(
            "publishPost"
        );


    function openCreatePost() {

        if (!postModal) {
            return;
        }


        postModal.classList.add(
            "active"
        );


        if (postText) {

            postText.value =
                "";


            if (characterCount) {

                characterCount.textContent =
                    "0 / 500";

            }


            setTimeout(
                function () {

                    postText.focus();

                },
                50
            );

        }

    }


    if (openPostModal) {

        openPostModal.addEventListener(
            "click",
            openCreatePost
        );

    }


    if (openPostModal2) {

        openPostModal2.addEventListener(
            "click",
            openCreatePost
        );

    }


    if (openPostModal3) {

        openPostModal3.addEventListener(
            "click",
            openCreatePost
        );

    }


    if (openPhotoModal) {

        openPhotoModal.addEventListener(
            "click",
            openCreatePost
        );

    }


    function closeCreatePost() {

        if (postModal) {

            postModal.classList.remove(
                "active"
            );

        }

    }


    if (closePostModal) {

        closePostModal.addEventListener(
            "click",
            closeCreatePost
        );

    }


    if (postModal) {

        postModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    postModal
                ) {

                    closeCreatePost();

                }

            }
        );

    }


    // ==========================
    // ESC
    // ==========================

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape" &&
                postModal &&
                postModal.classList.contains(
                    "active"
                )
            ) {

                closeCreatePost();

            }

        }
    );


    // ==========================
    // CHARACTER COUNT
    // ==========================

    if (
        postText &&
        characterCount
    ) {

        postText.addEventListener(
            "input",
            function () {

                characterCount.textContent =
                    `${postText.value.length} / 500`;

            }
        );

    }


    // ==========================
    // PUBLISH POST
    // ==========================

    if (
        publishPost &&
        postText
    ) {

        publishPost.addEventListener(
            "click",
            async function () {

                const text =
                    postText.value.trim();


                if (!text) {

                    alert(
                        "Write something first."
                    );


                    postText.focus();


                    return;

                }


                if (text.length > 500) {

                    alert(
                        "Post cannot be longer than 500 characters."
                    );


                    return;

                }


                publishPost.disabled =
                    true;


                publishPost.textContent =
                    "Publishing...";


                try {

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
                            "Could not publish post."
                        );


                        return;

                    }


                    postText.value =
                        "";


                    if (characterCount) {

                        characterCount.textContent =
                            "0 / 500";

                    }


                    closeCreatePost();


                    await loadPosts();


                    await loadUserStats();


                } catch (error) {

                    console.error(
                        "Post error:",
                        error
                    );


                    alert(
                        "Could not connect to the Vexora server."
                    );

                } finally {

                    publishPost.disabled =
                        false;


                    publishPost.textContent =
                        "Publish";

                }

            }
        );

    }


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


            // REMOVE OLD REAL POSTS

            feed.querySelectorAll(
                ".real-post"
            ).forEach(function (post) {

                post.remove();

            });


            // REMOVE DEMO POSTS

            feed.querySelectorAll(
                ".demo-post"
            ).forEach(function (post) {

                post.remove();

            });


            // REMOVE EMPTY MESSAGE

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


        // ==========================
        // OPEN USER PROFILE
        // ==========================

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
        // POST TEXT
        // ==========================

        const content =
            createElement(
                "div",
                "post-text",
                post.content || ""
            );


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
                "button"
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


                    // ==========================
                    // COMMENT AVATAR
                    // ==========================

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


                    // ==========================
                    // COMMENT CONTENT
                    // ==========================

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


                    topRow.appendChild(
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
            async function () {

                const shareText =
                    `@${post.username}: ${post.content}`;


                try {

                    if (
                        navigator.share
                    ) {

                        await navigator.share({
                            title:
                                "Vexora post",

                            text:
                                shareText
                        });

                    } else if (
                        navigator.clipboard
                    ) {

                        await navigator.clipboard.writeText(
                            shareText
                        );


                        alert(
                            "Post copied to clipboard."
                        );

                    } else {

                        alert(
                            shareText
                        );

                    }

                } catch (error) {

                    if (
                        error.name !==
                        "AbortError"
                    ) {

                        console.error(
                            "Share error:",
                            error
                        );

                    }

                }

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
    // START
    // ==========================

    loadUserStats();

    loadSuggestions();

    loadPosts();

});