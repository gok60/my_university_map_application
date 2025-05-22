--
-- PostgreSQL database dump
--

-- Dumped from database version 12.19
-- Dumped by pg_dump version 12.19

-- Started on 2025-05-22 06:39:28

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
-- TOC entry 3803 (class 1262 OID 87074)
-- Name: harita_hacettepe; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE harita_hacettepe WITH TEMPLATE = template0 ENCODING = 'UTF8' LC_COLLATE = 'Turkish_T�rkiye.1254' LC_CTYPE = 'Turkish_T�rkiye.1254';


ALTER DATABASE harita_hacettepe OWNER TO postgres;

\connect harita_hacettepe

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
-- TOC entry 2 (class 3079 OID 87075)
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- TOC entry 3804 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry, geography, and raster spatial types and functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 208 (class 1259 OID 88151)
-- Name: birimler; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.birimler (
    id character varying NOT NULL,
    geom public.geometry(Point,4326),
    name character varying(254),
    description character varying(254),
    website character varying(255),
    telefon character varying(50),
    user_id integer
);


ALTER TABLE public.birimler OWNER TO postgres;

--
-- TOC entry 209 (class 1259 OID 88157)
-- Name: birimler_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.birimler_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.birimler_id_seq OWNER TO postgres;

--
-- TOC entry 3805 (class 0 OID 0)
-- Dependencies: 209
-- Name: birimler_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.birimler_id_seq OWNED BY public.birimler.id;


--
-- TOC entry 210 (class 1259 OID 88159)
-- Name: events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.events (
    id integer NOT NULL,
    title character varying(255) NOT NULL,
    date date NOT NULL,
    "time" time without time zone,
    location character varying(255),
    event_type character varying(100),
    contact_info character varying(255),
    description text,
    konum public.geography(Point,4326),
    geom public.geometry(Point,4326),
    user_id integer,
    website character varying(255),
    image_path character varying
);


ALTER TABLE public.events OWNER TO postgres;

--
-- TOC entry 211 (class 1259 OID 88165)
-- Name: etkinlikler_etkinlik_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.etkinlikler_etkinlik_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.etkinlikler_etkinlik_id_seq OWNER TO postgres;

--
-- TOC entry 3806 (class 0 OID 0)
-- Dependencies: 211
-- Name: etkinlikler_etkinlik_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.etkinlikler_etkinlik_id_seq OWNED BY public.events.id;


--
-- TOC entry 212 (class 1259 OID 88167)
-- Name: hata_noktalar; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hata_noktalar (
    id integer NOT NULL,
    isim_soyisim character varying(100) NOT NULL,
    hata_turu character varying(100) NOT NULL,
    aciklama text,
    geom public.geometry(Point,4326),
    user_id integer
);


ALTER TABLE public.hata_noktalar OWNER TO postgres;

--
-- TOC entry 213 (class 1259 OID 88173)
-- Name: hata_noktalar_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.hata_noktalar_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.hata_noktalar_id_seq OWNER TO postgres;

--
-- TOC entry 3807 (class 0 OID 0)
-- Dependencies: 213
-- Name: hata_noktalar_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.hata_noktalar_id_seq OWNED BY public.hata_noktalar.id;


--
-- TOC entry 214 (class 1259 OID 88175)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(50) DEFAULT 'normal'::character varying,
    name character varying(100),
    surname character varying(100),
    email character varying(255),
    is_verified boolean DEFAULT false,
    activation_code character varying(64),
    community character varying,
    student_no character varying(20),
    email_verified boolean DEFAULT false NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 88183)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 3808 (class 0 OID 0)
-- Dependencies: 215
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 3635 (class 2604 OID 88185)
-- Name: birimler id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.birimler ALTER COLUMN id SET DEFAULT nextval('public.birimler_id_seq'::regclass);


--
-- TOC entry 3636 (class 2604 OID 88186)
-- Name: events id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events ALTER COLUMN id SET DEFAULT nextval('public.etkinlikler_etkinlik_id_seq'::regclass);


