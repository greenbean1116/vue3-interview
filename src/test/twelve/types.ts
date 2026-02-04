import type { Ref } from 'vue'

export interface IStore {
  theme: Ref<'black' | 'white'>
  toggleTheme: () => void
}
