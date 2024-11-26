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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const lang = 'fr'

  const { wikiId } = await req.json() as {
    wikiId: string
  }

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
  const responseWikipedia = await fetch(wikiepediaPageURL)
  const wikipediaPage = await responseWikipedia.json()

  const firstPage = Object.keys(wikipediaPage.query.pages)[0]
  const wikipediaLangPageId = wikipediaPage.query.pages[firstPage].pageid

  const wikipediaPageSectionsURL = wikipediaPageFindSections(wikipediaLangPageId)
  const responseWikipediaSections = await fetch(wikipediaPageSectionsURL)
  const wikipediaPageSections = await responseWikipediaSections.json()

  console.log('wikipediaPageSections', wikipediaPageSections)

  const toc = flatTocToTree(wikipediaPageSections.parse.sections);
    for (const [sectionId, section] of toc) {
      // find dubbing section
      if (dubbingTerm.some((rx) => rx.test(section.line))) {
        sectionFound = true;
        await exploreDubbingSectionChilds(section.index, toc, element);
      }
    }

  return new Response(
    JSON.stringify({ stop: true }),
    {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    },
  )

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