# Api-App-RT
 -- School Project --

An API to be used with an Android application. You can register reports, add images, login as a new user or administrator, using NodeJS, Express, MongoDB and Moongose.

- NodeJS / Express  🟢
- MongoDB 🍃
- Multer 📸
- JWT 🔑

## Project Description
The API can register multiple users, register new reports with the option to add images, login with existing users and can comment on report to update them.
This is a school project that we worked on together with the Parque Rufino Tamayo, in Nuevo León, México. Along with application, we made an Android Application that consume the API.

This API was uploaded to a server with Ubuntu, and it worked there. We used _Express_ for multiple routes, and _Moongose_ to access to the _MongoDB_ database, also we used _Multer_ to saved all images in a specific folder and _JWT_ for the login.


### Packages, how to Install and Run
Maybe you will have to install multiple package, only copy this lines:
| Packages | Links |
| ------ | ------ |
| [Express][express] | ```npm install express``` |
| [Multer][multer] | ```npm install multer``` |
| [Mongoose][mongoose]| ```npm install mongoose``` |
| [JWT (JSONWebToken)][jsonwebtoken]| ```npm install jsonwebtoken``` |


If you already have all libraries, just drop the folder into VSCode and run!
``` 
$ node server.js
```

## How to Use 
If you want to try this API, you could use Postman or a similar application, just check all routes, and send the correct information.
Also, install MongoDB Atlas and start a new database.


## License
MIT License

Copyright (c) [2020] [Erik Js. González]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

**Free Software, thanks Lord!**

[//]: #
   [express]: <https://expressjs.com/>
   [multer]: <https://www.npmjs.com/package/multer>
   [mongoose]: <https://mongoosejs.com/>
   [jsonwebtoken]: <https://github.com/auth0/node-jsonwebtoken>
