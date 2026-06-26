const { body, validationResult } = require("express-validator");

const registerRules = [
  body("email")
    .isEmail().withMessage("Format d'email invalide")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 8 }).withMessage("Le mot de passe doit contenir au moins 8 caractères"),
];

const loginRules = [
  body("email")
    .notEmpty().withMessage("Email ou pseudo requis")
    .if((value) => typeof value === "string" && value.includes("@"))
    .isEmail().withMessage("Format d'email invalide")
    .normalizeEmail(),
  body("password")
    .notEmpty().withMessage("Le mot de passe est requis"),
];


function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

module.exports = { registerRules, loginRules, validate };
