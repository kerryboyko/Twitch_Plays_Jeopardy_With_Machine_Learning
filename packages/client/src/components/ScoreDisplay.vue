<template>
  <div class="score-display" :class="{ negative: state.myScore < 0 }">
    ${{ state.myScore }}
  </div>
  <wager-display v-if="state.promptedForWager" />
</template>

<script lang="ts">
import { defineComponent, reactive, computed, ComputedRef } from "vue";
import { useStore } from "vuex";
import WagerDisplay from "./WagerDisplay.vue";

export default defineComponent({
  components: { WagerDisplay },
  name: "ScoreDisplay",
  setup() {
    const store = useStore();
    const state = reactive<{
      myScore: ComputedRef<number>;
      promptedForWager: ComputedRef<boolean>;
    }>({
      myScore: computed(
        () => store.state.game.scoreboard[store.state.user.twitchId]
      ),

      promptedForWager: computed(() => {
        return true || store.state.game.promptedForWager;
      }),
    });

    return { state };
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
</style>