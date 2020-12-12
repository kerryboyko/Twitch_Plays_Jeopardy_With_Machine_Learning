/* eslint-disable @typescript-eslint/no-explicit-any */
import { reactive } from "vue";

import createAuth0Client, {
  Auth0Client,
  PopupConfigOptions,
  PopupLoginOptions,
} from "@auth0/auth0-spa-js";
import config from "../../config";

export interface AuthState {
  loading: boolean;
  isAuthenticated: boolean;
  user: any;
  popupOpen: boolean;
  error: any | null;
}

export interface AuthHook {
  authState: AuthState;
  auth0Client: Auth0Client;
  handleRedirectCallback: () => Promise<void>;
  loginWithPopup: Auth0Client["loginWithPopup"];
  logout: Auth0Client["logout"];
}

/** Define a default action to perform after authentication */
const DEFAULT_REDIRECT_CALLBACK = () =>
  window.history.replaceState({}, document.title, window.location.pathname);

export const useAuth0 = async (
  onRedirectCallback: (...args: any[]) => void = DEFAULT_REDIRECT_CALLBACK,
  redirect_uri = window.location.origin,
  domain = config.AUTH_0_DOMAIN,
  client_id = config.AUTH_0_CLIENT_ID
): Promise<AuthHook> => {
  const authState = reactive<AuthState>({
    loading: true,
    isAuthenticated: false,
    user: {},
    popupOpen: false,
    error: null,
  });
  const auth0Client = await createAuth0Client({
    redirect_uri,
    domain,
    client_id,
  });
  try {
    if (
      ["code=", "state="].every((s: string) =>
        window.location.search.includes(s)
      )
    ) {
      const { appState } = await auth0Client.handleRedirectCallback();
      onRedirectCallback(appState);
    }
  } catch (err) {
    authState.error = err;
  } finally {
    authState.isAuthenticated = await auth0Client.isAuthenticated();
    authState.user = await auth0Client.getUser();
    authState.loading = false;
  }

  const loginWithPopup = async (
    lpOptions: PopupLoginOptions,
    lpConfig: PopupConfigOptions
  ): Promise<void> => {
    authState.popupOpen = true;
    if (auth0Client !== null) {
      try {
        await auth0Client.loginWithPopup(lpOptions, lpConfig);
      } catch (e) {
        console.error(e);
      } finally {
        authState.popupOpen = false;
      }
    }
  };

  const handleRedirectCallback = async (): Promise<void> => {
    authState.loading = true;
    if (auth0Client !== null) {
      try {
        await auth0Client.handleRedirectCallback();
        authState.user = await auth0Client.getUser();
        authState.isAuthenticated = true;
      } catch (e) {
        authState.error = e;
      }
    }
    authState.loading = false;
  };

  return {
    authState,
    auth0Client,
    loginWithPopup,
    handleRedirectCallback,
    logout: auth0Client.logout,
  };
};

export default useAuth0;
