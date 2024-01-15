const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const expressJwt = require("express-jwt");
const authRoutes = require("./routes/authRoutes");
const contactRoutes = require("./routes/contactRoutes");
const swaggerRoutes = require("./routes/swaggerRoutes");
const logger = require("./path/to/logger");

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
app.use(cookieParser());
app.use(helmet());
app.use(expressJwt({ secret: process.env.JWT_SECRET, algorithms: ["HS256"] }));

// Routes
app.use("/auth", authRoutes);
app.use("/contact", contactRoutes);
app.use("/docs", swaggerRoutes);

module.exports = app;
