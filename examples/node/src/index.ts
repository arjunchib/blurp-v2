import { createServer } from "http";
import { serveWebhook } from "@blurp/node";
import * as Tally from "./tally.js";

createServer(serveWebhook([Tally])).listen(8787);
