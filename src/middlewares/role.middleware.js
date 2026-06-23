function requireRole(...roles) {
  return (req, res, next) => {
    const role = req.headers["x-user-role"];
    if (!roles.includes(role)) {
      return res.status(403).json({ message: "Action réservée aux administrateurs." });
    }
    next();
  };
}

module.exports = { requireRole };
