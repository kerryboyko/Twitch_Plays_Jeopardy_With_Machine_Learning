<template>
  <div class="answer-input">
    <div>{{ state.twitchId }}'s response</div>
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
    <answer-timer
      :seconds="state.seconds"
      :inactive="state.disabled"
      :value="timerValue"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed, watch, ComputedRef } from "vue";
import { useStore } from "vuex";
import { ClueState } from "@jeopardai/server/src/types";
import useCountdown from "./AnswerTimer/useCountdown";
import AnswerTimer from "./AnswerTimer/AnswerTimer.vue";
import { provideAnswer } from "../socket/actions";

export default defineComponent({
  name: "AnswerInput",
  components: { AnswerTimer },
  setup() {
    const { value: timerValue, countdown, clearTimer } = useCountdown();
    const store = useStore();
    const state = reactive<{
      input: string;
      disabled: boolean;
      twitchId: ComputedRef<string>;
      clueState: ComputedRef<ClueState>;
      seconds: ComputedRef<number>;
      isDailyDouble: ComputedRef<boolean>;
      playerHasControl: ComputedRef<boolean>;
    }>({
      input: "What is ",
      disabled: true,
      twitchId: computed(() => store.state.user.twitchId),
      clueState: computed(() => store.state.clue.clueState),
      seconds: computed(() => {
        return Math.round(timerValue.value * 30);
      }),
      isDailyDouble: computed(() => store.state.clue.isDailyDouble),
      playerHasControl: computed(
        () => store.state.user.twitchId === store.state.game.controllingPlayer
      ),
    });

    const submit = () => {
      if (state.input.trim() === "What is") {
        return;
      }
      provideAnswer({ twitchId: state.twitchId, provided: state.input });
      state.disabled = true;
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
      () => state.clueState,
      () => {
        if (state.clueState === ClueState.DisplayClue) {
          if (!state.isDailyDouble || state.playerHasControl) {
            state.input = "What is ";
            launchTimer();
          }
        }
        if (state.clueState === ClueState.DisplayAnswer) {
          state.disabled = true;
          clearTimer();
        }
        if (state.clueState === ClueState.PromptSelectClue) {
          state.input = "";
          state.disabled = true;
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
  @media screen and (max-width: 720px) {
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
    @media screen and (max-width: 720px) {
      width: calc(100% - 1rem);
      font-size: 1rem;
    }
    &:focus {
      border: 1px solid yellow;
    }
    &--disabled {
      background-color: $jeopardy-blue-disabled;
    }
  }
  &__button {
    width: 15%;
    margin: 0.5rem;
    height: 46px;
    font-size: 1rem;
    font-family: Roboto;
    background-color: $jeopardy-blue;
    color: white;
    margin: 0.5rem;
    padding: 0.5rem;
    border: 1px solid white;
    border-radius: 0.5rem;
    outline: none;
    text-transform: uppercase;
    cursor: pointer;
    @media screen and (max-width: 720px) {
      width: calc(100% - 1rem);
      font-size: 1rem;
      font-family: Roboto;
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
