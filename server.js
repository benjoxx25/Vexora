const express = require("express");
const path = require("path");
const db = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "5mb" }));
app.use(express.static(__dirname));


// ==========================
// POČETNA STRANICA
// ==========================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});


// ==========================
// REGISTRACIJA
// ==========================

app.post("/api/register", (req, res) => {

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Please fill in all fields."
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 6 characters."
        });
    }

    try {

        const existingUser = db.prepare(`
            SELECT id
            FROM users
            WHERE username = ? OR email = ?
        `).get(username.trim(), email.trim());

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Username or email already exists."
            });
        }

        const result = db.prepare(`
            INSERT INTO users (
                username,
                email,
                password,
                bio,
                avatar
            )
            VALUES (?, ?, ?, ?, ?)
        `).run(
            username.trim(),
            email.trim(),
            password,
            "",
            ""
        );

        res.json({
            success: true,
            message: "Account created successfully!",
            userId: result.lastInsertRowid,
            username: username.trim()
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Something went wrong."
        });

    }

});


// ==========================
// LOGIN
// ==========================

app.post("/api/login", (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Please enter your email and password."
        });
    }

    try {

        const user = db.prepare(`
            SELECT
                id,
                username,
                email,
                password,
                bio,
                avatar
            FROM users
            WHERE email = ?
        `).get(email.trim());

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Incorrect email or password."
            });
        }

        if (user.password !== password) {
            return res.status(401).json({
                success: false,
                message: "Incorrect email or password."
            });
        }

        res.json({
            success: true,
            message: "Login successful.",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                bio: user.bio || "",
                avatar: user.avatar || ""
            }
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Something went wrong."
        });

    }

});


// ==========================
// KORISNICI
// ==========================

app.get("/api/users", (req, res) => {

    const username = req.query.username;
    const currentUserId = Number(req.query.currentUserId);


    // ==========================
    // JEDAN KORISNIK
    // ==========================

    if (username) {

        try {

            const user = db.prepare(`
                SELECT
                    id,
                    username,
                    bio,
                    avatar
                FROM users
                WHERE username = ?
            `).get(username);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found."
                });
            }

            return res.json({
                success: true,
                user: user
            });

        } catch (error) {

            console.error(error);

            return res.status(500).json({
                success: false,
                message: "Could not find user."
            });

        }

    }


    // ==========================
    // LISTA KORISNIKA
    // ==========================

    if (!currentUserId) {
        return res.status(400).json({
            success: false,
            message: "Current user ID is required."
        });
    }

    try {

        const users = db.prepare(`
            SELECT
                users.id,
                users.username,
                users.bio,
                users.avatar,

                (
                    SELECT COUNT(*)
                    FROM follows
                    WHERE follows.following_id = users.id
                ) AS followers,

                EXISTS (
                    SELECT 1
                    FROM follows
                    WHERE follows.follower_id = ?
                    AND follows.following_id = users.id
                ) AS isFollowing

            FROM users

            WHERE users.id != ?

            ORDER BY users.id DESC

            LIMIT 20
        `).all(
            currentUserId,
            currentUserId
        );

        res.json({
            success: true,
            users: users
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not load users."
        });

    }

});


// ==========================
// PROFIL KORISNIKA
// ==========================

app.get("/api/users/:userId/profile", (req, res) => {

    const userId = Number(req.params.userId);

    if (!userId) {
        return res.status(400).json({
            success: false,
            message: "Invalid user."
        });
    }

    try {

        const user = db.prepare(`
            SELECT
                id,
                username,
                email,
                bio,
                avatar,
                created_at
            FROM users
            WHERE id = ?
        `).get(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }


        const posts = db.prepare(`
            SELECT COUNT(*) AS count
            FROM posts
            WHERE user_id = ?
        `).get(userId);


        const followers = db.prepare(`
            SELECT COUNT(*) AS count
            FROM follows
            WHERE following_id = ?
        `).get(userId);


        const following = db.prepare(`
            SELECT COUNT(*) AS count
            FROM follows
            WHERE follower_id = ?
        `).get(userId);


        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                bio: user.bio || "",
                avatar: user.avatar || "",
                created_at: user.created_at
            },
            stats: {
                posts: posts.count,
                followers: followers.count,
                following: following.count
            }
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not load profile."
        });

    }

});


