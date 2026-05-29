import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchAllPeople, fetchPerson, savePerson, deletePerson } from '@/services/people'

export const usePeopleStore = defineStore('people', () => {
  const all = ref([])
  const loaded = ref(false)

  async function loadAll() {
    all.value = await fetchAllPeople()
    loaded.value = true
    return all.value
  }

  async function getById(id) {
    let p = all.value.find(p => p.id === id)
    if (!p) {
      p = await fetchPerson(id)
    }
    return p
  }

  function getChildren(personId, families) {
    const childIds = families
      .filter(f => f.husbandId === personId || f.wifeId === personId)
      .flatMap(f => f.childIds ?? [])
    return all.value.filter(p => childIds.includes(p.id))
  }

  function getSpouses(personId, families) {
    return families
      .filter(f => f.husbandId === personId || f.wifeId === personId)
      .map(f => {
        const spouseId = f.husbandId === personId ? f.wifeId : f.husbandId
        return { spouseId, familyId: f.id }
      })
      .filter(s => s.spouseId)
  }

  async function ensureLoaded() {
    if (!loaded.value) await loadAll()
  }

  async function save(id, data) {
    const newId = await savePerson(id, data)
    await loadAll()
    return newId
  }

  async function remove(id) {
    await deletePerson(id)
    all.value = all.value.filter(p => p.id !== id)
  }

  function getRoot() {
    return all.value.find(p => p.isRoot) || all.value[0]
  }

  return { all, loaded, loadAll, ensureLoaded, getById, getChildren, getSpouses, save, remove, getRoot }
})
