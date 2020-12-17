<template>
  <div class="login">
    <div class="login__prompt">
      <p class="login__prompt__header">Welcome to JEOPARDAI!</p>
      <p>
        In order to play, we need to get permission to use your
        <span class="emphasis">twitch username.</span>
      </p>
      <p>
        We collect your twitch username to keep track of your score, and your
        answer responses to train the AI,
        <span class="emphasis"
          >we do not keep any other personally identifying information about
          you.</span
        >
      </p>
      <hr />
      <div class="login__prompt__checkbox">
        <input type="checkbox" v-model="state.userAgrees" name="user-agrees" />
        <label for="user-agrees"
          >I agree to share my twitch username and question responses.</label
        >
      </div>
      <button
        :class="{
          login__button: true,
          [`login__button--disabled`]: !state.userAgrees,
        }"
        @click="requestId"
      >
        Login
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";

export default defineComponent({
  name: "Login",
  setup(_props, context) {
    const state = reactive<{ userAgrees: boolean }>({
      userAgrees: false,
    });
    const handleCheck = (bool: boolean) => {
      console.log(bool);
      state.userAgrees = bool;
    };
    const handleLogin = () => {
      context.emit("user-login");
    };
    return {
      state,
      handleCheck,
      handleLogin,
    };
  },
});
</script>

<style lang="scss">
.login {
  max-width: 600px;
  display: flex;
  justify-content: center;
  align-items: center;
  // background-image: url("/img/login-background");
  font-weight: 400;
  background-color: #0d538d;
  font-size: 1rem;
  &__prompt {
    font-family: Korinna;
    text-transform: uppercase;
    color: #ffffff;
    padding: 10px 20px;
    text-align: center;
    &__checkbox {
      display: flex;
      justify-content: center;
      align-items: center;
      text-transform: none;
      font-size: 1.25rem;
      font-family: BenchNine;
      text-align: left;
      & input {
        margin-right: 20px;
      }
    }
    &__header {
      font-size: 1.25rem;
    }
  }
  &__button {
    margin-top: 20px;
    color: #0d538d;
    background-color: #cedeeb;
    border: 0px;
    padding: 5px;
    font-size: 1rem;
    &:hover {
      background-color: #ffffff;
    }
    &--disabled {
      opacity: 0.5;
    }
  }
}
.emphasis {
  color: yellow;
}
</style>
