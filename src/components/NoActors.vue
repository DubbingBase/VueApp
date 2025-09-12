<template>
  <div class="no-actors">No actors found for this movie.</div>
</template>

<script setup lang="ts">
// No props needed
</script>

<style scoped lang="scss">
.no-actors {
  color: var(--ion-color-medium);
  font-style: italic;
  text-align: center;
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  width: 100%;
}
</style>
