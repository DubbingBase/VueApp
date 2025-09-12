<template>
  <div class="voice-actor-list">
    <template v-if="voiceActors.length">
      <div class="voice-actor-container">
        <VoiceActorItem
          v-for="item in voiceActors"
          :key="item.voiceActorDetails.id"
          :item="item"
          :isAdmin="isAdmin"
          :goToVoiceActor="goToVoiceActor"
          :editVoiceActorLink="editVoiceActorLink"
          :confirmDeleteVoiceActorLink="confirmDeleteVoiceActorLink"
        />
      </div>
    </template>
    <NoVoiceActor
      v-else
      :actor="actor"
      :isAdmin="isAdmin"
      :openVoiceActorSearch="openVoiceActorSearch"
    />
  </div>
</template>

<script setup lang="ts">
import VoiceActorItem from "@/components/VoiceActorItem.vue";
import NoVoiceActor from "@/components/NoVoiceActor.vue";

defineProps<{
  voiceActors: any[];
  actor: any;
  isAdmin: boolean;
  goToVoiceActor: (id: number) => void;
  editVoiceActorLink: (item: any) => void;
  confirmDeleteVoiceActorLink: (item: any) => void;
  openVoiceActorSearch: (actor: any) => void;
}>();
</script>

<style scoped lang="scss">
.voice-actor-list {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  overflow-y: hidden;
}

.voice-actor-container {
  width: 100%;
}
</style>
