import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchAllFamilies, fetchFamily, saveFamily, deleteFamily } from '@/services/families'
import { updateDoc, arrayUnion, arrayRemove, doc } from 'firebase/firestore'
import { db } from '@/services/firebase'

export const useFamiliesStore = defineStore('families', () => {
  const all = ref([])
  const loaded = ref(false)

  async function loadAll() {
    all.value = await fetchAllFamilies()
    loaded.value = true
    return all.value
  }

  async function getById(id) {
    let f = all.value.find(f => f.id === id)
    if (!f) {
      f = await fetchFamily(id)
    }
    return f
  }

  async function getFamiliesForPerson(personId) {
    await ensureLoaded()
    return all.value.filter(f => f.husbandId === personId || f.wifeId === personId)
  }

  async function ensureLoaded() {
    if (!loaded.value) await loadAll()
  }

  async function save(id, data) {
    const newId = await saveFamily(id, data)
    await loadAll()
    return newId
  }

  async function remove(id) {
    await deleteFamily(id)
    all.value = all.value.filter(f => f.id !== id)
  }

  async function addChild(familyId, childId) {
    await updateDoc(doc(db, 'families', familyId), {
      childIds: arrayUnion(childId)
    })
    await loadAll()
  }

  async function removeChild(familyId, childId) {
    await updateDoc(doc(db, 'families', familyId), {
      childIds: arrayRemove(childId)
    })
    await loadAll()
  }

  return { all, loaded, loadAll, getById, getFamiliesForPerson, ensureLoaded, save, remove, addChild, removeChild }
})
