class ConsoleLogger {
  constructor(private id: string) {}

  private wrapMsg(msg: string): string {
    return `[${this.id}] ${msg}`;
  }

  info(msg: string) {
    console.info(this.wrapMsg(msg));
  }

  debug(msg: string) {
    console.debug(this.wrapMsg(msg));
  }

  warn(msg: string) {
    console.warn(this.wrapMsg(msg));
  }

  error(msg: string) {
    console.error(this.wrapMsg(msg));
  }
}

class Logger {
  base = new ConsoleLogger("disco");
  voice = new ConsoleLogger("discoVoice");
  gateway = new ConsoleLogger("discoGateway");
  rest = new ConsoleLogger("discoRest");
  webhook = new ConsoleLogger("discoWebhook");
}

export const logger = new Logger();
