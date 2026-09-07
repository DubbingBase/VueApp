---
name: dev-server
description: Starts and manages the local dev environment (Supabase + Nuxt). Use when you need to spin up the app for testing, browser testing with DevTools, or any dev workflow that requires the app running.
---

# Dev Server

## Starting the dev environment

The app needs two services running:

1. **Supabase** (local Postgres + API) — without this, the website shows no data
2. **Nuxt dev server** — serves the app

### Step 1: Start Supabase

```bash
cd packages/database && ./node_modules/.bin/supabase start
```

Or:

```bash
cd packages/database && pnpm exec supabase start
```

Verify it's up:

```bash
curl -s --connect-timeout 3 http://127.0.0.1:55321/rest/v1/voice_actors?select=id&limit=1
```

### Step 2: Start Nuxt dev server

Use a **Paseo terminal** so the server stays in a managed session (not a background `&` process that becomes hard to track):

```
paseo_create_terminal → then type: mise run website
```

Alternatively:

```bash
mise run website
```

This binds to `0.0.0.0:3000` (or `:3001` if 3000 is occupied). The server logs go to the terminal.

## Accessing from mobile / LAN

- **Supabase must be running first** (port 55321)
- Check what's listening: `ss -tlnp | grep -E "300|553"`
- Mobile URL: `http://<host-ip>:3001` (or whatever port Nuxt chose)
- Find host IPs: `ip -4 addr show | grep -oP '(?<=inet\s)\d+(\.\d+){3}'`

## Common issues

**`supabase start` fails with "failed to read file: open packages/database/supabase/functions/actor/index.ts"**

The `config.toml` has stale `[functions.*]` blocks from when edge functions existed. Remove them:

```bash
grep "^\[functions" packages/database/supabase/config.toml  # should be empty
```

If not empty, remove all `[functions.*]` blocks (keep `[edge_runtime]`).

**Port 3000 occupied**

Nuxt auto-falls back to 3001. Check which port: `ss -tlnp | grep node`

**Website shows no data**

1. Supabase not running → start it
2. `.env` file missing → `cp .env.example .env`

## Stopping

```bash
cd packages/database && ./node_modules/.bin/supabase stop
```
