import dotenv from "dotenv";
import pick from "lodash/pick";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../", ".env") });

const config: Record<string, string> = pick(process.env, [
  "FRONTEND_PORT",
  "TWITCH_LOGIN_CLIENT_ID",
  "TWITCH_LOGIN_CLIENT_SECRET",
  "AUTH_0_DOMAIN",
  "AUTH_0_CLIENT_ID",
  "JEOPARDY_INTERACTION_CLIENT_ID",
  "JEOPARDY_INTERACTION_SECRET",
  "JEOPARDY_INTERACTION_EXTENSION_SECRET",
  "SERVER_URL",
  "SERVER_PORT",
]) as Record<string, string>;

export default config;
