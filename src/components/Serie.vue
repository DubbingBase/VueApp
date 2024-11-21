<template>
    <router-link
        class="serie"
       
        :to="{
            name: 'SerieDetails',
            params: {
                id: value.id
            }
        }"
    >
        <div class="poster">
            <img
                :src="getImage(value.poster_path)"
                alt=""
            >
        </div>
        <div class="caption">{{ value.name }}</div>
    </router-link>
    
    </template>
    
    
    <script lang="ts" setup>
    import { PropType, toRefs } from 'vue';
    import { Serie } from '../../supabase/functions/_shared/serie';
    import { getImage } from '../utils';
    
    
    const props = defineProps({
        value : {
            type: Object as PropType<Serie>,
            required: true
        }
    })
    
    const { value } = toRefs(props);
    
    </script>
    
    <style lang="scss" scoped>
    .serie {
        // overflow: hidden;
        width: 28%;
        margin: 4px;
        display: flex;
        flex-direction: column;
        vertical-align: top;
        height: auto;
        flex: 1 0 auto;
        color: inherit;
        text-decoration: none;
    
        .poster {
            height: 100%;
            display: flex;
            align-items: start;
            flex: 0;
    
            img {
                border-radius: 12px;
                max-width: 100%;
                max-height: 100%;
                height: auto;
                object-fit: contain;
    
                display: flex;
                flex-direction: column;
            }
        }
    
        .caption {
            text-align: center;
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            line-clamp: 2;
            -webkit-box-orient: vertical;
            margin: 8px 4px;
        }
    }
    
    </style>