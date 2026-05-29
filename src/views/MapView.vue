<template>
  <div class="h-[calc(100vh-56px)] relative">
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center text-gray-400 z-10 bg-white/80">
      Memuat pohon keluarga...
    </div>
    <TreeMap v-else :people="peopleStore.all" :families="familiesStore.all" :focus-id="focusId" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePeopleStore } from '@/stores/people'
import { useFamiliesStore } from '@/stores/families'
import TreeMap from '@/components/TreeMap.vue'

const route = useRoute()
const peopleStore = usePeopleStore()
const familiesStore = useFamiliesStore()
const loading = ref(true)
const focusId = computed(() => route.query.focus || null)

onMounted(async () => {
  await Promise.all([peopleStore.loadAll(), familiesStore.loadAll()])
  loading.value = false
})
</script>
