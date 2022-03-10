const sqlite = require ('better-sqlite3');
const db = new sqlite ('./database.db', { verbose: console.log });

db.prepare(`CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_is_admin INTEGER NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_password VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_creation INTEGER NOT NULL,
    user_last_login INTEGER,
    user_last_ip VARCHAR(255)
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS user_tokens (
    user_token VARCHAR(255) PRIMARY KEY,
    user_id INTEGER NOT NULL,
    user_token_start INTEGER NOT NULL,
    user_token_refresh INTEGER NOT NULL,
    user_token_address VARCHAR(255)
)`).run();

db.prepare(`INSERT INTO users ( 
        user_is_admin, 
        user_name, 
        user_password, 
        user_email, 
        user_creation 
    ) VALUES (
        1,
        'Matthew',
        '$2a$10$/AU4.8cKSHeEZEdttiQ9v./XVDRwzkmo/V6k7ahqUdu1UUuhztyOq',
        'matt@matt.com',
        ${Date.now()}
    )`).run();