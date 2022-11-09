class DiscordRestService {
  private readonly baseUrl: string;

  constructor(private version: number) {
    this.baseUrl = `https://discord.com/api/v${version}`;
  }

  private async fetch<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${url}`, {
      headers: {
        Authorization: `Bot ${process.env.TOKEN}`,
      },
      ...init,
    });
    return await res.json<T>();
  }
}
