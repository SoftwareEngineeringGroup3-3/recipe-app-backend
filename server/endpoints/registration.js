const { ApiObject, ApiError } = require ('../apiobject.js');
const { User, hashPassword, validateUsername, validatePassword, validateEmail } = require ('../templates/user.js');
const { verifyToken, createToken } = require ('../templates/token.js');

const registrationValidation = {
    username: { required: true, type: 'string', lambda: validateUsername },
    password: { required: true, type: 'string', lambda: validatePassword },
    email: {required: true, type: 'string', lambda: validateEmail}
};

const checkUsernameUniqueness = (req, username) => {
    const users = req.database.prepare('SELECT user_id, user_name, user_password FROM users WHERE user_name = ?').all(username);
    if(users.length > 0) throw new ApiError(409,'Database error: more than one user with the same username'); //we assume user_name is unique
    return true;
}

class ApiRegistrationObject extends ApiObject {
    async post (req) {
        this.enforceContentType(req, 'application/json');
        const data = this.parseAndValidate(req.body, registrationValidation, true);
        checkUsernameUniqueness(req,data.username);
        var usrIns= new User(null,true);
        usrIns.username=data.username;
        usrIns.password=await hashPassword(data.password);
        usrIns.email=data.email;
        usrIns.created=Date.now();
        usrIns.isAdmin="0";
        usrIns.insert(req.database);
        return usrIns.serialize();
    }
}

module.exports = ApiRegistrationObject;