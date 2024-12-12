--
-- PostgreSQL database dump
--

-- Dumped from database version 16.4 (Debian 16.4-1.pgdg120+2)
-- Dumped by pg_dump version 16.4 (Homebrew)

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: tigerlift_r4f8_user
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO tigerlift_r4f8_user;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: tigerlift_r4f8_user
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: tigerlift_r4f8_user
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    netid character varying(20),
    message text NOT NULL,
    notification_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    subject text,
    status text
);


ALTER TABLE public.notifications OWNER TO tigerlift_r4f8_user;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: tigerlift_r4f8_user
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO tigerlift_r4f8_user;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tigerlift_r4f8_user
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: predefinedlocations; Type: TABLE; Schema: public; Owner: tigerlift_r4f8_user
--

CREATE TABLE public.predefinedlocations (
    id integer NOT NULL,
    name character varying(255) NOT NULL
);


ALTER TABLE public.predefinedlocations OWNER TO tigerlift_r4f8_user;

--
-- Name: predefinedlocations_id_seq; Type: SEQUENCE; Schema: public; Owner: tigerlift_r4f8_user
--

CREATE SEQUENCE public.predefinedlocations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.predefinedlocations_id_seq OWNER TO tigerlift_r4f8_user;

--
-- Name: predefinedlocations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tigerlift_r4f8_user
--

ALTER SEQUENCE public.predefinedlocations_id_seq OWNED BY public.predefinedlocations.id;


--
-- Name: riderequests; Type: TABLE; Schema: public; Owner: tigerlift_r4f8_user
--

CREATE TABLE public.riderequests (
    id integer NOT NULL,
    netid character varying(10),
    full_name text,
    mail character varying(30),
    ride_id integer,
    status character varying(20) NOT NULL,
    request_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    response_time timestamp without time zone,
    CONSTRAINT riderequests_status_check CHECK (((status)::text = ANY (ARRAY[('pending'::character varying)::text, ('accepted'::character varying)::text, ('rejected'::character varying)::text])))
);


ALTER TABLE public.riderequests OWNER TO tigerlift_r4f8_user;

--
-- Name: riderequests_id_seq; Type: SEQUENCE; Schema: public; Owner: tigerlift_r4f8_user
--

CREATE SEQUENCE public.riderequests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.riderequests_id_seq OWNER TO tigerlift_r4f8_user;

--
-- Name: riderequests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tigerlift_r4f8_user
--

ALTER SEQUENCE public.riderequests_id_seq OWNED BY public.riderequests.id;


--
-- Name: rides; Type: TABLE; Schema: public; Owner: tigerlift_r4f8_user
--

CREATE TABLE public.rides (
    id integer NOT NULL,
    admin_netid character varying(20),
    admin_name character varying(50),
    admin_email character varying(50),
    max_capacity integer NOT NULL,
    arrival_time timestamp without time zone NOT NULL,
    creation_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    current_riders text[],
    origin_dict jsonb NOT NULL,
    destination_dict jsonb NOT NULL,
    note character varying(250),
    CONSTRAINT rides_max_capacity_check CHECK (((max_capacity >= 1) AND (max_capacity <= 20)))
);


ALTER TABLE public.rides OWNER TO tigerlift_r4f8_user;

--
-- Name: rides_id_seq; Type: SEQUENCE; Schema: public; Owner: tigerlift_r4f8_user
--

CREATE SEQUENCE public.rides_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rides_id_seq OWNER TO tigerlift_r4f8_user;

--
-- Name: rides_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tigerlift_r4f8_user
--

ALTER SEQUENCE public.rides_id_seq OWNED BY public.rides.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: tigerlift_r4f8_user
--

