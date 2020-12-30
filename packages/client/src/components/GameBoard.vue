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
            @click="handleClueSelection(category, valueIndex)"
            class="value"
            :class="{
              dead: !(
                clueIsCurrent(category, valueIndex) ||
                isLive(category, valueIndex)
              ),
              [`daily-double`]: clueIsDailyDouble(category, valueIndex),
              [`current-clue`]: clueIsCurrent(category, valueIndex),
              [`selected`]:
                category === state.selectedCategory &&
                valueIndex === state.selectedValueIndex,
            }"
          >
            <span
              v-if="
                category === state.selectedCategory &&
                valueIndex === state.selectedValueIndex
              "
              >Loading</span
            >
            <span
              v-else-if="
                clueIsCurrent(category, valueIndex) &&
                clueIsDailyDouble(category, valueIndex)
              "
              >Daily Double</span
            >
            <span
              v-else-if="
                clueIsCurrent(category, valueIndex) ||
                isLive(category, valueIndex)
              "
              >${{ value }}</span
            >
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
      currentClue: computed(() => store.state.clue),
      selectedCategory: "",
      selectedValueIndex: -1,
    });
    const multiplier: number = state.isDoubleJeopardy ? 400 : 200;
    const values = [1, 2, 3, 4, 5].map((n) => n * multiplier);

    const handleClueSelection = (category: string, valueIndex: number) => {
      selectClue({
        twitchId: state.twitchId,
        category,
        valueIndex,
      });
      state.selectedCategory = category;
      state.selectedValueIndex = valueIndex;
    };
    const isLive = (category: string, valueIndex: number): boolean =>
      state.board[category][valueIndex];
    const isCategoryLive = (category: string): boolean =>
      state.board[category].some((el: boolean) => el);

    const clueIsCurrent = (category: string, valueIndex: number): boolean => {
      return (
        category === state.currentClue.category &&
        valueIndex === state.currentClue.valueIndex
      );
    };
    const clueIsDailyDouble = (
      category: string,
      valueIndex: number
    ): boolean => {
      return (
        clueIsCurrent(category, valueIndex) && state.currentClue.isDailyDouble
      );
    };

    watch(
      () => store.state.clue.clueState,
      () => {
        if (
          [
            ClueState.DisplayClue,
            ClueState.DisplayAnswer,
            ClueState.DailyDouble,
          ].includes(store.state.clue.clueState)
        ) {
          state.selectedCategory = "";
          state.selectedValueIndex = -1;
        }
      }
    );

    return {
      values,
      isLive,
      isCategoryLive,
      state,
      handleClueSelection,
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
