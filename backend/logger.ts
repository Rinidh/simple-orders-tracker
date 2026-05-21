import winston from "winston";
import "winston-mongodb";
import path from "path";
import _ from "lodash";

const { combine, timestamp, printf, colorize, errors, splat } = winston.format;

const logDir = path.resolve(process.cwd(), "logs");

//need to insert this custom format to ably apply meta data info to mongodb docs
const insertMetaForWinstonMongo = winston.format((logEntry) => {
  logEntry.meta = _.chain(logEntry)
    .omit(logEntry as any, ["level", "message"])
    .omitBy((value, key) => _.isSymbol(key))
    .value();
  // For winston-mongodb < 5.x, use:
  // logEntry.meta = _.chain(logEntry).omit(logEntry, ['level', 'message']).omitBy((value, key) => _.isSymbol(key)).value();
  return logEntry;
});

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

// Message formatter expects a `timestamp` field to be provided by the
// transport-specific format (so transports can choose ISO vs human formats).
const messageFormat = combine(
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

// Transport-specific timestamp formats
const humanTimestamp = timestamp({
  format: () =>
    new Date().toLocaleString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }),
});

const isoTimestamp = timestamp({ format: () => new Date().toISOString() });

const consoleFormat = combine(
  humanTimestamp,
  colorize({ all: true }),
  messageFormat,
);
const fileFormat = combine(humanTimestamp, messageFormat);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? "info",
  format: messageFormat,
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

// Expose a function to add the MongoDB transport at runtime. This allows
// `dotenv.config()` to run before we check environment variables so the
// transport is reliably added when a URI is provided.
export function addMongoTransport(mongoUri?: string) {
  if (!mongoUri) return;

  // winston-mongodb registers a MongoDB transport on winston.transports.MongoDB
  // @ts-ignore
  logger.add(
    new (winston.transports as any).MongoDB({
      level: "info",
      db: mongoUri,
      options: { useUnifiedTopology: true },
      collection: process.env.LOG_COLLECTION ?? "logs",
      tryReconnect: true,
      metaKey: "meta",
      format: combine(insertMetaForWinstonMongo(), isoTimestamp, messageFormat),
    }),
  );
}

export default logger;
