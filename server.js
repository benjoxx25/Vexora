const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const db = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

// ======================================================
// UPLOAD FOLDERS
// ======================================================

const messageUploadsDir = path.join(
    __dirname,
    "uploads",
    "messages"
);

const postUploadsDir = path.join(
    __dirname,
    "uploads",
    "posts"
);

fs.mkdirSync(messageUploadsDir, {
    recursive: true
});

fs.mkdirSync(postUploadsDir, {
    recursive: true
});

// ======================================================
// MIDDLEWARE
// ======================================================

app.use(
    express.json({
        limit: "30mb"
    })
);

app.use(
    express.static(__dirname)
);

// ======================================================
// HELPER - IMAGE DATA
// ======================================================

function parseImageData(imageData) {
    if (typeof imageData !== "string") {
        return null;
    }

    const match = imageData.match(
        /^data:image\/(jpeg|jpg|png|webp|gif);base64,(.+)$/i
    );

    if (!match) {
        return null;
    }

    let extension =
        match[1].toLowerCase();

    if (
        extension === "jpeg" ||
        extension === "jpg"
    ) {
        extension = "jpg";
    }

    let buffer;

    try {
        buffer = Buffer.from(
            match[2],
            "base64"
        );
    } catch (error) {
        return null;
    }

    if (!buffer || buffer.length === 0) {
        return null;
    }

    return {
        extension: extension,
        buffer: buffer
    };
}

// ======================================================
// HELPER - VIDEO DATA
// ======================================================

function parseVideoData(videoData) {
    if (typeof videoData !== "string") {
        return null;
    }

    const match = videoData.match(
        /^data:video\/(mp4|webm|ogg);base64,(.+)$/i
    );

    if (!match) {
        return null;
    }

    const extension =
        match[1].toLowerCase();

    let buffer;

    try {
        buffer = Buffer.from(
            match[2],
            "base64"
        );
    } catch (error) {
        return null;
    }

    if (!buffer || buffer.length === 0) {
        return null;
    }

    return {
        extension: extension,
        buffer: buffer
    };
}

// ======================================================
// HELPER - CREATE CONVERSATION
// ======================================================

function createConversation(userId, recipientId) {
    const firstUserId =
        Math.min(
            Number(userId),
            Number(recipientId)
        );

    const secondUserId =
        Math.max(
            Number(userId),
            Number(recipientId)
        );

    let conversation =
        db.prepare(
            "SELECT id FROM conversations WHERE user1_id = ? AND user2_id = ?"
        ).get(
            firstUserId,
            secondUserId
        );

    if (!conversation) {
        const result =
            db.prepare(
                "INSERT INTO conversations (user1_id, user2_id) VALUES (?, ?)"
            ).run(
                firstUserId,
                secondUserId
            );

        conversation = {
            id: result.lastInsertRowid
        };
    }

    return conversation;
}

// ======================================================
// HELPER - CREATE NOTIFICATION
// ======================================================

function createNotification(
    recipientId,
    actorId,
    type,
    postId = null,
    commentId = null
) {
    if (
        !recipientId ||
        !actorId ||
        Number(recipientId) === Number(actorId)
    ) {
        return;
    }

    db.prepare(`
        INSERT INTO notifications (
            recipient_id,
            actor_id,
            type,
            post_id,
            comment_id,
            is_read
        )
        VALUES (?, ?, ?, ?, ?, 0)
    `).run(
        recipientId,
        actorId,
        type,
        postId,
        commentId
    );
}

// ======================================================
// HOME
// ======================================================

app.get("/", function (req, res) {
    res.sendFile(
        path.join(
            __dirname,
            "index.html"
        )
    );
});

// ======================================================
// REGISTER
// ======================================================

app.post("/api/register", function (req, res) {
    const username =
        typeof req.body.username === "string"
            ? req.body.username.trim()
            : "";

    const email =
        typeof req.body.email === "string"
            ? req.body.email.trim()
            : "";

    const password =
        typeof req.body.password === "string"
            ? req.body.password
            : "";

    if (
        !username ||
        !email ||
        !password
    ) {
        return res.status(400).json({
            success: false,
            message: "Please fill in all fields."
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message:
                "Password must be at least 6 characters."
        });
    }

    if (username.length > 30) {
        return res.status(400).json({
            success: false,
            message:
                "Username cannot be longer than 30 characters."
        });
    }

    try {
        const existingUser =
            db.prepare(
                "SELECT id FROM users WHERE username = ? OR email = ?"
            ).get(
                username,
                email
            );

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message:
                    "Username or email already exists."
            });
        }

        const result =
            db.prepare(
                "INSERT INTO users (username, email, password, bio, avatar) VALUES (?, ?, ?, ?, ?)"
            ).run(
                username,
                email,
                password,
                "",
                ""
            );

        return res.json({
            success: true,
            message:
                "Account created successfully!",
            userId:
                result.lastInsertRowid,
            username:
                username
        });

    } catch (error) {
        console.error(
            "REGISTER ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Something went wrong."
        });
    }
});

// ======================================================
// LOGIN
// ======================================================

