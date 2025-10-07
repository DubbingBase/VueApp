// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { corsHeaders } from "../_shared/http-utils.ts"

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // 1. Fetch new media
  const newMoviesResponse = await fetch(`https://api.themoviedb.org/3/movie/upcoming?language=fr-FR`, {
    headers: {
      "Content-Type": "application/json",
      'Authorization': `Bearer ${Deno.env.get('TMDB_API_KEY')}`,
      'Accept': 'application/json',
    },
  })
  const newMovies = await newMoviesResponse.json()

  const newShowsResponse = await fetch(`https://api.themoviedb.org/3/tv/on_the_air?language=fr-FR`, {
    headers: {
      "Content-Type": "application/json",
      'Authorization': `Bearer ${Deno.env.get('TMDB_API_KEY')}`,
      'Accept': 'application/json',
    },
  })
  const newShows = await newShowsResponse.json()

  const allNew = [
    ...(newMovies.results || []).map((item: any) => ({ ...item, type: 'movie' })),
    ...(newShows.results || []).map((item: any) => ({ ...item, type: 'tv' })),
  ]

  // Limit to the top 15 most popular items
  const top15New = allNew.sort((a, b) => b.popularity - a.popularity).slice(0, 15);

  console.log('top15New', top15New)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set.')
    return new Response(JSON.stringify({ error: 'Missing Supabase environment variables.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }

  const allResults = [];
  console.log(`Starting sequential processing of top ${top15New.length} items.`);

  for (const media of top15New) {
    const tmdbId = media.id;
    const type = media.type as 'movie' | 'tv';
    const title = media.title ?? media.name;

    const result = await (async () => {
      try {
        console.log(`Invoking prepare_movie for ${type} ${tmdbId} (${title})`);
        const invokeResponse = await fetch(`${supabaseUrl}/functions/v1/prepare_movie`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serviceRoleKey}`,
          },
          body: JSON.stringify({ tmdbId, type }),
        });

        if (!invokeResponse.ok) {
          const errorBody = await invokeResponse.text();
          throw new Error(`Status ${invokeResponse.status}: ${errorBody}`);
        }

        const result = await invokeResponse.json();
        if (result.ok === false) {
            throw new Error(result.error || 'prepare_movie function returned an error');
        }

        return { status: 'fulfilled', value: { title, type } };
      } catch (error) {
        console.error(`Failed to process ${type} ${tmdbId} (${title}):`, error.message);
        return { status: 'rejected', reason: { title, type, error: error.message } };
      }
    })();

    allResults.push(result);

    // Add 1-second delay to prevent rate limiting
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  // Generate Summary
  const successfulMovies = allResults.filter(r => r.status === 'fulfilled' && r.value.type === 'movie');
  const successfulShows = allResults.filter(r => r.status === 'fulfilled' && r.value.type === 'tv');
  const failedJobs = allResults.filter(r => r.status === 'rejected');

  const jobs = [
    ...successfulMovies,
    ...successfulShows,
  ]

  let summary = `DubbingBase New Media Report:\n`;
  summary += `- ✅ Processed ${successfulMovies.length} movies and ${successfulShows.length} shows successfully.\n`;
  for (const item of jobs) {
    console.log('item', item)
    summary += `  - ${item.value?.title ?? 'Unknown'}\n`
  }
  if (failedJobs.length > 0) {
    summary += `- ❌ Encountered ${failedJobs.length} errors.\n`;
    failedJobs.forEach(job => {
        const reason = job.reason as { title: string, type: string, error: string };
        summary += `  - Failed: ${reason.type} "${reason.title}" (Reason: ${reason.error})\n`;
    });
  }

  // Send ntfy notification
const ntfyTopic = 'Armaldio_DubbingBaseNewMediaSummary';
  try {
    await fetch(`https://ntfy.sh/${ntfyTopic}`, {
      method: 'POST',
      body: summary,
      headers: {
        'Title': 'DubbingBase New Media Report',
      }
    });
    console.log('Sent ntfy notification.');
  } catch (e) {
    console.error('Failed to send ntfy notification:', e);
  }

  return new Response(JSON.stringify({ ok: true, message: "New media processing done.", summary }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})