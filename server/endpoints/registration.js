const { ApiObject, ApiError } = require ('../apiobject.js');
const { User, hashPassword, validateUsername, validatePassword, validateEmail } = require ('../templates/user.js');
const { verifyToken, createToken } = require ('../templates/token.js');

const registrationValidation = {
    username: { required: true, type: 'string', lambda: validateUsername },
    password: { required: true, type: 'string', lambda: validatePassword },
    email: {required: true, type: 'string', lambda: validateEmail}
};

const checkDataUniqueness = (req, username, email) => {
    const sameUsers = req.database.prepare('SELECT user_id, user_name FROM users WHERE user_name = ?').all(username);
    if(sameUsers.length > 0) throw new ApiError(409,'Database error: user with the same username already exists.'); //we assume user_name is unique
    const sameEmails = req.database.prepare('SELECT user_id, user_name FROM users WHERE user_email = ?').all(email);
    if(sameEmails.length > 0) throw new ApiError(409,'Database error: user with the same email already exists.'); //we assume email is unique
    return true;
}

class ApiRegistrationObject extends ApiObject {
    async post (req) {
        this.enforceContentType(req, 'application/json');
        const data = this.parseAndValidate(req.body, registrationValidation, true);
        checkDataUniqueness(req,data.username,data.email);
        var usrNew= new User(null,true);
        usrNew.username=data.username;
        usrNew.password=await hashPassword(data.password);
        usrNew.email=data.email;
        usrNew.created=Date.now();
        usrNew.isAdmin="0";
        usrNew.insert(req.database);
        if(!usrNew.id)
        {
            throw new ApiError(403, 'User creation failed');
        }
        delete usrNew.password;
        usrNew = usrNew.serialize();
        return usrNew;
    }
}

module.exports = ApiRegistrationObject;