app.post("/api/login", function (req, res) {
    const email =
        typeof req.body.email === "string"
            ? req.body.email.trim()
            : "";

    const password =
        typeof req.body.password === "string"
            ? req.body.password
            : "";

    if (
        !email ||
        !password
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Please enter your email and password."
        });
    }

    try {
        const user =
            db.prepare(
                "SELECT id, username, email, password, bio, avatar FROM users WHERE email = ?"
            ).get(email);

        if (!user) {
            return res.status(401).json({
                success: false,
                message:
                    "Incorrect email or password."
            });
        }

        if (user.password !== password) {
            return res.status(401).json({
                success: false,
                message:
                    "Incorrect email or password."
            });
        }

        return res.json({
            success: true,
            message:
                "Login successful.",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                bio: user.bio || "",
                avatar: user.avatar || ""
            }
        });

    } catch (error) {
        console.error(
            "LOGIN ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Something went wrong."
        });
    }
});

// ======================================================
// USERS / SEARCH
// ======================================================

app.get("/api/users", function (req, res) {
    const username =
        typeof req.query.username === "string"
            ? req.query.username.trim()
            : "";

    const currentUserId =
        Number(req.query.currentUserId);

    try {
        if (username) {
            const users =
                db.prepare(
                    "SELECT id, username, bio, avatar FROM users WHERE username LIKE ? ORDER BY username ASC LIMIT 20"
                ).all(
                    "%" + username + "%"
                );

            return res.json({
                success: true,
                users: users
            });
        }

        if (!currentUserId) {
            return res.status(400).json({
                success: false,
                message:
                    "Current user ID is required."
            });
        }

        const users =
            db.prepare(`
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

        return res.json({
            success: true,
            users: users
        });

    } catch (error) {
        console.error(
            "USERS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Could not load users."
        });
    }
});

// ======================================================
// USER PROFILE
// ======================================================

app.get(
    "/api/users/:userId/profile",
    function (req, res) {
        const userId =
            Number(req.params.userId);

        if (!userId) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid user."
            });
        }

        try {
            const user =
                db.prepare(
                    "SELECT id, username, email, bio, avatar, created_at FROM users WHERE id = ?"
                ).get(userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message:
                        "User not found."
                });
            }

            const posts =
                db.prepare(
                    "SELECT COUNT(*) AS count FROM posts WHERE user_id = ?"
                ).get(userId);

            const followers =
                db.prepare(
                    "SELECT COUNT(*) AS count FROM follows WHERE following_id = ?"
                ).get(userId);

            const following =
                db.prepare(
                    "SELECT COUNT(*) AS count FROM follows WHERE follower_id = ?"
                ).get(userId);

            return res.json({
                success: true,

                user: {
                    id: user.id,
                    username: user.username,
                    bio: user.bio || "",
                    avatar: user.avatar || "",
                    created_at:
                        user.created_at
                },

                stats: {
                    posts: posts.count,
                    followers:
                        followers.count,
                    following:
                        following.count
                }
            });

        } catch (error) {
            console.error(
                "PROFILE ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Could not load profile."
            });
        }
    }
);

// ======================================================
// UPDATE PROFILE
// ======================================================

app.put(
    "/api/users/:userId/profile",
    function (req, res) {
        const userId =
            Number(req.params.userId);

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
                message:
                    "Invalid user."
            });
        }

        if (!username) {
            return res.status(400).json({
                success: false,
                message:
                    "Username cannot be empty."
            });
        }

        if (username.length > 30) {
            return res.status(400).json({
                success: false,
                message:
                    "Username cannot be longer than 30 characters."
            });
        }

        if (bio.length > 160) {
            return res.status(400).json({
                success: false,
                message:
                    "Bio cannot be longer than 160 characters."
            });
        }

        if (
            avatar &&
            !avatar.startsWith("data:image/")
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid profile picture."
            });
        }

        if (avatar.length > 4000000) {
            return res.status(400).json({
                success: false,
                message:
                    "Profile picture is too large."
            });
        }

        try {
            const existingUser =
                db.prepare(
                    "SELECT id FROM users WHERE id = ?"
                ).get(userId);

            if (!existingUser) {
                return res.status(404).json({
                    success: false,
                    message:
                        "User not found."
                });
            }

            const usernameTaken =
                db.prepare(
                    "SELECT id FROM users WHERE username = ? AND id != ?"
                ).get(
                    username,
                    userId
                );

            if (usernameTaken) {
                return res.status(400).json({
                    success: false,
                    message:
                        "That username is already taken."
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

            const updatedUser =
                db.prepare(
                    "SELECT id, username, email, bio, avatar FROM users WHERE id = ?"
                ).get(userId);

            return res.json({
                success: true,
                message:
                    "Profile updated successfully.",
                user: updatedUser
            });

        } catch (error) {
            console.error(
                "UPDATE PROFILE ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Could not update profile."
            });
        }
    }
);

// ======================================================
// CREATE POST
// ======================================================

app.post("/api/posts", function (req, res) {
    const userId =
        Number(req.body.userId);

    const content =
        typeof req.body.content === "string"
            ? req.body.content.trim()
            : "";

    const imageData =
        typeof req.body.imageData === "string"
            ? req.body.imageData
            : "";

    const videoData =
        typeof req.body.videoData === "string"
            ? req.body.videoData
            : "";

    if (!userId) {
        return res.status(400).json({
            success: false,
            message:
                "Invalid user."
        });
    }

    if (
        !content &&
        !imageData &&
        !videoData
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Post cannot be empty."
        });
    }

    if (
        imageData &&
        videoData
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Choose either an image or a video, not both."
        });
    }

    if (content.length > 500) {
        return res.status(400).json({
            success: false,
            message:
                "Post cannot be longer than 500 characters."
        });
    }

    let parsedImage = null;
    let parsedVideo = null;

    // ==================================================
    // IMAGE
    // ==================================================

    if (imageData) {
        parsedImage =
            parseImageData(
                imageData
            );

        if (!parsedImage) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid image format."
            });
        }

        const maxImageSize =
            8 * 1024 * 1024;

        if (
            parsedImage.buffer.length >
            maxImageSize
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Image cannot be larger than 8 MB."
            });
        }
    }

    // ==================================================
    // VIDEO
    // ==================================================

    if (videoData) {
        parsedVideo =
            parseVideoData(
                videoData
            );

        if (!parsedVideo) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid video format."
            });
        }

        const maxVideoSize =
            20 * 1024 * 1024;

        if (
            parsedVideo.buffer.length >
            maxVideoSize
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Video cannot be larger than 20 MB."
            });
        }
    }

    let savedImagePath = null;
    let savedVideoPath = null;

    try {
        const user =
            db.prepare(
                "SELECT id FROM users WHERE id = ?"
            ).get(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    "User not found."
            });
        }

        let imageUrl = "";
        let videoUrl = "";

        // ==================================================
        // SAVE IMAGE
        // ==================================================

        if (parsedImage) {
            const filename =
                Date.now() +
                "-" +
                crypto
                    .randomBytes(8)
                    .toString("hex") +
                "." +
                parsedImage.extension;

            savedImagePath =
                path.join(
                    postUploadsDir,
                    filename
                );

            fs.writeFileSync(
                savedImagePath,
                parsedImage.buffer
            );

            imageUrl =
                "/uploads/posts/" +
                filename;
        }

        // ==================================================
        // SAVE VIDEO
        // ==================================================

        if (parsedVideo) {
            const filename =
                Date.now() +
                "-" +
                crypto
                    .randomBytes(8)
                    .toString("hex") +
                "." +
                parsedVideo.extension;

            savedVideoPath =
                path.join(
                    postUploadsDir,
                    filename
                );

            fs.writeFileSync(
                savedVideoPath,
                parsedVideo.buffer
            );

            videoUrl =
                "/uploads/posts/" +
                filename;
        }

        const result =
            db.prepare(
                "INSERT INTO posts (user_id, content, image_url, video_url) VALUES (?, ?, ?, ?)"
            ).run(
                userId,
                content,
                imageUrl,
                videoUrl
            );

        return res.json({
            success: true,
            message:
                "Post created successfully.",
            postId:
                result.lastInsertRowid
        });

    } catch (error) {
        if (savedImagePath) {
            try {
                if (
                    fs.existsSync(
                        savedImagePath
                    )
                ) {
                    fs.unlinkSync(
                        savedImagePath
                    );
                }
            } catch (deleteError) {
                console.error(
                    "Could not remove unused post image:",
                    deleteError
                );
            }
        }

        if (savedVideoPath) {
            try {
                if (
                    fs.existsSync(
                        savedVideoPath
                    )
                ) {
                    fs.unlinkSync(
                        savedVideoPath
                    );
                }
            } catch (deleteError) {
                console.error(
                    "Could not remove unused post video:",
                    deleteError
                );
            }
        }

        console.error(
            "CREATE POST ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Could not create post."
        });
    }
});

// ======================================================
// GET POSTS
// ======================================================

app.get("/api/posts", function (req, res) {
    const userId =
        Number(req.query.userId) || 0;

    try {
        const posts =
            db.prepare(`
                SELECT
                    posts.id,
                    posts.content,
                    posts.image_url,
                    posts.video_url,
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
                    posts.image_url,
                    posts.video_url,
                    posts.created_at,
                    users.id,
                    users.username,
                    users.avatar

                ORDER BY posts.id DESC
            `).all(userId);

        return res.json({
            success: true,
            posts: posts
        });

    } catch (error) {
        console.error(
            "GET POSTS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Could not load posts."
        });
    }
});

// ======================================================
// LIKE / UNLIKE POST
// ======================================================

app.post(
    "/api/posts/:postId/like",
    function (req, res) {
        const postId =
            Number(req.params.postId);

        const userId =
            Number(req.body.userId);

        if (
            !postId ||
            !userId
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Missing post or user."
            });
        }

        try {
            const post =
                db.prepare(
                    "SELECT id, user_id FROM posts WHERE id = ?"
                ).get(postId);

            if (!post) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Post not found."
                });
            }

            const user =
                db.prepare(
                    "SELECT id FROM users WHERE id = ?"
                ).get(userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message:
                        "User not found."
                });
            }

            const existingLike =
                db.prepare(
                    "SELECT id FROM likes WHERE user_id = ? AND post_id = ?"
                ).get(
                    userId,
                    postId
                );

            if (existingLike) {
                db.prepare(
                    "DELETE FROM likes WHERE user_id = ? AND post_id = ?"
                ).run(
                    userId,
                    postId
                );
            } else {
                db.prepare(
                    "INSERT INTO likes (user_id, post_id) VALUES (?, ?)"
                ).run(
                    userId,
                    postId
                );

                createNotification(
                    post.user_id,
                    userId,
                    "like",
                    postId,
                    null
                );
            }

            const result =
                db.prepare(
                    "SELECT COUNT(*) AS count FROM likes WHERE post_id = ?"
                ).get(postId);

            return res.json({
                success: true,
                liked:
                    !existingLike,
                likes:
                    result.count
            });

        } catch (error) {
            console.error(
                "POST LIKE ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Could not update like."
            });
        }
    }
);

// ======================================================
// DELETE POST
// ======================================================

app.delete(
    "/api/posts/:postId",
    function (req, res) {
        const postId =
            Number(req.params.postId);

        const userId =
            Number(req.body.userId);

        if (
            !postId ||
            !userId
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Missing post or user."
            });
        }

        try {
            const post =
                db.prepare(
                    "SELECT id, user_id, image_url, video_url FROM posts WHERE id = ?"
                ).get(postId);

            if (!post) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Post not found."
                });
            }

            if (
                Number(post.user_id) !==
                userId
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "You can only delete your own posts."
                });
            }

            const deletePost =
                db.transaction(
                    function () {
                        db.prepare(
                            "DELETE FROM likes WHERE post_id = ?"
                        ).run(postId);

                        db.prepare(`
                            DELETE FROM comment_likes
                            WHERE comment_id IN (
                                SELECT id
                                FROM comments
                                WHERE post_id = ?
                            )
                        `).run(postId);

                        db.prepare(
                            "DELETE FROM comments WHERE post_id = ?"
                        ).run(postId);

                        db.prepare(
                            "DELETE FROM notifications WHERE post_id = ?"
                        ).run(postId);

                        db.prepare(
                            "DELETE FROM posts WHERE id = ?"
                        ).run(postId);
                    }
                );

            deletePost();

            // ==================================================
            // DELETE IMAGE FILE
            // ==================================================

            if (
                post.image_url &&
                post.image_url.startsWith(
                    "/uploads/posts/"
                )
            ) {
                const filename =
                    path.basename(
                        post.image_url
                    );

                const imagePath =
                    path.join(
                        postUploadsDir,
                        filename
                    );

                try {
                    if (
                        fs.existsSync(
                            imagePath
                        )
                    ) {
                        fs.unlinkSync(
                            imagePath
                        );
                    }
                } catch (imageDeleteError) {
                    console.error(
                        "Could not delete post image:",
                        imageDeleteError
                    );
                }
            }

            // ==================================================
            // DELETE VIDEO FILE
            // ==================================================

            if (
                post.video_url &&
                post.video_url.startsWith(
                    "/uploads/posts/"
                )
            ) {
                const filename =
                    path.basename(
                        post.video_url
                    );

                const videoPath =
                    path.join(
                        postUploadsDir,
                        filename
                    );

                try {
                    if (
                        fs.existsSync(
                            videoPath
                        )
                    ) {
                        fs.unlinkSync(
                            videoPath
                        );
                    }
                } catch (videoDeleteError) {
                    console.error(
                        "Could not delete post video:",
                        videoDeleteError
                    );
                }
            }

            return res.json({
                success: true,
                message:
                    "Post deleted successfully."
            });

        } catch (error) {
            console.error(
                "DELETE POST ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Could not delete post."
            });
        }
    }
);

// ======================================================
// GET COMMENTS
// ======================================================

app.get(
    "/api/posts/:postId/comments",
    function (req, res) {
        const postId =
            Number(req.params.postId);

        const userId =
            Number(req.query.userId) || 0;

        if (!postId) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid post."
            });
        }

        try {
            const comments =
                db.prepare(`
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
                    userId,
                    postId
                );

            return res.json({
                success: true,
                comments: comments
            });

        } catch (error) {
            console.error(
                "GET COMMENTS ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Could not load comments."
            });
        }
    }
);

