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
  displayName: string;
  avatar: string;
  other: any;
}
interface TwitchHook {
  isLoggedIn: Ref<boolean>;
  isLoading: Ref<boolean>;
  error: Ref<string>;
  other: Ref<any>;
  loadProfile: () => Promise<void>;
  requestId: () => void;
  displayName: Ref<string>;
  avatar: Ref<string>;
}
const useTwitch = (
  registerPlayerOnLogin: (name: string) => void
): TwitchHook => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const twitchExt: any = window.Twitch!.ext;

  const state = reactive<TwitchState>({
    isLoggedIn: false,
    isLoading: false,
    error: "",
    other: {},
    displayName: "",
    avatar: "",
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
      const profile = response.data.data.data[0]; // I have no idea why this is.
      state.displayName = profile.display_name;
      state.avatar = profile.profile_image_url;
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
    twitchExt.onAuthorized((_auth: any) => {
      if (twitchExt.viewer.isLinked) {
        state.isLoggedIn = true;
        loadProfile().then(() => {
          registerPlayerOnLogin(state.displayName);
        });
      } else {
        state.isLoggedIn = false;
      }
    });
  });

  return { ...toRefs(state), loadProfile, requestId };
};
export default useTwitch;