--
-- TOC entry 3637 (class 2604 OID 88187)
-- Name: hata_noktalar id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hata_noktalar ALTER COLUMN id SET DEFAULT nextval('public.hata_noktalar_id_seq'::regclass);


--
-- TOC entry 3640 (class 2604 OID 88188)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 3790 (class 0 OID 88151)
-- Dependencies: 208
-- Data for Name: birimler; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.birimler VALUES ('g4MzE', '0101000020E61000003E761728295E404041F163CC5DEF4340', 'Yıldız Amfi', '-', NULL, NULL, NULL);
INSERT INTO public.birimler VALUES ('A5OTc', '0101000020E6100000010000A2585E40408ABDF73760EF4340', 'Aktüerya Bilimleri Bölümü', '-', 'https://aktuerya.hacettepe.edu.tr/', ' (0312) 297 6160 ve (0312) 297 6234', NULL);
INSERT INTO public.birimler VALUES ('c3MTI', '0101000020E6100000010000F0835D40407E2AC287A8EF4340', 'Spor Bilimleri Fakültesi', '-', 'https://sporbilimleri.hacettepe.edu.tr/', '+90 312 297 68 90', NULL);
INSERT INTO public.birimler VALUES ('c3NjI', '0101000020E610000025E659492B5E4040AC00DF6DDEEE4340', 'Güzel Sanatlar Fakültesi', '-', 'https://gsf.hacettepe.edu.tr/', '0312 297 68 40-41', NULL);
INSERT INTO public.birimler VALUES ('c4MDA', '0101000020E610000076DEC666475E4040ABE7A4F78DEF4340', 'Bilgisayar ve Yapay Zeka Mühendisliği', '-', 'https://cs.hacettepe.edu.tr/', '(+90) 312 297 75 00', NULL);
INSERT INTO public.birimler VALUES ('E3NjU', '0101000020E6100000B6F7A92A345E40409BC761307FEF4340', 'Çevre Mühendisliği', '-', 'https://cevre.hacettepe.edu.tr/tr', '(312) 2977800', NULL);
INSERT INTO public.birimler VALUES ('EwMzc', '0101000020E610000065A71FD4455E404019709692E5EE4340', 'Güzel Sanatlar Enstitüsü', '-', 'https://gse.hacettepe.edu.tr/', '+90 (0312) 297 87 54', NULL);
INSERT INTO public.birimler VALUES ('g0NzA', '0101000020E6100000B29B19FD685E4040EFA83121E6EE4340', 'Gıda Mühendisliği', '-', 'https://food.hacettepe.edu.tr/', '(0312) 297 71 00 (0312) 297 71 10', NULL);
INSERT INTO public.birimler VALUES ('gxMjI', '0101000020E6100000D8F15F20085E404015713AC956EF4340', 'Elektrik ve Elektronik Mühendisliği', '-', 'https://www.ee.hacettepe.edu.tr/', '(+90) (312) 297 7000', NULL);
INSERT INTO public.birimler VALUES ('I0MDI', '0101000020E610000096CD1C925A5E40405CE333D93FEF4340', 'Kimya Mühendisliği', '-', 'https://cheng.hacettepe.edu.tr/', '+90 312 297 74 00 - 01', NULL);
INSERT INTO public.birimler VALUES ('kwNDc', '0101000020E6100000F85278D0EC5E40407D923B6C22EF4340', 'Endüstri Mühendisliği', '-', 'https://ie.hacettepe.edu.tr/ ', '+90  312 297 8950 - 297 8951', NULL);
INSERT INTO public.birimler VALUES ('kyMTA', '0101000020E61000004D2EC6C03A5E40402A37514B73EF4340', 'Yer Bilimleri Binası', '-', 'https://yuvam.hacettepe.edu.tr/', NULL, NULL);
INSERT INTO public.birimler VALUES ('kzMjk', '0101000020E61000003BC3D4963A5E4040D40CA9A278EF4340', 'Maden Mühendisliği', '-', 'https://maden.hacettepe.edu.tr/', '+90 312 297 76 00', NULL);
INSERT INTO public.birimler VALUES ('M1Mjk', '0101000020E61000005039268BFB5D4040CA6FD1C952EF4340', 'Nükleer Enerji Mühendisliği', '-', 'https://nuke.hacettepe.edu.tr/', '+90 312 297 73 00', NULL);
INSERT INTO public.birimler VALUES ('M3NDI', '0101000020E61000007D2079E7505E40400ED76A0F7BEF4340', 'Jeoloji Mühendisliği', '-', 'https://jeomuh.hacettepe.edu.tr/', '90 (312) 297 77 00', NULL);
INSERT INTO public.birimler VALUES ('M5OTA', '0101000020E61000006286C613415E40409225732CEFEE4340', 'Heykel Bölümü', '-', 'https://heykel.hacettepe.edu.tr/', '312 297 87 75 – 297 87 76 – 297 87 77', NULL);
INSERT INTO public.birimler VALUES ('QyMzY', '0101000020E610000085798F334D5E4040D1B1834A5CEF4340', 'İstatistik Bölümü', '-', 'https://stat.hacettepe.edu.tr/', ' 0 312 297 79 00', NULL);
INSERT INTO public.birimler VALUES ('U0MDQ', '0101000020E6100000FD69A33A1D5E4040535E2BA1BBEE4340', 'Yabancı Diller Yüksekokulu', '-', 'https://ydyo.hacettepe.edu.tr/', '(0312) 297 80 85', NULL);
INSERT INTO public.birimler VALUES ('U1NzM', '0101000020E6100000C4995FCD015E4040AF3F89CF9DEE4340', 'İnşaat Mühendisliği', '-', 'https://ce.hacettepe.edu.tr/', '+90 312 297 73 28', NULL);
INSERT INTO public.birimler VALUES ('U1ODU', '0101000020E61000006743FE99415E4040FCA6B05241EF4340', 'Kimya Bölümü', '-', 'https://chem.hacettepe.edu.tr/', '+90-312-297-7940', NULL);
INSERT INTO public.birimler VALUES ('UyNjA', '0101000020E610000082751C3F545E4040BAA0BE654EEF4340', 'Matematik Bölümü', '-', 'https://mat.hacettepe.edu.tr/', '+90 312 297 78 50', NULL);
INSERT INTO public.birimler VALUES ('Y0MjQ', '0101000020E610000029EACC3D245E4040B8C9A8328CEF4340', 'Biyoloji Bölümü', '-', 'https://biology.hacettepe.edu.tr/ ', ' +90 (312) 297 8000', NULL);
INSERT INTO public.birimler VALUES ('Y1Mjk', '0101000020E6100000B7EBA529025E404021CA17B490EE4340', 'Makine Mühedisliği', '-', 'https://me.hacettepe.edu.tr/tr', '+90 (312) 297-6207 / 08', NULL);
INSERT INTO public.birimler VALUES ('Y1NTY', '0101000020E6100000A9674128EF5D40402E3D9AEAC9EE4340', 'Harita Mühendisliği', '-', 'https://geomatik.hacettepe.edu.tr/', '+90 (312) 297 69 90', NULL);
INSERT INTO public.birimler VALUES ('Y3MTk', '0101000020E6100000402FDCB9305E40403CBF28417FEF4340', 'Fen Bilimleri Enstitüsü', '-', 'https://fenbilimleri.hacettepe.edu.tr/', '0 (312) 297 68 66-67', NULL);
INSERT INTO public.birimler VALUES ('YxNDc', '0101000020E61000001F9F909DB75D40404D4A41B797EE4340', 'Hukuk Fakültesi', '-', 'https://hukukfakultesi.hacettepe.edu.tr/', '+90 312 297 62 70-71', NULL);
INSERT INTO public.birimler VALUES ('YxOTU', '0101000020E610000036E9B6442E5E404043ACFE08C3EE4340', 'İktisadi ve İdari Bilimler Fakültesi', '-', 'https://iibf.hacettepe.edu.tr/', '0 312 297 68 30 31 32', NULL);


