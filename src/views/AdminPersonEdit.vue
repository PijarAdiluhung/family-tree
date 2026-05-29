<template>
  <div class="px-4 py-6 max-w-lg mx-auto">
    <router-link to="/admin" class="text-sm text-gray-500 hover:underline mb-4 inline-block">&larr; Kembali</router-link>
    <h2 class="text-lg font-bold mb-6">Edit Anggota</h2>
    <div v-if="loading" class="text-center py-8 text-gray-400">Loading...</div>
    <template v-else-if="person">
      <PersonForm :initial="person" @save="handleSave" @cancel="$router.push('/admin')" />
      <div class="mt-6">
        <FamilyManager :person-id="person.id" @updated="reload" />
      </div>
    </template>
    <div v-else class="text-center py-8 text-gray-400">Anggota tidak ditemukan</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePeopleStore } from '@/stores/people'
import { useFamiliesStore } from '@/stores/families'
import PersonForm from '@/components/PersonForm.vue'
import FamilyManager from '@/components/FamilyManager.vue'

const route = useRoute()
const router = useRouter()
const peopleStore = usePeopleStore()
const familiesStore = useFamiliesStore()
const person = ref(null)
const loading = ref(true)

async function load() {
  await Promise.all([peopleStore.ensureLoaded(), familiesStore.ensureLoaded()])
  person.value = await peopleStore.getById(route.params.id)
  loading.value = false
}

async function reload() {
  await familiesStore.loadAll()
}

onMounted(load)

async function handleSave(data) {
  try {
    await peopleStore.save(route.params.id, data)
    router.push('/admin')
  } catch (e) {
    alert('Gagal menyimpan: ' + e.message)
    console.error('Firestore save error:', e)
  }
}
</script>
