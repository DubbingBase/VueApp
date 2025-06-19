-- Create storage bucket for voice actor profile pictures
insert into storage.buckets (id, name, public) values ('voice_actor_profile_pictures', 'voice_actor_profile_pictures', true)
on conflict (id) do nothing;
