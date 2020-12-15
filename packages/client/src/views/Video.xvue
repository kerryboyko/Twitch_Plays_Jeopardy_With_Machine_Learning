<template>
  <div class="stream-area">
    <clue-display
      class="clue-display"
      question="O, a beautiful Falmouth, Mass. statue of Katharine Lee Bates shows her imagining the lines of this song"
      value="400"
      category="The monuments women"
    />
    <game-board
      class="board-display"
      :categories="categories"
      :isDoubleJeopardy="false"
    />
    <div class="answers-display">Answers will go here</div>
    <div class="scores-display">Scores will go here</div>
    <chat-log class="chat-display" />
  </div>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineComponent } from "vue";
import ClueDisplay from "../components/ClueDisplay.vue";
import ChatLog from "../components/ChatLog.vue";
import GameBoard from "../components/GameBoard.vue";
import mockBoard from "../../../gDoubleJeopardyBoard.json";

const mockCategories = mockBoard.clueSet.map((set) => ({
  name: set.category,
  keyword: set.key,
}));
export default defineComponent({
  components: { ChatLog, ClueDisplay, GameBoard },
  name: "Main",
  setup() {
    return {
      categories: mockCategories,
    };
  },
});
</script>

<style scoped lang="scss">
.back {
  width: 100%;
  height: 100%;
}
.stream-area {
  width: 1280px;
  min-width: 1280px;
  height: 720px;
  min-height: 720px;
  overflow: hidden;
  background-color: green;
  display: grid;
  grid-template-areas:
    "clue chat scores"
    "board chat answers";
  grid-template-columns: 50% 25% 25%;
  grid-template-rows: 50% 50%;
}
.clue-display {
  grid-area: clue;
}
.board-display {
  grid-area: board;
}
.chat-display {
  grid-area: chat;
}
.answers-display {
  grid-area: answers;
  background-color: rgb(212, 245, 247);

}
.scores-display {
  grid-area: scores;
  background-color: pink;
}
</style>
