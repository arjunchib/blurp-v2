import { createServer } from "http";
import { serveWebhook } from "@blurp/node";
import * as Tally from "./tally.js";
import * as Test from "./test.js";

createServer(serveWebhook([Tally, Test])).listen(8787);
