<template>
  <div class="game-board">
    <div class="game-board__row">
      <div
        v-for="(category, categoryIndex) in state.categories"
        :key="category.keyword"
        class="head-tile"
      >
        <div class="head-tile__inner">
          <category-name
            v-if="!isCategoryDead(categoryIndex)"
            :head="category.head"
            :tail="category.tail"
            :keyword="category.keyword"
          />
        </div>
      </div>
    </div>
    <div
      v-for="(value, valueIndex) in values"
      class="game-board__row"
      :key="value"
    >
      <div
        class="value"
        v-for="(category, categoryIndex) in state.categories"
        :key="`${value}-${category.keyword}`"
        @click="handleClick(categoryIndex, valueIndex)"
      >
        <div v-if="!isDead(categoryIndex, valueIndex)">${{ value }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import CategoryName from "./minor/CategoryName.vue";
import get from "lodash/get";
interface Category {
  keyword: string;
  name: string;
}

interface GameBoardState {
  categories: { head: string; tail: string; keyword: string }[];
  deadClues: Record<number, number[]>;
}
const formatCategoryName = (category: string, keyword: string) => {
  const index = category.indexOf(keyword);
  const head = category.substring(0, index);
  const tail = category.substring(index + keyword.length);
  console.log({ category, keyword, index, head, tail });
  return {
    head,
    tail,
    keyword,
  };
};

export default defineComponent({
  components: { CategoryName },
  name: "GameBoard",
  props: ["categories", "isDoubleJeopardy"],
  setup(props) {
    const multiplier: number = props.isDoubleJeopardy ? 200 : 400;
    const values = [1, 2, 3, 4, 5].map((n) => n * multiplier);

    const formattedCategories = props.categories.map(
      ({ keyword, name }: Category) => formatCategoryName(name, keyword)
    );

    const state = reactive<GameBoardState>({
      categories: formattedCategories,
      deadClues: {},
    });
    const handleClick = (cat: number, val: number) => {
      if (!state.deadClues[cat]) {
        state.deadClues[cat] = [];
      }
      state.deadClues[cat].push(val);
    };
    const isDead = (categoryIndex: number, valueIndex: number): boolean => {
      if (!state.deadClues[categoryIndex]) {
        return false;
      }
      return state.deadClues[categoryIndex].includes(valueIndex);
    };
    const isCategoryDead = (categoryIndex: number): boolean =>
      get(state, ["deadClues", categoryIndex], []).length === 5;

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
  height: 360px;
  width: 640px;
  background-image: url("/img/clue-background.jpg");
  color: #ffffff;
  display: flex;
  flex-direction: column;
  &__row {
    flex: 1;
    display: flex;
    justify-content: space-evenly;
    flex-direction: row;
  }
}
.head-tile {
  backdrop-filter: invert(10%);
  font-family: BenchNine;
  font-weight: 300;
  font-size: 16px;
  text-transform: uppercase;
  padding: 3px;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  border: 1px solid black;
  text-shadow: 3px 4px 2px #000000;
}
.value {
  flex: 1;
  font-family: Teko;
  font-weight: 400;
  color: #eca955;
  text-shadow: 3px 4px 2px #000000;
  font-size: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  border: 1px solid black;
}
</style>