const { requireAdminAccount } = require("./auth");

// Authorizes either the legacy shared x-api-key OR a logged-in admin
// account's Bearer token. Kept separate from auth.js since it composes
// two different auth mechanisms rather than checking one.
function requireApiKey(req, res, next) {
  const key = req.headers["x-api-key"];
  if (key === process.env.API_KEY) {
    return next();
  }
  return requireAdminAccount(req, res, next);
}

module.exports = requireApiKey;
