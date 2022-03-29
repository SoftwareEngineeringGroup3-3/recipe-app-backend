const { verifyToken } = require('../templates/token');
const { User } = require('../templates/user');

module.exports = async (req, res, next) => {
    if(req.database && req.cookies) {
        const token = req.cookies.security_header;

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