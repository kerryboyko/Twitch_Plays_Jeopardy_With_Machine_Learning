import dotenv from "dotenv";
import pick from "lodash/pick";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../", ".env") });

if (process.env.CANARY !== "true") {
  console.warn(
    `.env file not found. It should be at ${path.resolve(
      __dirname,
      "../../../",
      ".env"
    )}`
  );
}

const config: Record<string, string> = pick(process.env, [
  "DB_URL",
  "DB_NAME",
  "JSERVICE_URL",
  "BOT_USERNAME",
  "CHANNEL_NAME",
  "OAUTH_TOKEN",
  "SERVER_PORT",
  "TWITCH_LOGIN_CLIENT_ID",
  "JEOPARDY_INTERACTION_CLIENT_ID",
  "JEOPARDY_INTERACTION_SECRET",
  "JEOPARDY_INTERACTION_EXTENSION_SECRET",
]) as Record<string, string>;

export default config;
