/* eslint-disable @typescript-eslint/no-explicit-any */
import { onMounted, reactive, toRefs } from "vue";
import axios from "axios";
import { Ref } from "vue";
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
  other: any;
}
interface TwitchHook {
  isLoggedIn: Ref<boolean>;
  isLoading: Ref<boolean>;
  error: Ref<string>;
  profile: Ref<any>;
  other: Ref<any>;
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
    other: {},
  });

  const loadProfile = async () => {
    state.isLoading = true;
    try {
      const response = await axios.post(
        `https://jeopardai.frontendgineer.com/userid`,
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
    console.log("What is this?");
    const whateverThisReturns = twitchExt.actions.requestIdShare();
    state.other.whateverThisReturns = whateverThisReturns;
  };

  onMounted(() => {
    twitchExt.onAuthorized((auth: any) => {
      console.log("AUTH", auth);
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
