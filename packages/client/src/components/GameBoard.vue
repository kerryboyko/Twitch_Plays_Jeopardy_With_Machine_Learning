<template>
  <div
    class="game-board-container"
    :class="{ highlight: showCluePrompt, [`disable-all`]: !showCluePrompt }"
  >
    <table class="game-board">
      <thead>
        <tr>
          <th
            v-for="(category, index) in categories"
            :key="category"
            class="category-name"
          >
            <span v-if="!isCategoryDead(index)">{{ category }}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(value, valueIndex) in values" :key="`${value}-row`">
          <td
            v-for="(category, categoryIndex) in categories"
            :key="`${category}-${value}`"
            @click="handleClick(categoryIndex, valueIndex)"
            class="value"
            :class="{ dead: isDead(categoryIndex, valueIndex) }"
          >
            <span v-if="!isDead(categoryIndex, valueIndex)">${{ value }}</span>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="select-prompt" v-if="showCluePrompt">
      {{ twitchId }}, you have control of the board. Select a category
    </div>
  </div>
</template>

<script lang="ts">
import { ClueState } from "@jeopardai/server/src/types";
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  name: "GameBoard",
  props: ["categories", "board", "isDoubleJeopardy"],
  setup(props) {
    const store = useStore();
    const multiplier: number = props.isDoubleJeopardy ? 200 : 400;
    const values = [1, 2, 3, 4, 5].map((n) => n * multiplier);
    const twitchId = computed<string>(() => store.state.user.twitchId);
    const showCluePrompt = computed<boolean>(
      () =>
        store.state.user.twitchId === store.state.game.controllingPlayer &&
        store.state.game.clueState === ClueState.PromptSelectClue
    );
    return {
      values,
      isDead: () => false,
      isCategoryDead: () => false,
      showCluePrompt,
      twitchId,
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
