<template>
  <div class="min-h-screen flex flex-col">
    <header class="bg-emerald-700 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow">
      <button v-if="showBack" @click="goBack" class="p-1 -ml-1 rounded-full hover:bg-emerald-800">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
      </button>
      <router-link to="/" class="text-lg font-bold tracking-tight">{{ title }}</router-link>
      <div class="relative flex items-center">
        <template v-if="auth.isAdmin && route.path.startsWith('/admin')">
          <button @click="menuOpen = !menuOpen" class="p-1 rounded-full hover:bg-emerald-800">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
          <div v-if="menuOpen" class="absolute top-full right-0 mt-1 bg-white text-gray-800 rounded shadow-lg z-50 min-w-40 overflow-hidden" @click="menuOpen = false">
            <router-link to="/picker" class="block px-4 py-2 hover:bg-gray-100">Picker</router-link>
            <router-link to="/map" class="block px-4 py-2 hover:bg-gray-100">Pohon Keluarga</router-link>
          </div>
        </template>
        <router-link v-else to="/info" class="p-1 rounded-full hover:bg-emerald-800">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </router-link>
      </div>
    </header>
    <main class="flex-1">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const menuOpen = ref(false)

function closeMenu(e) {
  if (!e.target.closest('.relative')) menuOpen.value = false
}

onMounted(() => document.addEventListener('click', closeMenu))
onUnmounted(() => document.removeEventListener('click', closeMenu))

const titles = {
  home: 'Silsilah App',
  picker: 'Simple Mode',
  map: 'Pohon Keluarga',
  person: 'Detail',
  info: 'Info',
  login: 'Login',
}

const title = computed(() => {
  if (route.path.startsWith('/admin')) return 'Admin'
  return titles[route.name] || 'Silsilah App'
})

const showBack = computed(() => route.name !== 'home')

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>
