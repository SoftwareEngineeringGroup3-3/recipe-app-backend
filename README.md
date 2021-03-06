# recipe-app-backend

#
## General info

### For implementing new features go to `Issues -> (pick one) -> Assign yourself -> Create a branch (if not created) -> switch to branch in VS Code -> After pull request has been merged DO NOT delete the branch you have worked on`

## Issues priority
##### `priority:highest` - MUST for the next checkpoint
##### `priority:high` - SHOULD for the next checkpoint
##### `priority:medium` - COULD for the next checkpoint
##### `priority:low` - future task, not needed for the next checkpoint
##### `priority:lowest` - not needed at all


## Project setup
#### To install dependencies: `npm install`
#### To setup database: `npm run setupProject`
#### To start server in DEV mode: `npm run dev`
#### To start server: `npm run startServer`

At the database setup there is admin account created.\
You can change the credentials in `setupDatabase.js`.\
Default values:\
`username: Matthew`\
`password: Mateusz`\
\
Password is hashed with sha256.\
\
To check if everything works:\
-open Postman\
-set request type to { `POST` | `PUT` | `GET` | `DELETE` }\
-url: `localhost:5000/api/{endpoint}`\
-headers: `Content-Type: "application/json"`\
-body (set to raw): `
  {
     "parameter_1": "value_1", ... ,
     "parameter_n": "value_n"
  }
`
