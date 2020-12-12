<template>
  <div class="home">
    <!-- Check that the SDK client is not currently loading before accessing is methods -->
    <div v-if="!state.authLoaded">
      <!-- show login when not authenticated -->
      <button v-if="!state.auth.isAuthenticated" @click="login">Log in</button>
      <!-- show logout when authenticated -->
      <button v-if="state.auth.isAuthenticated" @click="logout">Log out</button>
    </div>
  </div>
  <div>Testing SocketIO Client</div>
  <div>
    <input type="text" v-model="state.inputField" />
    <button @click="sendMessage">Send Message</button>
    <div>
      <ul>
        <li v-for="response in state.responses" :key="response">
          {{ response }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */

import { defineComponent, reactive, onBeforeMount } from "vue";
import useAuth from "../hooks/auth";
import get from "lodash/get";
import noop from "lodash/noop";
import useSocket from "../hooks/useSocket";

export default defineComponent({
  name: "Main",
  setup() {
    const state = reactive<{
      responses: string[];
      inputField: string;
      auth: any;
      authLoaded: boolean;
    }>({
      responses: [],
      inputField: "",
      auth: null, 
      authLoaded: false,
    });
    onBeforeMount(async () => {
      useSocket();
      state.auth = await useAuth();
      state.authLoaded = true;
    });
    const login = () =>
      get(state, "auth.auth0Client.loginWithRedirect", noop)();
    const logout = () =>
      get(
        state,
        "auth.auth0Client.logout",
        noop
      )({ returnTo: window.location.origin });
    return {
      state,
      login,
      logout,
    };
  },
});
</script>
