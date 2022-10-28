import { onUnmounted, reactive, watchEffect } from 'vue'

export default function useScreen() {
  const screen = reactive({ width: 0, height: 0 });
  
  const update = () => {
    screen.width = window.innerWidth;
    screen.height = window.innerHeight;
  }
  watchEffect(update);
  window.addEventListener('resize', update);
  onUnmounted(() => {
    window.removeEventListener('resize', update);
  });

  return screen;
}