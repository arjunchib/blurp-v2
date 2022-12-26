import { Disco } from "@disco/cloudflare";
import * as Tally from "./tally.js";

// const handler = startWebhook({ commands: [Test] });

// export default {
//   async fetch(request: Request, environment: any) {
//     return await handler(request, environment);
//   },
// };

const app = new Disco([Tally]);

// export default {
//   fetch: (req: any, env: any, ctx: any) => app.fetch(req, env, ctx),
// };
export default app;
