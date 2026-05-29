import { db } from './firebase'
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, orderBy, setDoc
} from 'firebase/firestore'

const COLLECTION = 'people'

export function personRef(id) {
  return doc(db, COLLECTION, id)
}

export async function fetchPerson(id) {
  const snap = await getDoc(personRef(id))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

export async function fetchAllPeople() {
  const q = query(collection(db, COLLECTION), orderBy('name'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function savePerson(id, data) {
  if (id) {
    await updateDoc(personRef(id), { ...data, updatedAt: new Date() })
    return id
  }
  const ref = await addDoc(collection(db, COLLECTION), { ...data, createdAt: new Date(), updatedAt: new Date() })
  return ref.id
}

export async function deletePerson(id) {
  await deleteDoc(personRef(id))
}
