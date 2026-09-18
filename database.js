const Database = require("better-sqlite3");

const db = new Database("vexora.db");

// =========================
// KORISNICI
// =========================

db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        bio TEXT DEFAULT '',
        avatar TEXT DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`).run();


// =========================
// DODAVANJE BIO I AVATAR KOLONA
// ZA POSTOJEĆU BAZU
// =========================

const userColumns = db.prepare(`
    PRAGMA table_info(users)
`).all();

const hasBioColumn = userColumns.some(function (column) {
    return column.name === "bio";
});

if (!hasBioColumn) {
    db.prepare(`
        ALTER TABLE users
        ADD COLUMN bio TEXT DEFAULT ''
    `).run();
}

const hasAvatarColumn = userColumns.some(function (column) {
    return column.name === "avatar";
});

if (!hasAvatarColumn) {
    db.prepare(`
        ALTER TABLE users
        ADD COLUMN avatar TEXT DEFAULT ''
    `).run();
}


// =========================
// OBJAVE
// =========================

db.prepare(`
    CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
`).run();


// =========================
// LAJKOVI
// =========================

db.prepare(`
    CREATE TABLE IF NOT EXISTS likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        post_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, post_id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (post_id) REFERENCES posts(id)
    )
`).run();


// =========================
// KOMENTARI
// =========================

db.prepare(`
    CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        post_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (post_id) REFERENCES posts(id)
    )
`).run();


// =========================
// LAJKOVI KOMENTARA
// =========================

db.prepare(`
    CREATE TABLE IF NOT EXISTS comment_likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        comment_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, comment_id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (comment_id) REFERENCES comments(id)
    )
`).run();


// =========================
// PRAĆENJE KORISNIKA
// =========================

db.prepare(`
    CREATE TABLE IF NOT EXISTS follows (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        follower_id INTEGER NOT NULL,
        following_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

        UNIQUE(follower_id, following_id),

        FOREIGN KEY (follower_id) REFERENCES users(id),
        FOREIGN KEY (following_id) REFERENCES users(id),

        CHECK(follower_id != following_id)
    )
`).run();


// =========================
// NOTIFICATIONS
// =========================

db.prepare(`
    CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        recipient_id INTEGER NOT NULL,
        actor_id INTEGER NOT NULL,

        type TEXT NOT NULL,

        post_id INTEGER,
        comment_id INTEGER,

        is_read INTEGER DEFAULT 0,

        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (recipient_id) REFERENCES users(id),
        FOREIGN KEY (actor_id) REFERENCES users(id),
        FOREIGN KEY (post_id) REFERENCES posts(id),
        FOREIGN KEY (comment_id) REFERENCES comments(id)
    )
`).run();


// =========================
// DM CONVERSATIONS
// =========================

db.prepare(`
    CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        user1_id INTEGER NOT NULL,
        user2_id INTEGER NOT NULL,

        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

        UNIQUE(user1_id, user2_id),

        FOREIGN KEY (user1_id) REFERENCES users(id),
        FOREIGN KEY (user2_id) REFERENCES users(id),

        CHECK(user1_id < user2_id),
        CHECK(user1_id != user2_id)
    )
`).run();


// =========================
// DM MESSAGES
// =========================

db.prepare(`
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        conversation_id INTEGER NOT NULL,
        sender_id INTEGER NOT NULL,

        content TEXT NOT NULL DEFAULT '',

        image_url TEXT DEFAULT '',

        is_read INTEGER DEFAULT 0,

        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (conversation_id) REFERENCES conversations(id),
        FOREIGN KEY (sender_id) REFERENCES users(id)
    )
`).run();


// =========================
// DODAVANJE IMAGE_URL KOLONE
// ZA POSTOJEĆU BAZU
// =========================

const messageColumns = db.prepare(`
    PRAGMA table_info(messages)
`).all();

const hasImageUrlColumn = messageColumns.some(function (column) {
    return column.name === "image_url";
});

if (!hasImageUrlColumn) {
    db.prepare(`
        ALTER TABLE messages
        ADD COLUMN image_url TEXT DEFAULT ''
    `).run();
}


// =========================
// DM INDEXI
// =========================

db.prepare(`
    CREATE INDEX IF NOT EXISTS idx_messages_conversation
    ON messages(conversation_id)
`).run();

db.prepare(`
    CREATE INDEX IF NOT EXISTS idx_messages_sender
    ON messages(sender_id)
`).run();

db.prepare(`
    CREATE INDEX IF NOT EXISTS idx_messages_created
    ON messages(created_at)
`).run();

db.prepare(`
    CREATE INDEX IF NOT EXISTS idx_conversations_user1
    ON conversations(user1_id)
`).run();

db.prepare(`
    CREATE INDEX IF NOT EXISTS idx_conversations_user2
    ON conversations(user2_id)
`).run();


console.log("Vexora database is ready.");

module.exports = db;
