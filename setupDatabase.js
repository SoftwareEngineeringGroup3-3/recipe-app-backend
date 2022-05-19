const sqlite = require ('better-sqlite3');
const db = new sqlite ('./database.db', { verbose: console.log });

db.prepare(`CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_is_admin INTEGER NOT NULL,
    user_name VARCHAR(255) NOT NULL,
    user_password VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_creation INTEGER NOT NULL,
    user_savedRecipes VARCHAR(255),
    user_last_login INTEGER,
    user_last_ip VARCHAR(255)
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS recipes (
    recipe_id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipe_name VARCHAR(255) NOT NULL,
    recipe_instructions TEXT,
    recipe_ingredients TEXT NOT NULL,
    recipe_tags VARCHAR(255)
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS shops (
    shop_id INTEGER PRIMARY KEY AUTOINCREMENT,
    shop_vendor_name VARCHAR(255) NOT NULL,
    shop_products TEXT
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS restaurants (
    restaurant_id INTEGER PRIMARY KEY AUTOINCREMENT,
    restaurant_name VARCHAR(255) NOT NULL
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS restaurants_recipes (
    recipe_id INTEGER,
    restaurant_id INTEGER,
    price INTEGER NOT NULL,
    PRIMARY KEY (recipe_id, restaurant_id),
    CONSTRAINT fk_recipes
        FOREIGN KEY (recipe_id)
        REFERENCES recipes(recipe_id),
    CONSTRAINT fk_restaurants
        FOREIGN KEY (restaurant_id)
        REFERENCES restaurants(restaurant_id)
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS users_recipes (
    user_id INTEGER,
    recipe_id INTEGER,
    PRIMARY KEY (user_id, recipe_id),
    CONSTRAINT fk_users
        FOREIGN KEY (user_id)
        REFERENCES users(user_id),
    CONSTRAINT fk_recipes
        FOREIGN KEY (recipe_id)
        REFERENCES recipes(recipe_id)
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS user_tokens (
    user_token VARCHAR(255) PRIMARY KEY,
    user_id INTEGER NOT NULL,
    user_token_start INTEGER NOT NULL,
    user_token_refresh INTEGER NOT NULL,
    user_token_address VARCHAR(255)
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS ingredients (
    ingredient_id INTEGER PRIMARY KEY AUTOINCREMENT,
    ingredient_name VARCHAR(255) NOT NULL
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
        '853cc41b94c44da86fa500aa2cbe04890ea7e993c39e65a32ec49a1175477a0c',
        'matt@matt.com',
        ${Date.now()}
    )`).run();