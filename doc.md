push local db to remote using migrations
```
supabase db push
```

create a new migration based on the diff of the local and remote db
```
pnpm supabase db diff --use-migra initial-schema -f initial-schema
```
