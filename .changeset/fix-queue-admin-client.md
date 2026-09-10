---
"@app/website": patch
---

Use the request context when initializing the server-side Supabase client so queue extraction writes use the secret key and pass RLS checks.
