<template>
  <div
    class="game-board-container"
    :class="{
      highlight: state.showCluePrompt && state.isControllingPlayer,
      [`disable-all`]: !state.isControllingPlayer,
    }"
  >
    <div class="game-state">{{ state.gameState }}</div>
    <table class="game-board">
      <thead>
        <tr>
          <th
            v-for="category in state.categories"
            :key="category"
            class="category-name"
          >
            <span v-if="isCategoryLive(category)">{{ category }}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(value, valueIndex) in values" :key="`${value}-row`">
          <td
            v-for="category in state.categories"
            :key="`${category}-${value}`"
            @click="handleClick(category, valueIndex)"
            class="value"
            :class="{
              dead: !isLive(category, valueIndex),
              [`daily-double`]: clueIsDailyDouble(category, valueIndex),
              [`current-clue`]: clueIsCurrent(category, valueIndex),
            }"
          >
            <span v-if="state.isLoading && clueIsLoading(category, valueIndex)"
              >Loading</span
            >
            <span v-else-if="clueIsDailyDouble(category, valueIndex)"
              >Daily Double</span
            >
            <span v-else-if="isLive(category, valueIndex)">${{ value }}</span>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="select-prompt" v-if="state.showCluePrompt">
      <span v-if="state.isControllingPlayer"
        >{{ state.twitchId }}, you have control of the board. Select a
        category</span
      >
      <span v-else>
        Please wait while {{ state.controllingPlayer }} makes the next
        selection.</span
      >
    </div>
  </div>
</template>

<script lang="ts">
import { ClueState, GameState } from "@jeopardai/server/src/types";
import { computed, defineComponent, reactive, watch } from "vue";
import { useStore } from "vuex";
import { selectClue } from "../socket/actions";

export default defineComponent({
  name: "GameBoard",
  setup() {
    const store = useStore();
    const state = reactive({
      categories: computed(() => store.state.game.categories),
      board: computed(() => store.state.game.board),
      twitchId: computed<string>(() => store.state.user.twitchId),
      gameState: computed<string>(() => `${store.state.game.gameState}`),
      showCluePrompt: computed<boolean>(
        () => store.state.clue.clueState === ClueState.PromptSelectClue
      ),
      isDoubleJeopardy: computed<boolean>(
        () => store.state.game.gameState === GameState.DoubleJeopardy
      ),
      isControllingPlayer: computed<boolean>(
        () => store.state.game.controllingPlayer === store.state.user.twitchId
      ),
      controllingPlayer: computed<string>(
        () => store.state.game.controllingPlayer
      ),
      currentClue: computed(() => ({
        category: store.state.clue.category,
        value: store.state.clue.value,
      })),
      isLoading: false,
      clueSelected: ["", -1],
    });
    const multiplier: number = state.isDoubleJeopardy ? 400 : 200;
    const values = [1, 2, 3, 4, 5].map((n) => n * multiplier);
    const handleClick = (category: string, valueIndex: number) => {
      selectClue({
        twitchId: state.twitchId,
        category,
        valueIndex,
      });
      state.clueSelected = [category, valueIndex];
      state.isLoading = true;
    };
    const isLive = (category: string, valueIndex: number): boolean =>
      state.board[category][valueIndex];
    const isCategoryLive = (category: string): boolean =>
      state.board[category].some((el: boolean) => el);
    const clueIsSelected = (category: string, valueIndex: number) => {
      const [selectedCategory, selectedValueIndex] = state.clueSelected;
      return category === selectedCategory && valueIndex === selectedValueIndex;
    };
    const clueIsLoading = (category: string, valueIndex: number) => {
      return (
        store.state.clue.clueState === ClueState.PromptSelectClue &&
        clueIsSelected(category, valueIndex)
      );
    };
    const clueIsCurrent = (category: string, valueIndex: number) => {
      return (
        category === store.state.clue.category &&
        valueIndex === store.state.clue.value
      );
    };
    const clueIsDailyDouble = (category: string, valueIndex: number) => {
      return (
        clueIsSelected(category, valueIndex) &&
        store.state.clue.clueState === ClueState.DailyDouble
      );
    };
    watch(
      () => store.state.clue.clueState,
      () => {
        if (store.state.clue.clueState === ClueState.DisplayClue) {
          state.isLoading = false;
        }
      }
    );
    return {
      values,
      isLive,
      isCategoryLive,
      state,
      handleClick,
      clueIsLoading,
      clueIsCurrent,
      clueIsDailyDouble,
    };
  },
});
</script>

<style lang="scss" scoped>
.game-board {
  table-layout: fixed;

  height: 360px;
  width: 100%;
  background-image: url("/img/clue-background.jpg");
  background-size: cover;
  color: #ffffff;
}
.category-name {
  height: 3rem;
  backdrop-filter: invert(10%);
  font-family: Bebas Neue;
  font-weight: 300;
  font-size: 1.25rem;
  text-transform: uppercase;
  padding: 3px;
  align-items: center;
  text-align: center;
  text-shadow: 3px 4px 2px #000000;
  @media screen and (max-width: 720px) {
    font-size: 1rem;
  }
}
.daily-double {
  font-family: Bebas Neue;
  font-size: 0.75rem;
}
.current-clue {
  box-shadow: inset 0 0 22px #ffffff;
}
.select-prompt {
  font-family: Roboto;
  text-align: center;
  padding: 2px 2px;
}
.game-board-container {
  border: 3px solid transparent;
}
.highlight {
  border: 3px solid yellow;
}
.value {
  min-height: 4rem;
  font-family: Bebas Neue;
  font-weight: 400;
  color: #eca955;
  text-shadow: 3px 4px 2px #000000;
  font-size: 2rem;
  align-items: center;
  text-align: center;
  cursor: pointer;
  @media screen and (max-width: 720px) {
    font-size: 1.75rem;
  }
  &:hover {
    backdrop-filter: invert(10%);
    color: #ebd0b0;
    &.dead {
      backdrop-filter: none;
      cursor: not-allowed;
    }
  }
}
.disable-all {
  pointer-events: none;
}
.game-state {
  text-align: center;
}
</style>
