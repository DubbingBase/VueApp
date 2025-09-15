import { supabase } from "./api/supabase";

export const getImage = (path: string | undefined, size: string = '500') => {
    if (!path) return `https://placehold.co/${size}x${size}?text=?`;

    // If path starts with '/', it's a TMDB path
    if (path.startsWith('/')) {
        return `https://image.tmdb.org/t/p/w${size}${path}`;
    }

    // Otherwise, it's a Supabase storage path
    const { data } = supabase.storage
        .from('voice_actor_profile_pictures')
        .getPublicUrl(path);

    return data.publicUrl;
}
