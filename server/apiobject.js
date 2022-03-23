class ApiError extends Error {
    constructor (code, message) {
        super(message);
        this.code = code;
    }
}

class ApiObject {
    enforceContentType (req, contentType) {
        if(!req) throw new Error('req is null');

        if(!req.is(contentType)) throw new ApiError(400, `Content type is not supported`);
    }

    parseAndValidate (raw, validation, enforceReq = true) {
        try {
            const data = JSON.parse(raw);
            this.validateFormat(data, validation, enforceReq);

            return data;
        } catch (e) {
            throw (e instanceof ApiError) ? e : new ApiError(400, e.message);
        }
    }

    validateFormat (object, validation, enforceReq = true) {
        for(const field in validation) {
            const required = !!validation[field].required;
            const type = validation[field].type;
            const lambda = validation[field].lambda;

            if(enforceReq && required && object[field]==null) throw new ApiError(403, `Parameter ${field} is required!`);

            if(object[field]) {
                if(type && (typeof object[field]) !== type) throw new ApiError (403, `Parameter ${field} requires type ${type}`);
                if(lambda && !lambda(object[field])) throw new ApiError (403, `Parameter ${field} has invalid format`);
            }
        }
    }

    tryValidateFormat (object, validation, enforceReq = true) {
        try {
            this.validateFormat(object, validation, enforceReq);
        } catch (e) {
            return false;
        }

        return true;
    }

    async get(req) {
        throw new ApiError(405, 'method unsupported');
    }

    async post(req) { 
        throw new ApiError(405, 'method unsupported');
    }

    async delete(req) { 
        throw new ApiError(405, 'method unsupported');
    }

    async put(req) {
        throw new ApiError(405, 'method unsupported');
    }
}

function asyncHandlerWrapper (handler, req, res) {
    handler(req).then(data => {
        res.statusCode = 200;
        res.contentType('application/json');

        res.write(JSON.stringify(data));
        res.end();
    }).catch (error => {
        if(error instanceof ApiError) {
            res.statusCode = error.code;

            res.write(JSON.stringify({error: error.code, message: error.message}));
            res.end();
        } else {
            res.statusCode = 500;
            console.error(error);
            console.error(error.stack);

            res.write(JSON.stringify({error: 500, message: 'Internal server error occured'}));
            res.end();
        }
    });
};

module.exports.registerEndpoint = (app, url, endpoint) => {
    if(!(endpoint instanceof ApiObject)) throw new Error(`Endpoint handler has to be an instance of ApiObject`);

    app.get(url, (req, res) => {
        asyncHandlerWrapper((req) => endpoint.get(req), req, res);
    });

    app.post(url, (req, res) => {
        asyncHandlerWrapper((req) => endpoint.post(req), req, res);
    });

    app.delete(url, (req, res) => {
        asyncHandlerWrapper((req) => endpoint.delete(req), req, res);
    });

    app.put(url, (req, res) => {
        asyncHandlerWrapper((req) => endpoint.put(req), req, res);
    });
};

module.exports.ApiError = ApiError;
module.exports.ApiObject = ApiObject;