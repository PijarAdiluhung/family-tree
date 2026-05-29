<template>
  <div class="flex flex-col items-center justify-center min-h-[70vh] px-6">
    <div class="card w-full max-w-sm p-6">
      <h2 class="text-xl font-bold mb-6 text-center">Admin Login</h2>
      <form @submit.prevent="handleLogin" class="flex flex-col gap-4">
        <div>
          <label class="label" for="email">Email</label>
          <input id="email" v-model="email" type="email" class="input" required autocomplete="email" />
        </div>
        <div>
          <label class="label" for="password">Password</label>
          <input id="password" v-model="password" type="password" class="input" required autocomplete="current-password" />
        </div>
        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
        <button type="submit" class="btn-primary w-full" :disabled="loading">
          {{ loading ? 'Loading...' : 'Masuk' }}
        </button>
      </form>
      <router-link to="/" class="block text-center text-sm text-gray-500 mt-4 hover:underline">Kembali</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    router.push('/admin')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>
