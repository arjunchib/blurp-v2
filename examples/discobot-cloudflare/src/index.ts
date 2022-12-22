import { Disco } from "@disco/cloudflare";
import * as Test from "./test";

// const handler = startWebhook({ commands: [Test] });

// export default {
//   async fetch(request: Request, environment: any) {
//     return await handler(request, environment);
//   },
// };

export default new Disco([Test]);
