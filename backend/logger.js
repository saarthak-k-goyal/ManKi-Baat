const winston = require("winston");
const path = require("path");

const logDirectory = path.join(__dirname, "logs");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(info => {
      // If log contains a JSON object, pretty print it
      let msg = typeof info.message === "string" ? info.message : JSON.stringify(info.message);

      return `[${info.timestamp}] ${info.level.toUpperCase()} → ${msg}`;
    })
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logDirectory, "requests.log"),
      level: "info",
    }),
    new winston.transports.File({
      filename: path.join(logDirectory, "errors.log"),
      level: "error",
    })
  ]
});

// Console output pretty in dev mode
if (process.env.NODE_ENV !== "production") {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(info => `[${info.timestamp}] ${info.level}: ${info.message}`)
    )
  }));
}

module.exports = logger;
