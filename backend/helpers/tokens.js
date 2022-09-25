const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");


// let payload = {
//   username: "windyfrost",
//   isAdmin: true,
// };

// console.log(jwt.sign(payload, SECRET_KEY));

/** return signed JWT from user data. */

function createToken(user) {
  console.assert(
    user.isAdmin !== undefined,
    "createToken passed user without isAdmin property"
  );

  let payload = {
    username: user.username,
    isAdmin: user.isAdmin || false,
  };

  return jwt.sign(payload, SECRET_KEY);
}

module.exports = { createToken };
