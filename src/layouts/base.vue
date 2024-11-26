<template>
  <div class="base">
    <div class="top-bar">
      <div class="logo">DB_LOGO</div>
    </div>
    <div class="content">
      <router-view />
    </div>
    <div class="menu">
      <Tabs :value="active" class="tab-menu">
        <TabList>
          <Tab v-for="item in items" :key="item.label" :value="item.route">
            <router-link
              v-if="item.route"
              v-slot="{ href, navigate }"
              :to="item.route"
              custom
            >
              <a
                v-ripple
                :href="href"
                @click="navigate"
                class="flex items-center gap-2 text-inherit"
              >
                <i :class="item.icon" />
                <span>{{ item.label }}</span>
              </a>
            </router-link>
          </Tab>
        </TabList>
      </Tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const active = ref(0);
const items = ref([
  {
    label: "Accueil",
    icon: "pi pi-fw pi-home",
    route: "/",
  },
  {
    label: "Recherche",
    icon: "pi pi-fw pi-search",
    route: "/search",
  },
  {
    label: "Parametres",
    icon: "pi pi-fw pi-cog",
    route: "/settings",
  },
]);
</script>

<style scoped>
.base {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: rgb(42, 42, 42);
  color: white;
}

.content {
  height: 100%;
  padding: 8px;
  overflow: auto;
}

.top-bar {
  display: flex;
  justify-content: center;
  background-color: rgb(38, 38, 38);
  padding: 16px 16px;
  color: white;
}

.tab-menu {
}
</style>
