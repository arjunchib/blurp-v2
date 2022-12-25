import { Disco } from "@disco/cloudflare";
import * as Tally from "./tally.js";

// const handler = startWebhook({ commands: [Test] });

// export default {
//   async fetch(request: Request, environment: any) {
//     return await handler(request, environment);
//   },
// };

export default new Disco([Tally]);
