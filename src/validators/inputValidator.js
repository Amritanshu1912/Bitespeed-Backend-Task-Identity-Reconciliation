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

// Validation for the identify endpoint
const validateContact = [
  body("email").trim().isEmail().withMessage("Invalid email"),
  body("phoneNumber")
    .trim()
    .isMobilePhone()
    .withMessage("Invalid phone number"),
];

// Validation error handler middleware
const handleValidationErrors = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.logger.error(errors.array());
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  } catch (error) {
    req.logger.error(error);
    next(error);
  }
};

module.exports = {
  validateRegisterUser,
  validateLoginUser,
  validateContact,
  handleValidationErrors,
};
