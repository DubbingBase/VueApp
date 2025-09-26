<template>
  <div class="person-item" @click="handleClick" tabindex="0" role="button" :aria-label="`Go to details for ${displayName}`">
    <div class="person-avatar">
      <img v-if="image" :src="image" :alt="`${displayName} photo`" />
      <img v-else :src="`https://placehold.co/${width}x${height}?text=?`" alt="No photo" />
    </div>

    <div class="person-info">
       <div class="person-name">{{ displayName }}</div>
       <div v-if="subtitle" class="person-subtitle">{{ subtitle }}</div>
       <div v-if="tags.length > 0" class="person-tags">
         <span v-for="tag in tags" :key="tag" class="tag">{{ tag }}</span>
       </div>
     </div>

    <div class="person-actions">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { THUMBNAIL_DEFAULT_WIDTH, THUMBNAIL_DEFAULT_HEIGHT } from '@/constants/thumbnails';

export interface PersonData {
  id: number;
  name?: string;
  firstname?: string;
  lastname?: string;
  character?: string;
  profile_path?: string;
  profile_picture?: string;
  performance?: string;
  tags?: string[] | string;
}

const props = withDefaults(defineProps<{
  person: PersonData;
  type?: 'actor' | 'voice-actor';
  getImage?: (path: string) => string;
  subtitleOverride?: string;
  width?: number;
  height?: number;
}>(), {
  width: THUMBNAIL_DEFAULT_WIDTH,
  height: THUMBNAIL_DEFAULT_HEIGHT,
});

const emit = defineEmits<{
  click: [person: PersonData];
}>();

const displayName = computed(() => {
  if (props.person.name) return props.person.name;
  if (props.person.firstname || props.person.lastname) {
    return `${props.person.firstname || ''} ${props.person.lastname || ''}`.trim();
  }
  return props.person.character || 'Unknown';
});

const image = computed(() => {
  if (props.getImage && props.person.profile_path) {
    return props.getImage(props.person.profile_path);
  }
  return props.person.profile_picture || props.person.profile_path;
});

const subtitle = computed(() => {
    if (props.subtitleOverride) {
      return props.subtitleOverride;
    }
    if (props.type === 'actor' && props.person.character) {
      return props.person.character;
    }
    if (props.type === 'voice-actor' && props.person.performance) {
      return props.person.performance;
    }
    return undefined;
  });

const tags = computed(() => {
    if (!props.person.tags) return [];
    if (Array.isArray(props.person.tags)) {
      return props.person.tags;
    }
    if (typeof props.person.tags === 'string') {
      return props.person.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    }
    return [];
  });

const widthStyle = computed(() => `${props.width}px`);
const heightStyle = computed(() => `${props.height}px`);

const handleClick = () => {
  emit('click', props.person);
};
</script>

<style scoped lang="scss">
.person-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }

  &:focus {
    outline: 2px solid #007bff;
    outline-offset: 2px;
  }
}

.person-avatar {
   width: v-bind(widthStyle);
   height: v-bind(heightStyle);
   border-radius: var(--thumbnail-border-radius);
   border: var(--thumbnail-border);
   overflow: hidden;
   flex-shrink: 0;

   img {
     width: 100%;
     height: 100%;
     object-fit: cover;
   }
 }

.person-info {
  flex: 1;
  min-width: 0;

  .person-name {
    font-size: 14px;
    font-weight: 600;
    color: #e0e0e0;
    line-height: 1.4;
    margin-bottom: 2px;
  }

  .person-subtitle {
    font-size: 12px;
    color: #b0b0b0;
    line-height: 1.2;
  }

  .person-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 4px;

    .tag {
      display: inline-block;
      padding: 2px 6px;
      background-color: rgba(0, 123, 255, 0.2);
      color: #4dabf7;
      font-size: 10px;
      font-weight: 500;
      border-radius: 4px;
      border: 1px solid rgba(0, 123, 255, 0.3);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }
}

.person-actions {
  display: flex;
  gap: 4px;
  align-items: center;
}

@media (max-width: 768px) {
    .person-item {
      padding: 6px;
      gap: 8px;
    }

    .person-tags {
      .tag {
        font-size: 9px;
        padding: 1px 4px;
      }
    }
  }
</style>
