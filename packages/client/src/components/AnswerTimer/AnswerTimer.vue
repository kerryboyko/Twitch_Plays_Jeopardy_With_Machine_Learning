<template>
  <div class="meter--container">
    <div v-if="!inactive && seconds !== undefined" class="seconds">
      {{ seconds }}
    </div>
    <div class="meter" :class="{ inactive: inactive }">
      <span
        :class="{
          warn: value < 0.3,
          danger: value < 0.15,
          inactive: inactive,
        }"
        :style="{ width: inactive ? '100%' : `${value * 100}%` }"
      ></span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "AnswerTimer",
  props: {
    value: {
      type: Number,
      required: true,
    },
    inactive: {
      type: Boolean,
      required: false,
      default: true,
    },
    seconds: {
      type: Number,
      required: false,
    },
  },
});
</script>
<style lang="scss">
.meter--container {
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
  align-items: center;
}
.seconds {
  width: 30px;
}
.meter {
  width: 100%;
  height: 30px; /* Can be anything */
  position: relative;
  background: rgb(231, 231, 231);
  border-radius: 25px;
  padding: 8px;
  box-shadow: inset 0 -1px 1px rgba(255, 255, 255, 0.3);
  &.inactive {
    visibility: hidden;
  }
}
.meter > span {
  display: block;
  height: 15px;
  border-radius: 8px;
  background-color: rgb(43, 194, 83);
  background-color: linear-gradient(
    center bottom,
    rgb(43, 194, 83) 37%,
    rgb(84, 240, 84) 69%
  );
  box-shadow: inset 0 2px 9px rgba(255, 255, 255, 0.3),
    inset 0 -2px 6px rgba(0, 0, 0, 0.4);
  position: relative;
  overflow: hidden;
  &.warn {
    background-color: rgb(184, 194, 43);

    background-color: linear-gradient(
      center bottom,
      rgb(184, 194, 43) 37%,
      rgb(142, 150, 35) 69%
    );
  }
  &.danger {
    background-color: rgb(202, 39, 39);

    background-color: linear-gradient(
      center bottom,
      rgb(202, 39, 39) 37%,
      rgb(153, 29, 29) 69%
    );
  }
  &.inactive {
    background-color: rgb(119, 119, 119);
    width: 100%;
  }
}
</style>
