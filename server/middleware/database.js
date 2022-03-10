const sqlite = require('better-sqlite3');

module.exports = (req, res, next) => {
    const db = new sqlite('database.db');
    req.database = db;

    next();
};