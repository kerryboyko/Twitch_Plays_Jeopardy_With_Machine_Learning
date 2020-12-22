<template>
  <div class="game-clock">
    <div class="game-clock__display">
      {{ state.timeElapsed }}
      {{ state.gamePending ? "to game start" : "elapsed" }}
    </div>
    <div class="game-clock__display">{{ state.formattedTime }}</div>
  </div>
</template>
<script lang="ts">
import { defineComponent, onBeforeUnmount, onMounted, reactive } from "vue";
import { useStore } from "vuex";
import intervalToDuration from "date-fns/intervalToDuration";
import { Duration, isBefore } from "date-fns";

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
  name: "GameTimer",
  setup() {
    let interval: ReturnType<typeof setTimeout>;
    const store = useStore();
    const state = reactive<{
      timeElapsed: string;
      gameQueued: boolean;
      gamePending: boolean;
    }>({
      timeElapsed: "00:00",
      gameQueued: false,
      gamePending: false,
    });

    const checkTime = () => {
      const gameStart = store.state.game.startTime;

      if (gameStart !== 0) {
        const launchTime = new Date(gameStart);
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
    onMounted(() => {
      interval = setInterval(() => {
        checkTime();
      }, 1000);
    });
    onBeforeUnmount(() => {
      clearInterval(interval);
    });

    return { state };
  },
});
</script>
<style lang="scss" scoped></style>
