import { set, get } from 'lodash'
import { computed, Ref } from 'vue'

export default function propToComputed<T>(objectRef: Ref<unknown | undefined>, path: string[]) {
  return computed<T>({
    get() {
      if (objectRef.value) {
        return get(objectRef.value, path) ?? undefined;
      }
    },
    set(newValue) {
      if (get(objectRef.value, path)) {
        return set(objectRef.value as any, path, newValue);
      }
    }
  })
}