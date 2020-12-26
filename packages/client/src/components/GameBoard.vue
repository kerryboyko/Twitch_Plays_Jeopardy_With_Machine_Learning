<template>
  <table class="game-board">
    <thead>
      <tr>
        <th
          v-for="(category, index) in state.categories"
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
    <!-- <div
      v-for="(value, valueIndex) in values"
      class="game-board__row"
      :key="value"
    >
      <div
        :class="{
          value: true,
          dead: isDead(categoryIndex, valueIndex),
        }"
        v-for="(category, categoryIndex) in state.categories"
        :key="`${value}-${category.keyword}`"
        @click="handleClick(categoryIndex, valueIndex)"
      >
        <div v-if="!isDead(categoryIndex, valueIndex)">${{ value }}</div>
      </div>
    </div> -->
  </table>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import get from "lodash/get";

interface GameBoardState {
  categories: { head: string; tail: string; keyword: string }[];
  deadClues: Record<number, Record<number, boolean>>;
}

export default defineComponent({
  name: "GameBoard",
  props: ["categories", "isDoubleJeopardy"],
  setup(props) {
    const multiplier: number = props.isDoubleJeopardy ? 200 : 400;
    const values = [1, 2, 3, 4, 5].map((n) => n * multiplier);
    const justTitles = props.categories.map(
      ({ category }: { category: string }) => category
    );

    const state = reactive<GameBoardState>({
      categories: justTitles,
      deadClues: {},
    });
    const handleClick = (cat: number, val: number) => {
      if (!state.deadClues[cat]) {
        state.deadClues[cat] = {};
      }
      state.deadClues[cat][val] = true;
    };
    const isDead = (categoryIndex: number, valueIndex: number): boolean =>
      state.deadClues?.[categoryIndex]?.[valueIndex];

    const isCategoryDead = (categoryIndex: number): boolean =>
      Object.keys(get(state.deadClues, [categoryIndex], {})).length === 5;

    return {
      state,
      values,
      isDead,
      isCategoryDead,
      handleClick,
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
</style>
