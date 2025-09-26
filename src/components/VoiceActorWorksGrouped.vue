<template>
  <div class="voice-actor-works-grouped">
    <h3>Œuvres (Groupées par Acteur)</h3>

    <div v-if="works.length === 0" class="no-works">
      <p>Aucune œuvre trouvée</p>
    </div>

    <div v-else class="actors-list">
      <div
        v-for="actorGroup in groupedWorks"
        :key="actorGroup.actor.id"
        class="actor-group"
      >
        <div class="actor-header">
          <div class="actor-info">
            <MediaThumbnail
              :height="40"
              :width="40"
              radius="50%"
              :path="actorGroup.actor.profile_path || undefined"
              class="actor-avatar"
            />
            <div class="actor-details">
              <h4 class="actor-name">{{ actorGroup.actor.name }}</h4>
              <span class="works-count">{{ actorGroup.works.length }} œuvre{{ actorGroup.works.length > 1 ? 's' : '' }}</span>
            </div>
          </div>
        </div>

        <div class="works-list">
          <div
            v-for="work in actorGroup.works"
            :key="work.media.id"
            class="work-item"
          >
            <div class="media-poster">
              <router-link :to="{
                name:
                  work.media.media_type === 'movie'
                    ? 'MovieDetails'
                    : 'SerieDetails',
                params: {
                  id: work.media.id,
                },
              }">
                <MediaThumbnail :path="work.media.poster_path" />
              </router-link>
            </div>

            <div class="work-info">
              <h5 class="media-title">
                <router-link :to="{
                  name:
                    work.media.media_type === 'movie'
                      ? 'MovieDetails'
                      : 'SerieDetails',
                  params: {
                    id: work.media.id,
                  },
                }" class="title-link">
                  {{ (work.media as any).title ?? (work.media as any).name }}
                </router-link>
              </h5>

              <div class="character-info">
                <span class="character-name">{{ work.data.character }}</span>
              </div>

              <div class="release-date">
                <span class="date-value">
                  {{ (work.media as any).release_date || (work.media as any).first_air_date }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import MediaThumbnail from "@/components/MediaThumbnail.vue";
import type { Movie as MovieModel } from "../../supabase/functions/_shared/movie";
import type { Serie as SerieModel } from "../../supabase/functions/_shared/serie";

type EnhancedWorkItem = {
  media: MovieModel | SerieModel;
  work: { id: number; actor_id: number; content_id: number };
  data: {
    character: string | undefined;
    actor: {
      id: number;
      name: string;
      character?: string;
      profile_path?: string | null;
    };
  };
  sortDate: string;
};

interface Props {
  works: EnhancedWorkItem[];
}

const props = defineProps<Props>();

// Group works by actor
const groupedWorks = computed(() => {
  const groups = new Map<number, { actor: EnhancedWorkItem['data']['actor'], works: EnhancedWorkItem[] }>();

  props.works.forEach(work => {
    const actorId = work.data.actor.id;
    if (!groups.has(actorId)) {
      groups.set(actorId, {
        actor: work.data.actor,
        works: []
      });
    }
    groups.get(actorId)!.works.push(work);
  });

  // Sort works within each actor group by release date (newest first)
  const result = Array.from(groups.values()).map(group => ({
    ...group,
    works: [...group.works].sort((a, b) => {
      return a.sortDate > b.sortDate ? -1 : 1;
    })
  }));

  // Sort actors by number of works (descending)
  return result.sort((a, b) => b.works.length - a.works.length);
});
</script>

<style scoped lang="scss">
.voice-actor-works-grouped {
  padding: 12px;
  background: var(--ion-color-card);
  border-radius: 8px;
  border: 1px solid var(--ion-color-border);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

  h3 {
    margin: 0 0 12px 0;
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--ion-color-text-secondary);
  }

  .no-works {
    text-align: center;
    padding: 2rem 1rem;
    color: var(--ion-color-text-muted);

    p {
      margin: 0;
      font-size: 0.95rem;
    }
  }

  .actors-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .actor-group {
    background: var(--ion-color-surface);
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    border: 1px solid var(--ion-color-border);

    .actor-header {
      padding: 8px;
      background: var(--ion-color-surface);
      border-bottom: 1px solid var(--ion-color-border);

      .actor-info {
        display: flex;
        align-items: center;
        gap: 8px;

        .actor-avatar {
          flex-shrink: 0;
        }

        .actor-details {
          .actor-name {
            margin: 0 0 2px 0;
            font-size: 1rem;
            font-weight: 600;
            color: var(--ion-color-text-primary);
          }

          .works-count {
            font-size: 0.8rem;
            color: var(--ion-color-text-muted);
            font-weight: 500;
          }
        }
      }
    }

    .works-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 8px;
    }

    .work-item {
      display: flex;
      gap: 8px;
      padding: 8px;
      background: var(--ion-color-card);
      border-radius: 6px;
      border: 1px solid var(--ion-color-border);
      transition: transform 0.2s ease, box-shadow 0.2s ease;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
      }

      @media (max-width: 768px) {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }

      .media-poster {
        flex-shrink: 0;

        img {
          width: 80px;
          height: 120px;
          object-fit: cover;
          border-radius: 4px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);

          @media (max-width: 768px) {
            width: 70px;
            height: 105px;
          }
        }
      }

      .work-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;

        .media-title {
          margin: 0 0 6px 0;
          font-size: 0.95rem;
          font-weight: 600;

          .title-link {
            color: var(--ion-color-text-secondary);
            text-decoration: none;
            transition: color 0.2s ease;

            &:hover {
              color: var(--ion-color-text-muted);
              text-decoration: underline;
            }
          }
        }

        .character-info,
        .release-date {
          font-size: 0.85rem;

          @media (max-width: 768px) {
            text-align: center;
          }

          .character-name {
            color: var(--ion-color-text-secondary);
            font-style: italic;
          }

          .date-value {
            color: var(--ion-color-text-secondary);
          }
        }
      }
    }
  }
}
</style>