// ==========================
// AŽURIRANJE PROFILA
// ==========================

app.put("/api/users/:userId/profile", (req, res) => {

    const userId = Number(req.params.userId);

    const username =
        typeof req.body.username === "string"
            ? req.body.username.trim()
            : "";

    const bio =
        typeof req.body.bio === "string"
            ? req.body.bio.trim()
            : "";

    const avatar =
        typeof req.body.avatar === "string"
            ? req.body.avatar.trim()
            : "";


    if (!userId) {
        return res.status(400).json({
            success: false,
            message: "Invalid user."
        });
    }


    if (!username) {
        return res.status(400).json({
            success: false,
            message: "Username cannot be empty."
        });
    }


    if (username.length > 30) {
        return res.status(400).json({
            success: false,
            message: "Username cannot be longer than 30 characters."
        });
    }


    if (bio.length > 160) {
        return res.status(400).json({
            success: false,
            message: "Bio cannot be longer than 160 characters."
        });
    }


    if (
        avatar &&
        !avatar.startsWith("data:image/")
    ) {
        return res.status(400).json({
            success: false,
            message: "Invalid profile picture."
        });
    }


    if (avatar.length > 4000000) {
        return res.status(400).json({
            success: false,
            message: "Profile picture is too large."
        });
    }


    try {

        const existingUser = db.prepare(`
            SELECT id
            FROM users
            WHERE id = ?
        `).get(userId);


        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }


        const usernameTaken = db.prepare(`
            SELECT id
            FROM users
            WHERE username = ?
            AND id != ?
        `).get(
            username,
            userId
        );


        if (usernameTaken) {
            return res.status(400).json({
                success: false,
                message: "That username is already taken."
            });
        }


        db.prepare(`
            UPDATE users
            SET
                username = ?,
                bio = ?,
                avatar = ?
            WHERE id = ?
        `).run(
            username,
            bio,
            avatar,
            userId
        );


        const updatedUser = db.prepare(`
            SELECT
                id,
                username,
                email,
                bio,
                avatar
            FROM users
            WHERE id = ?
        `).get(userId);


        res.json({
            success: true,
            message: "Profile updated successfully.",
            user: updatedUser
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not update profile."
        });

    }

});


// ==========================
// KREIRANJE OBJAVE
// ==========================

app.post("/api/posts", (req, res) => {

    const { userId, content } = req.body;

    if (!userId || !content || content.trim() === "") {
        return res.status(400).json({
            success: false,
            message: "Post cannot be empty."
        });
    }

    const cleanContent = content.trim();

    if (cleanContent.length > 500) {
        return res.status(400).json({
            success: false,
            message: "Post cannot be longer than 500 characters."
        });
    }

    try {

        const user = db.prepare(`
            SELECT id
            FROM users
            WHERE id = ?
        `).get(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }


        const result = db.prepare(`
            INSERT INTO posts (
                user_id,
                content
            )
            VALUES (?, ?)
        `).run(
            userId,
            cleanContent
        );


        res.json({
            success: true,
            message: "Post created successfully.",
            postId: result.lastInsertRowid
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not create post."
        });

    }

});


// ==========================
// DOHVAT OBJAVA
// ==========================

app.get("/api/posts", (req, res) => {

    const userId = Number(req.query.userId);

    try {

        const posts = db.prepare(`
            SELECT
                posts.id,
                posts.content,
                posts.created_at,
                users.id AS user_id,
                users.username,
                users.avatar,

                COUNT(DISTINCT likes.id) AS likes,

                COUNT(DISTINCT comments.id) AS comments,

                EXISTS (
                    SELECT 1
                    FROM likes AS user_likes
                    WHERE user_likes.post_id = posts.id
                    AND user_likes.user_id = ?
                ) AS liked

            FROM posts

            JOIN users
                ON posts.user_id = users.id

            LEFT JOIN likes
                ON posts.id = likes.post_id

            LEFT JOIN comments
                ON posts.id = comments.post_id

            GROUP BY
                posts.id,
                posts.content,
                posts.created_at,
                users.id,
                users.username,
                users.avatar

            ORDER BY posts.id DESC

        `).all(userId || 0);


        res.json({
            success: true,
            posts: posts
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not load posts."
        });

    }

});


