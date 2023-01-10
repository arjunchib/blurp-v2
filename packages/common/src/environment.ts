const API_VERSION = 10;

interface Environment {
  version: number;
  token?: string;
  applicationId?: string;
  guildId?: string;
  publicKey?: string;
}

const target = {
  version: API_VERSION,
};

const handler = {
  get(target: Environment, prop: keyof Environment, receiver: unknown) {
    if (!target[prop]) {
      throw new Error(`${prop} not set`);
    }
    return Reflect.get(target, prop, receiver);
  },
};

export const environment: Environment = new Proxy(target, handler);
