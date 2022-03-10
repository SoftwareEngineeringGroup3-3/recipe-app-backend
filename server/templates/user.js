const bcrypt = require('bcrypt');
const { DatabaseObject } = require('../databaseObject');

class User extends DatabaseObject {
    constructor(id = null, password = false) {
        super('users', id, !!id); //tableName='users', id=id, synchronized=true/false

        //setup properties
        this.bindProperty('id', 'user_id', this.id);
        this.bindProperty('isAdmin', 'user_is_admin');
        this.bindProperty('username', 'user_name');
        this.bindProperty('email', 'user_email');
        this.bindProperty('created', 'user_creation');
        this.bindProperty('lastLogin', 'user_last_login');
        this.bindProperty('lastLoginAddr', 'user_last_ip');

        //password optional (see /middleware/authorization)
        if(password) this.bindProperty('password', 'user_password');
    }
}

async function hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

async function comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

function validateUsername (username) {
    return (username.length >= 4 && username.length <= 20 && !(username.match (/[^0-9a-zA-Z_]/g)));
}

function validatePassword (password) {
    return (password.length >= 5 && password.length <= 32 && !password.match(/\s/g));
}

function validateEmail (email) {
    return (email.length <= 64 && !!email.match (/^[a-zA-Z0-9\-\_\.]+@[a-z0-9]+\.[a-z]{1,3}$/g))
}

function validateIsAdmin (isAdmin) {
    return (isAdmin == 0 || isAdmin == 1) ? true : false;
}

const userFormat = {
    user_name: { required: true, type: 'string', lambda: validateUsername },
    user_password: { required: true, type: 'string', lambda: validatePassword },
    user_email: { required: true, type: 'string', lambda: validateEmail },
    user_old_password: { required: false, type: 'string', lambda: validatePassword },
    user_is_admin: {required: true, type: 'number', lambda: validateIsAdmin}
};

module.exports = { User, hashPassword, comparePassword, validateUsername, validatePassword, validateEmail, validateIsAdmin, userFormat };