// ==========================
// LIKE / UNLIKE OBJAVE
// ==========================

app.post("/api/posts/:postId/like", (req, res) => {

    const postId = Number(req.params.postId);
    const { userId } = req.body;

    if (!postId || !userId) {
        return res.status(400).json({
            success: false,
            message: "Missing post or user."
        });
    }

    try {

        const post = db.prepare(`
            SELECT id
            FROM posts
            WHERE id = ?
        `).get(postId);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found."
            });
        }


        const user = db.prepare(`
            SELECT id
            FROM users
            WHERE id = ?
        `).get(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }


        const existingLike = db.prepare(`
            SELECT id
            FROM likes
            WHERE user_id = ?
            AND post_id = ?
        `).get(
            userId,
            postId
        );


        if (existingLike) {

            db.prepare(`
                DELETE FROM likes
                WHERE user_id = ?
                AND post_id = ?
            `).run(
                userId,
                postId
            );

        } else {

            db.prepare(`
                INSERT INTO likes (
                    user_id,
                    post_id
                )
                VALUES (?, ?)
            `).run(
                userId,
                postId
            );

        }


        const result = db.prepare(`
            SELECT COUNT(*) AS count
            FROM likes
            WHERE post_id = ?
        `).get(postId);


        res.json({
            success: true,
            liked: !existingLike,
            likes: result.count
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not update like."
        });

    }

});


// ==========================
// BRISANJE OBJAVE
// ==========================

app.delete("/api/posts/:postId", (req, res) => {

    const postId = Number(req.params.postId);
    const userId = Number(req.body.userId);

    if (!postId || !userId) {
        return res.status(400).json({
            success: false,
            message: "Missing post or user."
        });
    }

    try {

        const post = db.prepare(`
            SELECT
                id,
                user_id
            FROM posts
            WHERE id = ?
        `).get(postId);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found."
            });
        }


        if (Number(post.user_id) !== Number(userId)) {
            return res.status(403).json({
                success: false,
                message: "You can only delete your own posts."
            });
        }


        const deletePost = db.transaction(() => {

            db.prepare(`
                DELETE FROM likes
                WHERE post_id = ?
            `).run(postId);


            db.prepare(`
                DELETE FROM comment_likes
                WHERE comment_id IN (
                    SELECT id
                    FROM comments
                    WHERE post_id = ?
                )
            `).run(postId);


            db.prepare(`
                DELETE FROM comments
                WHERE post_id = ?
            `).run(postId);


            db.prepare(`
                DELETE FROM posts
                WHERE id = ?
            `).run(postId);

        });


        deletePost();


        res.json({
            success: true,
            message: "Post deleted successfully."
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not delete post."
        });

    }

});


// ==========================
// KOMENTARI
// ==========================

app.get("/api/posts/:postId/comments", (req, res) => {

    const postId = Number(req.params.postId);

    if (!postId) {
        return res.status(400).json({
            success: false,
            message: "Invalid post."
        });
    }

    try {

        const comments = db.prepare(`
            SELECT
                comments.id,
                comments.user_id,
                comments.content,
                comments.created_at,
                users.username,
                users.avatar,

                COUNT(DISTINCT comment_likes.id) AS likes,

                EXISTS (
                    SELECT 1
                    FROM comment_likes AS user_comment_likes
                    WHERE user_comment_likes.comment_id = comments.id
                    AND user_comment_likes.user_id = ?
                ) AS liked

            FROM comments

            JOIN users
                ON comments.user_id = users.id

            LEFT JOIN comment_likes
                ON comments.id = comment_likes.comment_id

            WHERE comments.post_id = ?

            GROUP BY
                comments.id,
                comments.user_id,
                comments.content,
                comments.created_at,
                users.username,
                users.avatar

            ORDER BY comments.id ASC

        `).all(
            Number(req.query.userId) || 0,
            postId
        );


        res.json({
            success: true,
            comments: comments
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not load comments."
        });

    }

});


