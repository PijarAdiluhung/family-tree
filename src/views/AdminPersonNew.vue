<template>
  <div class="px-4 py-6 max-w-lg mx-auto">
    <router-link to="/admin" class="text-sm text-gray-500 hover:underline mb-4 inline-block">&larr; Kembali</router-link>
    <h2 class="text-lg font-bold mb-6">Tambah Anggota Baru</h2>
    <PersonForm @save="handleSave" @cancel="$router.push('/admin')" />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { usePeopleStore } from '@/stores/people'
import { useFamiliesStore } from '@/stores/families'
import PersonForm from '@/components/PersonForm.vue'
import { toast } from 'vue3-toastify'

const router = useRouter()
const peopleStore = usePeopleStore()
const familiesStore = useFamiliesStore()

async function handleSave(data) {
  try {
    await peopleStore.save(null, data)
    toast.success('Anggota baru berhasil ditambahkan.')
    router.push('/admin')
  } catch (e) {
    toast.error('Gagal menyimpan: ' + e.message)
    console.error('Firestore save error:', e)
  }
}
</script>
