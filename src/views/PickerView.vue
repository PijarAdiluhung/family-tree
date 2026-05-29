<template>
  <div class="flex flex-col h-full w-full">
    <div v-if="loading" class="flex-1 flex items-center justify-center text-gray-400">Loading...</div>
    <template v-else-if="path.length">
      <div class="flex-1 overflow-y-auto">
        <div v-for="(row, i) in rows" :key="i" class="border-b border-gray-100">
          <div class="px-4 pt-3 pb-1 text-xs text-gray-400">
            <template v-if="i === 0">Generasi Pertama</template>
            <template v-else>Anak dari {{ row.parent.name }}</template>
          </div>
          <div class="px-4 pt-1 pb-3 overflow-x-auto scrollbar-hide">
            <div class="flex gap-3" :style="{ minWidth: `${Math.max(row.children.length * 160, 100)}px` }">
              <button v-for="child in row.children" :key="child.id" @click="selectPerson(i, child)"
                class="flex flex-col items-center gap-2 min-w-[140px] p-4 rounded-2xl border-2 transition-all hover:shadow-md active:scale-95 cursor-pointer shrink-0"
                :class="[child.gender === 'male' ? 'border-blue-200 bg-blue-50' : 'border-pink-200 bg-pink-50', child.id === selectedId(i) ? 'ring-2 ring-emerald-500' : '']">
                <div class="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold shadow-sm"
                  :class="child.gender === 'male' ? 'bg-blue-200 text-blue-800' : 'bg-pink-200 text-pink-800'">
                  {{ child.name.charAt(0) }}
                </div>
                <span class="text-sm font-medium text-center leading-tight">{{ child.name }}</span>
                <span v-if="childCount(child.id) > 0" class="text-xs text-gray-400">
                  {{ childCount(child.id) }} anak
                </span>
              </button>
              <div v-if="row.children.length === 0" class="flex items-center justify-center text-gray-400 min-w-[140px] py-8">
                <p class="text-sm">Tidak ada anak</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="px-4 py-3 border-t bg-white">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
            :class="deepest.gender === 'male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'">
            {{ deepest.name.charAt(0) }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-sm truncate">{{ deepest.name }}</p>
            <div class="flex gap-2 text-xs text-gray-500">
              <span v-if="deepest.birthYear">{{ deepest.birthYear }}</span>
              <span v-if="spouseNames.length">Pasangan: {{ spouseNames.join(', ') }}</span>
            </div>
          </div>
          <router-link :to="`/person/${deepest.id}`" class="btn-ghost text-xs shrink-0">Detail</router-link>
        </div>
      </div>
    </template>
    <div v-else class="flex-1 flex items-center justify-center text-gray-400">
      Tidak ada data. Silakan login sebagai admin untuk menambahkan anggota.
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { usePeopleStore } from '@/stores/people'
import { useFamiliesStore } from '@/stores/families'

const route = useRoute()
const peopleStore = usePeopleStore()
const familiesStore = useFamiliesStore()

const path = ref([])
const loading = ref(true)

function getChildren(person) {
  const personFamilies = familiesStore.all.filter(f => f.husbandId === person.id || f.wifeId === person.id)
  const childIds = personFamilies.flatMap(f => f.childIds || [])
  return childIds
    .map(id => peopleStore.all.find(p => p.id === id))
    .filter(Boolean)
    .sort((a, b) => (a.birthYear || 0) - (b.birthYear || 0))
}

function getParent(personId) {
  const family = familiesStore.all.find(f => (f.childIds || []).includes(personId))
  if (!family) return null
  const parentId = family.husbandId || family.wifeId
  if (!parentId) return null
  return peopleStore.all.find(p => p.id === parentId) || null
}

const rows = computed(() =>
  path.value.map(person => ({
    parent: person,
    children: getChildren(person),
  }))
)

const deepest = computed(() => path.value[path.value.length - 1])

const spouseNames = computed(() => {
  if (!deepest.value) return []
  const personFamilies = familiesStore.all.filter(f => f.husbandId === deepest.value.id || f.wifeId === deepest.value.id)
  return personFamilies.map(f => {
    const sid = f.husbandId === deepest.value.id ? f.wifeId : f.husbandId
    if (!sid) return null
    const sp = peopleStore.all.find(p => p.id === sid)
    return sp?.name
  }).filter(Boolean)
})

function childCount(personId) {
  const person = peopleStore.all.find(p => p.id === personId)
  if (!person) return 0
  return getChildren(person).length
}

function selectedId(i) {
  return path.value[i + 1]?.id
}

function selectPerson(levelIndex, person) {
  path.value = path.value.slice(0, levelIndex + 1)
  path.value.push(person)
}

async function init() {
  loading.value = true
  await Promise.all([peopleStore.ensureLoaded(), familiesStore.ensureLoaded()])
  if (peopleStore.all.length === 0) {
    loading.value = false
    return
  }
  const root = peopleStore.getRoot()
  const focusId = route.query.focus

  let startPerson
  if (focusId) {
    startPerson = peopleStore.all.find(p => p.id === focusId) || root
  } else {
    startPerson = root
  }

  const ancestors = [root]
  if (startPerson.id !== root.id) {
    const chain = []
    let current = startPerson
    while (current && current.id !== root.id) {
      chain.unshift(current)
      current = getParent(current.id)
    }
    ancestors.push(...chain)
  }

  path.value = ancestors
  loading.value = false
}

onMounted(init)
watch(() => route.query.focus, init)
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { scrollbar-width: none; }
</style>