// ======================================================
// CREATE COMMENT
// ======================================================

app.post(
    "/api/posts/:postId/comments",
    function (req, res) {
        const postId =
            Number(req.params.postId);

        const userId =
            Number(req.body.userId);

        const content =
            typeof req.body.content === "string"
                ? req.body.content.trim()
                : "";

        if (
            !postId ||
            !userId ||
            !content
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Comment cannot be empty."
            });
        }

        if (content.length > 300) {
            return res.status(400).json({
                success: false,
                message:
                    "Comment cannot be longer than 300 characters."
            });
        }

        try {
            const post =
                db.prepare(
                    "SELECT id, user_id FROM posts WHERE id = ?"
                ).get(postId);

            if (!post) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Post not found."
                });
            }

            const user =
                db.prepare(
                    "SELECT id FROM users WHERE id = ?"
                ).get(userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message:
                        "User not found."
                });
            }

            const result =
                db.prepare(
                    "INSERT INTO comments (user_id, post_id, content) VALUES (?, ?, ?)"
                ).run(
                    userId,
                    postId,
                    content
                );

            createNotification(
                post.user_id,
                userId,
                "comment",
                postId,
                result.lastInsertRowid
            );

            const comment =
                db.prepare(`
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
                `).get(
                    result.lastInsertRowid
                );

            return res.json({
                success: true,
                comment: comment
            });

        } catch (error) {
            console.error(
                "CREATE COMMENT ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Could not create comment."
            });
        }
    }
);

