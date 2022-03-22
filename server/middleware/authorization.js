const { verifyToken } = require('../templates/token');
const { User } = require('../templates/user');

module.exports = async (req, res, next) => {
    if(req.database && req.headers && req.headers.authorization) {
        const token=req.headers.authorization.replace("Bearer ","");;
        if(token) {
            try {
                const user_id = await verifyToken(req.database, token, req.socket.remoteAddress);

                if(user_id) {
                    const user = new User(user_id, false);
                    user.fetch(req.database);

                    req.user = user;
                }
            } catch (error) {
                console.error(error);
                console.error(error.stack);
            }
        }
    }
    next();
};