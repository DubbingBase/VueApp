# Plan: Cloudflare PR Website Previews

## Goal

Deploy the Nuxt website to a temporary Cloudflare Worker for each internal pull
request, update that preview when new commits are pushed, and delete it whenever
the pull request closes or merges.

## Decisions

- Use one Worker per PR named `dubbingbase-website-pr-<number>`.
- Use the account's `workers.dev` URL instead of adding custom DNS records.
- Run only for pull requests originating in the same repository; skip forks so
  deployment credentials are never exposed to untrusted code.
- Use only public Supabase credentials. Do not expose production server secrets,
  the production KV namespace, or scheduled jobs to previews.
- Treat previews as read-only and add `X-Robots-Tag: noindex, nofollow, noarchive`.
- Delete the Worker for both merged and abandoned/closed PRs.

## Implementation Tasks

1. Add a dedicated GitHub Actions workflow for PR `opened`, `reopened`, and
   `synchronize` events, filtered to website-related paths.
2. Build `apps/website` with `NITRO_PRESET=cloudflare-module` and deploy using a
   preview-specific Wrangler configuration.
3. Configure the preview Worker without production KV bindings or cron triggers.
4. Add runtime preview safeguards that reject mutation methods while allowing
   `GET`, `HEAD`, and `OPTIONS`, and mark responses as non-indexable.
5. Publish one sticky PR comment containing the preview URL and deployed commit;
   update it on subsequent commits instead of creating duplicates.
6. Add a close-event cleanup job that deletes the Worker through Cloudflare’s API,
   treating an already-missing Worker as a successful cleanup.
7. Document setup and required secrets for the `cloudflare-preview` GitHub
   environment.

## Required Configuration

- `CLOUDFLARE_PREVIEW_API_TOKEN`: scoped to preview Worker deploy/delete operations.
- `CLOUDFLARE_PREVIEW_ACCOUNT_ID`: dedicated preview Cloudflare account ID.
- `CLOUDFLARE_WORKERS_SUBDOMAIN`: preview account `workers.dev` subdomain.
- `SUPABASE_URL`: public Supabase URL.
- `SUPABASE_PUBLISHABLE_KEY`: public Supabase key.

## Verification

- Validate the workflow syntax with `actionlint`.
- Run website typecheck, focused preview middleware tests, and the Cloudflare Nuxt
  build.
- Confirm the preview config contains no production KV, cron, or server secrets.
- Test an internal PR end to end: deploy, update on a new commit, receive the
  sticky comment, and delete successfully on merge/close.
- Confirm fork PRs do not receive deployment credentials or run deployment jobs.
- Confirm production Worker configuration and the main deployment workflow are
  unchanged.

## Rollout and Cost Notes

- Configure the GitHub environment before enabling the first preview PR.
- Use Cloudflare Workers free usage where sufficient; the paid Workers plan has
  a $5/month account minimum if the free CPU/request limits are insufficient.
- GitHub Actions usage consumes the repository’s included minutes and may incur
  normal overage charges for private repositories.