// ======================================================
// LIKE / UNLIKE COMMENT
// ======================================================

app.post(
    "/api/comments/:commentId/like",
    function (req, res) {
        const commentId =
            Number(req.params.commentId);

        const userId =
            Number(req.body.userId);

        if (
            !commentId ||
            !userId
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Missing comment or user."
            });
        }

        try {
            const comment =
                db.prepare(`
                    SELECT
                        comments.id,
                        comments.user_id,
                        comments.post_id
                    FROM comments
                    WHERE comments.id = ?
                `).get(commentId);

            if (!comment) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Comment not found."
                });
            }

            const user =
                db.prepare(
                    "SELECT id FROM users WHERE id = ?"
                ).get(userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message:
                        "User not found."
                });
            }

            const existingLike =
                db.prepare(
                    "SELECT id FROM comment_likes WHERE user_id = ? AND comment_id = ?"
                ).get(
                    userId,
                    commentId
                );

            if (existingLike) {
                db.prepare(
                    "DELETE FROM comment_likes WHERE user_id = ? AND comment_id = ?"
                ).run(
                    userId,
                    commentId
                );
            } else {
                db.prepare(
                    "INSERT INTO comment_likes (user_id, comment_id) VALUES (?, ?)"
                ).run(
                    userId,
                    commentId
                );

                createNotification(
                    comment.user_id,
                    userId,
                    "comment_like",
                    comment.post_id,
                    commentId
                );
            }

            const result =
                db.prepare(
                    "SELECT COUNT(*) AS count FROM comment_likes WHERE comment_id = ?"
                ).get(commentId);

            return res.json({
                success: true,
                liked:
                    !existingLike,
                likes:
                    result.count
            });

        } catch (error) {
            console.error(
                "COMMENT LIKE ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Could not update comment like."
            });
        }
    }
);

