SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- Dumped from database version 15.6
-- Dumped by pg_dump version 15.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: key; Type: TABLE DATA; Schema: pgsodium; Owner: supabase_admin
--



--
-- Data for Name: source; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: voice_actors; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."voice_actors" ("id", "firstname", "bio", "nationality", "date_of_birth", "awards", "years_active", "social_media_links", "lastname", "profile_picture") VALUES
	(2, 'Laëtitia', NULL, NULL, NULL, NULL, NULL, NULL, 'Lefebvre', NULL),
	(3, 'Damien', NULL, NULL, NULL, NULL, NULL, NULL, 'Boisseau', NULL),
	(4, 'Xavier', NULL, NULL, NULL, NULL, NULL, NULL, 'Couleau', NULL),
	(5, 'Coco', NULL, NULL, NULL, NULL, NULL, NULL, 'Noël', NULL),
	(6, 'William', NULL, NULL, NULL, NULL, NULL, NULL, 'Coryn', NULL),
	(7, 'Gauthier', NULL, NULL, NULL, NULL, NULL, NULL, 'Battoue', NULL),
	(8, 'Marie', NULL, NULL, NULL, NULL, NULL, NULL, 'Glorieux', NULL),
	(9, 'Marion', NULL, NULL, NULL, NULL, NULL, NULL, 'Peronnet', NULL),
	(10, 'Geoffrey', NULL, NULL, NULL, NULL, NULL, NULL, 'Loval', NULL),
	(11, 'Florie', NULL, NULL, NULL, NULL, NULL, NULL, 'Auclerc', NULL),
	(12, 'Léana', NULL, NULL, NULL, NULL, NULL, NULL, 'Montana', NULL),
	(13, 'Clara', NULL, NULL, NULL, NULL, NULL, NULL, 'Soares', NULL),
	(14, 'Dorylia', NULL, NULL, NULL, NULL, NULL, NULL, 'Calmel', NULL),
	(15, 'Eve', NULL, NULL, NULL, NULL, NULL, NULL, 'Reinquin', NULL),
	(16, 'Kévin', NULL, NULL, NULL, NULL, NULL, NULL, 'Goffette', NULL),
	(17, 'Birane', NULL, NULL, NULL, NULL, NULL, NULL, 'Ba', NULL),
	(18, 'Jean-Claude', NULL, NULL, NULL, NULL, NULL, NULL, 'Donda', NULL),
	(19, 'Marion', NULL, NULL, NULL, NULL, NULL, NULL, 'Gress', NULL),
	(20, 'Diane', NULL, NULL, NULL, NULL, NULL, NULL, 'Pierens', NULL),
	(21, 'Colette', NULL, NULL, NULL, NULL, NULL, NULL, 'Venhard', NULL),
	(22, 'Esthèle', NULL, NULL, NULL, NULL, NULL, NULL, 'Dumand', NULL),
	(23, 'Cylia', NULL, NULL, NULL, NULL, NULL, NULL, 'Assohou', NULL),
	(24, 'Marion', NULL, NULL, NULL, NULL, NULL, NULL, 'Poncelet', NULL),
	(26, 'Bastien', NULL, NULL, NULL, NULL, NULL, NULL, 'Jacquemart', NULL),
	(27, 'Yumi', NULL, NULL, NULL, NULL, NULL, NULL, 'Fujimori', NULL),
	(28, 'Richard', NULL, NULL, NULL, NULL, NULL, NULL, 'Darbois', NULL),
	(29, 'Mathias', NULL, NULL, NULL, NULL, NULL, NULL, 'Zakhar', NULL),
	(30, 'Adrien', NULL, NULL, NULL, NULL, NULL, NULL, 'Pelon', NULL),
	(31, 'Célia', NULL, NULL, NULL, NULL, NULL, NULL, 'Asensio', NULL),
	(32, 'Lara', NULL, NULL, NULL, NULL, NULL, NULL, 'Locoge', NULL),
	(33, 'Bernard', NULL, NULL, NULL, NULL, NULL, NULL, 'Alane', NULL),
	(34, 'Sébastien', NULL, NULL, NULL, NULL, NULL, NULL, 'Desjours', NULL),
	(35, 'Emma', NULL, NULL, NULL, NULL, NULL, NULL, 'Santini', NULL),
	(36, 'Véronique', NULL, NULL, NULL, NULL, NULL, NULL, 'Desmadryl', NULL),
	(37, 'Bernard', NULL, NULL, NULL, NULL, NULL, NULL, 'Bollet', NULL),
	(38, 'Gaëtan', NULL, NULL, NULL, NULL, NULL, NULL, 'Borg', NULL),
	(39, 'Corrine', NULL, NULL, NULL, NULL, NULL, NULL, 'Wellong', NULL),
	(40, 'Virginie', NULL, NULL, NULL, NULL, NULL, NULL, 'Méry', NULL),
	(41, 'Rachel', NULL, NULL, NULL, NULL, NULL, NULL, 'Pignot', NULL),
	(42, 'Agnes', NULL, NULL, NULL, NULL, NULL, NULL, 'Pat', NULL),
	(43, 'Emily', NULL, NULL, NULL, NULL, NULL, NULL, 'Pello', NULL),
	(44, 'Laura', NULL, NULL, NULL, NULL, NULL, NULL, 'Blanc', NULL),
	(1, 'Daniel', NULL, NULL, NULL, NULL, NULL, NULL, 'Njo Lobé', NULL),
	(46, 'Jean-Philippe', NULL, NULL, NULL, NULL, NULL, NULL, 'Puymartin', NULL),
	(47, 'Mike', NULL, NULL, NULL, NULL, NULL, NULL, 'Fédée', NULL),
	(48, 'Véronique', NULL, NULL, NULL, NULL, NULL, NULL, 'Augereau', NULL),
	(49, 'Jérémy', NULL, NULL, NULL, NULL, NULL, NULL, 'Bardeau', NULL),
	(50, 'Laurent', NULL, NULL, NULL, NULL, NULL, NULL, 'Orry', NULL),
	(52, 'Emmanuel', NULL, NULL, NULL, NULL, NULL, NULL, 'Gradi', NULL),
	(53, 'Laura', NULL, NULL, NULL, NULL, NULL, NULL, 'Zichy', NULL),
	(25, 'Anatole', NULL, NULL, NULL, NULL, NULL, NULL, 'de Bodinat', 'ANATOLE_DE_BODINAT.jpg');


