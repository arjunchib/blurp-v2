import { createServer } from "http";
import { serveWebhook } from "@blurp/node";
import Tally from "./tally.js";
import Test from "./test.js";

createServer(serveWebhook([Tally, Test])).listen(8787);