--
-- TOC entry 3792 (class 0 OID 88159)
-- Dependencies: 210
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.events VALUES (52, 'gdsfgsdg', '2025-05-17', '23:17:00', 'sdsad', 'Workshop', 'fesfd', 'fsdfsd', NULL, '0101000020E610000001000098715E4040086D2C2036EF4340', 47, 'https://www.1003.com', '/uploads/events/1-1747415659773.jpeg');
INSERT INTO public.events VALUES (53, 'fsaasd', '2025-05-20', '08:14:00', 'gegsdfs', 'Sports', 'fesfd', 'ömnöm', NULL, '0101000020E6100000010000D8F55D4040178CD636C9F04340', 47, 'https://www.1004.com', '/uploads/events/birimler-1747451590023.PNG');
INSERT INTO public.events VALUES (54, 'fdfs', '2025-05-21', '09:18:00', 'sdsad', 'Expo', 'hhfdh', 'fdgfd', NULL, '0101000020E610000001000038F05D4040EEE6AAB8CCF04340', 47, 'www.A15.COM', '/uploads/events/google_haritalar-1747451654535.PNG');
INSERT INTO public.events VALUES (55, 'maç', '2025-05-20', '10:07:00', 'hhh', 'Concert', 'dasd', 'assss', NULL, '0101000020E610000096C8D625DE5D4040BFD93C022AEF4340', 47, 'https://www.1006.com', '/uploads/events/Ekran AlÄ±ntÄ±sÄ±_1-1747627446380.PNG');