--
-- Data for Name: work; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."work" ("id", "content_id", "actor_id", "voice_actor_id", "highlight", "suggestions", "status", "source_id", "content_type", "performance") VALUES
	(1, 124364, 6195, 1, false, NULL, 'suggestion', NULL, 'tv', 'dialogues'),
	(2, 124364, 5887, 2, false, NULL, 'suggestion', NULL, 'tv', 'dialogues'),
	(3, 124364, 7498, 3, false, NULL, 'suggestion', NULL, 'tv', 'dialogues'),
	(4, 124364, 60089, 4, false, NULL, 'suggestion', NULL, 'tv', 'dialogues'),
	(5, 124364, 108895, 5, false, NULL, 'suggestion', NULL, 'tv', 'dialogues'),
	(6, 124364, 124315, 6, false, NULL, 'suggestion', NULL, 'tv', 'dialogues'),
	(7, 124364, 1927025, 7, false, NULL, 'suggestion', NULL, 'tv', 'dialogues'),
	(8, 124364, 2520942, 8, false, NULL, 'suggestion', NULL, 'tv', 'dialogues'),
	(9, 124364, 3437121, 9, false, NULL, 'suggestion', NULL, 'tv', 'dialogues'),
	(10, 124364, 2710310, 10, false, NULL, 'suggestion', NULL, 'tv', 'dialogues'),
	(11, 124364, 2578201, 11, false, NULL, 'suggestion', NULL, 'tv', 'dialogues'),
	(12, 124364, 1562430, 12, false, NULL, 'suggestion', NULL, 'tv', 'dialogues'),
	(13, 124364, 3118207, 13, false, NULL, 'suggestion', NULL, 'tv', 'dialogues'),
	(14, 124364, 1449399, 14, false, NULL, 'suggestion', NULL, 'tv', 'dialogues'),
	(15, 124364, 1503397, 15, false, NULL, 'suggestion', NULL, 'tv', 'dialogues'),
	(16, 124364, 2194626, 16, false, NULL, 'suggestion', NULL, 'tv', 'dialogues'),
	(17, 124364, 3705079, 17, false, NULL, 'suggestion', NULL, 'tv', 'dialogues'),
	(18, 124364, 19976, 18, false, NULL, 'suggestion', NULL, 'tv', 'dialogues'),
	(19, 124364, 1785654, 19, false, NULL, 'suggestion', NULL, 'tv', 'dialogues'),
	(20, 124364, 3437125, 20, false, NULL, 'suggestion', NULL, 'tv', 'dialogues'),
	(21, 124364, 58803, 21, false, NULL, 'suggestion', NULL, 'tv', 'dialogues'),
	(22, 402431, 1765068, 22, false, NULL, 'suggestion', NULL, 'movie', 'dialogues'),
	(23, 402431, 1765068, 23, false, NULL, 'suggestion', NULL, 'movie', 'chants'),
	(24, 402431, 4716775, 24, false, NULL, 'suggestion', NULL, 'movie', 'dialogues'),
	(25, 402431, 80860, 25, false, NULL, 'suggestion', NULL, 'movie', 'dialogues'),
	(26, 402431, 80860, 26, false, NULL, 'suggestion', NULL, 'movie', 'chants'),
	(27, 402431, 1620, 27, false, NULL, 'suggestion', NULL, 'movie', 'dialogues'),
	(28, 402431, 4785, 28, false, NULL, 'suggestion', NULL, 'movie', 'dialogues'),
	(29, 402431, 2271410, 29, false, NULL, 'suggestion', NULL, 'movie', 'dialogues'),
	(30, 402431, 2271410, 30, false, NULL, 'suggestion', NULL, 'movie', 'chants'),
	(31, 402431, 3102321, 31, false, NULL, 'suggestion', NULL, 'movie', 'dialogues'),
	(32, 402431, 3102321, 32, false, NULL, 'suggestion', NULL, 'movie', 'chants'),
	(33, 402431, 22970, 33, false, NULL, 'suggestion', NULL, 'movie', 'voice over'),
	(34, 402431, 1564920, 34, false, NULL, 'suggestion', NULL, 'movie', 'dialogues'),
	(35, 402431, 1587577, 35, false, NULL, 'suggestion', NULL, 'movie', 'dialogues'),
	(36, 402431, 1716724, 36, false, NULL, 'suggestion', NULL, 'movie', 'dialogues'),
	(37, 402431, 22810, 37, false, NULL, 'suggestion', NULL, 'movie', 'dialogues'),
	(38, 402431, 22810, 38, false, NULL, 'suggestion', NULL, 'movie', 'chants'),
	(39, 402431, 4824375, 39, false, NULL, 'suggestion', NULL, 'movie', 'dialogues'),
	(40, 402431, 1239745, 40, false, NULL, 'suggestion', NULL, 'movie', 'dialogues'),
	(41, 402431, 1239745, 41, false, NULL, 'suggestion', NULL, 'movie', 'chants'),
	(42, 402431, 19394, 42, false, NULL, 'suggestion', NULL, 'movie', 'dialogues'),
	(43, 402431, 52775, 43, false, NULL, 'suggestion', NULL, 'movie', 'dialogues'),
	(44, 125988, 933238, 44, false, NULL, 'suggestion', NULL, 'tv', 'dialogues'),
	(45, 125988, 4238, 1, false, NULL, 'suggestion', NULL, 'tv', 'dialogues'),
	(46, 125988, 504, 46, false, NULL, 'suggestion', NULL, 'tv', 'dialogues'),
	(47, 125988, 1717255, 47, false, NULL, 'suggestion', NULL, 'tv', 'dialogues'),
	(48, 125988, 17477, 48, false, NULL, 'suggestion', NULL, 'tv', 'dialogues'),
	(49, 125988, 1617697, 49, false, NULL, 'suggestion', NULL, 'tv', 'dialogues'),
	(50, 125988, 123532, 50, false, NULL, 'suggestion', NULL, 'tv', 'dialogues'),
	(51, 125988, 1642036, 25, false, NULL, 'suggestion', NULL, 'tv', 'dialogues'),
	(52, 125988, 83222, 52, false, NULL, 'suggestion', NULL, 'tv', 'dialogues'),
	(53, 125988, 1147904, 53, false, NULL, 'suggestion', NULL, 'tv', 'dialogues');


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id") VALUES
	('voice_actor_profile_pictures', 'voice_actor_profile_pictures', NULL, '2024-11-28 11:58:38.789487+00', '2024-11-28 11:58:38.789487+00', true, false, 512000, '{image/*}', NULL);


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."objects" ("id", "bucket_id", "name", "owner", "created_at", "updated_at", "last_accessed_at", "metadata", "version", "owner_id", "user_metadata") VALUES
	('1fbf898b-3464-43bb-a107-bb23d15582ee', 'voice_actor_profile_pictures', 'ANATOLE_DE_BODINAT.jpg', NULL, '2024-11-28 12:14:10.494916+00', '2024-11-28 12:14:10.494916+00', '2024-11-28 12:14:10.494916+00', '{"eTag": "\"dfbde8373d1ad2ae936926e5a529d0ab\"", "size": 446089, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2024-11-28T12:14:10.487Z", "contentLength": 446089, "httpStatusCode": 200}', '6f3922f8-2d93-4cb0-84b1-feb4509dedb8', NULL, '{}');


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--



--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 1, false);


--
-- Name: key_key_id_seq; Type: SEQUENCE SET; Schema: pgsodium; Owner: supabase_admin
--

SELECT pg_catalog.setval('"pgsodium"."key_key_id_seq"', 1, false);


--
-- Name: source_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."source_id_seq"', 1, false);


--
-- Name: voice_actors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."voice_actors_id_seq"', 53, true);


--
-- Name: work_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."work_id_seq"', 53, true);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('"supabase_functions"."hooks_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

RESET ALL;
