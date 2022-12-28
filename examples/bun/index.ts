import { Disco } from "@disco/bun";
import * as Test from "./commands/test.js";

const app = new Disco([Test]);

// console.log(app);

export default {
  port: 8787,
  fetch: async (req: Request) => await app.fetch(req),
};
