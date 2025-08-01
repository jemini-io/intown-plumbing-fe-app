import pino from "pino";

export const logger = pino({
  name: "podium",
  level: "info",
  serializers: { err: pino.stdSerializers.err },
});
