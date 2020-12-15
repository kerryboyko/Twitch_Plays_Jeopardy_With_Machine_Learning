<template>
  <div class="home">home</div>
  <login />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Login from "../components/Login";

export default defineComponent({
  name: "Home",
  components: { Login },
});
</script>