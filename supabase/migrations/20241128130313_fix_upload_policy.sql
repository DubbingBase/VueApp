create policy "allow all 4lebm_0"
on "storage"."objects"
as permissive
for select
to public
using ((bucket_id = 'voice_actor_profile_pictures'::text));


create policy "allow all 4lebm_1"
on "storage"."objects"
as permissive
for insert
to public
with check ((bucket_id = 'voice_actor_profile_pictures'::text));


create policy "allow all 4lebm_2"
on "storage"."objects"
as permissive
for update
to public
using ((bucket_id = 'voice_actor_profile_pictures'::text));



