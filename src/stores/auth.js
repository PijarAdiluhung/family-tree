import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  onAuthStateChanged, signInWithEmailAndPassword,
  signOut as fbSignOut
} from 'firebase/auth'
import { auth } from '@/services/firebase'
import { getDoc, doc } from 'firebase/firestore'
import { db } from '@/services/firebase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAdmin = ref(false)
  const loading = ref(true)

  const isLoggedIn = computed(() => !!user.value)

  async function checkAdmin(uid) {
    try {
      const snap = await getDoc(doc(db, 'settings', 'app'))
      if (snap.exists()) {
        return snap.data().adminUids?.includes(uid) ?? false
      }
      return false
    } catch {
      return false
    }
  }

  const unsubscribe = onAuthStateChanged(auth, async (u) => {
    user.value = u
    if (u) {
      isAdmin.value = await checkAdmin(u.uid)
    } else {
      isAdmin.value = false
    }
    loading.value = false
  })

  async function login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    isAdmin.value = await checkAdmin(cred.user.uid)
    return cred
  }

  async function signOut() {
    await fbSignOut(auth)
    isAdmin.value = false
  }

  return { user, isAdmin, loading, isLoggedIn, login, signOut }
})
