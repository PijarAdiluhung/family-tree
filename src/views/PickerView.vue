<template>
  <div class="flex flex-col h-[calc(100vh-56px)]">
    <div v-if="loading" class="flex-1 flex items-center justify-center text-gray-400">Loading...</div>
    <template v-else-if="currentPerson">
      <div class="px-4 py-3 border-b bg-white">
        <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide" ref="breadcrumbRef">
          <template v-for="(p, i) in breadcrumb" :key="p.id">
            <button @click="navigateTo(i)" class="whitespace-nowrap text-sm px-3 py-1.5 rounded-full transition-colors"
              :class="i === breadcrumb.length - 1 ? 'bg-emerald-900 text-white font-medium' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'">
              {{ p.name }}
            </button>
            <span v-if="i < breadcrumb.length - 1" class="text-gray-300 text-sm self-center">&gt;</span>
          </template>
        </div>
      </div>

      <div class="flex-1 overflow-x-auto overflow-y-hidden">
        <div class="h-full flex items-center px-4" ref="scrollerRef">
          <div class="flex gap-4 items-center" :style="{ minWidth: `${Math.max(children.length * 160, 100)}px` }">
            <button v-for="child in children" :key="child.id" @click="selectPerson(child)"
              class="flex flex-col items-center gap-2 min-w-[140px] p-4 rounded-2xl border-2 transition-all hover:shadow-md active:scale-95 cursor-pointer shrink-0"
              :class="child.gender === 'male' ? 'border-blue-200 bg-blue-50' : 'border-pink-200 bg-pink-50'">
              <div class="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold shadow-sm"
                :class="child.gender === 'male' ? 'bg-blue-200 text-blue-800' : 'bg-pink-200 text-pink-800'">
                {{ child.name.charAt(0) }}
              </div>
              <span class="text-sm font-medium text-center leading-tight">{{ child.name }}</span>
              <span v-if="childCounts[child.id] !== undefined" class="text-xs text-gray-400">
                {{ childCounts[child.id] }} anak
              </span>
            </button>
            <div v-if="children.length === 0" class="text-center text-gray-400 w-full py-8">
              <p class="text-lg">Tidak ada anak</p>
              <p class="text-sm mt-1">Anggota terakhir di jalur ini</p>
            </div>
          </div>
        </div>
      </div>

      <div class="px-4 py-3 border-t bg-white">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
            :class="currentPerson.gender === 'male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'">
            {{ currentPerson.name.charAt(0) }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-sm truncate">{{ currentPerson.name }}</p>
            <div class="flex gap-2 text-xs text-gray-500">
              <span v-if="currentPerson.birthYear">{{ currentPerson.birthYear }}</span>
              <span v-if="spouseNames.length">Pasangan: {{ spouseNames.join(', ') }}</span>
            </div>
          </div>
          <router-link :to="`/person/${currentPerson.id}`" class="btn-ghost text-xs shrink-0">Detail</router-link>
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

const breadcrumb = ref([])
const currentPerson = ref(null)
const children = ref([])
const childCounts = ref({})
const spouseNames = ref([])
const loading = ref(true)

const currentIndex = computed(() => breadcrumb.value.length - 1)

async function loadChildren(person) {
  const personFamilies = familiesStore.all.filter(f => f.husbandId === person.id || f.wifeId === person.id)
  const childIds = personFamilies.flatMap(f => f.childIds || [])
  const kids = childIds.map(id => peopleStore.all.find(p => p.id === id)).filter(Boolean)
  children.value = kids

  const counts = {}
  for (const kid of kids) {
    const kidFamilies = familiesStore.all.filter(f => f.husbandId === kid.id || f.wifeId === kid.id)
    counts[kid.id] = kidFamilies.reduce((sum, f) => sum + (f.childIds?.length || 0), 0)
  }
  childCounts.value = counts

  const sp = personFamilies.map(f => {
    const sid = f.husbandId === person.id ? f.wifeId : f.husbandId
    if (!sid) return null
    const sp = peopleStore.all.find(p => p.id === sid)
    return sp?.name
  }).filter(Boolean)
  spouseNames.value = sp
}

async function selectPerson(person) {
  breadcrumb.value.push(person)
  currentPerson.value = person
  await loadChildren(person)
}

function navigateTo(index) {
  breadcrumb.value = breadcrumb.value.slice(0, index + 1)
  const p = breadcrumb.value[index]
  currentPerson.value = p
  loadChildren(p)
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
  breadcrumb.value = [startPerson]
  currentPerson.value = startPerson
  await loadChildren(startPerson)
  loading.value = false
}

onMounted(init)
watch(() => route.query.focus, init)
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { scrollbar-width: none; }
</style>
