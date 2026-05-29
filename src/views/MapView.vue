<template>
  <div class="h-[calc(100vh-56px)] relative">
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center text-gray-400 z-10 bg-white/80">
      Memuat pohon keluarga...
    </div>
    <TreeMap
      v-else
      ref="treeMapRef"
      :people="peopleStore.all"
      :families="familiesStore.all"
      :focus-id="focusId"
      :highlight-person-id="highlightPersonId"
      @highlight-cleared="highlightPersonId = null"
    />

    <template v-if="!loading">
      <button
        @click="searchOpen = true"
        class="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-emerald-700 text-white shadow-lg flex items-center justify-center hover:bg-emerald-800 transition-colors"
        title="Cari anggota keluarga"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      <div
        v-if="highlightPersonId"
        class="absolute top-4 left-4 z-20 flex items-center gap-2"
      >
        <span class="text-xs text-gray-500 bg-white/90 backdrop-blur rounded-full px-3 py-1.5 shadow text-emerald-700 font-medium">
          Menyorot jalur silsilah
        </span>
        <button
          @click="highlightPersonId = null"
          class="w-7 h-7 rounded-full bg-white shadow flex items-center justify-center hover:bg-gray-100 transition-colors"
          title="Bersihkan sorotan"
        >
          <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <SearchModal
        v-if="searchOpen"
        :people="peopleStore.all"
        @select="onPersonSelected"
        @close="searchOpen = false"
      />
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePeopleStore } from '@/stores/people'
import { useFamiliesStore } from '@/stores/families'
import TreeMap from '@/components/TreeMap.vue'
import SearchModal from '@/components/SearchModal.vue'

const route = useRoute()
const peopleStore = usePeopleStore()
const familiesStore = useFamiliesStore()
const loading = ref(true)
const focusId = computed(() => route.query.focus || null)
const treeMapRef = ref(null)
const searchOpen = ref(false)
const highlightPersonId = ref(null)

function onPersonSelected(personId) {
  highlightPersonId.value = personId
  searchOpen.value = false
}

onMounted(async () => {
  await Promise.all([peopleStore.ensureLoaded(), familiesStore.ensureLoaded()])
  loading.value = false
})
</script>