app.post("/api/posts/:postId/comments", (req, res) => {

    const postId = Number(req.params.postId);
    const { userId, content } = req.body;

    if (
        !postId ||
        !userId ||
        !content ||
        content.trim() === ""
    ) {
        return res.status(400).json({
            success: false,
            message: "Comment cannot be empty."
        });
    }

    const cleanContent = content.trim();

    if (cleanContent.length > 300) {
        return res.status(400).json({
            success: false,
            message: "Comment cannot be longer than 300 characters."
        });
    }

    try {

        const post = db.prepare(`
            SELECT id
            FROM posts
            WHERE id = ?
        `).get(postId);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found."
            });
        }


        const user = db.prepare(`
            SELECT id
            FROM users
            WHERE id = ?
        `).get(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }


        const result = db.prepare(`
            INSERT INTO comments (
                user_id,
                post_id,
                content
            )
            VALUES (?, ?, ?)
        `).run(
            userId,
            postId,
            cleanContent
        );


        const comment = db.prepare(`
            SELECT
                comments.id,
                comments.user_id,
                comments.content,
                comments.created_at,
                users.username,
                users.avatar,

                0 AS likes,
                0 AS liked

            FROM comments

            JOIN users
                ON comments.user_id = users.id

            WHERE comments.id = ?

        `).get(result.lastInsertRowid);


        res.json({
            success: true,
            comment: comment
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not create comment."
        });

    }

});


// ==========================
// LIKE / UNLIKE KOMENTARA
// ==========================

app.post("/api/comments/:commentId/like", (req, res) => {

    const commentId = Number(req.params.commentId);
    const { userId } = req.body;

    if (!commentId || !userId) {
        return res.status(400).json({
            success: false,
            message: "Missing comment or user."
        });
    }

    try {

        const comment = db.prepare(`
            SELECT
                id,
                post_id
            FROM comments
            WHERE id = ?
        `).get(commentId);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found."
            });
        }


        const user = db.prepare(`
            SELECT id
            FROM users
            WHERE id = ?
        `).get(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }


        const existingLike = db.prepare(`
            SELECT id
            FROM comment_likes
            WHERE user_id = ?
            AND comment_id = ?
        `).get(
            userId,
            commentId
        );


        if (existingLike) {

            db.prepare(`
                DELETE FROM comment_likes
                WHERE user_id = ?
                AND comment_id = ?
            `).run(
                userId,
                commentId
            );

        } else {

            db.prepare(`
                INSERT INTO comment_likes (
                    user_id,
                    comment_id
                )
                VALUES (?, ?)
            `).run(
                userId,
                commentId
            );

        }


        const result = db.prepare(`
            SELECT COUNT(*) AS count
            FROM comment_likes
            WHERE comment_id = ?
        `).get(commentId);


        res.json({
            success: true,
            liked: !existingLike,
            likes: result.count
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not update comment like."
        });

    }

});


// ==========================
// FOLLOW / UNFOLLOW
// ==========================