// ======================================================
// FOLLOW / UNFOLLOW
// ======================================================

app.post(
    "/api/users/:userId/follow",
    function (req, res) {
        const followingId =
            Number(req.params.userId);

        const followerId =
            Number(req.body.followerId);

        if (
            !followingId ||
            !followerId
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Missing user information."
            });
        }

        if (
            followingId === followerId
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "You cannot follow yourself."
            });
        }

        try {
            const targetUser =
                db.prepare(
                    "SELECT id FROM users WHERE id = ?"
                ).get(followingId);

            if (!targetUser) {
                return res.status(404).json({
                    success: false,
                    message:
                        "User not found."
                });
            }

            const followerUser =
                db.prepare(
                    "SELECT id FROM users WHERE id = ?"
                ).get(followerId);

            if (!followerUser) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Follower user not found."
                });
            }

            const existingFollow =
                db.prepare(
                    "SELECT id FROM follows WHERE follower_id = ? AND following_id = ?"
                ).get(
                    followerId,
                    followingId
                );

            if (existingFollow) {
                db.prepare(
                    "DELETE FROM follows WHERE follower_id = ? AND following_id = ?"
                ).run(
                    followerId,
                    followingId
                );
            } else {
                db.prepare(
                    "INSERT INTO follows (follower_id, following_id) VALUES (?, ?)"
                ).run(
                    followerId,
                    followingId
                );

                createNotification(
                    followingId,
                    followerId,
                    "follow",
                    null,
                    null
                );
            }

            const followers =
                db.prepare(
                    "SELECT COUNT(*) AS count FROM follows WHERE following_id = ?"
                ).get(followingId);

            const following =
                db.prepare(
                    "SELECT COUNT(*) AS count FROM follows WHERE follower_id = ?"
                ).get(followingId);

            return res.json({
                success: true,
                following:
                    !existingFollow,
                followers:
                    followers.count,
                followingCount:
                    following.count
            });

        } catch (error) {
            console.error(
                "FOLLOW ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Could not update follow."
            });
        }
    }
);

// ======================================================
// NOTIFICATIONS - GET
// ======================================================

