<template>
  <div class="clue">
    <div class="clue__internals">
      <div v-if="state.shouldShowClue" class="clue__category">
        {{ state.category }} - ${{ state.value }}
      </div>
      <div v-if="state.shouldShowClue" class="clue__container">
        <div v-if="state.question" class="clue__question">
          {{ state.question }}
        </div>
        <div v-if="state.shouldShowAnswer" class="clue__answer">
          {{ state.answer }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClueState } from "@jeopardai/server/src/types";
import { computed, defineComponent, reactive } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  name: "ClueDisplay",
  setup() {
    const store = useStore();
    const state = reactive({
      question: computed(() => store.state.clue.question),
      answer: computed(() => store.state.clue.answer),
      value: computed(() => store.state.clue.value),
      category: computed(() => store.state.clue.category),
      shouldShowClue: computed(() => {
        return (
          store.state.clue.question !== "" &&
          [ClueState.DisplayClue, ClueState.DisplayAnswer].includes(
            store.state.clue.clueState
          )
        );
      }),
      shouleShowAnswer: computed(() => {
        return (
          store.state.clue.answer !== "" &&
          store.state.clue.clueState === ClueState.DisplayAnswer
        );
      }),
    });
    return { state };
  },
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
