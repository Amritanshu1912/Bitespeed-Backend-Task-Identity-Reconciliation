const express = require("express");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const router = express.Router();

// Middleware to log incoming requests
// Middleware to log incoming requests
router.use((req, res, next) => {
  req.logger.info(`Received ${req.method} request at ${req.originalUrl}`);
  next();
});

router.use(
  "/",
  swaggerUi.serve,
  swaggerUi.setup(YAML.load(path.join(__dirname, "../swagger.yaml")))
);

module.exports = router;
