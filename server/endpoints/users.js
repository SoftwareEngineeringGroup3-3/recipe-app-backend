const { ApiObject, ApiError } = require ('../apiobject.js');
const { User, validateUsername, validatePassword,validateIsAdmin, hashPassword } = require ('../templates/user.js');

const userValidationFields = {
    id: { required: true, type: 'number', lambda: () => { return true; } },
    username: { required: false, type: 'string', lambda: validateUsername },
    password: { required: false, type: 'string', lambda: validatePassword },
    savedRecipes: { required: false, type: 'array', lambda: () => { return true; } }
};

const checkUsernameUniqueness = (req, username) => {
    const sameUsers = req.database.prepare('SELECT user_id, user_name FROM users WHERE user_name = ?').all(username);
    if(sameUsers.length > 0) throw new ApiError(409,'Parameters error: user with the new username already exists.'); //we assume user_name is unique
    return true;
}

/**
 * 
 * @param {Processed_GET_Request} req - Get request that contains page and limit as parameters, and processed by middleware to have an opened sqlite3 database.
 * @returns a JSON body of response containing total number of users and list of objects containing the ID and username for every user on the given page and limit.
 */
const getAllUsers = (req) => {
    const page = req.query.page;
    const limit = req.query.limit;
    const users = req.database.prepare(`SELECT user_id AS id, user_name AS name, user_is_admin as is_admin, user_email as email FROM users`).all();
    let resBody = { total_users: users.length, users: []};
    let pageUsers = [];
    for(let i = (page-1) * limit; i < page*limit; i++) {
        if(users[i] != null) pageUsers.push(users[i]);
        else break;
    }
    resBody.users = pageUsers;
    return resBody;
}


class ApiUserObject extends ApiObject {

    async delete (req) {
        if(!req.user.isAdmin) {
            throw new ApiError(401, 'User is not authorized!');
        }
        if(!req.user.id) {
            throw new ApiError(400, 'ID is not defined');
        }
        let userData= new User(req.params.id);
        if(!userData.fetch(req.database)) //fetch returns false if id doesn't exist or true if it does.
        {
            throw new ApiError(404, 'User not found')
        }
        userData.delete(req.database);
        return userData.serialize();
    }

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

        if(newData.savedRecipes)
        {
            userData.savedRecipes = newData.savedRecipes;
        }
                
        //Saved recipes and tags funcionalities not yet implemented or planned to be 
        //implemented in this sprint. So, add relevant assignments here when that's done.


        userData.sync(req.database);
        return userData.serialize();
    }


    async get(req){
        if(!req.user || (req.user.id != req.params.id && !req.user.isAdmin)) {
            throw new ApiError(401, 'Not authorized.');
        }

        if(req.params.id == 'all') {
            console.log('Received: POST ingredients/all');
            console.log(req.params)
            if(!req.query || !req.query.page || !req.query.limit || isNaN(req.query.page) || isNaN(req.query.limit))
            {
                throw new ApiError(403,"Validation Error!")
            }
            else
            {
                return getAllUsers(req);
            }
        }
    }
}

module.exports = ApiUserObject;