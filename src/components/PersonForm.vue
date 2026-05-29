<template>
  <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
    <div>
      <label class="label" for="name">Nama *</label>
      <input id="name" v-model="form.name" class="input" required />
    </div>

    <div>
      <label class="label">Jenis Kelamin *</label>
      <div class="flex gap-3">
        <label class="flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer"
          :class="form.gender === 'male' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'">
          <input type="radio" v-model="form.gender" value="male" class="sr-only" />
          <span class="text-sm">Laki-laki</span>
        </label>
        <label class="flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer"
          :class="form.gender === 'female' ? 'border-pink-500 bg-pink-50' : 'border-gray-300'">
          <input type="radio" v-model="form.gender" value="female" class="sr-only" />
          <span class="text-sm">Perempuan</span>
        </label>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="label" for="birthYear">Tahun Lahir</label>
        <input id="birthYear" v-model.number="form.birthYear" type="number" class="input" placeholder="1960" />
      </div>
      <div>
        <label class="label" for="deathYear">Tahun Wafat</label>
        <input id="deathYear" v-model.number="form.deathYear" type="number" class="input" placeholder="—" />
      </div>
    </div>

    <div>
      <label class="label" for="birthPlace">Tempat Lahir</label>
      <input id="birthPlace" v-model="form.birthPlace" class="input" placeholder="Jakarta" />
    </div>

    <div>
      <label class="label" for="photoUrl">URL Foto (Bunny CDN)</label>
      <input id="photoUrl" v-model="form.photoUrl" class="input" placeholder="https://..." />
      <p v-if="form.photoUrl" class="mt-2">
        <img :src="form.photoUrl" class="w-20 h-20 rounded-lg object-cover border" alt="preview" />
      </p>
    </div>

    <label class="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" v-model="form.isRoot" class="w-4 h-4 rounded border-gray-300" />
      <span class="text-sm font-medium">Tetapkan sebagai akar pohon (root)</span>
    </label>

    <div class="flex gap-3 pt-2">
      <button type="button" @click="$emit('cancel')" class="btn-secondary flex-1">Batal</button>
      <button type="submit" class="btn-primary flex-1">Simpan</button>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  initial: { type: Object, default: null },
})

const emit = defineEmits(['save', 'cancel'])

const form = ref({
  name: '',
  gender: 'male',
  birthYear: null,
  deathYear: null,
  birthPlace: '',
  photoUrl: '',
  isRoot: false,
})

watch(() => props.initial, (val) => {
  if (val) {
    form.value = {
      name: val.name || '',
      gender: val.gender || 'male',
      birthYear: val.birthYear || null,
      deathYear: val.deathYear || null,
      birthPlace: val.birthPlace || '',
      photoUrl: val.photoUrl || '',
      isRoot: val.isRoot || false,
    }
  }
}, { immediate: true })

function handleSubmit() {
  const data = { ...form.value }
  if (!data.birthYear) data.birthYear = null
  if (!data.deathYear) data.deathYear = null
  emit('save', data)
}
</script>
