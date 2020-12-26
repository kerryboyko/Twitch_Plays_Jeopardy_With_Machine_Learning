<template>
  <div class="answer-input">
    <input
      class="answer-input__input"
      :class="{ [`answer-input__input--disabled`]: state.disabled }"
      type="text"
      placeholder="What is...?"
      v-model="state.input"
      :disabled="state.disabled"
      v-on:keyup.enter="submit"
    />
    <button
      class="answer-input__button"
      :class="{ [`answer-input__button--disabled`]: state.disabled }"
      @click="submit"
      :disabled="state.disabled"
    >
      Submit
    </button>
  </div>
  <div class="answer-timer-container">
    <answer-timer :inactive="state.disabled" :value="timerValue" />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, watch } from "vue";
import { useStore } from "vuex";
import { ClueState } from "@jeopardai/server/src/types";
import useCountdown from "./AnswerTimer/useCountdown";
import AnswerTimer from "./AnswerTimer/AnswerTimer.vue";

export default defineComponent({
  name: "AnswerInput",
  components: { AnswerTimer },
  setup(_props, context) {
    const { value: timerValue, countdown, clearTimer } = useCountdown();
    const store = useStore();
    const state = reactive<{ input: string; disabled: boolean }>({
      input: "What is ",
      disabled: true,
    });

    const submit = () => {
      if (state.input.trim() === "What is") {
        return;
      }
      context.emit("submit-question", state.input);
      state.disabled = true;
      clearTimer();
    };
    const launchTimer = () => {
      state.input = "What is ";
      state.disabled = false;
      countdown(() => {
        clearTimer();
        state.disabled = true;
      });
    };

    watch(
      () => store.state.clue.clueState,
      () => {
        console.log("CHANGE!", store.state.clue.clueState);
        if (store.state.clue.clueState === ClueState.DisplayClue) {
          launchTimer();
        }
        if (store.state.clue.clueState === ClueState.DisplayAnswer) {
          state.disabled = true;
          clearTimer();
        }
      }
    );

    return { state, submit, timerValue };
  },
});
</script>

<style lang="scss" scoped>
$jeopardy-blue: #2c3e50;
$jeopardy-blue-disabled: #657c92;

.answer-input {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  @media screen and (max-width: 500px) {
    flex-direction: column;
  }
  &__input {
    width: 80%;
    font-family: Korinna;
    font-size: 1.5rem;
    color: white;
    text-shadow: 2px 2px black;
    background-color: $jeopardy-blue;
    margin: 0.5rem;
    padding: 0.5rem;
    border: 1px solid white;
    border-radius: 0.5rem;
    outline: none;
    cursor: text;
    @media screen and (max-width: 500px) {
      width: calc(100% - 1rem);
      font-size: 1rem;
    }
    &:focus {
      border: 1px solid yellow;
    }
    &--disabled {
      background-color: $jeopardy-blue-disabled;
      text-align: center;
    }
  }
  &__button {
    width: 15%;
    margin: 0.5rem;
    height: 46px;
    font-size: 1rem;
    font-family: Poppins;
    background-color: $jeopardy-blue;
    color: white;
    margin: 0.5rem;
    padding: 0.5rem;
    border: 1px solid white;
    border-radius: 0.5rem;
    outline: none;
    text-transform: uppercase;
    cursor: pointer;
    @media screen and (max-width: 500px) {
      width: calc(100% - 1rem);
      font-size: 1rem;
      font-family: Poppins;
    }
    &:hover {
      color: $jeopardy-blue;
      background-color: white;
    }
    &:focus {
      color: $jeopardy-blue;
      background-color: white;
    }
    &--disabled {
      background-color: $jeopardy-blue-disabled;
      &:hover {
        background-color: $jeopardy-blue-disabled;
        color: white;
      }
    }
  }
}
.answer-timer-container {
  width: calc(100% - 1rem);
  margin: 0.5rem;
}
</style>