import { assert } from "console";
import dotenv from "dotenv";
import pick from "lodash/pick";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../", ".env") });
console.log("path to env:", path.resolve(__dirname, "../../../", ".env"));
assert(process.env.CANARY === "true");

const config: Record<string, string> = pick(process.env, [
  "DB_URL",
  "DB_NAME",
  "JSERVICE_URL",
  "BOT_USERNAME",
  "CHANNEL_NAME",
  "OAUTH_TOKEN",
  "SERVER_PORT",
  "JEOPARDY_INTERACTION_CLIENT_ID",
  "JEOPARDY_INTERACTION_SECRET",
]) as Record<string, string>;
export default config;
