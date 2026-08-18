const jwt = require("jsonwebtoken");

function signToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      name: user.name,
      isAdmin: Boolean(user.isAdmin),
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
}

module.exports = { signToken };
