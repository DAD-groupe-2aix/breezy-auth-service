const { verifyToken } = require("../utils/jwt.util");

function authenticate(req, res, next) {
  // Priorité 1 : cookie HttpOnly (flux normal après migration)
  // Priorité 2 : header Authorization Bearer (fallback Postman / avant migration frontend)
  let token = req.cookies?.accessToken;

  if (!token) {
    const authHeader = req.headers["authorization"];
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Authentication failed" });
  }
}

module.exports = { authenticate };