<template>
  <div
    class="flex flex-col items-center justify-center min-h-[80vh] my-6 px-6 gap-8"
  >
    <div class="text-center">
      <div class="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden">
        <img
          src="/assets/logo.jpg"
          alt="Logo"
          class="w-full h-full object-cover"
        />
      </div>
      <h1 class="text-2xl font-bold text-gray-800">Keluarga Mbah Kaslan</h1>
      <p class="text-gray-500 mt-1">Penjelajah silsilah keluarga</p>
    </div>

    <div class="w-full max-w-sm flex flex-col gap-4">
      <router-link
        to="/picker"
        class="card flex items-center gap-4 p-5 hover:shadow-md transition-shadow"
      >
        <div
          class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0"
        >
          <svg
            class="w-6 h-6 text-green-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
            />
          </svg>
        </div>
        <div class="text-left">
          <div class="font-semibold text-gray-800">Mode Simple</div>
          <div class="text-sm text-gray-500">
            Telusuri anak, cucu, cicit, dan seterusnya
          </div>
        </div>
        <svg
          class="w-5 h-5 text-gray-400 ml-auto shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </router-link>

      <router-link
        to="/map"
        class="card flex items-center gap-4 p-5 hover:shadow-md transition-shadow"
      >
        <div
          class="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-network-icon lucide-network w-6 h-6 text-amber-700"
          >
            <rect x="16" y="16" width="6" height="6" rx="1" />
            <rect x="2" y="16" width="6" height="6" rx="1" />
            <rect x="9" y="2" width="6" height="6" rx="1" />
            <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3" />
            <path d="M12 12V8" />
          </svg>
        </div>
        <div class="text-left">
          <div class="font-semibold text-gray-800">Pohon Keluarga</div>
          <div class="text-sm text-gray-500">
            Lihat semua anggota dalam satu tampilan
          </div>
        </div>
        <svg
          class="w-5 h-5 text-gray-400 ml-auto shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </router-link>

      <router-link
        to="/revisi"
        class="card flex items-center gap-4 p-5 hover:shadow-md transition-shadow"
      >
        <div
          class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center shrink-0"
        >
          <svg
            class="w-6 h-6 text-purple-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </div>
        <div class="text-left">
          <div class="font-semibold text-gray-800">Revisi Data</div>
          <div class="text-sm text-gray-500">Koreksi data anggota keluarga</div>
        </div>
        <svg
          class="w-5 h-5 text-gray-400 ml-auto shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </router-link>
    </div>

    <p class="text-xs text-gray-400 mt-4">
      <router-link to="/login" class="underline hover:text-gray-600"
        >Admin login</router-link
      >
    </p>
  </div>
</template>
