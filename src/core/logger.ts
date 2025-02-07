import { createLogger, format, transports } from "winston";
import path from "path";

const logFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.printf(({ timestamp, level, message, stack }) => {
    return stack
      ? `[${timestamp}] [${level}] ${message}\nStack: ${stack}`
      : `[${timestamp}] [${level}] ${message}`;
  })
);

const logger = createLogger({
  level: "info",
  format: logFormat,
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), logFormat),
    }),    
  ],
  exitOnError: false,
});

export default logger;
