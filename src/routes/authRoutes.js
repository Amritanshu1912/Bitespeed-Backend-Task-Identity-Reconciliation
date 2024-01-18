const express = require("express");
const router = express.Router();
const { signup, signin, logout } = require("../controllers/authController.js");
const {
  validateSignUpUser,
  validateLoginUser,
  handleValidationErrors,
} = require("../validators/inputValidator.js");

// Middleware to log incoming requests
router.use((req, res, next) => {
  req.logger.info(`Received ${req.method} request at ${req.originalUrl}`);
  next();
});

router.post("/signup", validateSignUpUser, handleValidationErrors, signup);
router.post("/signin", validateLoginUser, handleValidationErrors, signin);
router.get("/logout", logout);

module.exports = router;