--
-- TOC entry 3794 (class 0 OID 88167)
-- Dependencies: 212
-- Data for Name: hata_noktalar; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.hata_noktalar VALUES (2, 'Gökdemir Çardak', 'Altyapı', 'Yol çalışması var', '0101000020E6100000CDCCCCCCCC6C40403333333333F34340', 47);
INSERT INTO public.hata_noktalar VALUES (3, 'SELECT (1=1); DROP TABLE hata_noktalar; --', 'Deneme', 'SQL Injection Denemesi', '0101000020E6100000CDCCCCCCCC6C40403333333333F34340', 47);
INSERT INTO public.hata_noktalar VALUES (4, 'SELECT 1=1; DROP TABLE hata_noktalar; --', 'Deneme', 'SQL Injection Denemesi', '0101000020E6100000CDCCCCCCCC6C40403333333333F34340', 47);
INSERT INTO public.hata_noktalar VALUES (8, 'Ahmet Yılmaz', 'Yol Bozukluğu', 'Parkın yanındaki yol bozuk.', '0101000020E6100000B9162D40DB5E40406B0BCF4BC5EE4340', 47);
INSERT INTO public.hata_noktalar VALUES (7, 'BDFSDFS', 'FSDFSD', 'nnnn', NULL, 47);
INSERT INTO public.hata_noktalar VALUES (14, 'sgsdg', 'sdsadas', 'gdsgsd', NULL, 47);
INSERT INTO public.hata_noktalar VALUES (13, 'Gökdemir Çardak', 'sgdgsd', 'gdsgsd', NULL, 47);
INSERT INTO public.hata_noktalar VALUES (9, 'Gökdemir Çardak', 'dasdas', 'dasdasd', NULL, 47);
INSERT INTO public.hata_noktalar VALUES (11, 'sadsasss', 'dsadas', 'dasdasda', NULL, 47);
INSERT INTO public.hata_noktalar VALUES (16, 'sddddd', 'dddd', 'ddddd', '0101000020E6100000010000C8BA5D40408676D9EF9DEE4340', 47);
INSERT INTO public.hata_noktalar VALUES (1, 'Gökdemir Çardak', 'dsadsa', 'dasdsad', '0101000020E6100000010000781A5D40406A74D2EBFCEE4340', 47);
INSERT INTO public.hata_noktalar VALUES (19, 'czxcxz', 'ccc', 'ccc', '0101000020E610000001000040AB5E4040BDA4E6AAE1EE4340', 47);
INSERT INTO public.hata_noktalar VALUES (23, 'dsad', 'dasda', 'dsada', '0101000020E6100000010000D0C15D404004DBEA8A3EF04340', 47);
INSERT INTO public.hata_noktalar VALUES (24, 'fsaf', 'sss', 'aada', '0101000020E6100000F598EED9105E40402DD74B15CFEF4340', 47);
INSERT INTO public.hata_noktalar VALUES (25, 'das', 'asda', 'asdasda', '0101000020E61000001DAD5AC6E35D4040071FD1E1BCEF4340', 47);
INSERT INTO public.hata_noktalar VALUES (26, 'sadas', 'fsaf', 'ffffffff', '0101000020E6100000010000F0CF5C4040C5B1BA7D2DEF4340', 47);


