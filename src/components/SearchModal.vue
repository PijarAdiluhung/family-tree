<template>
  <div
    class="fixed inset-0 z-50 flex items-start justify-center pt-20"
    @click.self="emit('close')"
  >
    <div class="absolute inset-0 bg-black/40" @click="emit('close')" />
    <div
      class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
      @click.stop
    >
      <div class="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
        <svg class="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref="inputRef"
          v-model="query"
          type="text"
          placeholder="Cari nama anggota keluarga..."
          class="flex-1 outline-none text-sm bg-transparent"
        />
        <button v-if="query" @click="query = ''" class="text-gray-400 hover:text-gray-600">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="max-h-80 overflow-y-auto">
        <div v-if="!query" class="px-4 py-8 text-center text-sm text-gray-400">
          Ketik nama untuk mencari
        </div>
        <div v-else-if="results.length === 0" class="px-4 py-8 text-center text-sm text-gray-400">
          Tidak ditemukan
        </div>
        <button
          v-for="person in results"
          :key="person.id"
          @click="emit('select', person.id)"
          class="w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 transition-colors text-left"
        >
          <span
            class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            :class="person.gender === 'male' ? 'bg-blue-400' : 'bg-pink-400'"
          >
            {{ person.name.charAt(0).toUpperCase() }}
          </span>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium text-gray-800 truncate">{{ person.name }}</div>
            <div class="text-xs text-gray-400">
              <template v-if="person.birthYear">{{ person.birthYear }}</template>
              <template v-if="person.birthYear && person.deathYear"> &ndash; </template>
              <template v-if="person.deathYear">{{ person.deathYear }}</template>
              <template v-if="!person.birthYear && !person.deathYear">Tahun tidak diketahui</template>
            </div>
          </div>
          <svg class="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import Fuse from 'fuse.js'

const props = defineProps({
  people: { type: Array, default: () => [] },
})

const emit = defineEmits(['select', 'close'])

const inputRef = ref(null)
const query = ref('')

const fuse = computed(() => {
  return new Fuse(props.people, {
    keys: ['name', 'birthYear', 'birthPlace'],
    threshold: 0.4,
    minMatchCharLength: 1,
  })
})

const results = computed(() => {
  if (!query.value.trim()) return []
  return fuse.value.search(query.value.trim()).map(r => r.item)
})

onMounted(() => {
  inputRef.value?.focus()
})

watch(query, (val) => {
  if (!val.trim()) return
})
</script>
