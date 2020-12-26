<template>
  <div class="clue">
    <div class="clue__internals">
      <div class="clue__category">{{ category }} - ${{ value }}</div>
      <div class="clue__container">
        <div v-if="question" class="clue__question">
          {{ question }}
        </div>
        <div v-if="answer" class="clue__answer">
          {{ answer }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineComponent } from "vue";

export default defineComponent({
  name: "ClueDisplay",
  props: ["category", "value", "question", "answer"],
});
</script>

<style lang="scss" scoped>
.clue {
  font-family: "Korinna", sans-serif;
  text-transform: uppercase;
  height: 360px;
  width: 100%;
  padding: 10px 50px 50px 50px;
  background-image: url("/img/clue-background.jpg");
  background-repeat: no-repeat;
  background-size: cover;
  color: #ffffff;
  font-size: 25px;
  text-shadow: 3px 4px 2px #000000;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  text-align: center;
  align-items: center;
  &__internals {
    width: 100%;
    max-width: 600px;
    display: flex;
    flex-direction: column;
    height: 290px;
    min-height: 290px;
  }
  &__category {
    height: 40px;
    font-size: 20px;
    font-family: Bebas Neue;
    color: #e7ddcb;
  }
  &__container {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    height: 290px;
    letter-spacing: 1px;
    text-align: center;
    align-items: center;
  }
}
</style>
