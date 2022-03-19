const express = require ('express');
const path = require ('path');
const cors = require('cors');
const cookieParser = require ('cookie-parser');

const config = require('./config.json');
const { registerEndpoint } = require('./apiobject');
const reqbody = require('./middleware/reqbody');
const database = require('./middleware/database');
const authorization = require('./middleware/authorization');

const app = express();

app.use(express.static(path.join(__dirname, '../public')));
app.use(reqbody);
app.use(cors ({
    origin: config.cors_origins,
    credentials: true
}));
app.use(cookieParser());
app.use(database);
app.use(authorization);



for(const url in config.api_objects) {
    //regiser configured endpoints (see config.json)
    registerEndpoint(app, url, new(require(config.api_objects[url]))());
}

app.listen(5000);
