import { Disco } from "@disco/cloudflare";
import * as Tally from "./tally.js";

const app = new Disco([Tally]);
export default app;
