const { ApiObject, ApiError } = require ('../apiobject.js');
const { User, validateUsername, validatePassword,validateIsAdmin, hashPassword } = require ('../templates/user.js');

const userValidationFields = {
    username: { required: false, type: 'string', lambda: validateUsername },
    password: { required: false, type: 'string', lambda: validatePassword }
};

const checkUsernameUniqueness = (req, username) => {
    const sameUsers = req.database.prepare('SELECT user_id, user_name FROM users WHERE user_name = ?').all(username);
    if(sameUsers.length > 0) throw new ApiError(409,'Parameters error: user with the new username already exists.'); //we assume user_name is unique
    return true;
}

class ApiUserEditObject extends ApiObject {
    async put (req) {
        console.log("endpoints/users/{id}: recieved put");
        this.enforceContentType(req, 'application/json'); 
        if(!req.params.id || isNaN(req.params.id))
        {
             throw new ApiError(403, 'Validation exception.');
        }
        if(!req.user || (req.user.id != req.params.id && !req.user.isAdmin)) {
            throw new ApiError(401, 'Not authorized.'); //can only edit your own profile.
        }
        const newData = this.parseAndValidate(req.body, userValidationFields, true);
        let userData= new User(req.params.id);
        if(!userData.fetch(req.database)) //fetch returns false if id doesn't exist or true if it does.
        {
            throw new ApiError(404, 'User not found')
        }

        if(newData.username && userData.username!=newData.username) //this if is needed because of uniqueness check
        {
            checkUsernameUniqueness(req,newData.username);
            userData.username=newData.username;
        }

        if(newData.password)
        {
            userData.password=await hashPassword(newData.password);
        }
                
        //Saved recipes and tags funcionalities not yet implemented or planned to be 
        //implemented in this sprint. So, add relevant assignments here when that's done.


        userData.sync(req.database);
        return userData.serialize();
    }
}

module.exports = ApiUserEditObject;