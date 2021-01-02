<template>
  <div class="wager">
    <div class="wager__header">Your Wager</div>
    <div class="wager__area">
      <div>
        <span>$</span>
        <input
          class="wager__input"
          :class="{ disabled: state.wagerLocked }"
          type="number"
          v-model="state.myWager"
          @blur="checkWager"
          :disabled="state.wagerLocked"
          v-on:keyup.enter="submit"
        />
      </div>
      <button v-if="!state.wagerLocked" class="wager__button" @click="submit">
        Submit
      </button>
    </div>
    <div v-if="!state.wagerLocked" class="wager__header">
      (Min: ${{ state.minWager }}/Max: ${{ state.maxWager }})
    </div>
    <answer-timer
      :seconds="state.seconds"
      :inactive="state.wagerLocked"
      :value="timerValue"
    />
  </div>
</template>

<script lang="ts">
import { ClueState, GameState } from "@jeopardai/server/src/types";
import {
  defineComponent,
  reactive,
  computed,
  ComputedRef,
  watch,
  onBeforeMount,
} from "vue";
import { useStore } from "vuex";
import { provideWager } from "../socket/actions";
import AnswerTimer from "./AnswerTimer/AnswerTimer.vue";
import useCountdown from "./AnswerTimer/useCountdown";

export default defineComponent({
  name: "ScoreDisplay",
  components: { AnswerTimer },
  setup() {
    const { value: timerValue, countdown, clearTimer } = useCountdown();
    const store = useStore();
    const state = reactive<{
      clueState: ComputedRef<ClueState>;
      myScore: ComputedRef<number>;
      maxWager: ComputedRef<number>;
      minWager: ComputedRef<number>;
      promptedForWager: ComputedRef<boolean>;
      wagerLocked: ComputedRef<boolean>;
      seconds: ComputedRef<number>;
      myWager: number;
    }>({
      clueState: computed(() => store.state.clue.clueState),
      myScore: computed(
        () => store.state.game.scoreboard[store.state.user.twitchId]
      ),
      maxWager: computed(() => {
        const ownScore = store.state.game.scoreboard[store.state.user.twitchId];
        let defaultMax = 1000;
        if (store.state.game.gameState === GameState.DoubleJeopardy) {
          defaultMax = 2000;
        }
        if (store.state.game.gameState === GameState.FinalJeopardy) {
          defaultMax = 0;
        }
        return Math.max(ownScore, defaultMax);
      }),
      minWager: computed(() => {
        return store.state.game.gameState === GameState.FinalJeopardy ? 0 : 5;
      }),
      promptedForWager: computed(() => {
        return store.state.game.promptedForWager;
      }),
      wagerLocked: computed(() => store.state.clue.wager !== null),
      seconds: computed(() => {
        return Math.round(timerValue.value * 30);
      }),
      myWager: 5,
    });
    const checkWager = (): number => {
      if (state.myWager < state.minWager) {
        state.myWager = state.minWager;
      }
      if (state.myWager > state.maxWager) {
        state.myWager = state.maxWager;
      }
      return state.myWager;
    };
    const launchTimer = () => {
      countdown(() => {
        clearTimer();
      });
    };
    onBeforeMount(() => {
      launchTimer();
    });
    watch(
      () => state.clueState,
      () => {
        if (state.clueState !== ClueState.DailyDouble) {
          clearTimer();
        }
      }
    );
    const submit = () => {
      provideWager({
        twitchId: store.state.user.twitchId,
        wager: checkWager(),
      });
    };

    return { state, checkWager, submit, timerValue };
  },
});
</script>

<style lang="scss" scoped>
$jeopardy-blue: #2c3e50;
$jeopardy-blue-disabled: #657c92;

.wager {
  width: 100%;
  padding: 10px;
  background-image: url("/img/clue-background.jpg");
  background-repeat: no-repeat;
  background-size: cover;
  &__area {
    display: flex;
    justify-content: space-around;
    align-items: center;
    font-size: 2rem;
    color: #eea955;

    padding: 0.5rem 2rem;
  }
  &__header {
    font-size: 1.5rem;
    text-align: center;
  }
  &__input {
    padding: 5px;
    margin-left: 5px;
    font-size: 2rem;
    cursor: text;
    background-color: transparent;
    color: white;
    border: 2px solid white;
    border-radius: 0.25rem;
    &.disabled {
      background-color: rgba(255, 255, 255, 0.3);
    }
  }
  &__button {
    font-size: 1rem;
    font-family: Roboto;
    background-color: $jeopardy-blue;
    color: white;
    border: 1px solid white;
    border-radius: 0.5rem;
    padding: 1rem;
    outline: none;
    text-transform: uppercase;
    cursor: pointer;
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
</style>
