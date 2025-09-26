<template>
  <div class="voice-actor-works-chronological">
    <h3>Œuvres (Chronologique)</h3>

    <div v-if="works.length === 0" class="no-works">
      <p>Aucune œuvre trouvée</p>
    </div>

    <div v-else class="works-list">
      <div
        v-for="work in works"
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
          <h4 class="media-title">
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
          </h4>

          <div class="character-info">
            <span class="character-label">Personnage:</span>
            <span class="character-name">{{ work.data.character }}</span>
          </div>

          <div class="release-date">
            <span class="date-label">Date de sortie:</span>
            <span class="date-value">
              {{ (work.media as any).release_date || (work.media as any).first_air_date }}
            </span>
          </div>

          <div class="actor-info">
            <span class="actor-label">Acteur original:</span>
            <router-link
              class="actor-link"
              :to="{
                name: 'ActorDetails',
                params: {
                  id: work.data.actor.id.toString(),
                },
              }"
            >
              <MediaThumbnail
                :height="32"
                :width="32"
                radius="50%"
                :path="work.data.actor.profile_path || undefined"
                class="actor-avatar"
              />
              <span class="actor-name">{{ work.data.actor.name }}</span>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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

defineProps<Props>();
</script>

<style scoped lang="scss">
.voice-actor-works-chronological {
  padding: 24px;
  background: #f8f9fa;
  border-radius: 12px;

  h3 {
    margin: 0 0 24px 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #495057;
  }

  .no-works {
    text-align: center;
    padding: 3rem 1rem;
    color: var(--ion-color-medium);

    p {
      margin: 0;
      font-size: 1.1rem;
    }
  }

  .works-list {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .work-item {
    display: flex;
    gap: 20px;
    padding: 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .media-poster {
      flex-shrink: 0;

      img {
        width: 120px;
        height: 180px;
        object-fit: cover;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

        @media (max-width: 768px) {
          width: 100px;
          height: 150px;
        }
      }
    }

    .work-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 12px;

      .media-title {
        margin: 0;
        font-size: 1.3rem;
        font-weight: 600;

        .title-link {
          color: #495057;
          text-decoration: none;
          transition: color 0.2s ease;

          &:hover {
            color: #6c757d;
            text-decoration: underline;
          }
        }
      }

      .character-info,
      .release-date,
      .actor-info {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 1rem;

        @media (max-width: 768px) {
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
        }

        .character-label,
        .date-label,
        .actor-label {
          font-weight: 600;
          color: var(--ion-color-medium);
          min-width: 120px;

          @media (max-width: 768px) {
            min-width: auto;
          }
        }

        .character-name {
          color: var(--ion-color-dark);
          font-style: italic;
        }

        .date-value {
          color: var(--ion-color-dark);
        }

        .actor-link {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          color: inherit;
          transition: color 0.2s ease;

          &:hover {
            color: #6c757d;
          }

          .actor-avatar {
            flex-shrink: 0;
          }

          .actor-name {
            font-weight: 500;
          }
        }
      }
    }
  }
}
</style>
