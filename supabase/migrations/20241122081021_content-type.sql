ALTER TABLE "public"."work" rename COLUMN "tmdb_content_id" TO "content_id";

alter table "public"."work" add column "content_type" text;


