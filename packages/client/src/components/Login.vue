<template>
  <div class="login">login</div>
  <div>Is logged in? {{ state.isLoggedIn }}</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Login",
  setup() {
    const state = reactive({
      isLoggedIn: false,
    });

    return state;
  },
});
</script>
