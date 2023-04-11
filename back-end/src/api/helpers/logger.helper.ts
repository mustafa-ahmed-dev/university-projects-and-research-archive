import path from "path";
import { createLogger, format, transports } from "winston";

const logsDir = path.join(__dirname, "..", "logs");

const logger = createLogger({
  level: "info",
  format: format.json(),
  transports: [
    new transports.Console(),
    new transports.File({
      dirname: logsDir,
      filename: "error.log",
      level: "error",
    }),
    new transports.File({ dirname: logsDir, filename: "combined.log" }),
  ],
});

export default logger;