app.get(
    "/api/notifications",
    function (req, res) {
        const userId =
            Number(req.query.userId);

        if (!userId) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid user."
            });
        }

        try {
            const user =
                db.prepare(
                    "SELECT id FROM users WHERE id = ?"
                ).get(userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message:
                        "User not found."
                });
            }

            const notifications =
                db.prepare(`
                    SELECT
                        notifications.id,
                        notifications.recipient_id,
                        notifications.actor_id,
                        notifications.type,
                        notifications.post_id,
                        notifications.comment_id,
                        notifications.is_read,
                        notifications.created_at,

                        users.username AS actor_username,
                        users.avatar AS actor_avatar,

                        posts.content AS post_content

                    FROM notifications

                    JOIN users
                        ON users.id =
                            notifications.actor_id

                    LEFT JOIN posts
                        ON posts.id =
                            notifications.post_id

                    WHERE notifications.recipient_id = ?

                    ORDER BY notifications.id DESC

                    LIMIT 50
                `).all(userId);

            return res.json({
                success: true,
                notifications:
                    notifications
            });

        } catch (error) {
            console.error(
                "GET NOTIFICATIONS ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Could not load notifications."
            });
        }
    }
);

// ======================================================
// NOTIFICATIONS - UNREAD COUNT
// ======================================================

app.get(
    "/api/notifications/unread-count",
    function (req, res) {
        const userId =
            Number(req.query.userId);

        if (!userId) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid user."
            });
        }

        try {
            const user =
                db.prepare(
                    "SELECT id FROM users WHERE id = ?"
                ).get(userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message:
                        "User not found."
                });
            }

            const result =
                db.prepare(`
                    SELECT COUNT(*) AS count

                    FROM notifications

                    WHERE recipient_id = ?

                    AND is_read = 0
                `).get(userId);

            return res.json({
                success: true,
                unread:
                    result.count
            });

        } catch (error) {
            console.error(
                "NOTIFICATION UNREAD ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Could not load unread notifications."
            });
        }
    }
);

// ======================================================
// NOTIFICATIONS - MARK ALL AS READ
// ======================================================

app.post(
    "/api/notifications/read",
    function (req, res) {
        const userId =
            Number(req.body.userId);

        if (!userId) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid user."
            });
        }

        try {
            const user =
                db.prepare(
                    "SELECT id FROM users WHERE id = ?"
                ).get(userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message:
                        "User not found."
                });
            }

            db.prepare(`
                UPDATE notifications

                SET is_read = 1

                WHERE recipient_id = ?

                AND is_read = 0
            `).run(userId);

            return res.json({
                success: true
            });

        } catch (error) {
            console.error(
                "MARK NOTIFICATIONS READ ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Could not mark notifications as read."
            });
        }
    }
);

// ======================================================
// USER STATS
// ======================================================

app.get(
    "/api/users/:userId/stats",
    function (req, res) {
        const userId =
            Number(req.params.userId);

        if (!userId) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid user."
            });
        }

        try {
            const user =
                db.prepare(
                    "SELECT id, username, bio, avatar FROM users WHERE id = ?"
                ).get(userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message:
                        "User not found."
                });
            }

            const followers =
                db.prepare(
                    "SELECT COUNT(*) AS count FROM follows WHERE following_id = ?"
                ).get(userId);

            const following =
                db.prepare(
                    "SELECT COUNT(*) AS count FROM follows WHERE follower_id = ?"
                ).get(userId);

            const posts =
                db.prepare(
                    "SELECT COUNT(*) AS count FROM posts WHERE user_id = ?"
                ).get(userId);

            return res.json({
                success: true,
                user: user,
                followers:
                    followers.count,
                following:
                    following.count,
                posts:
                    posts.count
            });

        } catch (error) {
            console.error(
                "STATS ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Could not load user statistics."
            });
        }
    }
);

// ======================================================
// DM - UNREAD COUNT
// ======================================================

