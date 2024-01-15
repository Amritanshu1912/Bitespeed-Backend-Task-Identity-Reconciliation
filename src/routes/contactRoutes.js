const express = require("express");
const router = express.Router();
const {
  identifyContact,
  getAllContacts,
} = require("../controllers/contactController");
const {
  validateContact,
  handleValidationErrors,
} = require("../validators/inputValidator.js");

const { authenticate } = require("../middlewares/authMiddleware.js");

// Middleware to log incoming requests
router.use((req, res, next) => {
  req.logger.info(`Received ${req.method} request at ${req.originalUrl}`);
  next();
});

router.post(
  "/identify",
  validateContact,
  handleValidationErrors,
  identifyContact
);
router.get("/contacts", authenticate, getAllContacts);

module.exports = router;
