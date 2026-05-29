import { db } from './firebase'
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where
} from 'firebase/firestore'

const COLLECTION = 'families'

export function familyRef(id) {
  return doc(db, COLLECTION, id)
}

export async function fetchFamily(id) {
  const snap = await getDoc(familyRef(id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

export async function fetchAllFamilies() {
  const snap = await getDocs(collection(db, COLLECTION))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function fetchFamiliesByParent(personId) {
  const q = query(
    collection(db, COLLECTION),
    where('husbandId', '==', personId)
  )
  const q2 = query(
    collection(db, COLLECTION),
    where('wifeId', '==', personId)
  )
  const [snap1, snap2] = await Promise.all([getDocs(q), getDocs(q2)])
  return [...snap1.docs, ...snap2.docs].map(d => ({ id: d.id, ...d.data() }))
}

export async function fetchFamiliesByChild(personId) {
  const q = query(
    collection(db, COLLECTION),
    where('childIds', 'array-contains', personId)
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function saveFamily(id, data) {
  if (id) {
    await updateDoc(familyRef(id), { ...data, updatedAt: new Date() })
    return id
  }
  const ref = await addDoc(collection(db, COLLECTION), { ...data, createdAt: new Date(), updatedAt: new Date() })
  return ref.id
}

export async function deleteFamily(id) {
  await deleteDoc(familyRef(id))
}
