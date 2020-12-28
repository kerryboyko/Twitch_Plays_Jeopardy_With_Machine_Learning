<template>
  <div class="score-display" :class="{ negative: state.myScore < 0 }">
    ${{ state.myScore }}
  </div>
  <div v-if="state.promptedForWager" class="wager">
    <div class="wager__header">Your Wager</div>
    <div class="wager__area">
      <div>
        <span>$</span>
        <input
          class="wager__input"
          type="number"
          v-model="state.myWager"
          @blur="checkWager"
          :disabled="state.disabled"
          v-on:keyup.enter="submit"
        />
      </div>
      <button class="wager__button" :disabled="state.disabled" @click="submit">
        Submit
      </button>
    </div>
    <div class="wager__header">
      (Min: ${{ state.minWager }}/Max: ${{ state.maxWager }})
    </div>
  </div>
</template>

<script lang="ts">
import { GameState } from "@jeopardai/server/src/types";
import { defineComponent, reactive, computed, ComputedRef } from "vue";
import { useStore } from "vuex";
import { provideWager } from "../socket/actions";

export default defineComponent({
  name: "ScoreDisplay",
  setup() {
    const store = useStore();
    const state = reactive<{
      myScore: ComputedRef<number>;
      maxWager: ComputedRef<number>;
      minWager: ComputedRef<number>;
      promptedForWager: ComputedRef<boolean>;
      myWager: number;
    }>({
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
        return true || store.state.game.promptedForWager;
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

    const submit = () => {
      provideWager({
        twitchId: store.state.user.twitchId,
        wager: checkWager(),
      });
    };

    return { state, checkWager, submit };
  },
});
</script>

<style lang="scss" scoped>
$jeopardy-blue: #2c3e50;
$jeopardy-blue-disabled: #657c92;
.score-display {
  font-family: Roboto;
  font-weight: bold;
  color: #eea955;
  font-size: 5rem;
  background-image: url("/img/clue-background.jpg");
  background-repeat: no-repeat;
  background-size: cover;
  text-align: center;
  &.negative {
    color: rgb(224, 64, 64);
  }
}
.wager {
  width: 100%;
  padding: 10px;
  background-image: url("/img/clue-background.jpg");
  background-repeat: no-repeat;
  background-size: cover;
  &__area {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 4rem;
    color: #eea955;

    padding: 0.5rem 2rem;
  }
  &__header {
    font-size: 1.5rem;
    text-align: center;
  }
  &__input {
    padding: 5px;
    margin: 5px 5px 5px 30px;
    font-size: 4rem;
    width: 80%;
    cursor: text;
    background-color: transparent;
    color: white;
    border: 2px solid white;
    border-radius: 0.25rem;
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