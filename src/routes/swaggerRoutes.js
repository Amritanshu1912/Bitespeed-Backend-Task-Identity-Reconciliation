// routes/swaggerRoutes.js

const express = require("express");
const { swaggerUi, specs } = require("../..swaggerConfig");

const router = express.Router();

router.use("/api-docs", swaggerUi.serve);
router.get("/api-docs", swaggerUi.setup(specs));

module.exports = router;
