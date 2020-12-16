/* eslint-disable @typescript-eslint/no-explicit-any */
import { onMounted, reactive, toRefs } from "vue";
import axios from "axios";
import { Ref } from "vue";
import config from "../secret/config.json";
declare global {
  interface Window {
    Twitch: any;
  }
}

window.Twitch = window.Twitch || {};

interface TwitchState {
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string;
  profile: any;
}
interface TwitchHook {
  isLoggedIn: Ref<boolean>;
  isLoading: Ref<boolean>;
  error: Ref<string>;
  profile: Ref<any>;
  loadProfile: () => Promise<void>;
  requestId: () => void;
}
const useTwitch = (): TwitchHook => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const twitchExt: any = window.Twitch!.ext;

  const state = reactive<TwitchState>({
    isLoggedIn: false,
    isLoading: false,
    error: "",
    profile: {},
  });

  const loadProfile = async () => {
    state.isLoading = true;
    try {
      const response = await axios.post(
        `${config.SERVER_URL}:${config.SERVER_PORT}`,
        {},
        {
          headers: { authorization: `Bearer ${twitchExt.viewer.sessionToken}` },
        }
      );
      console.log("response", response);
      state.profile = response.data;
    } catch (err) {
      state.error = err.message;
      console.error(err.message);
    } finally {
      state.isLoading = false;
    }
  };

  const requestId = () => {
    twitchExt.actions.requestIdShare();
  };

  onMounted(() => {
    twitchExt.onAuthorized((auth: any) => {
      console.log(auth);
      if (twitchExt.viewer.isLinked) {
        state.isLoggedIn = true;
        loadProfile();
      } else {
        state.isLoggedIn = false;
      }
    });
  });

  return { ...toRefs(state), loadProfile, requestId };
};
export default useTwitch;
