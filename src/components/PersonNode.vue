<template>
  <div
    class="relative px-1 py-1.5 w-[110px] rounded-xl text-center text-xs font-medium shadow-sm border cursor-pointer select-none transition-all hover:shadow-md"
    :class="nodeClasses"
    :style="nodeStyle"
  >
    <Handle type="target" :position="Position.Left" id="left" class="!opacity-0" />

    <div class="font-semibold leading-tight truncate px-1">{{ person.name }}</div>
    <div v-if="person.birthYear" class="text-[10px] opacity-75 mt-0.5">{{ person.birthYear }}</div>

    <Handle type="source" :position="Position.Right" id="right" class="!opacity-0" />

    <Handle type="target" :position="Position.Top" id="top" class="!opacity-0" />
    <Handle type="source" :position="Position.Bottom" id="bottom" class="!opacity-0" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'

const props = defineProps({
  data: { type: Object, required: true },
})

const person = computed(() => props.data.person)
const highlighted = computed(() => props.data.highlighted)

const nodeClasses = computed(() => {
  const p = person.value
  if (!p) return ''
  const base = 'border-2'
  if (p.isRoot) return `${base} bg-amber-100 border-amber-400 text-amber-900 font-bold`
  if (p.gender === 'male') return `${base} bg-blue-100 border-blue-300 text-blue-900`
  return `${base} bg-pink-100 border-pink-300 text-pink-900`
})

const nodeStyle = computed(() => {
  if (!highlighted.value) return {}
  return {
    boxShadow: '0 0 0 3px rgb(5 150 105), 0 0 0 5px rgb(255 255 255), 0 0 0 7px rgb(5 150 105)',
  }
})
</script>