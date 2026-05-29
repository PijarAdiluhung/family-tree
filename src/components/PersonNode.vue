<template>
  <div
    class="px-2 py-1.5 rounded-xl text-center text-xs font-medium shadow-sm border cursor-pointer select-none min-w-[80px] transition-all hover:shadow-md"
    :class="nodeClasses"
  >
    <div class="font-semibold leading-tight truncate max-w-[100px]">{{ person.name }}</div>
    <div v-if="person.birthYear" class="text-[10px] opacity-75 mt-0.5">{{ person.birthYear }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: { type: Object, required: true },
})

const person = computed(() => props.data.person)

const nodeClasses = computed(() => {
  const p = person.value
  if (!p) return ''
  const base = 'border-2'
  if (p.isRoot) return `${base} bg-amber-100 border-amber-400 text-amber-900 font-bold`
  if (p.gender === 'male') return `${base} bg-blue-100 border-blue-300 text-blue-900`
  return `${base} bg-pink-100 border-pink-300 text-pink-900`
})
</script>
