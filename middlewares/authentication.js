const { secret } = require('../config');
const jwt = require("jsonwebtoken");

// Middleware function to require a login
function requireLogin(req, res, next) {
  // if there is no token stored in cookies, the request is unauthorized
  if (!req.headers.authorization) {
    console.log("Unauthorized user access");
    return res.status(403).send({ message: "Need to authenticate first" });
  }

  try {
    // use the jwt.verify method to verify the access token, it throws an error if the token has expired or has a invalid signature
    // Format is: Authorization: Bearer <token>, so in "Bearer <token>" after the first space we get the token
    const accessToken = req.headers.authorization.split(" ")[1];
    payload = jwt.verify(accessToken, secret);
    console.log("Logged user accessing the site " + payload.id);
    req.user = payload; // you can retrieve further details from the database. Here I am just taking the name to render it wherever it is needed.
    next();
  } catch (err) {
    // Maybe it expired, or something else even though the token is valid
    return res.status(403).json("You need to login first");
  }
}

function generateToken(user) {
  let payload = {
    email: user.email,
    id: user._id,
    type: user.type,
  };
  let oneDay = 60 * 60 * 24;
  return (token = jwt.sign(payload, secret, { expiresIn: oneDay }));
}

module.exports = { requireLogin, generateToken };