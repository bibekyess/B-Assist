const path = require("path");
const os = require("os"); 
const winston = require("winston");

class Logger {
 static instance = null; // Mkaes sure that there is only one instance of the logger

 constructor() {
    this.logger = winston.createLogger({
        level: process.env.LOG_LEVEL || 'debug', // FIXME
        format: winston.format.combine(
          winston.format.colorize({ all: true }), // Colorful adds beautiful motivation lol
          winston.format.timestamp(),
          winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level}]: ${message}`;
          })
        ),
        transports: [
          new winston.transports.Console(),
          new winston.transports.File({
            filename: path.join(os.homedir(), ".bassist", "service.log"),
            maxSize: 1000000, // 1 MB
            maxFiles: 1,
          })
        ],
        exceptionHandlers: [
          new winston.transports.File({ 
            filename: path.join(os.homedir(), ".bassist", "exceptions.log"),
            maxSize: 1000000, // 1 MB
            maxFiles: 1,            
          })
        ],
        rejectionHandlers: [
          new winston.transports.File({ 
            filename: path.join(os.homedir(), ".bassist", "rejections.log"),
            maxSize: 1000000, // 1 MB
            maxFiles: 1,            
          })
        ] 
    });
  }

 static getLogger() {
    if (this.instance === null) {
      this.instance = new this();
    }
    return this.instance;
  }
}

function info(msg) {
    console.log(msg);
    Logger.getLogger().logger.info(msg);
}

function error(msg) {
    console.log(msg);
    Logger.getLogger().logger.error(msg);
}

function debug(msg) {
  console.log(msg);
  Logger.getLogger().logger.debug(msg);
}

module.exports = {
    logInfo: info,
    logErr: error,
    logDebug: debug
}

