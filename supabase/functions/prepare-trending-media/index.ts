// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { corsHeaders } from "../_shared/cors.ts"

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // 1. Fetch trending media
  const trendingMoviesResponse = await fetch(`https://api.themoviedb.org/3/trending/movie/day?language=fr-FR`, {
    headers: {
      "Content-Type": "application/json",
      'Authorization': `Bearer ${Deno.env.get('TMDB_API_KEY')}`,
      'Accept': 'application/json',
    },
  })
  const trendingMovies = await trendingMoviesResponse.json()

  const trendingShowsResponse = await fetch(`https://api.themoviedb.org/3/trending/tv/day?language=fr-FR`, {
    headers: {
      "Content-Type": "application/json",
      'Authorization': `Bearer ${Deno.env.get('TMDB_API_KEY')}`,
      'Accept': 'application/json',
    },
  })
  const trendingShows = await trendingShowsResponse.json()

  const allTrending = [
    ...(trendingMovies.results || []).map((item: any) => ({ ...item, type: 'movie' })),
    ...(trendingShows.results || []).map((item: any) => ({ ...item, type: 'tv' })),
  ]

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  console.log('supabaseUrl', supabaseUrl)
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set.')
    return new Response(JSON.stringify({ error: 'Missing Supabase environment variables.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }

  // Iterate over trending items and trigger processing (fire-and-forget)
  for (const media of allTrending) {
      const tmdbId = media.id;
      const type = media.type as 'movie' | 'tv';

      try {
        console.log(`Invoking prepare_movie for ${type} ${tmdbId}`);

        // Invoke the 'prepare_movie' function
        const invokeResponse = await fetch(`${supabaseUrl}/functions/v1/prepare_movie`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serviceRoleKey}`,
          },
          body: JSON.stringify({
            tmdbId: tmdbId,
            type: type,
          }),
        });

        if (!invokeResponse.ok) {
          const errorBody = await invokeResponse.text();
          console.error(`Failed to invoke prepare_movie for ${type} ${tmdbId}. Status: ${invokeResponse.status}. Body: ${errorBody}`);
        } else {
          console.log(`Successfully invoked prepare_movie for ${type} ${tmdbId}.`);
        }
      } catch (error) {
        console.error(`An error occurred while processing ${type} ${tmdbId}:`, error);
      }
  }

  return new Response(JSON.stringify({ ok: true, message: "Trending media processing done." }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
