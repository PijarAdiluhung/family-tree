import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  onAuthStateChanged, signInWithEmailAndPassword,
  signOut as fbSignOut
} from 'firebase/auth'
import { auth } from '@/services/firebase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(true)

  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => !!user.value)

  const unsubscribe = onAuthStateChanged(auth, (u) => {
    user.value = u
    loading.value = false
  })

  async function login(email, password) {
    await signInWithEmailAndPassword(auth, email, password)
  }

  async function signOut() {
    await fbSignOut(auth)
  }

  return { user, isAdmin, loading, isLoggedIn, login, signOut }
})
