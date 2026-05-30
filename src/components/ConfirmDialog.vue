<template>
  <Teleport to="body">
    <div
      v-if="state.show"
      class="fixed inset-0 z-[100] flex items-center justify-center"
      @click.self="cancel"
    >
      <div class="absolute inset-0 bg-black/40" />
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-xs mx-4 p-6 text-center">
        <p class="text-sm text-gray-600 mb-6" v-text="state.message" />
        <div class="flex gap-3">
          <button @click="cancel" class="btn-ghost flex-1 text-sm">Batal</button>
          <button @click="ok" class="btn-primary flex-1 text-sm">Ya</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { useConfirm } from '@/composables/useConfirm'

const { state } = useConfirm()

function ok() {
  if (state.resolve) {
    state.resolve(true)
    state.resolve = null
  }
  state.show = false
}

function cancel() {
  if (state.resolve) {
    state.resolve(false)
    state.resolve = null
  }
  state.show = false
}
</script>
