<template>
  <div class="home">
    <div class="login-data" v-if="isLoggedIn">
      <img :src="avatar" />
      <div>Display Name: {{ displayName }}</div>
      <div>{{ state.log }}</div>
    </div>

    <login v-else @user-login="requestId" />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import Login from "../components/Login.vue";
import useTwitchExt from "../hooks/useTwitchExt";

export default defineComponent({
  name: "Home",
  components: { Login },
  setup() {
    const state = reactive<{ log: any[] }>({ log: [] });
    const registerPlayerOnLogin = (name: string) => {
      state.log.push(`REGISTERING PLAYER`);
      state.log.push(name);
    };
    const {
      isLoggedIn,
      isLoading,
      requestId,
      displayName,
      avatar,
    } = useTwitchExt(registerPlayerOnLogin);

    return {
      state,
      isLoggedIn,
      isLoading,
      requestId,
      displayName,
      avatar,
    };
  },
});
</script>

<style lang="scss">
.home {
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #0d538d;
}
.login-data {
  max-width: 300px;
  color: white;
}
</style>
