import { reactive } from 'vue'

const state = reactive({
  show: false,
  title: '',
  message: '',
  resolve: null,
})

function confirm(message, title = 'Konfirmasi') {
  state.title = title
  state.message = message
  state.show = true
  return new Promise((resolve) => {
    state.resolve = resolve
  })
}

export function useConfirm() {
  return { state, confirm }
}
