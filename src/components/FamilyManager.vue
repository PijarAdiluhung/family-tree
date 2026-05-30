<template>
  <div class="card p-4">
    <h3 class="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-3">Keluarga</h3>

    <div class="space-y-4">
      <div>
        <label class="label">Pasangan</label>
        <div v-if="spouses.length" class="flex flex-wrap gap-2 mb-2">
          <div v-for="s in spouses" :key="s.id" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-gray-100">
            <span>{{ s.name }}</span>
            <button @click="removeSpouse(s)" class="text-red-400 hover:text-red-600 ml-1">&times;</button>
          </div>
        </div>
        <div class="flex gap-2">
          <select v-model="selectedSpouseId" class="input text-sm flex-1">
            <option value="">— Pilih pasangan —</option>
            <option v-for="p in availablePeople" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
          <button @click="addSpouse" class="btn-secondary text-sm" :disabled="!selectedSpouseId">Tambah</button>
        </div>
      </div>

      <div>
        <label class="label">Anak</label>
        <div v-if="children.length" class="flex flex-col gap-1.5 mb-2">
          <div v-for="c in children" :key="c.id" class="flex items-center justify-between px-3 py-1.5 rounded-lg bg-gray-50 text-sm">
            <span>{{ c.name }}{{ c.birthYear ? ' (' + c.birthYear + ')' : '' }}</span>
            <button @click="removeChild(c)" class="text-red-400 hover:text-red-600">&times;</button>
          </div>
        </div>
        <div v-if="!children.length" class="text-xs text-gray-400 mb-2">Belum ada anak</div>
        <div class="flex gap-2">
          <select v-model="selectedChildId" class="input text-sm flex-1">
            <option value="">— Pilih anak —</option>
            <option v-for="p in availablePeople" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
          <button @click="addChild" class="btn-secondary text-sm" :disabled="!selectedChildId">Tambah</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePeopleStore } from '@/stores/people'
import { useFamiliesStore } from '@/stores/families'
import { toast } from 'vue3-toastify'

const props = defineProps({
  personId: { type: String, required: true },
})

const emit = defineEmits(['updated'])

const peopleStore = usePeopleStore()
const familiesStore = useFamiliesStore()

const spouses = ref([])
const children = ref([])
const selectedSpouseId = ref('')
const selectedChildId = ref('')

const availablePeople = computed(() =>
  peopleStore.all.filter(p => p.id !== props.personId)
)

async function loadFamilies() {
  const personFamilies = await familiesStore.getFamiliesForPerson(props.personId)
  const results = { spouses: [], children: [] }

  for (const f of personFamilies) {
    const spouseId = f.husbandId === props.personId ? f.wifeId : f.husbandId
    if (spouseId) {
      const sp = await peopleStore.getById(spouseId)
      if (sp) results.spouses.push({ ...sp, familyId: f.id })
    }
    for (const childId of f.childIds || []) {
      const child = await peopleStore.getById(childId)
      if (child) results.children.push({ ...child, familyId: f.id })
    }
  }

  spouses.value = results.spouses.filter((s, i, arr) => arr.findIndex(a => a.id === s.id) === i)
  children.value = results.children
}

async function addSpouse() {
  if (!selectedSpouseId.value) return
  const newFamilyId = await familiesStore.save(null, {
    husbandId: props.personId,
    wifeId: selectedSpouseId.value,
    childIds: [],
  })
  selectedSpouseId.value = ''
  await loadFamilies()
  emit('updated')
}

async function removeSpouse(spouse) {
  if (!confirm(`Hapus pasangan ${spouse.name}?`)) return
  if (spouse.familyId) {
    await familiesStore.remove(spouse.familyId)
  }
  await loadFamilies()
  emit('updated')
}

async function addChild() {
  if (!selectedChildId.value) return
  const personFamilies = await familiesStore.getFamiliesForPerson(props.personId)
  if (personFamilies.length === 0) {
    toast.warning('Tambahkan pasangan terlebih dahulu sebelum menambah anak.')
    selectedChildId.value = ''
    return
  }
  const familyId = personFamilies[0].id
  await familiesStore.addChild(familyId, selectedChildId.value)
  selectedChildId.value = ''
  await loadFamilies()
  emit('updated')
}

async function removeChild(child) {
  if (!confirm(`Hapus ${child.name} dari daftar anak?`)) return
  if (child.familyId) {
    await familiesStore.removeChild(child.familyId, child.id)
  }
  await loadFamilies()
  emit('updated')
}

onMounted(loadFamilies)
</script>