--
-- TOC entry 3633 (class 0 OID 87392)
-- Dependencies: 204
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 3796 (class 0 OID 88175)
-- Dependencies: 214
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users VALUES (42, 'superadmin', '$2b$10$FQkOIMRS2txWcy2HAGizJ.XiLC4Ps.X451Y0sIq1UHvEMkn5IX1UC', 'supervisor', 'System', 'Supervisor', 'supervisor@example.com', true, 'ABC123XYZ789', NULL, NULL, true);
INSERT INTO public.users VALUES (47, 'gcardak', '$2b$10$TnUNf55qrr7Wow8IeSZFWe8L1GoWMiWTIdgi2tYsFn.DdlYRusMai', 'admin', 'Gökdemir', 'Çardak', 'gcardak60@gmail.com', true, NULL, 'Harita Mühendisliği', 'N22135991', true);


--
-- TOC entry 3809 (class 0 OID 0)
-- Dependencies: 209
-- Name: birimler_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.birimler_id_seq', 4, true);


--
-- TOC entry 3810 (class 0 OID 0)
-- Dependencies: 211
-- Name: etkinlikler_etkinlik_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.etkinlikler_etkinlik_id_seq', 55, true);


--
-- TOC entry 3811 (class 0 OID 0)
-- Dependencies: 213
-- Name: hata_noktalar_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.hata_noktalar_id_seq', 26, true);


--
-- TOC entry 3812 (class 0 OID 0)
-- Dependencies: 215
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 47, true);


--
-- TOC entry 3645 (class 2606 OID 88190)
-- Name: birimler birimler_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.birimler
    ADD CONSTRAINT birimler_pkey PRIMARY KEY (id);


--
-- TOC entry 3647 (class 2606 OID 88192)
-- Name: events etkinlikler_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT etkinlikler_pkey PRIMARY KEY (id);


--
-- TOC entry 3649 (class 2606 OID 88194)
-- Name: hata_noktalar hata_noktalar_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hata_noktalar
    ADD CONSTRAINT hata_noktalar_pkey PRIMARY KEY (id);


--
-- TOC entry 3651 (class 2606 OID 88196)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 3653 (class 2606 OID 88198)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3655 (class 2606 OID 88200)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 3656 (class 2606 OID 88201)
-- Name: birimler fk_birimler_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.birimler
    ADD CONSTRAINT fk_birimler_user FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3657 (class 2606 OID 88206)
-- Name: events fk_etkinlik_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT fk_etkinlik_user FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3658 (class 2606 OID 88211)
-- Name: hata_noktalar fk_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hata_noktalar
    ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users(id);


-- Completed on 2025-05-22 06:39:29

--
-- PostgreSQL database dump complete
--

