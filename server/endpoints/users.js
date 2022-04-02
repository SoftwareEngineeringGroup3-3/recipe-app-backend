const { ApiObject, ApiError } = require ('../apiobject.js');
const { User, validateUsername, validatePassword,validateIsAdmin } = require ('../templates/user.js');

const userValidationFields = {
    username: { required: true, type: 'string', lambda: validateUsername },
    password: { required: true, type: 'string', lambda: validatePassword },
    isAdmin: { required: true, type: 'number', lambda: validateIsAdmin}
};

const checkUsernameUniqueness = (req, username) => {
    const sameUsers = req.database.prepare('SELECT user_id, user_name FROM users WHERE user_name = ?').all(username);
    if(sameUsers.length > 0) throw new ApiError(409,'Parameters error: user with the new username already exists.'); //we assume user_name is unique
    return true;
}

class ApiAuthorizationObject extends ApiObject {
    async put (req) {
        console.log("endpoints/users/{id}: recieved put");
        this.enforceContentType(req, 'application/json'); 
        if(!req.params.id)
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
            throw new ApiError(404, 'Ingredient not found')
        }

        if(userData.username!=newData.username) //this if is needed because of uniqueness check
        {
            checkUsernameUniqueness(newData.username);
            userData.username=newData.username;
        }

        userData.password=await hashPassword(newData.password);
        
        if(req.user.isAdmin)//only admin can change if others are admin.
        {
            userData.isAdmin=newData.isAdmin;
        }
        
        //Saved recipes and tags funcionaliyies not yet implemented or planned to be 
        //implemented in this sprint. So, add relevant assignments here when that's done.


        userData.sync(req.database);
        return await getAuthorizationToken(req, data.username, data.password);
    }
}

module.exports = ApiAuthorizationObject;