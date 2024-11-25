// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { corsHeaders } from "../_shared/cors.ts"
import { supabase } from "../_shared/supabase.ts"
import { getEntity, getWikipediaPage, getWikipediaPageSectionAsWikitext, wikipediaPageFindSections } from "../_shared/extract/constants.ts"
import { MistralMovieExtractOutput } from "../_shared/mistral.ts";
import { WithCast } from "../_shared/other.ts";
import { Database } from "../_shared/database.types.ts";
import { PostgrestError } from "jsr:@supabase/supabase-js";

const insertVoiceActor = async (voiceActorFirstName: string, voiceActorLastName: string) => {
  console.log('upserting voice actor', {
    firstname: voiceActorFirstName,
    lastname: voiceActorLastName,
  })
  const insertResult = await supabase.from('voice_actors').upsert({
    firstname: voiceActorFirstName,
    lastname: voiceActorLastName,
  }, {
    onConflict: 'firstname, lastname',
  }).select()
  return insertResult
}

const insertVoiceActorWork = async (
  voiceActorId: number,
  tmdbId: number,
  actorId: number,
  contentType: string,
  performance?: string,
) => {
  // TODO: add source
  console.log('inserting work', {
    voice_actor_id: voiceActorId,
    content_id: tmdbId,
    actor_id: actorId,
  })
  const insertResult = await supabase.from('work').insert({
    voice_actor_id: voiceActorId,
    content_id: tmdbId,
    actor_id: actorId,
    performance,
    content_type: contentType,
  }).select()
  return insertResult
}

const insertVoiceActorAndWork = async (
  voiceActorFirstName: string,
  voiceActorLastName: string,
  tmdbId: number,
  actorId: number,
  contentType: string,
  performance?: string
) => {
  let result: Database['public']['Tables']['voice_actors']['Insert'][] | null
  let error: PostgrestError | null
  try {
    const insertVoiceResult = await insertVoiceActor(voiceActorFirstName, voiceActorLastName)
    result = insertVoiceResult.data
    error = insertVoiceResult.error
    console.log('insert voice actor result', result, error)
  } catch (e) {
    console.error('e', e)
  }
  const voiceActorId = result?.[0]?.id
  if (voiceActorId) {
    try {
      const { data: result2, error: error2 } = await insertVoiceActorWork(
        voiceActorId,
        tmdbId,
        actorId,
        contentType,
        performance
      )
      console.log('insert voice actor work result', result2, error2)
    } catch (e) {
      console.error('e', e)
    }
  }
}


Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const lang = 'fr'

  const { wikiId, tmdbId, type } = await req.json() as {
    wikiId: string
    tmdbId: number
    type: 'movie' | 'tv'
  }

  const response = await fetch(`https://api.themoviedb.org/3/${type}/${tmdbId}?append_to_response=credits,external_ids&language=fr-FR`, {
    headers: {
      "Content-Type": "application/json",
      'Authorization': `Bearer ${Deno.env.get('TMDB_API_KEY')}`,
      'Accept': 'application/json',
    },
  })

  const movie = await response.json() as WithCast

  const entityURL = getEntity(wikiId)

  const responseWikidata = await fetch(entityURL)
  const entity = await responseWikidata.json()

  const wikipediaPageTitle = entity.entities[wikiId].sitelinks[lang + 'wiki'].title

  if (!wikipediaPageTitle) {
    console.error('wikipediaPageTitle is undefined')
    return new Response(
      JSON.stringify({ ok: false, error: 'wikipediaPageTitle is undefined' }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      },
    )
  }

  const wikiepediaPageURL = getWikipediaPage(wikipediaPageTitle, lang)
  console.log('wikiepediaPageURL', wikiepediaPageURL)
  const responseWikipedia = await fetch(wikiepediaPageURL)
  const wikipediaPage = await responseWikipedia.json()

  const firstPage = Object.keys(wikipediaPage.query.pages)[0]

  const wikipediaLangPageId = wikipediaPage.query.pages[firstPage].pageid

  const wikipediaPageSectionsURL = wikipediaPageFindSections(wikipediaLangPageId)
  const responseWikipediaSections = await fetch(wikipediaPageSectionsURL)
  const wikipediaPageSections = await responseWikipediaSections.json()

  const sectionIds = wikipediaPageSections.parse.sections.filter((section: any) => {
    return section.line.match(/distribution/i)
  })

  for (const section of sectionIds) {
    console.log('section', section)

    const sectionAsWikitextURL = getWikipediaPageSectionAsWikitext(wikipediaLangPageId, section.index)
    const responseSectionActionWikitext = await fetch(sectionAsWikitextURL)
    const wikitextJSON = await responseSectionActionWikitext.json()
    const wikitext = wikitextJSON.parse.wikitext

    const mistralURL = 'https://api.mistral.ai/v1/agents/completions'
    const mistralJSONRequest = await fetch(mistralURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('MISTRAL_TOKEN')}`
      },
      body: JSON.stringify({
        "stream": false,
        "messages": [
          {
            "role": "user",
            "content": wikitext
          }
        ],
        "agent_id": "ag:4785a948:20241120:extracteur-page-film-wikipedia-doubleurs:31fc70f7",
        "response_format": {
          "type": "json_object"
        }
      })
    })

    const mistralJSON = await mistralJSONRequest.json()

    const mistralSuggestion = mistralJSON.choices[0].message.content
    const mistralSuggestionJSON = JSON.parse(mistralSuggestion) as MistralMovieExtractOutput

    console.log('mistralSuggestion', mistralSuggestionJSON)

    for (const entry of mistralSuggestionJSON?.items ?? []) {
      const { actor, voiceActorFirstname, voiceActorName } = entry

      if (actor && voiceActorFirstname && voiceActorName) {
        // get actor id from the movie cast
        const foundActor = movie.credits.cast.find((cast) => cast.name === actor)

        if (!foundActor) {
          console.log(`actor from wikitext "${actor}" not found in tmdb cast`)
          continue
        }

        const { id: actorId } = foundActor

        await insertVoiceActorAndWork(
          voiceActorFirstname,
          voiceActorName,
          tmdbId,
          actorId,
          type,
          entry.performance
        )
      } else {
        console.error('mistral missing structure')
      }
    }
  }

  const result = { ok: true }
  return new Response(
    JSON.stringify(result),
    {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    },
  )
})