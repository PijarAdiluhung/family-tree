<template>
  <div class="min-h-screen flex flex-col">
    <header class="bg-blue-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow">
      <button v-if="showBack" @click="goBack" class="p-1 -ml-1 rounded-full hover:bg-blue-800">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
      </button>
      <router-link to="/" class="text-lg font-bold tracking-tight">Keluarga Besar</router-link>
      <div class="flex items-center gap-2">
        <router-link to="/picker" class="text-sm px-2 py-1 rounded hover:bg-blue-800">Cari</router-link>
        <router-link to="/map" class="text-sm px-2 py-1 rounded hover:bg-blue-800">Pohon</router-link>
        <router-link v-if="auth.isAdmin" to="/admin" class="text-sm px-2 py-1 rounded hover:bg-blue-800">Admin</router-link>
      </div>
    </header>
    <main class="flex-1">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const showBack = computed(() => route.name !== 'home')

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>
