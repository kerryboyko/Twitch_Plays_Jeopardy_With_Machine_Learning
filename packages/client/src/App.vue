<template>
  <home />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Home from "./views/Home.vue";

export default defineComponent({
  name: "App",
  components: { Home },
});
</script>

<style lang="scss">
@import url("https://fonts.googleapis.com/css2?family=Inter&family=BenchNine:wght@300;700&display=swap&family=Teko:wght@300&display=swap");

@font-face {
  font-family: "Korinna";
  src: url("/fonts/OPTIKorinna-Agency.ttf.woff") format("woff"),
    url("/fonts/OPTIKorinna-Agency.ttf.svg#OPTIKorinna-Agency") format("svg"),
    url("/fonts/OPTIKorinna-Agency.ttf.eot"),
    url("/fonts/OPTIKorinna-Agency.ttf.eot?#iefix") format("embedded-opentype");
  font-weight: normal;
  font-style: normal;
}
* {
  box-sizing: border-box;
}
body {
  background-color: white;
}
</style>
