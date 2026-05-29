<template>
  <div class="px-4 py-6 max-w-2xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-bold">Admin — Daftar Anggota</h2>
      <div class="flex gap-2">
        <button @click="auth.signOut()" class="btn-ghost text-xs">Logout</button>
        <router-link to="/admin/people/new" class="btn-primary text-sm">+ Tambah</router-link>
      </div>
    </div>

    <div class="mb-4">
      <input v-model="search" type="text" placeholder="Cari nama..." class="input" />
    </div>

    <div v-if="loading" class="text-center py-12 text-gray-400">Loading...</div>
    <div v-else-if="filtered.length === 0" class="text-center py-12 text-gray-400">
      {{ peopleStore.all.length === 0 ? 'Belum ada anggota. Tambahkan anggota pertama!' : 'Tidak ditemukan' }}
    </div>
    <div v-else class="flex flex-col gap-2">
      <div v-for="p in filtered" :key="p.id" class="card flex items-center gap-3 p-3">
        <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
          :class="p.gender === 'male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'">
          {{ p.name.charAt(0) }}
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-medium text-sm truncate">
            {{ p.name }}
            <span v-if="p.isRoot" class="text-[10px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded-full ml-1">Root</span>
          </div>
          <div class="text-xs text-gray-400">
            {{ p.gender === 'male' ? 'Laki-laki' : 'Perempuan' }}
            <span v-if="p.birthYear">· {{ p.birthYear }}</span>
          </div>
        </div>
        <div class="flex gap-1 shrink-0">
          <button @click="setRoot(p.id)" class="btn-ghost text-xs px-2 py-1" title="Set as root">👑</button>
          <router-link :to="`/admin/people/${p.id}/edit`" class="btn-ghost text-xs px-2 py-1">Edit</router-link>
          <button @click="handleDelete(p)" class="btn-ghost text-xs px-2 py-1 text-red-500">Hapus</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usePeopleStore } from '@/stores/people'
import { useAuthStore } from '@/stores/auth'
import { doc, updateDoc, getDoc } from 'firebase/firestore'
import { db } from '@/services/firebase'

const peopleStore = usePeopleStore()
const auth = useAuthStore()
const search = ref('')
const loading = ref(true)

const filtered = computed(() => {
  if (!search.value) return peopleStore.all
  const q = search.value.toLowerCase()
  return peopleStore.all.filter(p => p.name.toLowerCase().includes(q))
})

async function handleDelete(person) {
  if (!confirm(`Hapus "${person.name}"?`)) return
  await peopleStore.remove(person.id)
}

async function setRoot(personId) {
  for (const p of peopleStore.all) {
    if (p.isRoot && p.id !== personId) {
      const ref = doc(db, 'people', p.id)
      await updateDoc(ref, { isRoot: false })
    }
  }
  const ref = doc(db, 'people', personId)
  await updateDoc(ref, { isRoot: true })
  await peopleStore.loadAll()
}

onMounted(async () => {
  await peopleStore.loadAll()
  loading.value = false
})
</script>
