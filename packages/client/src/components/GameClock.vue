<template>
  <div class="game-clock">
    <div v-if="state.seed" class="game-clock__display">
      JeopardAI game (seed: {{ state.seed }})
      {{ state.gamePending ? "will begin in" : "has been running for" }}
      {{ state.timeElapsed }}
    </div>
    <div v-else>
      No JeopardAI game currently running.
      <div v-if="state.twitchId">
        <button @click="handleStartGame">Launch Game</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  ComputedRef,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  reactive,
} from "vue";
import { useStore } from "vuex";
import intervalToDuration from "date-fns/intervalToDuration";
import { Duration, isBefore } from "date-fns";
import { startGame } from "../socket/actions";

const durationToClock = (d: Duration) => {
  const { days, hours, minutes, seconds } = d as Required<Duration>;
  let flag = false;
  const output: number[] = [];
  if (days !== 0) {
    flag = true;
    output.push(days);
  }
  if (flag || hours !== 0) {
    flag = true;
    output.push(hours);
  }
  if (flag || minutes !== 0) {
    output.push(minutes);
  }
  output.push(seconds);
  return output
    .map((t: number) => {
      let s = t.toString();
      if (s.length === 1) {
        s = `0${s}`;
      }
      return s;
    })
    .join(":");
};

export default defineComponent({
  name: "GameClock",
  setup() {
    let interval: ReturnType<typeof setTimeout>;
    const store = useStore();
    const state = reactive<{
      timeElapsed: string;
      gameQueued: boolean;
      gamePending: boolean;
      gameStart: ComputedRef<number>;
      seed: ComputedRef<string>;
      twitchId: ComputedRef<string>;
    }>({
      timeElapsed: "00:00",
      gameQueued: false,
      gamePending: false,
      gameStart: computed(() => store.state.game.startTime),
      seed: computed(() => store.state.game.seed),
      twitchId: computed(() => store.state.user.twitchId),
    });
    const checkTime = () => {
      if (state.gameStart !== 0) {
        const launchTime = new Date(state.gameStart);
        const now = new Date();
        const d = intervalToDuration({
          start: launchTime,
          end: now,
        });
        state.timeElapsed = durationToClock(d);
        state.gameQueued = true;
        state.gamePending = isBefore(now, launchTime);
      } else {
        state.gameQueued = false;
      }
    };
    const handleStartGame = () => {
      startGame();
    };
    onMounted(() => {
      interval = setInterval(() => {
        checkTime();
      }, 1000);
    });
    onBeforeUnmount(() => {
      clearInterval(interval);
    });

    return { state, handleStartGame };
  },
});
</script>
<style lang="scss" scoped>
.game-clock {
  font-family: Bebas Neue;
}
</style>
