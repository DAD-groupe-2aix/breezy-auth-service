const AuthService = require("../services/auth.service");

async function register(req, res) {
  try {
    const { email, password } = req.body;
    const result = await AuthService.register(email, password);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    res.status(200).json(result);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
}

function validate(req, res) {
  return res.status(200).json({ message: "Token is valid", user: req.user });
}

module.exports = { register, login, validate };