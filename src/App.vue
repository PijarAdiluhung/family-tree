<template>
  <div
    v-if="auth.loading"
    class="h-svh w-screen overflow-hidden flex items-center justify-center bg-gray-50"
  >
    <div
      class="w-10 h-10 border-4 border-emerald-200 border-t-emerald-700 rounded-full animate-spin"
    ></div>
  </div>
  <div
    v-else
    class="h-svh w-screen flex flex-col overflow-hidden select-none"
  >
    <header
      class="bg-emerald-700 text-white px-4 pt-[env(safe-area-inset-top)] h-14 flex items-center justify-between z-50 shadow shrink-0"
    >
      <button
        v-if="showBack"
        @click="goBack"
        class="p-1 -ml-1 rounded-full hover:bg-emerald-800"
      >
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <router-link to="/" class="text-lg font-bold tracking-tight">{{
        title
      }}</router-link>

      <div class="relative flex items-center">
        <template v-if="auth.isAdmin">
          <button
            @click="menuOpen = !menuOpen"
            class="p-1 rounded-full hover:bg-emerald-800"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <div
            v-if="menuOpen"
            class="absolute top-full right-0 mt-1 bg-white text-gray-800 rounded shadow-lg z-50 min-w-40 overflow-hidden"
            @click="menuOpen = false"
          >
            <router-link to="/admin" class="block px-4 py-2 hover:bg-gray-100 font-semibold"
              >Admin</router-link
            >
            <hr class="border-gray-200" />
            <router-link to="/" class="block px-4 py-2 hover:bg-gray-100"
              >Welcome</router-link
            >
            <router-link to="/picker" class="block px-4 py-2 hover:bg-gray-100"
              >Simple Mode</router-link
            >
            <router-link to="/map" class="block px-4 py-2 hover:bg-gray-100"
              >Pohon Keluarga</router-link
            >
            <hr class="border-gray-200" />
            <router-link to="/revisi" class="block px-4 py-2 hover:bg-gray-100"
              >Revisi Data</router-link
            >
            <router-link
              to="/admin/revisi"
              class="block px-4 py-2 hover:bg-gray-100"
              >Revisi Masuk</router-link
            >
            <hr class="border-gray-200" />
            <button
              @click.stop="handleLogout"
              class="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
            >
              Logout
            </button>
          </div>
        </template>
        <router-link
          v-else
          to="/info"
          class="p-1 rounded-full hover:bg-emerald-800"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </router-link>
      </div>
    </header>

    <main
      class="flex-1 overflow-y-auto bg-gray-50"
    >
      <router-view v-slot="{ Component }">
        <Transition name="slide-fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </router-view>
    </main>

    <ConfirmDialog />
  </div>
</template>

<script setup>
import { useRouter, useRoute } from "vue-router";
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useConfirm } from "@/composables/useConfirm";
import ConfirmDialog from "@/components/ConfirmDialog.vue";

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const { confirm } = useConfirm();

const menuOpen = ref(false);

function closeMenu(e) {
  if (!e.target.closest(".relative")) menuOpen.value = false;
}

onMounted(() => document.addEventListener("click", closeMenu));
onUnmounted(() => document.removeEventListener("click", closeMenu));

const titles = {
  home: "Silsilah App",
  picker: "Simple Mode",
  map: "Pohon Keluarga",
  person: "Detail",
  info: "Info",
  login: "Login",
  revisi: "Revisi Data",
};

const title = computed(() => {
  if (route.path.startsWith("/admin")) return "Admin";
  return titles[route.name] || "Silsilah App";
});

const showBack = computed(() => route.name !== "home");

function goBack() {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push("/");
  }
}

async function handleLogout() {
  menuOpen.value = false
  const ok = await confirm('Yakin ingin logout?')
  if (!ok) return
  await auth.signOut()
  router.push('/')
}
</script>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.25s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.15s ease-in;
}
.slide-fade-enter-from {
  transform: translateY(12px);
  opacity: 0;
}
.slide-fade-leave-to {
  transform: translateY(-6px);
  opacity: 0;
}
</style>
