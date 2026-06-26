const AuthService = require("../services/auth.service");

const IS_PROD = process.env.NODE_ENV === "production";

const ACCESS_MAX_AGE  = 15 * 60 * 1000;       // 15 minutes en ms
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 jours en ms

function setAccessCookie(res, token) {
  res.cookie("accessToken", token, {
    httpOnly: true,
    sameSite: "strict",
    secure: IS_PROD,
    maxAge: ACCESS_MAX_AGE,
  });
}

function setRefreshCookie(res, token) {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    sameSite: "strict",
    secure: IS_PROD,
    maxAge: REFRESH_MAX_AGE,
  });
}

function clearAuthCookies(res) {
  res.clearCookie("accessToken",  { httpOnly: true, sameSite: "strict", secure: IS_PROD });
  res.clearCookie("refreshToken", { httpOnly: true, sameSite: "strict", secure: IS_PROD });
}

async function register(req, res) {
  try {
    const { email, password } = req.body;
    const result = await AuthService.register(email, password);
    setAccessCookie(res, result.token);
    res.status(201).json({ userId: result.userId, email: result.email, role: result.role });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    setAccessCookie(res, result.token);
    setRefreshCookie(res, result.refreshToken);
    res.status(200).json({ userId: result.userId, email: result.email, role: result.role });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
}

function validate(req, res) {
  res.set("X-User-Id", String(req.user.id));
  res.set("X-User-Role", req.user.role);
  return res.status(200).json({ message: "Token is valid", user: req.user });
}

async function refresh(req, res) {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) return res.status(400).json({ message: "Refresh token requis" });
    const result = await AuthService.refresh(refreshToken);
    setAccessCookie(res, result.token);
    setRefreshCookie(res, result.refreshToken);
    res.status(200).json({ message: "Token renouvelé" });
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
}

async function logout(req, res) {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      await AuthService.logout(refreshToken);
    }
    clearAuthCookies(res);
    res.status(200).json({ message: "Déconnecté avec succès" });
  } catch (err) {
    clearAuthCookies(res);
    res.status(200).json({ message: "Déconnecté avec succès" });
  }
}
async function listUsers(req, res) {
  try {
    const users = await AuthService.listUsers();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function updateUserRole(req, res) {
  try {
    const result = await AuthService.updateUserRole(req.params.id, req.body.role);
    res.status(200).json({ message: `Rôle mis à jour : ${result.role}`, user: result });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function adminCreateUser(req, res) {
  try {
    const { email, password, role } = req.body;
    const result = await AuthService.adminCreateUser(email, password, role);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

module.exports = { register, login, validate, refresh, logout, listUsers, updateUserRole, adminCreateUser };
