import { PersonData } from "@/components/PersonItem.vue";
import { Actor } from "../../supabase/functions/_shared/types";

export const actorToPersonData = (actor: Actor): PersonData<Actor> => {
    return {
        id: actor.id,
        name: actor.name,
        firstname: actor.firstname,
        lastname: actor.lastname,
        character: actor.character,
        profile_picture: actor.profile_path,
        performance: 'acting',
        tags: [],
        tmdb_id: actor.id,
        data: actor
    }
}
