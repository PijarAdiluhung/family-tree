<template>
  <div class="px-4 py-6 max-w-2xl mx-auto">
    <h2 class="text-lg font-bold mb-4">Revisi Data</h2>

    <div v-if="loading" class="text-center py-12 text-gray-400">Loading...</div>

    <template v-else-if="firstGen.length">
      <div class="mb-6">
        <label class="label">Pilih anak generasi pertama</label>
        <select v-model="selectedId" class="input" @change="onSelect">
          <option value="">— Pilih —</option>
          <option v-for="p in firstGen" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
      </div>

      <div v-if="forms.length" class="space-y-6">
        <div v-for="(entry, i) in forms" :key="entry._key" class="card p-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-semibold text-sm text-gray-500 uppercase tracking-wide">
              {{ entry.id ? 'Edit Data' : 'Orang Baru' }}
            </h3>
            <button v-if="!entry.id" @click="removeForm(i)" class="text-red-400 hover:text-red-600 text-sm">&times; Hapus</button>
          </div>
          <div class="flex flex-col gap-3">
            <div>
              <label class="label">Nama *</label>
              <input v-model="entry.name" class="input" required />
            </div>
            <div>
              <label class="label">Jenis Kelamin *</label>
              <div class="flex gap-3">
                <label class="relative flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer"
                  :class="entry.gender === 'male' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'">
                  <input type="radio" v-model="entry.gender" value="male" class="opacity-0 absolute inset-0 w-full h-full cursor-pointer" :name="'gender-' + entry._key" />
                  <span class="text-sm relative pointer-events-none">Laki-laki</span>
                </label>
                <label class="relative flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer"
                  :class="entry.gender === 'female' ? 'border-pink-500 bg-pink-50' : 'border-gray-300'">
                  <input type="radio" v-model="entry.gender" value="female" class="opacity-0 absolute inset-0 w-full h-full cursor-pointer" :name="'gender-' + entry._key" />
                  <span class="text-sm relative pointer-events-none">Perempuan</span>
                </label>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="label">Tahun Lahir</label>
                <input v-model.number="entry.birthYear" type="number" class="input" placeholder="1960" />
              </div>
              <div>
                <label class="label">Tahun Wafat</label>
                <input v-model.number="entry.deathYear" type="number" class="input" placeholder="—" />
              </div>
            </div>
            <div>
              <label class="label">Tempat Lahir</label>
              <input v-model="entry.birthPlace" class="input" placeholder="Jakarta" />
            </div>
            <div>
              <label class="label">URL Foto</label>
              <input v-model="entry.photoUrl" class="input" placeholder="https://..." />
            </div>
          </div>
        </div>

        <button @click="addForm" class="btn-secondary w-full text-sm">+ Tambah Orang</button>

        <button @click="handleSave" :disabled="saving" class="btn-primary w-full">
          {{ saving ? 'Menyimpan...' : 'Simpan Revisi' }}
        </button>
      </div>
    </template>

    <div v-else class="text-center py-12 text-gray-400">
      Belum ada data anggota keluarga.
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePeopleStore } from '@/stores/people'
import { useFamiliesStore } from '@/stores/families'
import { saveRevision } from '@/services/revisions'
import { toast } from 'vue3-toastify'

const router = useRouter()
const peopleStore = usePeopleStore()
const familiesStore = useFamiliesStore()

const loading = ref(true)
const selectedId = ref('')
const forms = ref([])
const saving = ref(false)

let nextKey = 1

const firstGen = computed(() => {
  const root = peopleStore.getRoot()
  if (!root) return []
  return peopleStore.getChildren(root.id, familiesStore.all)
})

function collectRelatedPersonIds(personId, visited = new Set()) {
  if (visited.has(personId)) return visited
  visited.add(personId)
  const personFamilies = familiesStore.all.filter(f => f.husbandId === personId || f.wifeId === personId)
  for (const f of personFamilies) {
    const spouseId = f.husbandId === personId ? f.wifeId : f.husbandId
    if (spouseId) collectRelatedPersonIds(spouseId, visited)
    for (const childId of f.childIds || []) {
      collectRelatedPersonIds(childId, visited)
    }
  }
  return visited
}

function buildForms(personId) {
  const ids = collectRelatedPersonIds(personId)
  const formList = []
  for (const id of ids) {
    const p = peopleStore.all.find(x => x.id === id)
    if (p) {
      formList.push({
        _key: nextKey++,
        id: p.id,
        name: p.name || '',
        gender: p.gender || 'male',
        birthYear: p.birthYear || null,
        deathYear: p.deathYear || null,
        birthPlace: p.birthPlace || '',
        photoUrl: p.photoUrl || '',
      })
    }
  }
  return formList
}

function onSelect() {
  if (!selectedId.value) {
    forms.value = []
    return
  }
  forms.value = buildForms(selectedId.value)
}

function addForm() {
  forms.value.push({
    _key: nextKey++,
    id: null,
    name: '',
    gender: 'male',
    birthYear: null,
    deathYear: null,
    birthPlace: '',
    photoUrl: '',
  })
}

function removeForm(i) {
  forms.value.splice(i, 1)
}

async function pingDiscord() {
  try {
    await fetch('https://mbah-kaslan-revision-feoas.bunny.run/', {
      method: 'POST',
      headers: {
        'Origin': 'https://mbah-kaslan.web.app',
        'Content-Type': 'application/json',
      },
    })
    console.log('Discord ping sent successfully')
  } catch (e) {
    console.error('Failed to ping Discord notification:', e)
  }
}

async function handleSave() {
  const people = forms.value.map(e => ({
    id: e.id,
    name: e.name,
    gender: e.gender,
    birthYear: e.birthYear || null,
    deathYear: e.deathYear || null,
    birthPlace: e.birthPlace || '',
    photoUrl: e.photoUrl || '',
  }))

  if (!people.some(p => p.name)) {
    toast.error('Setidaknya satu orang harus memiliki nama.')
    return
  }

  saving.value = true
  try {
    const basedOn = peopleStore.all.find(p => p.id === selectedId.value)
    await saveRevision({
      status: 'pending',
      basedOnPersonId: selectedId.value,
      basedOnPersonName: basedOn ? basedOn.name : '',
      people,
    })
    await pingDiscord()
    toast.success('Revisi berhasil dikirim! Terima kasih atas updatenya.')
    forms.value = []
    selectedId.value = ''
  } catch (e) {
    console.error('Failed to save revision:', e)
    toast.error('Gagal menyimpan revisi. Silakan coba lagi.')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await Promise.all([peopleStore.ensureLoaded(), familiesStore.ensureLoaded()])
  loading.value = false
})
</script>
