const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/auth.controller");
const { authenticate } = require("../middlewares/auth.middleware");
const { registerRules, loginRules, validate } = require("../middlewares/validate.middleware");

router.post("/register", registerRules, validate, AuthController.register);
router.post("/login", loginRules, validate, AuthController.login);
router.get("/validate", authenticate, AuthController.validate);
router.post("/refresh", AuthController.refresh);
router.post("/logout", AuthController.logout);

module.exports = router;