/* eslint-disable @typescript-eslint/no-explicit-any */
<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png" />
    <HelloWorld msg="Welcome to Your Vue.js App" />

    <!-- Check that the SDK client is not currently loading before accessing is methods -->
    <div v-if="!$auth.loading">
      <!-- show login when not authenticated -->
      <button v-if="!$auth.isAuthenticated" @click="login">Log in</button>
      <!-- show logout when authenticated -->
      <button v-if="$auth.isAuthenticated" @click="logout">Log out</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, onBeforeMount } from "vue";
import useSocket from "../hooks/useSocket";
export default defineComponent({
  name: "Main",
  setup(_props, context) {
    const state = reactive<{ responses: string[]; inputField: string }>({
      responses: [],
      inputField: "",
    });
    onBeforeMount(() => {
      useSocket();
    });
    return {
      state,
      login: (context as any).$auth.loginWithRedirect(),
      logout: (context as any).$auth.logout({ returnTo: window.location.origin }),
    };
  },
});
</script>
