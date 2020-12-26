<template>
  <div class="hello">
    <div><input v-model="state.name" type="text" /></div>
    <div>
      <button @click="handleLogin">Login</button>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, ComputedRef, defineComponent, reactive } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  name: "HelloWorld",
  props: {
    msg: String,
  },
  setup(_props, context) {
    const store = useStore();
    const state = reactive<{ name: string; seed: ComputedRef<string> }>({
      name: "",
      seed: computed(() => store.state.game.seed),
    });
    const handleLogin = () => {
      context.emit("login", state.name);
    };
    return { state, handleLogin };
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>