app.post("/api/users/:userId/follow", (req, res) => {

    const followingId =
        Number(req.params.userId);

    const followerId =
        Number(req.body.followerId);


    if (!followingId || !followerId) {
        return res.status(400).json({
            success: false,
            message: "Missing user information."
        });
    }


    if (followingId === followerId) {
        return res.status(400).json({
            success: false,
            message: "You cannot follow yourself."
        });
    }


    try {

        const targetUser = db.prepare(`
            SELECT id
            FROM users
            WHERE id = ?
        `).get(followingId);


        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }


        const followerUser = db.prepare(`
            SELECT id
            FROM users
            WHERE id = ?
        `).get(followerId);


        if (!followerUser) {
            return res.status(404).json({
                success: false,
                message: "Follower user not found."
            });
        }


        const existingFollow = db.prepare(`
            SELECT id
            FROM follows
            WHERE follower_id = ?
            AND following_id = ?
        `).get(
            followerId,
            followingId
        );


        if (existingFollow) {

            db.prepare(`
                DELETE FROM follows
                WHERE follower_id = ?
                AND following_id = ?
            `).run(
                followerId,
                followingId
            );

        } else {

            db.prepare(`
                INSERT INTO follows (
                    follower_id,
                    following_id
                )
                VALUES (?, ?)
            `).run(
                followerId,
                followingId
            );

        }


        const followers = db.prepare(`
            SELECT COUNT(*) AS count
            FROM follows
            WHERE following_id = ?
        `).get(followingId);


        const following = db.prepare(`
            SELECT COUNT(*) AS count
            FROM follows
            WHERE follower_id = ?
        `).get(followingId);


        res.json({
            success: true,
            following: !existingFollow,
            followers: followers.count,
            followingCount: following.count
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not update follow."
        });

    }

});


// ==========================
// STATISTIKA KORISNIKA
// ==========================

app.get("/api/users/:userId/stats", (req, res) => {

    const userId =
        Number(req.params.userId);


    if (!userId) {
        return res.status(400).json({
            success: false,
            message: "Invalid user."
        });
    }


    try {

        const user = db.prepare(`
            SELECT
                id,
                username,
                bio,
                avatar
            FROM users
            WHERE id = ?
        `).get(userId);


        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }


        const followers = db.prepare(`
            SELECT COUNT(*) AS count
            FROM follows
            WHERE following_id = ?
        `).get(userId);


        const following = db.prepare(`
            SELECT COUNT(*) AS count
            FROM follows
            WHERE follower_id = ?
        `).get(userId);


        const posts = db.prepare(`
            SELECT COUNT(*) AS count
            FROM posts
            WHERE user_id = ?
        `).get(userId);


        res.json({
            success: true,
            user: user,
            followers: followers.count,
            following: following.count,
            posts: posts.count
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not load user statistics."
        });

    }

});


// ======================================================
// ========================== DM SYSTEM ==================
// ======================================================


// ==========================
// UNREAD PORUKE
// ==========================

