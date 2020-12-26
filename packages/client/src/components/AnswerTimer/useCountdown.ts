import { reactive, Ref, toRefs } from "vue";

const useCountdown = (
  timeInSec = 30,
  tickMs = 200
): {
  value: Ref<number>;
  countdown: (callback?: () => void) => void;
  clearTimer: () => void;
} => {
  const state = reactive<{
    value: number;
  }>({ value: 0 });

  const countdown = (callback?: () => void) => {
    state.value = 1;
    const perSec = tickMs / 1000;
    const tick = perSec / timeInSec;
    state.value = state.value - tick;
    const current = setInterval(() => {
      state.value = state.value - tick;
      if (state.value <= 0.01) {
        state.value = 0;
        clearInterval(current);
        if (callback) {
          callback();
        }
      }
    }, 200);
  };
  const clearTimer = () => {
    state.value = 0;
  };

  return { ...toRefs(state), countdown, clearTimer };
};

export default useCountdown;
