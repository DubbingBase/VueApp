<template>
    <div class="base">
        <div class="top-bar">
            <div class="logo">
                DB_LOGO
            </div>
        </div>
        <div class="content">
            <router-view />
        </div>
        <TabMenu
            v-model:activeIndex="active"
            :model="items"
            class="tab-menu"
        >
            <template #item="{ label, item, props }">
                <router-link
                    v-if="item.route"
                    v-slot="routerProps"
                    :to="item.route"
                    custom
                >
                    <a
                        :href="routerProps.href"
                        v-bind="props.action"
                        @click="($event) => routerProps.navigate($event)"
                        @keydown.enter.space="($event) => routerProps.navigate($event)"
                    >
                        <span v-bind="props.icon" />
                        <span v-bind="props.label">{{ label }}</span>
                    </a>
                </router-link>
                <a
                    v-else
                    :href="item.url"
                    :target="item.target"
                    v-bind="props.action"
                >
                    <span v-bind="props.icon" />
                    <span v-bind="props.label">{{ label }}</span>
                </a>
            </template>
        </TabMenu>
    </div>
</template>

<script setup lang="ts">
import TabMenu from 'primevue/tabmenu';
import { ref } from 'vue';

const active = ref(0);
const items = ref([
    {
        label: 'Accueil',
        icon: 'pi pi-fw pi-home',
        route: '/'
    },
    {
        label: 'Recherche',
        icon: 'pi pi-fw pi-search',
        route: '/search'
    },
    {
        label: 'Parametres',
        icon: 'pi pi-fw pi-cog',
        route: '/settings'
    }
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
}

.top-bar {
    display: flex;
    justify-content: center;
    background-color: rgb(38, 38, 38);
    padding: 16px 16px;
    color: white;
}
</style>