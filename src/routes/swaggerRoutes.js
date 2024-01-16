const express = require("express");
const { swaggerUi, specs } = require("../swaggerConfig");

const router = express.Router();

// Middleware to log incoming requests
router.use((req, res, next) => {
  req.logger.info(`Received ${req.method} request at ${req.originalUrl}`);
  next();
});

router.use("/api-docs", swaggerUi.serve);
router.get("/api-docs", swaggerUi.setup(specs));

module.exports = router;
