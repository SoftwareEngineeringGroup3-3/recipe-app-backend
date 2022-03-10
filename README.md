# recipe-app-backend

### To install dependencies: `npm install`
### To setup database: `npm run setupProject`
### To start server: `npm run startServer`

At the database setup there is admin account created.\
You can change the credentials in `setupDatabase.js`.\
Default values:\
`username: Matthew`\
`password: Mateusz`\
\
To check if everything works:\
-open Postman\
-set request type to `POST`\
-url: `localhost:3000/api/logging`\
-headers: `Content-Type: "application/json"`\
-body (set to raw): `
  {
     "user_name": "Matthew",
     "user_password": "Mateusz"
  }
`
