const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    // format: winston.format.simple(), // Log format

    format: winston.format.combine(
      winston.format.colorize({ all: true }), // Add color to the log output
      winston.format.timestamp(), // Add a timestamp to each log
      winston.format.printf(({ timestamp, level, message }) => {
        return `${timestamp} [${level}]: ${message}`;
      })
    ),
    transports: [
      new winston.transports.Console()
    ],
  });
  

logger.info("Test")
logger.warn("Test is good@@")
logger.info("Bibs is in form")
logger.error("hahahahah")
logger.info("gog go gogo goosdf")