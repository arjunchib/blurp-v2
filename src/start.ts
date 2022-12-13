import { Context } from "./context.ts";
import { Options } from "./types.ts";
import { log } from "./deps.ts";

function setupLogger(logs: Options["logs"]) {
  // Skip setting up logging if false
  if (logs === false) return;
  // Use logging config if provided
  if (logs && typeof logs === "object") return log.setup(logs);
  // Setup logging with provided level
  logs = logs || "INFO";
  const defaultLogger = {
    level: logs,
    handlers: ["console"],
  };
  log.setup({
    handlers: {
      console: new log.handlers.ConsoleHandler(logs, {
        formatter: (logRecord) => {
          let { loggerName } = logRecord;
          if (loggerName !== "disco") {
            loggerName = loggerName.replace("disco", "").toLowerCase();
          }
          return `[${loggerName}] ${logRecord.levelName} ${logRecord.msg}`;
        },
      }),
    },
    loggers: {
      disco: defaultLogger,
      discoVoice: defaultLogger,
      discoRest: defaultLogger,
      discoGateway: defaultLogger,
      discoWebhook: defaultLogger,
    },
  });
}

export async function start(options: Options) {
  setupLogger(options?.logs);
  const ctx = new Context(options);
  await ctx.start();
}
