<template>
  <div>
    <div class="login">login</div>
    <pre>{{
      JSON.stringify({ isLoggedIn, isLoading, error, profile, other }, null, 2)
    }}</pre>
    <button @click="requestId">requestid</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import useTwitchExt from "../hooks/useTwitchExt";

export default defineComponent({
  name: "Login",
  setup() {
    const {
      isLoggedIn,
      isLoading,
      error,
      profile,
      requestId,
      other,
    } = useTwitchExt();

    return {
      isLoggedIn,
      isLoading,
      error,
      profile,
      requestId,
      other,
    };
  },
});
</script>
