<template>
  <div>
    <div ref="chatRef" class="chat__wrapper">
      <div class="chat__main">
        <div
          class="chat__entry"
          v-for="chatMsg in chatLog"
          :key="chatMsg.timestamp.toString()"
        >
          <span
            :class="{
              chat__entry__user: true,
              'chat__entry__user__is-alex': chatMsg.user === 'alextrebot',
            }"
            >{{ chatMsg.user }}:&nbsp;</span
          >
          <span class="chat__entry__message">{{ chatMsg.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineComponent, ref, watch } from "vue";
import useSocket from "../hooks/useSocket";
export default defineComponent({
  name: "Main",
  setup() {
    const { chatLog } = useSocket();

    const chatRef = ref(null);
    watch(
      () => JSON.stringify(chatLog),
      () => {
        if (chatRef.value !== null) {
          const isCurrentLock =
            (chatRef.value as any).scrollHeight -
              (chatRef.value as any).scrollTop -
              (chatRef.value as any).clientHeight <
            15;
          console.log(
            isCurrentLock,
            (chatRef.value as any).scrollHeight,
            (chatRef.value as any).scrollTop,
            (chatRef.value as any).clientHeight
          );
          if (isCurrentLock) {
            setTimeout(() => {
              (chatRef.value as any).scrollTop = (chatRef.value as any).clientHeight;
            }, 100);
          }
        }
      }
    );
    return {
      chatLog,
      chatRef,
    };
  },
});
</script>

<style lang="scss">
.chat {
  font-family: Inter;
  &__wrapper {
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    font-family: Inter, sans-serif;
    font-size: 0.75rem;
    width: 320px;
    height: 720px;
    padding: 0.25rem;
    overflow-x: hidden;
  }
  &__entry {
    &__user {
      color: yellow;
      &__is-alex {
        color: pink;
      }
    }
  }
}
</style>
