const winston = require("winston");

// Define the formats
const formats = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.simple(),
  winston.format.timestamp({
    format: "DD-MM HH:mm:ss",
  }),
  winston.format.errors({ stack: true }), // Include stack traces
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `[${timestamp}] [${level}]: ${message}${stack ? `\n${stack}` : ""}`;
  })
);

// Define the colors
const colors = {
  error: "red",
  warn: "yellow",
  info: "cyan",
  debug: "green",
};

// Create the logger
const logger = winston.createLogger({
  format: formats,
  transports: [
    new winston.transports.Console({
      level: "debug",
      handleExceptions: true,
    }),
  ],
  exitOnError: false, // do not exit on handled exceptions
});

// Add the colors
winston.addColors(colors);

module.exports = logger;
