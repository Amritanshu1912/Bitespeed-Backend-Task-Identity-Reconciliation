const logger = require("./utils/logger");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const { expressjwt: jwt } = require("express-jwt");

const authRoutes = require("./routes/authRoutes");
const contactRoutes = require("./routes/contactRoutes");
const swaggerRoutes = require("./routes/swaggerRoutes");

const app = express();

// Middleware
app.use((req, res, next) => {
  // Attach logger to request object for easy access in routes
  req.logger = logger;
  next();
});

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(helmet());
app.use(
  "/contact/contacts",
  jwt({ secret: process.env.JWT_SECRET, algorithms: ["HS256"] })
);

// Routes
app.use("/auth", authRoutes);
app.use("/contact", contactRoutes);
app.use("/api-docs", swaggerRoutes);

module.exports = app;
