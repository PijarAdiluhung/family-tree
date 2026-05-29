import { db } from './firebase'
import { collection, doc, getDocs, addDoc, updateDoc, query, where, orderBy } from 'firebase/firestore'

const COLLECTION = 'revisions'

export async function fetchAllRevisions() {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function fetchPendingRevisions() {
  const q = query(collection(db, COLLECTION), where('status', '==', 'pending'), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function saveRevision(data) {
  const ref = await addDoc(collection(db, COLLECTION), { ...data, createdAt: new Date() })
  return ref.id
}

export async function updateRevisionStatus(id, status) {
  await updateDoc(doc(db, COLLECTION, id), { status, updatedAt: new Date() })
}
