import pino from "pino";

export const logger = pino({
  name: "api",
  level: "info",
  serializers: { err: pino.stdSerializers.err },
});
