
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db = null;

export async function getDb() {
  if (!db) {
    db = await open({
      filename: `/tmp/database.db`,
      driver: sqlite3.Database,
    });

    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        bio TEXT,
        groupId INTEGER DEFAULT 6,
        settings TEXT DEFAULT '{}',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        title TEXT,
        content TEXT,
        userId INTEGER,
        createdAt DATETIME,
        views INTEGER DEFAULT 0,
        hidden BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (userId) REFERENCES users (id)
      );

      CREATE TABLE IF NOT EXISTS upgrades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        description TEXT
      );

      CREATE TABLE IF NOT EXISTS user_upgrades (
        userId INTEGER,
        upgradeId INTEGER,
        FOREIGN KEY (userId) REFERENCES users (id),
        FOREIGN KEY (upgradeId) REFERENCES upgrades (id),
        PRIMARY KEY (userId, upgradeId)
      );

      CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT,
        postId TEXT,
        userId INTEGER,
        createdAt DATETIME,
        FOREIGN KEY (postId) REFERENCES posts (id),
        FOREIGN KEY (userId) REFERENCES users (id)
      );
    `);

    // Seed upgrades
    await db.run("INSERT OR IGNORE INTO upgrades (name, description) VALUES ('VIB', 'Get a cool purple name.')");
    await db.run("INSERT OR IGNORE INTO upgrades (name, description) VALUES ('Box cutter', 'A cool slate name and the ability to edit posts.')");
    await db.run("INSERT OR IGNORE INTO upgrades (name, description) VALUES ('Box lover 9000', 'A cool red name and the ability to have private pastes.')");
    await db.run("INSERT OR IGNORE INTO upgrades (name, description) VALUES ('Change Color', 'Ability to change your name color.')");
    
    // Create admin user with an impossible password hash
    await db.run("INSERT OR IGNORE INTO users (username, password, groupId) VALUES ('admin', '', 0)");
  }
  return db;
}
