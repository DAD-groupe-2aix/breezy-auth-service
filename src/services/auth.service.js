const { hashPassword, comparePassword } = require("../utils/bcrypt.util");
const { generateToken, generateRefreshToken, verifyRefreshToken } = require("../utils/jwt.util");
const User = require("../models/user.model");
const RefreshToken = require("../models/refreshToken.model");

async function register(email, password) {
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) throw new Error("User already exists");

  const passwordHash = await hashPassword(password);
  const newUser = await User.create({ email, passwordHash });
  const token = generateToken({ id: newUser.id, email: newUser.email, role: newUser.role });

  return { token, userId: newUser.id, email: newUser.email, role: newUser.role };

}

async function login(email, password) {
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("Invalid credentials");

  const isValid = await comparePassword(password, user.passwordHash);
  if (!isValid) throw new Error("Invalid credentials");

  const token = generateToken({ id: user.id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id });

  const decoded = verifyRefreshToken(refreshToken);
  await RefreshToken.create({
    token: refreshToken,
    userId: user.id,
    expiresAt: new Date(decoded.exp * 1000),
  });

  return { token, refreshToken, userId: user.id, email: user.email, role: user.role };

}

async function refresh(refreshTokenStr) {
  const decoded = verifyRefreshToken(refreshTokenStr);
  if (!decoded) throw new Error("Refresh token invalide ou expiré");

  const stored = await RefreshToken.findOne({ where: { token: refreshTokenStr } });
  if (!stored) throw new Error("Refresh token non trouvé");

  await stored.destroy();

  const user = await User.findByPk(decoded.id);
  if (!user) throw new Error("Utilisateur introuvable");

  const newToken = generateToken({ id: user.id, email: user.email, role: user.role });
  const newRefreshToken = generateRefreshToken({ id: user.id });

  const newDecoded = verifyRefreshToken(newRefreshToken);
  await RefreshToken.create({
    token: newRefreshToken,
    userId: user.id,
    expiresAt: new Date(newDecoded.exp * 1000),
  });

  return { token: newToken, refreshToken: newRefreshToken };
}

async function logout(refreshTokenStr) {
  const stored = await RefreshToken.findOne({ where: { token: refreshTokenStr } });
  if (!stored) throw new Error("Refresh token non trouvé");
  await stored.destroy();
}
async function listUsers() {
  return User.findAll({ attributes: ["id", "email", "role"], order: [["id", "ASC"]] });
}

async function updateUserRole(id, role) {
  const validRoles = ["user", "moderator", "admin"];
  if (!validRoles.includes(role)) throw new Error("Rôle invalide");
  const user = await User.findByPk(id);
  if (!user) throw new Error("Utilisateur introuvable");
  user.role = role;
  await user.save();
  return { id: user.id, email: user.email, role: user.role };
}

async function adminCreateUser(email, password, role) {
  const validRoles = ["user", "moderator", "admin"];
  if (!validRoles.includes(role)) throw new Error("Rôle invalide");
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) throw new Error("User already exists");
  const passwordHash = await hashPassword(password);
  const newUser = await User.create({ email, passwordHash, role });
  return { userId: newUser.id, email: newUser.email, role: newUser.role };
}


module.exports = { register, login, refresh, logout, listUsers, updateUserRole, adminCreateUser };
