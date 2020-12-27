<template>
  <div
    class="game-board-container"
    :class="{
      highlight: state.showCluePrompt,
      [`disable-all`]: !state.showCluePrompt,
    }"
  >
    <table class="game-board">
      <thead>
        <tr>
          <th
            v-for="(category, index) in state.categories"
            :key="category"
            class="category-name"
          >
            <span v-if="isCategoryLive(index)">{{ category }}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(value, valueIndex) in values" :key="`${value}-row`">
          <td
            v-for="(category, categoryIndex) in state.categories"
            :key="`${category}-${value}`"
            @click="handleClick(categoryIndex, valueIndex)"
            class="value"
            :class="{ dead: !isLive(categoryIndex, valueIndex) }"
          >
            <span v-if="clueIsLoading(categoryIndex, valueIndex)">Loading</span>
            <span v-else-if="isLive(categoryIndex, valueIndex)"
              >${{ value }}</span
            >
          </td>
        </tr>
      </tbody>
    </table>
    <div class="select-prompt" v-if="state.showCluePrompt">
      {{ state.twitchId }}, you have control of the board. Select a category
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive } from "vue";
import { useStore } from "vuex";
import { selectClue } from "../socket/actions";

export default defineComponent({
  name: "GameBoard",
  props: ["categories", "board", "isDoubleJeopardy"],
  setup(props) {
    const store = useStore();
    const state = reactive({
      categories: computed(() => store.state.game.categories),
      board: computed(() => store.state.game.board),
      twitchId: computed<string>(() => store.state.user.twitchId),
      showCluePrompt: computed<boolean>(() => store.state.game.promptedForClue),
      clueLoading: [-1, -1],
    });
    const multiplier: number = props.isDoubleJeopardy ? 200 : 400;
    const values = [1, 2, 3, 4, 5].map((n) => n * multiplier);
    const handleClick = (categoryIndex: number, valueIndex: number) => {
      state.clueLoading = [categoryIndex, valueIndex];
      selectClue(state.twitchId, props.categories[categoryIndex], valueIndex);
    };
    const isLive = (categoryIndex: number, valueIndex: number): boolean =>
      state.board[state.categories[categoryIndex]][valueIndex];
    const isCategoryLive = (categoryIndex: number): boolean =>
      state.board[state.categories[categoryIndex]].some((el: boolean) => el);
    const clueIsLoading = (
      categoryIndex: number,
      valueIndex: number
    ): boolean => {
      return (
        isLive(categoryIndex, valueIndex) &&
        categoryIndex === state.clueLoading[0] &&
        valueIndex === state.clueLoading[1]
      );
    };
    return {
      values,
      isLive,
      isCategoryLive,
      state,
      handleClick,
      clueIsLoading,
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
.select-prompt {
  font-family: Poppins;
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
</style>
