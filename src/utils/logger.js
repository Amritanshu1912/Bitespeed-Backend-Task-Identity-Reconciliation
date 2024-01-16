const winston = require("winston");

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.simple(),
    winston.format.timestamp({
      format: "DD-MM HH:mm:ss",
    }),
    winston.format.errors({ stack: true }), // Include stack traces
    winston.format.printf(({ timestamp, level, message, stack }) => {
      return `[${timestamp}] [${level}]: ${message}${
        stack ? `\n${stack}` : ""
      }`;
    })
  ),
  transports: [
    new winston.transports.Console({
      level: "debug",
      handleExceptions: true,
    }),
  ],
  exitOnError: false, // do not exit on handled exceptions
});

winston.addColors({
  error: "red",
  warn: "yellow",
  info: "cyan",
  debug: "green",
});

module.exports = logger;
