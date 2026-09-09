# Cloudflare PR Website Previews

## Plan

- [x] Build the Nuxt website for internal pull requests with the Cloudflare preset.
- [x] Deploy each pull request to a stable per-PR Cloudflare Worker URL.
- [x] Reuse the Worker when new commits are pushed to the pull request.
- [x] Publish or update one preview comment containing the URL and commit SHA.
- [x] Use only public Supabase credentials; omit production server secrets, KV, and cron triggers.
- [x] Mark preview responses with `X-Robots-Tag: noindex, nofollow, noarchive`.
- [x] Delete the preview Worker when the pull request closes.
- [ ] Configure the `cloudflare-preview` GitHub environment and required secrets.
- [ ] Validate the lifecycle with an internal pull request.

## Required GitHub environment secrets

- `CLOUDFLARE_PREVIEW_API_TOKEN`: scoped to the preview account's Workers deployment and deletion APIs.
- `CLOUDFLARE_PREVIEW_ACCOUNT_ID`: the dedicated preview Cloudflare account ID.
- `CLOUDFLARE_WORKERS_SUBDOMAIN`: the preview account's `workers.dev` subdomain.
- `SUPABASE_URL`: the existing public Supabase URL.
- `SUPABASE_PUBLISHABLE_KEY`: the existing public Supabase publishable key.
