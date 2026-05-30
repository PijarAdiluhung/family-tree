<template>
  <div class="px-4 py-6 max-w-2xl mx-auto">
    <h2 class="text-lg font-bold mb-4">Revisi Data Masuk</h2>

    <div v-if="loading" class="text-center py-12 text-gray-400">Loading...</div>

    <div v-else-if="revisions.length === 0" class="text-center py-12 text-gray-400">
      Belum ada revisi masuk.
    </div>

    <div v-else class="flex flex-col gap-4">
      <div v-for="r in revisions" :key="r.id" class="card p-4">
        <div class="flex items-start justify-between mb-2">
          <div>
            <div class="font-semibold text-sm">{{ r.basedOnPersonName || '(tanpa nama)' }}</div>
            <div class="text-xs text-gray-400">
              {{ r.createdAt?.toDate?.()?.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) || '—' }}
            </div>
          </div>
          <span class="text-[10px] uppercase px-2 py-0.5 rounded-full"
            :class="r.status === 'applied' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'">
            {{ r.status === 'applied' ? 'Diterapkan' : 'Pending' }}
          </span>
        </div>

        <div class="text-xs text-gray-500 mb-3">
          {{ r.people?.length || 0 }} orang
        </div>

        <details class="text-sm">
          <summary class="cursor-pointer text-gray-600 hover:text-gray-800">Lihat data</summary>
          <div class="mt-2 space-y-2">
            <div v-for="(p, i) in r.people" :key="i" class="bg-gray-50 rounded p-2 text-xs">
              <div class="font-medium">{{ p.name || '(tanpa nama)' }}</div>
              <div class="text-gray-400">
                {{ p.gender === 'male' ? 'Laki-laki' : 'Perempuan' }}
                <span v-if="p.birthYear">· {{ p.birthYear }}</span>
                <span v-if="p.deathYear">– {{ p.deathYear }}</span>
                <span v-if="p.birthPlace">· {{ p.birthPlace }}</span>
              </div>
            </div>
          </div>
        </details>

        <div v-if="r.status === 'pending'" class="mt-3 flex gap-2">
          <button @click="applyRevision(r)" :disabled="applying === r.id" class="btn-primary text-sm flex-1">
            {{ applying === r.id ? 'Menerapkan...' : 'Terapkan' }}
          </button>
          <button @click="rejectRevision(r)" :disabled="applying === r.id" class="btn-ghost text-sm text-red-500">
            Tolak
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePeopleStore } from '@/stores/people'
import { useFamiliesStore } from '@/stores/families'
import { fetchPendingRevisions, updateRevisionStatus } from '@/services/revisions'
import { savePerson } from '@/services/people'
import { toast } from 'vue3-toastify'

const peopleStore = usePeopleStore()
const familiesStore = useFamiliesStore()

const loading = ref(true)
const revisions = ref([])
const applying = ref(null)

async function loadRevisions() {
  loading.value = true
  try {
    revisions.value = await fetchPendingRevisions()
  } catch (e) {
    console.error('Failed to load revisions:', e)
  } finally {
    loading.value = false
  }
}

async function applyRevision(r) {
  if (!confirm(`Terapkan revisi dari "${r.basedOnPersonName}" (${r.people.length} orang)?`)) return
  applying.value = r.id
  try {
    for (const p of r.people) {
      const data = {
        name: p.name,
        gender: p.gender,
        birthYear: p.birthYear || null,
        deathYear: p.deathYear || null,
        birthPlace: p.birthPlace || '',
        photoUrl: p.photoUrl || '',
      }
      await savePerson(p.id, data)
    }
    await updateRevisionStatus(r.id, 'applied')
    await Promise.all([peopleStore.loadAll(), familiesStore.loadAll()])
    await loadRevisions()
    toast.success('Revisi berhasil diterapkan.')
  } catch (e) {
    console.error('Failed to apply revision:', e)
    toast.error('Gagal menerapkan revisi.')
  } finally {
    applying.value = null
  }
}

async function rejectRevision(r) {
  if (!confirm(`Tolak revisi dari "${r.basedOnPersonName}"?`)) return
  applying.value = r.id
  try {
    await updateRevisionStatus(r.id, 'rejected')
    await loadRevisions()
    toast.success('Revisi berhasil ditolak.')
  } catch (e) {
    console.error('Failed to reject revision:', e)
  } finally {
    applying.value = null
  }
}

onMounted(async () => {
  await Promise.all([peopleStore.ensureLoaded(), familiesStore.ensureLoaded()])
  await loadRevisions()
})
</script>
