const winston = require("winston");

const customFormat = winston.format.combine(
  winston.format.simple(),
  winston.format.timestamp(),
  winston.format.printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level}]: ${message}`;
  })
);

const options = {
  file: {
    level: "info",
    filename: "../../logs/combined.log",
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: true,
  },
  console: {
    level: "debug",
    handleExceptions: true,
    json: false,
    colorize: true,
  },
};

// Define and configure the logger
const logger = winston.createLogger({
  format: customFormat,
  transports: [
    new winston.transports.Console(options.console),
    new winston.transports.File(options.file),
  ],
});

module.exports = logger;
