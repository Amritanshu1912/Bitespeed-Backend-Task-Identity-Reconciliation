// src/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const { signup, signin, logout } = require("../controllers/authController.js");
const {
  validateRegisterUser,
  validateLoginUser,
  handleValidationErrors,
} = require("../validators/authInputValidator.js");

router.post("/signup", validateRegisterUser, handleValidationErrors, signup);
router.post("/signin", validateLoginUser, handleValidationErrors, signin);
router.get("/logout", logout);

module.exports = router;