app.get("/api/messages/unread-count", (req, res) => {

    const userId = Number(req.query.userId);

    if (!userId) {
        return res.status(400).json({
            success: false,
            message: "Invalid user."
        });
    }

    try {

        const user = db.prepare(`
            SELECT id
            FROM users
            WHERE id = ?
        `).get(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const result = db.prepare(`
            SELECT COUNT(*) AS count
            FROM messages
            WHERE sender_id != ?
            AND is_read = 0
            AND conversation_id IN (
                SELECT id
                FROM conversations
                WHERE user1_id = ?
                OR user2_id = ?
            )
        `).get(
            userId,
            userId,
            userId
        );

        res.json({
            success: true,
            unread: result.count
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not load unread messages."
        });

    }

});


// ==========================
// KREIRANJE / DOHVAT RAZGOVORA
// ==========================

app.post("/api/messages/conversations", (req, res) => {

    const userId = Number(req.body.userId);
    const otherUserId = Number(req.body.otherUserId);

    if (!userId || !otherUserId) {
        return res.status(400).json({
            success: false,
            message: "Missing user information."
        });
    }

    if (userId === otherUserId) {
        return res.status(400).json({
            success: false,
            message: "You cannot message yourself."
        });
    }

    try {

        const user = db.prepare(`
            SELECT id, username, avatar
            FROM users
            WHERE id = ?
        `).get(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }


        const otherUser = db.prepare(`
            SELECT id, username, avatar
            FROM users
            WHERE id = ?
        `).get(otherUserId);

        if (!otherUser) {
            return res.status(404).json({
                success: false,
                message: "Other user not found."
            });
        }


        const user1 = Math.min(userId, otherUserId);
        const user2 = Math.max(userId, otherUserId);


        let conversation = db.prepare(`
            SELECT id
            FROM conversations
            WHERE user1_id = ?
            AND user2_id = ?
        `).get(
            user1,
            user2
        );


        if (!conversation) {

            const result = db.prepare(`
                INSERT INTO conversations (
                    user1_id,
                    user2_id
                )
                VALUES (?, ?)
            `).run(
                user1,
                user2
            );

            conversation = {
                id: result.lastInsertRowid
            };

        }


        res.json({
            success: true,
            conversation: {
                id: conversation.id,
                otherUser: otherUser
            }
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not create conversation."
        });

    }

});


// ==========================
// LISTA RAZGOVORA
// ==========================

app.get("/api/messages/conversations", (req, res) => {

    const userId = Number(req.query.userId);

    if (!userId) {
        return res.status(400).json({
            success: false,
            message: "Invalid user."
        });
    }

    try {

        const user = db.prepare(`
            SELECT id
            FROM users
            WHERE id = ?
        `).get(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }


        const conversations = db.prepare(`
            SELECT
                conversations.id,

                CASE
                    WHEN conversations.user1_id = ?
                    THEN conversations.user2_id
                    ELSE conversations.user1_id
                END AS other_user_id,

                other_user.username AS other_username,
                other_user.avatar AS other_avatar,

                last_message.content AS last_message,
                last_message.created_at AS last_message_time,

                (
                    SELECT COUNT(*)
                    FROM messages AS unread_messages
                    WHERE unread_messages.conversation_id = conversations.id
                    AND unread_messages.sender_id != ?
                    AND unread_messages.is_read = 0
                ) AS unread_count

            FROM conversations

            JOIN users AS other_user
                ON other_user.id =
                    CASE
                        WHEN conversations.user1_id = ?
                        THEN conversations.user2_id
                        ELSE conversations.user1_id
                    END

            LEFT JOIN messages AS last_message
                ON last_message.id = (
                    SELECT id
                    FROM messages
                    WHERE conversation_id = conversations.id
                    ORDER BY id DESC
                    LIMIT 1
                )

            WHERE conversations.user1_id = ?
               OR conversations.user2_id = ?

            ORDER BY
                COALESCE(last_message.created_at, conversations.created_at) DESC

        `).all(
            userId,
            userId,
            userId,
            userId,
            userId
        );


        res.json({
            success: true,
            conversations: conversations
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not load conversations."
        });

    }

});


// ==========================
// DOHVAT PORUKA
// ==========================

app.get("/api/messages/:conversationId", (req, res) => {

    const conversationId =
        Number(req.params.conversationId);

    const userId =
        Number(req.query.userId);


    if (!conversationId || !userId) {
        return res.status(400).json({
            success: false,
            message: "Invalid conversation or user."
        });
    }


    try {

        const conversation = db.prepare(`
            SELECT
                id,
                user1_id,
                user2_id
            FROM conversations
            WHERE id = ?
        `).get(conversationId);


        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found."
            });
        }


        if (
            Number(conversation.user1_id) !== userId &&
            Number(conversation.user2_id) !== userId
        ) {
            return res.status(403).json({
                success: false,
                message: "You do not have access to this conversation."
            });
        }


        const otherUserId =
            Number(conversation.user1_id) === userId
                ? Number(conversation.user2_id)
                : Number(conversation.user1_id);


        const otherUser = db.prepare(`
            SELECT
                id,
                username,
                avatar,
                bio
            FROM users
            WHERE id = ?
        `).get(otherUserId);


        const messages = db.prepare(`
            SELECT
                messages.id,
                messages.conversation_id,
                messages.sender_id,
                messages.content,
                messages.is_read,
                messages.created_at,

                users.username AS sender_username,
                users.avatar AS sender_avatar

            FROM messages

            JOIN users
                ON users.id = messages.sender_id

            WHERE messages.conversation_id = ?

            ORDER BY messages.id ASC

        `).all(conversationId);


        res.json({
            success: true,
            conversation: {
                id: conversation.id,
                otherUser: otherUser
            },
            messages: messages
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not load messages."
        });

    }

});


