<template>
    <div class="show">
        <div class="header" v-if="show">
            <img
                :src="getImage(show.backdrop_path)"
                alt=""
            />
            <div class="show-title">{{ show.title }}</div>
        </div>

        <div class="body">
            <div class="actor-wrapper" v-for="actor in actors">
                <router-link
                    class="actor"
                    :to="{
                    name: 'ActorDetails',
                    params: {
                        id: actor.id
                    }
                }">
                    <img
                        class="profile-img"
                        :src="getImage(actor.profile_path)"
                        alt=""
                    />
                    <div>{{ actor.name }}</div>
                </router-link>
                <div class="character">
                    <div>{{ actor.character }}</div>
                </div>
                <VoiceActor :model-value="getVoiceActorByTmdbId(actor.id)"></VoiceActor>
            </div>
        </div>

        <Button class="fetch-infos-btn" @click="fetchInfos">Récupérer les informations</Button>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { getImage } from '../utils'
import { SerieResponse } from '../../supabase/functions/_shared/serie'
import { supabase } from '../api/supabase';
import VoiceActor from '../components/VoiceActor.vue';
import { WorkAndVoiceActor } from '../../supabase/functions/_shared/movie';

const route = useRoute()

const show = ref<SerieResponse['serie'] | undefined>()
const voiceActors = ref<SerieResponse['voiceActors']>([])

const actors = computed(() => {
    return show.value?.credits.cast
})

const getVoiceActorByTmdbId = (tmdbId: number): WorkAndVoiceActor | undefined => {
    const va = voiceActors.value.find(v => v.actor_id === tmdbId)

    return va
}

const fetchInfos = async () => {
    const id = show.value?.external_ids?.wikidata_id

    if (!id) {
        console.error('id is undefined')
        return
    }

    console.log('id', id)
    const showResponseRaw = await supabase.functions.invoke('prepare_movie', {
        body: {
            wikiId: id,
            tmdbId: route.params.id,
            type: 'tv'
        }
    })
    const data = showResponseRaw.data

    console.log('data', data)
    location.reload()
}

onMounted(async () => {
    const id = route.params.id

    const showResponseRaw = await supabase.functions.invoke('show', { body: { id } })
    // const showResponse = await showResponseRaw.json() as SerieResponse
    const data = showResponseRaw.data as SerieResponse
    show.value = data.serie
    voiceActors.value = data.voiceActors
})
</script>

<style scoped lang="scss">
.show-title {
    text-align: center;
}

.header >img{
    object-fit: cover;
    width: 100%;
}
.actor-wrapper {
    margin: 16px 0;
    display: flex;
    background-color: rgb(48, 48, 48);
    border-radius: 25px;
    align-items: center;

    .actor, .va-actor, .character {
        flex: 1;
        text-decoration: none;
        color:inherit;
    }

    .character {
        text-align: center;
    }

    .va-actor, .actor {
        text-align: center;
        margin: 8px 0;
    }

    .actor, .va-actor {
        .profile-img {
            width: 50%;
            border-radius: 16px;
        }
    }
}

.fetch-infos-btn {
    position: absolute;
    bottom: 64px;
    right: 16px;
    padding: 4px;

}
</style>
