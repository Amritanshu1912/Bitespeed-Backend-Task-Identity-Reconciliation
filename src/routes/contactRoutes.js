// src/routes/identifyRoutes.js
const express = require("express");
const {
  identifyContact,
  getAllContacts,
} = require("../controllers/contactController");
const { authenticate } = require("../middlewares/authMiddleware.js");

const router = express.Router();

router.post("/identify", identifyContact);
router.get("/contacts", authenticate, getAllContacts);

module.exports = router;
