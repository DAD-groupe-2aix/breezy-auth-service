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

async function refresh(req, res) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: "Refresh token requis" });
    const result = await AuthService.refresh(refreshToken);
    res.status(200).json(result);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
}

async function logout(req, res) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: "Refresh token requis" });
    await AuthService.logout(refreshToken);
    res.status(200).json({ message: "Déconnecté avec succès" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

module.exports = { register, login, validate, refresh, logout };