app.get(
    "/api/messages/unread-count",
    function (req, res) {
        const userId =
            Number(req.query.userId);

        if (!userId) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid user."
            });
        }

        try {
            const user =
                db.prepare(
                    "SELECT id FROM users WHERE id = ?"
                ).get(userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message:
                        "User not found."
                });
            }

            const result =
                db.prepare(`
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

            return res.json({
                success: true,
                unread:
                    result.count
            });

        } catch (error) {
            console.error(
                "UNREAD ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Could not load unread messages."
            });
        }
    }
);

// ======================================================
// DM - CREATE / GET CONVERSATION
// ======================================================

app.post(
    "/api/messages/conversations",
    function (req, res) {
        const userId =
            Number(req.body.userId);

        const otherUserId =
            Number(req.body.otherUserId);

        if (
            !userId ||
            !otherUserId
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Missing user information."
            });
        }

        if (
            userId === otherUserId
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "You cannot message yourself."
            });
        }

        try {
            const user =
                db.prepare(
                    "SELECT id, username, avatar FROM users WHERE id = ?"
                ).get(userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message:
                        "User not found."
                });
            }

            const otherUser =
                db.prepare(
                    "SELECT id, username, avatar FROM users WHERE id = ?"
                ).get(otherUserId);

            if (!otherUser) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Other user not found."
                });
            }

            const conversation =
                createConversation(
                    userId,
                    otherUserId
                );

            return res.json({
                success: true,
                conversation: {
                    id:
                        conversation.id,
                    otherUser:
                        otherUser
                }
            });

        } catch (error) {
            console.error(
                "CREATE CONVERSATION ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Could not create conversation."
            });
        }
    }
);

// ======================================================
// DM - CONVERSATIONS LIST
// ======================================================

app.get(
    "/api/messages/conversations",
    function (req, res) {
        const userId =
            Number(req.query.userId);

        if (!userId) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid user."
            });
        }

        try {
            const user =
                db.prepare(
                    "SELECT id FROM users WHERE id = ?"
                ).get(userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message:
                        "User not found."
                });
            }

            const conversations =
                db.prepare(`
                    SELECT
                        conversations.id,

                        CASE
                            WHEN conversations.user1_id = ?
                            THEN conversations.user2_id
                            ELSE conversations.user1_id
                        END AS other_user_id,

                        other_user.username AS other_username,
                        other_user.avatar AS other_avatar,

                        CASE
                            WHEN last_message.image_url IS NOT NULL
                            AND last_message.image_url != ''
                            THEN '📷 Photo'
                            ELSE COALESCE(
                                last_message.content,
                                ''
                            )
                        END AS last_message,

                        last_message.created_at AS last_message_time,

                        (
                            SELECT COUNT(*)
                            FROM messages AS unread_messages

                            WHERE unread_messages.conversation_id =
                                conversations.id

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

                            WHERE conversation_id =
                                conversations.id

                            ORDER BY id DESC

                            LIMIT 1
                        )

                    WHERE conversations.user1_id = ?
                       OR conversations.user2_id = ?

                    ORDER BY
                        COALESCE(
                            last_message.created_at,
                            conversations.created_at
                        ) DESC
                `).all(
                    userId,
                    userId,
                    userId,
                    userId,
                    userId
                );

            return res.json({
                success: true,
                conversations:
                    conversations
            });

        } catch (error) {
            console.error(
                "CONVERSATIONS ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Could not load conversations."
            });
        }
    }
);

// ======================================================
// DM - GET MESSAGES
// ======================================================

app.get(
    "/api/messages/:conversationId",
    function (req, res) {
        const conversationId =
            Number(
                req.params.conversationId
            );

        const userId =
            Number(req.query.userId);

        if (
            !conversationId ||
            !userId
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid conversation or user."
            });
        }

        try {
            const conversation =
                db.prepare(
                    "SELECT id, user1_id, user2_id FROM conversations WHERE id = ?"
                ).get(
                    conversationId
                );

            if (!conversation) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Conversation not found."
                });
            }

            if (
                Number(
                    conversation.user1_id
                ) !== userId &&
                Number(
                    conversation.user2_id
                ) !== userId
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "You do not have access to this conversation."
                });
            }

            const otherUserId =
                Number(
                    conversation.user1_id
                ) === userId
                    ? Number(
                        conversation.user2_id
                    )
                    : Number(
                        conversation.user1_id
                    );

            const otherUser =
                db.prepare(
                    "SELECT id, username, avatar, bio FROM users WHERE id = ?"
                ).get(
                    otherUserId
                );

            const messages =
                db.prepare(`
                    SELECT
                        messages.id,
                        messages.conversation_id,
                        messages.sender_id,
                        messages.content,
                        messages.image_url,
                        messages.is_read,
                        messages.created_at,

                        users.username AS sender_username,
                        users.avatar AS sender_avatar

                    FROM messages

                    JOIN users
                        ON users.id =
                            messages.sender_id

                    WHERE messages.conversation_id = ?

                    ORDER BY messages.id ASC
                `).all(
                    conversationId
                );

            return res.json({
                success: true,

                conversation: {
                    id:
                        conversation.id,
                    otherUser:
                        otherUser
                },

                messages:
                    messages
            });

        } catch (error) {
            console.error(
                "GET MESSAGES ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Could not load messages."
            });
        }
    }
);

// ======================================================
// DM - SEND TEXT
// ======================================================

app.post(
    "/api/messages",
    function (req, res) {
        const userId =
            Number(req.body.userId);

        const recipientId =
            Number(req.body.recipientId);

        const content =
            typeof req.body.content === "string"
                ? req.body.content.trim()
                : "";

        if (
            !userId ||
            !recipientId ||
            !content
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Message cannot be empty."
            });
        }

        if (
            userId === recipientId
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "You cannot message yourself."
            });
        }

        if (content.length > 2000) {
            return res.status(400).json({
                success: false,
                message:
                    "Message cannot be longer than 2000 characters."
            });
        }

        try {
            const sender =
                db.prepare(
                    "SELECT id, username, avatar FROM users WHERE id = ?"
                ).get(userId);

            if (!sender) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Sender not found."
                });
            }

            const recipient =
                db.prepare(
                    "SELECT id, username, avatar FROM users WHERE id = ?"
                ).get(recipientId);

            if (!recipient) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Recipient not found."
                });
            }

            const conversation =
                createConversation(
                    userId,
                    recipientId
                );

            const result =
                db.prepare(`
                    INSERT INTO messages (
                        conversation_id,
                        sender_id,
                        content,
                        image_url,
                        is_read
                    )
                    VALUES (?, ?, ?, '', 0)
                `).run(
                    conversation.id,
                    userId,
                    content
                );

            const message =
                db.prepare(`
                    SELECT
                        messages.id,
                        messages.conversation_id,
                        messages.sender_id,
                        messages.content,
                        messages.image_url,
                        messages.is_read,
                        messages.created_at,

                        users.username AS sender_username,
                        users.avatar AS sender_avatar

                    FROM messages

                    JOIN users
                        ON users.id =
                            messages.sender_id

                    WHERE messages.id = ?
                `).get(
                    result.lastInsertRowid
                );

            return res.json({
                success: true,
                conversationId:
                    conversation.id,
                message:
                    message
            });

        } catch (error) {
            console.error(
                "SEND MESSAGE ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Could not send message."
            });
        }
    }
);

// ======================================================
// DM - SEND IMAGE
// ======================================================

app.post(
    "/api/messages/image",
    function (req, res) {
        const userId =
            Number(req.body.userId);

        const recipientId =
            Number(req.body.recipientId);

        const imageData =
            typeof req.body.imageData === "string"
                ? req.body.imageData
                : "";

        if (
            !userId ||
            !recipientId ||
            !imageData
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Image data is missing."
            });
        }

        if (
            userId === recipientId
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "You cannot message yourself."
            });
        }

        const parsedImage =
            parseImageData(
                imageData
            );

        if (!parsedImage) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid image format."
            });
        }

        const maxImageSize =
            8 * 1024 * 1024;

        if (
            parsedImage.buffer.length >
            maxImageSize
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Image cannot be larger than 8 MB."
            });
        }

        let savedImagePath = null;

        try {
            const sender =
                db.prepare(
                    "SELECT id, username, avatar FROM users WHERE id = ?"
                ).get(userId);

            if (!sender) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Sender not found."
                });
            }

            const recipient =
                db.prepare(
                    "SELECT id, username, avatar FROM users WHERE id = ?"
                ).get(recipientId);

            if (!recipient) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Recipient not found."
                });
            }

            const conversation =
                createConversation(
                    userId,
                    recipientId
                );

            const filename =
                Date.now() +
                "-" +
                crypto
                    .randomBytes(8)
                    .toString("hex") +
                "." +
                parsedImage.extension;

            savedImagePath =
                path.join(
                    messageUploadsDir,
                    filename
                );

            fs.writeFileSync(
                savedImagePath,
                parsedImage.buffer
            );

            const imageUrl =
                "/uploads/messages/" +
                filename;

            const result =
                db.prepare(`
                    INSERT INTO messages (
                        conversation_id,
                        sender_id,
                        content,
                        image_url,
                        is_read
                    )
                    VALUES (?, ?, '', ?, 0)
                `).run(
                    conversation.id,
                    userId,
                    imageUrl
                );

            const message =
                db.prepare(`
                    SELECT
                        messages.id,
                        messages.conversation_id,
                        messages.sender_id,
                        messages.content,
                        messages.image_url,
                        messages.is_read,
                        messages.created_at,

                        users.username AS sender_username,
                        users.avatar AS sender_avatar

                    FROM messages

                    JOIN users
                        ON users.id =
                            messages.sender_id

                    WHERE messages.id = ?
                `).get(
                    result.lastInsertRowid
                );

            return res.json({
                success: true,
                conversationId:
                    conversation.id,
                message:
                    message
            });

        } catch (error) {
            if (savedImagePath) {
                try {
                    if (
                        fs.existsSync(
                            savedImagePath
                        )
                    ) {
                        fs.unlinkSync(
                            savedImagePath
                        );
                    }
                } catch (deleteError) {
                    console.error(
                        "Could not remove unused message image:",
                        deleteError
                    );
                }
            }

            console.error(
                "SEND IMAGE ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Could not send image."
            });
        }
    }
);

// ======================================================
// DM - MARK AS READ
// ======================================================

app.post(
    "/api/messages/:conversationId/read",
    function (req, res) {
        const conversationId =
            Number(
                req.params.conversationId
            );

        const userId =
            Number(req.body.userId);

        if (
            !conversationId ||
            !userId
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid conversation or user."
            });
        }

        try {
            const conversation =
                db.prepare(
                    "SELECT id, user1_id, user2_id FROM conversations WHERE id = ?"
                ).get(
                    conversationId
                );

            if (!conversation) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Conversation not found."
                });
            }

            if (
                Number(
                    conversation.user1_id
                ) !== userId &&
                Number(
                    conversation.user2_id
                ) !== userId
            ) {
                return res.status(403).json({
                    success: false,
                    message:
                        "You do not have access to this conversation."
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

            return res.json({
                success: true
            });

        } catch (error) {
            console.error(
                "MARK READ ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Could not mark messages as read."
            });
        }
    }
);

// ======================================================
// 404 API HANDLER
// ======================================================

app.use(
    "/api",
    function (req, res) {
        return res.status(404).json({
            success: false,
            message:
                "API endpoint not found."
        });
    }
);

// ======================================================
// START SERVER
// ======================================================

app.listen(
    PORT,
    "0.0.0.0",
    function () {
        console.log(
            "========================================"
        );

        console.log(
            "VEXORA SERVER"
        );

        console.log(
            "Server running on:"
        );

        console.log(
            "http://localhost:" +
            PORT
        );

        console.log(
            "========================================"
        );
    }
);
