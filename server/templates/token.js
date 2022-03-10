const crypto = require('crypto');

module.exports.createToken = async (database, user_id, address) => {
    const token = crypto.randomBytes(50).toString('base64');
    const query = database.prepare(`INSERT INTO user_tokens (user_token, user_id, user_token_start, user_token_refresh, user_token_address) VALUES (?,?,?,?,?)`);
    const now = Date.now();

    query.run(token, user_id, now, now, address);
    return token;
};

module.exports.verifyToken = async (database, token, address) => {
    const query = database.prepare(`SELECT user_token, user_id FROM user_tokens WHERE user_token = ?`);
    const tokens = query.all(token);

    if(tokens.length === 0) {
        return null;
    } else if (tokens.length > 1) {
        throw new Error(`Database error: duplicated user token {${token}}`);
    } else {
        const user_id = tokens[0].user_id;
        const updateQuery = database.prepare(`UPDATE user_tokens SET user_token_refresh = ?, user_token_address = ? WHERE user_token = ?`);
        const now = Date.now();

        updateQuery.run(now, address, token);
        return user_id;
    }
};