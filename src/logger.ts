import { log } from "./deps.ts";
const { getLogger } = log;

class Logger {
  get base() {
    return getLogger("disco");
  }
  get voice() {
    return getLogger("discoVoice");
  }
  get gateway() {
    return getLogger("discoGateway");
  }
  get rest() {
    return getLogger("discoRest");
  }
}

export const logger = new Logger();
