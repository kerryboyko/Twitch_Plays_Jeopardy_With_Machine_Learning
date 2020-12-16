import axios from "axios";
import config from "../config";

export const getAccessToken = async (): Promise<string> | never => {
  try {
    const response = await axios.post(
      "https://id.twitch.tv/oauth2/token",
      {},
      {
        params: {
          client_id: config.JEOPARDY_INTERACTION_CLIENT_ID,
          client_secret: config.JEOPARDY_INTERACTION_SECRET,
          grant_type: "client_credentials",
        },
      }
    );
    const accessToken = response?.data?.access_token;
    if (accessToken.length) {
      console.log(`Confirmed Access Token`);
    }
    return accessToken;
  } catch (err) {
    console.error(err);
    throw new Error(err);
  }
};

export default getAccessToken;
