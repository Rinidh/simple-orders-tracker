import winston from "winston";
import "winston-mongodb";
import path from "path";

const { combine, timestamp, printf, colorize, errors, splat } = winston.format;

const logDir = path.resolve(process.cwd(), "logs");

const serializeMeta = (meta: unknown) => {
  if (meta instanceof Error) {
    return meta.stack ?? `${meta.name}: ${meta.message}`;
  }

  if (typeof meta === "object" && meta !== null) {
    try {
      return JSON.stringify(meta, null, 2);
    } catch {
      return String(meta);
    }
  }

  return String(meta);
};

const baseFormat = combine(
  timestamp(),
  errors({ stack: true }),
  splat(),
  printf((info) => {
    const message =
      typeof info.message === "string"
        ? info.message
        : info.message instanceof Error
          ? info.message.message
          : info.message !== undefined
            ? serializeMeta(info.message)
            : "";

    const splatMeta = (info[Symbol.for("splat")] as unknown[]) ?? [];
    const extras = splatMeta.map(serializeMeta).filter(Boolean);
    const stackText =
      info.stack && info.stack !== message ? serializeMeta(info.stack) : "";
    const parts = [message];

    if (stackText) {
      parts.push(stackText);
    }
    if (extras.length) {
      parts.push(...extras);
    }

    return `${info.timestamp} ${info.level}: ${parts.join("\n")}`;
  }),
);

const consoleFormat = combine(colorize({ all: true }), baseFormat);
const fileFormat = combine(timestamp(), errors({ stack: true }), splat());

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? "info",
  format: baseFormat,
  transports: [
    new winston.transports.Console({ format: consoleFormat }),
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      format: fileFormat,
    }),
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
      level: "info",
      format: fileFormat,
    }),
    new winston.transports.File({
      filename: path.join(logDir, "debug.log"),
      level: "debug",
      format: fileFormat,
    }),
  ],
});

// Add MongoDB transport if MONGODB_URI provided
if (process.env.MONGODB_URI) {
  // winston-mongodb registers a MongoDB transport on winston.transports.MongoDB
  // @ts-ignore
  logger.add(
    new (winston.transports as any).MongoDB({
      level: "info",
      db: process.env.MONGODB_URI,
      options: { useUnifiedTopology: true },
      collection: process.env.LOG_COLLECTION ?? "logs",
      tryReconnect: true,
      metaKey: "meta",
    }),
  );
}

export default logger;
