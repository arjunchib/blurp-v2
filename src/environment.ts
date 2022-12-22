const API_VERSION = 10;

interface Environment {
  version: number;
  token?: string;
  applicationId?: string;
  guildId?: string;
  publicKey?: string;
}

export const environment: Environment = {
  version: API_VERSION,
};