// ==========================
// SLANJE PORUKE
// ==========================

app.post("/api/messages", (req, res) => {

    const userId = Number(req.body.userId);
    const recipientId = Number(req.body.recipientId);

    const content =
        typeof req.body.content === "string"
            ? req.body.content.trim()
            : "";


    if (!userId || !recipientId || !content) {
        return res.status(400).json({
            success: false,
            message: "Message cannot be empty."
        });
    }


    if (userId === recipientId) {
        return res.status(400).json({
            success: false,
            message: "You cannot message yourself."
        });
    }


    if (content.length > 2000) {
        return res.status(400).json({
            success: false,
            message: "Message cannot be longer than 2000 characters."
        });
    }


    try {

        const sender = db.prepare(`
            SELECT
                id,
                username,
                avatar
            FROM users
            WHERE id = ?
        `).get(userId);


        if (!sender) {
            return res.status(404).json({
                success: false,
                message: "Sender not found."
            });
        }


        const recipient = db.prepare(`
            SELECT
                id,
                username,
                avatar
            FROM users
            WHERE id = ?
        `).get(recipientId);


        if (!recipient) {
            return res.status(404).json({
                success: false,
                message: "Recipient not found."
            });
        }


        const user1 = Math.min(userId, recipientId);
        const user2 = Math.max(userId, recipientId);


        let conversation = db.prepare(`
            SELECT
                id
            FROM conversations
            WHERE user1_id = ?
            AND user2_id = ?
        `).get(
            user1,
            user2
        );


        if (!conversation) {

            const result = db.prepare(`
                INSERT INTO conversations (
                    user1_id,
                    user2_id
                )
                VALUES (?, ?)
            `).run(
                user1,
                user2
            );

            conversation = {
                id: result.lastInsertRowid
            };

        }


        const result = db.prepare(`
            INSERT INTO messages (
                conversation_id,
                sender_id,
                content,
                is_read
            )
            VALUES (?, ?, ?, 0)
        `).run(
            conversation.id,
            userId,
            content
        );


        const message = db.prepare(`
            SELECT
                messages.id,
                messages.conversation_id,
                messages.sender_id,
                messages.content,
                messages.is_read,
                messages.created_at,

                users.username AS sender_username,
                users.avatar AS sender_avatar

            FROM messages

            JOIN users
                ON users.id = messages.sender_id

            WHERE messages.id = ?

        `).get(result.lastInsertRowid);


        res.json({
            success: true,
            conversationId: conversation.id,
            message: message
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not send message."
        });

    }

});


// ==========================
// OZNAČI PORUKE KAO PROČITANE
// ==========================

app.post("/api/messages/:conversationId/read", (req, res) => {

    const conversationId =
        Number(req.params.conversationId);

    const userId =
        Number(req.body.userId);


    if (!conversationId || !userId) {
        return res.status(400).json({
            success: false,
            message: "Invalid conversation or user."
        });
    }


    try {

        const conversation = db.prepare(`
            SELECT
                id,
                user1_id,
                user2_id
            FROM conversations
            WHERE id = ?
        `).get(conversationId);


        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Conversation not found."
            });
        }


        if (
            Number(conversation.user1_id) !== userId &&
            Number(conversation.user2_id) !== userId
        ) {
            return res.status(403).json({
                success: false,
                message: "You do not have access to this conversation."
            });
        }


        db.prepare(`
            UPDATE messages
            SET is_read = 1
            WHERE conversation_id = ?
            AND sender_id != ?
            AND is_read = 0
        `).run(
            conversationId,
            userId
        );


        res.json({
            success: true
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Could not mark messages as read."
        });

    }

});


// ==========================
// SERVER
// ==========================

app.listen(PORT, "0.0.0.0", () => {

    console.log(
        `Vexora server is running on port ${PORT}`
    );

});
