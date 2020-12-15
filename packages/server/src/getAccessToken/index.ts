import axios from "axios";
import config from "../config";

export const getAccessToken = async (): Promise<string> => {
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
    return accessToken;
  } catch (err) {
    console.error(err);
  }
};

export default getAccessToken;