CREATE TABLE public.users (
    id integer NOT NULL,
    netid character varying(10) NOT NULL,
    name character varying(50) NOT NULL,
    email character varying(50) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO tigerlift_r4f8_user;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: tigerlift_r4f8_user
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO tigerlift_r4f8_user;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tigerlift_r4f8_user
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: tigerlift_r4f8_user
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: predefinedlocations id; Type: DEFAULT; Schema: public; Owner: tigerlift_r4f8_user
--

ALTER TABLE ONLY public.predefinedlocations ALTER COLUMN id SET DEFAULT nextval('public.predefinedlocations_id_seq'::regclass);


--
-- Name: riderequests id; Type: DEFAULT; Schema: public; Owner: tigerlift_r4f8_user
--

ALTER TABLE ONLY public.riderequests ALTER COLUMN id SET DEFAULT nextval('public.riderequests_id_seq'::regclass);


--
-- Name: rides id; Type: DEFAULT; Schema: public; Owner: tigerlift_r4f8_user
--

ALTER TABLE ONLY public.rides ALTER COLUMN id SET DEFAULT nextval('public.rides_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: tigerlift_r4f8_user
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: tigerlift_r4f8_user
--

COPY public.notifications (id, netid, message, notification_time, subject, status) FROM stdin;
186	jy2920	Aasha S. Jain requested to join your Rideshare from Wawa to Trader Joe's on December 11, 2024, 4:00 PM!	2024-12-10 19:03:58.098958	🚗 Aasha S. Jain requested to join your Rideshare!	\N
187	jy2920	Ritika Bhatnagar requested to join your Rideshare from Wawa to Trader Joe's on December 11, 2024, 4:00 PM!	2024-12-10 19:04:01.67506	🚗 Ritika Bhatnagar requested to join your Rideshare!	\N
180	aj6117	Your request to join the Rideshare from Wawa to Trader Joe's on December 11, 2024, 4:00 PM was recently accepted!	2024-12-10 16:38:31.664523	🚗 Your Request to Join the Rideshare from Wawa to Trader Joe's Was Accepted!	\N
182	aj6117	The rideshare scheduled for December 11, 2024 at 4:00 PM has been canceled. Reason: No reason provided.	2024-12-10 16:48:30.606071	🚗 Your Rideshare Has been Canceled 	\N
166	jy2920	Your request to join the Rideshare from Wawa to Newark Liberty International Airport on December 18, 2024, 3:00 PM was recently accepted!	2024-12-10 16:12:08.974581	🚗 Your Request to Join the Rideshare from Wawa to Newark Liberty International Airport Was Accepted!	read
167	jy2920	Grace Kim requested to join your Rideshare from Wawa to Trader Joe's on December 11, 2024, 4:00 PM!	2024-12-10 16:13:38.763445	🚗 Grace Kim requested to join your Rideshare!	read
168	jy2920	Ritika Bhatnagar requested to join your Rideshare from Wawa to Trader Joe's on December 11, 2024, 4:00 PM!	2024-12-10 16:13:40.344429	🚗 Ritika Bhatnagar requested to join your Rideshare!	read
169	jy2920	Aasha S. Jain requested to join your Rideshare from Wawa to Trader Joe's on December 11, 2024, 4:00 PM!	2024-12-10 16:13:46.774729	🚗 Aasha S. Jain requested to join your Rideshare!	read
175	jy2920	Your request to join the Rideshare from Wawa to Newark Liberty International Airport on December 18, 2024, 3:00 PM was recently accepted!	2024-12-10 16:36:10.007443	🚗 Your Request to Join the Rideshare from Wawa to Newark Liberty International Airport Was Accepted!	read
176	jy2920	Aasha S. Jain requested to join your Rideshare from Wawa to Trader Joe's on December 11, 2024, 4:00 PM!	2024-12-10 16:37:36.288322	🚗 Aasha S. Jain requested to join your Rideshare!	read
178	jy2920	Grace Kim requested to join your Rideshare from Wawa to Trader Joe's on December 11, 2024, 4:00 PM!	2024-12-10 16:37:52.077466	🚗 Grace Kim requested to join your Rideshare!	read
179	jy2920	Ritika Bhatnagar requested to join your Rideshare from Wawa to Trader Joe's on December 11, 2024, 4:00 PM!	2024-12-10 16:37:57.711559	🚗 Ritika Bhatnagar requested to join your Rideshare!	read
185	jy2920	Your request to join the Rideshare from Wawa to Newark Liberty International Airport on December 18, 2024, 3:00 PM was recently accepted!	2024-12-10 19:02:18.619982	🚗 Your Request to Join the Rideshare from Wawa to Newark Liberty International Airport Was Accepted!	read
188	jy2920	Grace Kim requested to join your Rideshare from Wawa to Trader Joe's on December 11, 2024, 4:00 PM!	2024-12-10 19:04:05.13816	🚗 Grace Kim requested to join your Rideshare!	read
189	aj6117	Your request to join the Rideshare from Wawa to Trader Joe's on December 11, 2024, 4:00 PM was recently accepted!	2024-12-10 19:05:06.868325	🚗 Your Request to Join the Rideshare from Wawa to Trader Joe's Was Accepted!	read
191	aj6117	Your ride from Wawa to Trader Joe's \n          has changed arrrival time to December 11, 2024, 4:00 PM.	2024-12-11 15:53:16.980968	🚗 A rideshare you're in has changed arrival time!	\N
171	rb5539	Your request to join the Rideshare from Wawa to Trader Joe's on December 11, 2024, 4:00 PM was recently accepted!	2024-12-10 16:14:17.230695	🚗 Your Request to Join the Rideshare from Wawa to Trader Joe's Was Accepted!	read
173	rb5539	The rideshare scheduled for December 11, 2024 at 4:00 PM has been canceled. Reason: sdfsdf	2024-12-10 16:31:41.524465	🚗 Your Rideshare Has been Canceled 	read
190	rb5539	Your request to join the Rideshare from Wawa to Trader Joe's on December 11, 2024, 4:00 PM was recently accepted!	2024-12-10 19:05:09.616246	🚗 Your Request to Join the Rideshare from Wawa to Trader Joe's Was Accepted!	read
192	rb5539	Your ride from Wawa to Trader Joe's \n          has changed arrrival time to December 11, 2024, 4:00 PM.	2024-12-11 15:53:17.370124	🚗 A rideshare you're in has changed arrival time!	read
165	gk3261	Julia Ying requested to join your Rideshare from Wawa to Newark Liberty International Airport on December 18, 2024, 3:00 PM!	2024-12-10 16:11:39.132688	🚗 Julia Ying requested to join your Rideshare!	read
170	gk3261	Your request to join the Rideshare from Wawa to Trader Joe's on December 11, 2024, 4:00 PM was recently accepted!	2024-12-10 16:14:15.567483	🚗 Your Request to Join the Rideshare from Wawa to Trader Joe's Was Accepted!	read
172	gk3261	The rideshare scheduled for December 11, 2024 at 4:00 PM has been canceled. Reason: sdfsdf	2024-12-10 16:31:40.008665	🚗 Your Rideshare Has been Canceled 	read
174	gk3261	Julia Ying requested to join your Rideshare from Wawa to Newark Liberty International Airport on December 18, 2024, 3:00 PM!	2024-12-10 16:35:41.53136	🚗 Julia Ying requested to join your Rideshare!	read
177	gk3261	Ritika Bhatnagar requested to join your Rideshare from Wawa to Newark Liberty International Airport on December 18, 2024, 3:00 PM!	2024-12-10 16:37:49.086428	🚗 Ritika Bhatnagar requested to join your Rideshare!	read
181	gk3261	Your request to join the Rideshare from Wawa to Trader Joe's on December 11, 2024, 4:00 PM was recently accepted!	2024-12-10 16:38:33.290895	🚗 Your Request to Join the Rideshare from Wawa to Trader Joe's Was Accepted!	read
183	gk3261	The rideshare scheduled for December 11, 2024 at 4:00 PM has been canceled. Reason: No reason provided.	2024-12-10 16:48:32.176868	🚗 Your Rideshare Has been Canceled 	read
184	gk3261	Julia Ying requested to join your Rideshare from Wawa to Newark Liberty International Airport on December 18, 2024, 3:00 PM!	2024-12-10 19:01:41.197666	🚗 Julia Ying requested to join your Rideshare!	read
193	rb5539	Grace Kim requested to join your Rideshare from Frist Campus Center to Target on December 14, 2024, 12:00 PM!	2024-12-11 16:24:40.050808	🚗 Grace Kim requested to join your Rideshare!	\N
\.


--
-- Data for Name: predefinedlocations; Type: TABLE DATA; Schema: public; Owner: tigerlift_r4f8_user
--

COPY public.predefinedlocations (id, name) FROM stdin;
1	Wawa
2	Newark Liberty International Airport
\.


--
-- Data for Name: riderequests; Type: TABLE DATA; Schema: public; Owner: tigerlift_r4f8_user
--

COPY public.riderequests (id, netid, full_name, mail, ride_id, status, request_time, response_time) FROM stdin;
113	rb5539	Ritika Bhatnagar	rb5539@princeton.edu	66	pending	2024-12-10 16:37:48.808476	\N
116	jy2920	Julia Ying	jy2920@princeton.edu	66	accepted	2024-12-10 19:01:40.912726	2024-12-10 19:02:18.477692
117	aj6117	Aasha S. Jain	aj6117@princeton.edu	71	accepted	2024-12-10 19:03:57.792817	2024-12-10 19:05:06.726516
118	rb5539	Ritika Bhatnagar	rb5539@princeton.edu	71	accepted	2024-12-10 19:04:01.397936	2024-12-10 19:05:09.455449
119	gk3261	Grace Kim	gk3261@princeton.edu	71	rejected	2024-12-10 19:04:04.849167	2024-12-10 19:05:10.995441
120	gk3261	Grace Kim	gk3261@princeton.edu	64	pending	2024-12-11 16:24:39.757717	\N
\.


--
-- Data for Name: rides; Type: TABLE DATA; Schema: public; Owner: tigerlift_r4f8_user
--

COPY public.rides (id, admin_netid, admin_name, admin_email, max_capacity, arrival_time, creation_time, updated_at, current_riders, origin_dict, destination_dict, note) FROM stdin;
64	rb5539	Ritika Bhatnagar	rb5539@princeton.edu	3	2024-12-14 17:00:00	2024-12-10 15:49:36.881859	2024-12-10 15:49:36.881859	{}	{"id": "ChIJxY2Ce8Tmw4kR-OwkcvUVQ7s", "name": "Frist Campus Center", "address": "Frist Campus Center, Frist Ln, Princeton, NJ 08544, USA"}	{"id": "ChIJTVXtv3rhw4kRZ6DeyENbDvY", "name": "Target", "address": "500 Nassau Park Blvd, Princeton, NJ 08540, USA"}	
74	jy2920	Julia Ying	jy2920@princeton.edu	3	2024-12-11 15:51:12	2024-12-11 15:52:05.271273	2024-12-11 15:52:05.271273	{}	{"id": "ChIJPwPHlMjmw4kRmwnPlYKNAQQ", "name": "Wawa", "address": "152 Alexander St, Princeton, NJ 08540, USA"}	{"id": "ChIJK-1uZhpZwYkRHbnwTON6mVA", "name": "DFF Attic Insulation & Roofing Services Inc Of NJ", "address": "1102 Sylvan Ave, Hamilton Township, NJ 08610, USA"}	sdfsdfwefefwef
71	jy2920	Julia Ying	jy2920@princeton.edu	2	2024-12-11 15:52:26	2024-12-10 19:03:46.227327	2024-12-11 15:53:16.221882	{{aj6117,"Aasha S. Jain",aj6117@princeton.edu},{rb5539,"Ritika Bhatnagar",rb5539@princeton.edu}}	{"id": "ChIJPwPHlMjmw4kRmwnPlYKNAQQ", "name": "Wawa", "address": "152 Alexander St, Princeton, NJ 08540, USA"}	{"id": "ChIJAznDOj7hw4kRw-8xJFPXk_s", "name": "Trader Joe's", "address": "3528 Brunswick Pike, Princeton, NJ 08540, USA"}	
66	gk3261	Grace Kim	gk3261@princeton.edu	2	2024-12-18 20:00:00	2024-12-10 15:56:04.468742	2024-12-10 19:02:21.765064	{{jy2920,"Julia Ying",jy2920@princeton.edu}}	{"id": "ChIJPwPHlMjmw4kRmwnPlYKNAQQ", "name": "Wawa", "address": "152 Alexander St, Princeton, NJ 08540, USA"}	{"id": "ChIJ7wzsxeFSwokRhvLXxTe087M", "name": "Newark Liberty International Airport", "address": "3 Brewster Rd, Newark, NJ 07114, USA"}	My flight is at 6PM. I'm flexible to arriving a little later than 3PM.
75	jy2920	Julia Ying	jy2920@princeton.edu	3	2024-12-19 15:59:38	2024-12-11 15:59:41.455997	2024-12-11 15:59:41.455997	{}	{"id": "ChIJPwPHlMjmw4kRmwnPlYKNAQQ", "name": "Wawa", "address": "152 Alexander St, Princeton, NJ 08540, USA"}	{"id": "ChIJlcNwRouCH2cRVsx1ACh5-Dw", "name": "DFS Guam", "address": "1296 Pale San Vitores Rd, Tumon, 96913, Guam"}	
69	aj6117	Aasha S. Jain	aj6117@princeton.edu	3	2024-12-12 16:00:00	2024-12-10 16:51:10.527049	2024-12-10 16:51:10.527049	{}	{"id": "ChIJO-Ch4dzmw4kRxYFUYHL3UNA", "name": "Charter Club", "address": "79 Prospect Ave, Princeton, NJ 08540, USA"}	{"id": "ChIJTVXtv3rhw4kRZ6DeyENbDvY", "name": "Target", "address": "500 Nassau Park Blvd, Princeton, NJ 08540, USA"}	
72	rb5539	Ritika Bhatnagar	rb5539@princeton.edu	3	2024-12-11 00:57:25	2024-12-11 00:57:04.073919	2024-12-11 00:57:04.073919	{}	{"id": "ChIJPwPHlMjmw4kRmwnPlYKNAQQ", "name": "Wawa", "address": "152 Alexander St, Princeton, NJ 08540, USA"}	{"id": "ChIJO-Ch4dzmw4kRxYFUYHL3UNA", "name": "Charter Club", "address": "79 Prospect Ave, Princeton, NJ 08540, USA"}	
70	aj6117	Aasha S. Jain	aj6117@princeton.edu	2	2024-12-14 19:00:00	2024-12-10 16:53:51.747804	2024-12-10 16:53:51.747804	{}	{"id": "ChIJ47pgOMbmw4kRSVavBUk1fZk", "name": "The Dinky Bar & Kitchen", "address": "94 University Pl, Princeton, NJ 08540, USA"}	{"id": "ChIJb6OY6IDhw4kRtQZVdU3589Q", "name": "Quaker Bridge Mall", "address": "3320 US-1, Lawrenceville, NJ 08648, USA"}	
73	rb5539	Ritika Bhatnagar	rb5539@princeton.edu	3	2024-12-10 20:00:00	2024-12-11 00:57:57.729572	2024-12-11 01:11:04.392268	{}	{"id": "ChIJW-T2Wt7Gt4kRKl2I1CJFUsI", "name": "Washington", "address": "Washington, DC, USA"}	{"id": "ChIJIcdcblfdwIkRYlJn6UPLb0o", "name": "Atlantic City", "address": "Atlantic City, NJ, USA"}	
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: tigerlift_r4f8_user
--

COPY public.users (id, netid, name, email, created_at, updated_at) FROM stdin;
\.


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tigerlift_r4f8_user
--

SELECT pg_catalog.setval('public.notifications_id_seq', 193, true);


--
-- Name: predefinedlocations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tigerlift_r4f8_user
--

SELECT pg_catalog.setval('public.predefinedlocations_id_seq', 2, true);


--
-- Name: riderequests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tigerlift_r4f8_user
--

SELECT pg_catalog.setval('public.riderequests_id_seq', 120, true);


--
-- Name: rides_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tigerlift_r4f8_user
--

SELECT pg_catalog.setval('public.rides_id_seq', 75, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tigerlift_r4f8_user
--

SELECT pg_catalog.setval('public.users_id_seq', 1, false);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: tigerlift_r4f8_user
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: predefinedlocations predefinedlocations_pkey; Type: CONSTRAINT; Schema: public; Owner: tigerlift_r4f8_user
--

ALTER TABLE ONLY public.predefinedlocations
    ADD CONSTRAINT predefinedlocations_pkey PRIMARY KEY (id);


--
-- Name: riderequests riderequests_pkey; Type: CONSTRAINT; Schema: public; Owner: tigerlift_r4f8_user
--

ALTER TABLE ONLY public.riderequests
    ADD CONSTRAINT riderequests_pkey PRIMARY KEY (id);


--
-- Name: rides rides_pkey; Type: CONSTRAINT; Schema: public; Owner: tigerlift_r4f8_user
--

ALTER TABLE ONLY public.rides
    ADD CONSTRAINT rides_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: tigerlift_r4f8_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_netid_key; Type: CONSTRAINT; Schema: public; Owner: tigerlift_r4f8_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_netid_key UNIQUE (netid);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: tigerlift_r4f8_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: riderequests riderequests_ride_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: tigerlift_r4f8_user
--

ALTER TABLE ONLY public.riderequests
    ADD CONSTRAINT riderequests_ride_id_fkey FOREIGN KEY (ride_id) REFERENCES public.rides(id);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: tigerlift_r4f8_user
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON SEQUENCES TO tigerlift_r4f8_user;


--
-- Name: DEFAULT PRIVILEGES FOR TYPES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TYPES TO tigerlift_r4f8_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON FUNCTIONS TO tigerlift_r4f8_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TABLES TO tigerlift_r4f8_user;


--
-- PostgreSQL database dump complete
--

