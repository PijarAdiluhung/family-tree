<template>
  <div class="px-4 py-6 max-w-lg mx-auto">
    <div v-if="loading" class="text-center py-12 text-gray-400">Loading...</div>
    <div v-else-if="!person" class="text-center py-12 text-gray-400">Anggota tidak ditemukan</div>
    <template v-else>
      <div class="card p-6 mb-4">
        <div class="flex items-center gap-4 mb-4">
          <div class="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-700 shrink-0">
            {{ person.name.charAt(0) }}
          </div>
          <div>
            <h1 class="text-xl font-bold">{{ person.name }}</h1>
            <p class="text-sm text-gray-500">{{ person.gender === 'male' ? 'Laki-laki' : 'Perempuan' }}</p>
          </div>
        </div>
        <div class="space-y-2 text-sm">
          <p v-if="person.birthYear" class="text-gray-600"><span class="font-medium">Lahir:</span> {{ person.birthYear }}{{ person.birthPlace ? `, ${person.birthPlace}` : '' }}</p>
          <p v-if="person.deathYear" class="text-gray-600"><span class="font-medium">Meninggal:</span> {{ person.deathYear }}</p>
          <p v-if="person.photoUrl" class="mt-2">
            <img :src="person.photoUrl" :alt="person.name" class="w-full max-w-xs rounded-lg" />
          </p>
        </div>
      </div>

      <div v-if="spouses.length" class="card p-4 mb-4">
        <h3 class="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-3">Pasangan</h3>
        <div class="flex flex-wrap gap-2">
          <router-link v-for="s in spouses" :key="s.person.id" :to="`/person/${s.person.id}`" class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm hover:bg-gray-50">
            <span class="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs">{{ s.person.name.charAt(0) }}</span>
            {{ s.person.name }}
          </router-link>
        </div>
      </div>

      <div v-if="children.length" class="card p-4 mb-4">
        <h3 class="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-3">Anak ({{ children.length }})</h3>
        <div class="flex flex-col gap-2">
          <router-link v-for="c in children" :key="c.id" :to="`/person/${c.id}`" class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50">
            <span class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-700">{{ c.name.charAt(0) }}</span>
            <span class="text-sm font-medium">{{ c.name }}</span>
          </router-link>
        </div>
      </div>

      <div v-if="parentFamilies.length" class="card p-4 mb-4">
        <h3 class="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-3">Orang Tua</h3>
        <div v-for="f in parentFamilies" :key="f.id" class="flex flex-wrap gap-2">
          <template v-if="f.husbandId">
            <router-link v-if="parentMap[f.husbandId]" :to="`/person/${f.husbandId}`" class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm hover:bg-gray-50">
              {{ parentMap[f.husbandId].name }}
            </router-link>
          </template>
          <template v-if="f.wifeId">
            <router-link v-if="parentMap[f.wifeId]" :to="`/person/${f.wifeId}`" class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm hover:bg-gray-50">
              {{ parentMap[f.wifeId].name }}
            </router-link>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePeopleStore } from '@/stores/people'
import { useFamiliesStore } from '@/stores/families'

const route = useRoute()
const peopleStore = usePeopleStore()
const familiesStore = useFamiliesStore()

const person = ref(null)
const spouses = ref([])
const children = ref([])
const parentFamilies = ref([])
const parentMap = ref({})
const loading = ref(true)

onMounted(async () => {
  await Promise.all([peopleStore.ensureLoaded(), familiesStore.ensureLoaded()])
  const p = await peopleStore.getById(route.params.id)
  if (!p) { loading.value = false; return }
  person.value = p

  const personFamilies = await familiesStore.getFamiliesForPerson(p.id)
  const allFamilies = familiesStore.all

  for (const f of personFamilies) {
    const spouseId = f.husbandId === p.id ? f.wifeId : f.husbandId
    if (spouseId) {
      const sp = await peopleStore.getById(spouseId)
      if (sp) spouses.value.push({ person: sp, familyId: f.id })
    }
    const kids = (f.childIds || [])
      .map(id => peopleStore.all.find(p => p.id === id))
      .filter(Boolean)
    children.value.push(...kids)
  }

  parentFamilies.value = allFamilies.filter(f => (f.childIds || []).includes(p.id))
  for (const f of parentFamilies.value) {
    if (f.husbandId) {
      const hp = await peopleStore.getById(f.husbandId)
      if (hp) parentMap.value[f.husbandId] = hp
    }
    if (f.wifeId) {
      const wp = await peopleStore.getById(f.wifeId)
      if (wp) parentMap.value[f.wifeId] = wp
    }
  }

  loading.value = false
})
</script>
