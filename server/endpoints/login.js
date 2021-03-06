const { ApiObject, ApiError } = require ('../apiobject.js');
const { User, comparePassword, validateUsername, validatePassword } = require ('../templates/user.js');
const { verifyToken, createToken } = require ('../templates/token.js');

const loginValidation = {
    username: { required: true, type: 'string', lambda: validateUsername },
    password: { required: true, type: 'string', lambda: () => { return true; } }
};

const getAuthorizationToken = async (req, username, password) => {
    const users = req.database.prepare('SELECT user_id, user_name, user_password FROM users WHERE user_name = ?').all(username);

    if(users.length === 0) throw new ApiError(401, 'Incorrect username or password');
    if(users.length > 1) throw new Error('Database error: more than one user with the same username'); //we assume user_name is unique

    const user = users[0];
    if(!comparePassword(password, user.user_password)) throw new ApiError(401, 'Incorrect username or password');

    const token = await createToken(req.database, user.user_id, req.socket.remoteAddress);

    const userInfo = new User(user.user_id, false);
    userInfo.fetch(req.database);

    return { security_header: token, user: userInfo.serialize() };
}

class ApiAuthorizationObject extends ApiObject {
    async post (req) {
        this.enforceContentType(req, 'application/json');
        const data = this.parseAndValidate(req.body, loginValidation, true);

        return await getAuthorizationToken(req, data.username, data.password);
    }
}

module.exports = ApiAuthorizationObject;