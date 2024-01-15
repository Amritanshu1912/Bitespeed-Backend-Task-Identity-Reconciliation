const logger = require("../utils/logger.js");
const { body, validationResult } = require("express-validator");

// Validation for the registerUser endpoint
const validateRegisterUser = [
  body("username").trim().notEmpty().withMessage("Username is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

// Validation for the loginUser endpoint
const validateLoginUser = [
  body("username").trim().notEmpty().withMessage("Username is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

// Validation error handler middleware
const handleValidationErrors = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Log the validation errors
      logger.error(errors.array());

      // Return a more descriptive status code
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  } catch (error) {
    // Log any unexpected errors
    logger.error(error);
    next(error);
  }
};

module.exports = {
  validateRegisterUser,
  validateLoginUser,
  handleValidationErrors,
};
