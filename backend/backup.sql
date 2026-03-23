--
-- PostgreSQL database dump
--

\restrict D21ueEA0jStJgDi1E22HdhMI72XZNda3cVr37VrcXtVTHUKGW6Xbx2XNNaKIArC

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: invoices_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.invoices_status_enum AS ENUM (
    'Unpaid',
    'Paid',
    'Refunded'
);


ALTER TYPE public.invoices_status_enum OWNER TO postgres;

--
-- Name: purchase_orders_paymentstatus_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.purchase_orders_paymentstatus_enum AS ENUM (
    'Unpaid',
    'Paid'
);


ALTER TYPE public.purchase_orders_paymentstatus_enum OWNER TO postgres;

--
-- Name: purchase_orders_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.purchase_orders_status_enum AS ENUM (
    'Pending',
    'Received',
    'Cancelled'
);


ALTER TYPE public.purchase_orders_status_enum OWNER TO postgres;

--
-- Name: return_requests_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.return_requests_status_enum AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public.return_requests_status_enum OWNER TO postgres;

--
-- Name: sales_orders_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.sales_orders_status_enum AS ENUM (
    'Pending',
    'Confirmed',
    'Shipped',
    'Delivered',
    'Cancelled'
);


ALTER TYPE public.sales_orders_status_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "userId" uuid,
    action character varying NOT NULL,
    resource character varying NOT NULL,
    "resourceId" character varying,
    "oldData" jsonb,
    "newData" jsonb,
    "ipAddress" character varying,
    "userAgent" text,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    "parentId" uuid
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: coupons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.coupons (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    code character varying NOT NULL,
    "discountType" character varying(20) NOT NULL,
    "discountValue" numeric(14,2) NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    label character varying(120),
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.coupons OWNER TO postgres;

--
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    email character varying(255),
    phone character varying(50),
    address text,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- Name: discount_tiers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.discount_tiers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "productId" uuid NOT NULL,
    "minQuantity" integer NOT NULL,
    "discountPercent" integer NOT NULL,
    label character varying(120)
);


ALTER TABLE public.discount_tiers OWNER TO postgres;

--
-- Name: inventory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "productId" uuid NOT NULL,
    quantity integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "expiryDate" date
);


ALTER TABLE public.inventory OWNER TO postgres;

--
-- Name: inventory_movements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_movements (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "productId" uuid NOT NULL,
    "quantityDelta" integer NOT NULL,
    type character varying(50) NOT NULL,
    "referenceType" character varying(50),
    "referenceId" uuid,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.inventory_movements OWNER TO postgres;

--
-- Name: invoices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoices (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "salesOrderId" uuid NOT NULL,
    "customerId" uuid NOT NULL,
    amount numeric(14,2) NOT NULL,
    status public.invoices_status_enum DEFAULT 'Unpaid'::public.invoices_status_enum NOT NULL,
    "invoiceNumber" character varying(50),
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "paidAmount" numeric(14,2) DEFAULT '0'::numeric NOT NULL
);


ALTER TABLE public.invoices OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    type character varying NOT NULL,
    "productId" uuid,
    message text NOT NULL,
    read boolean DEFAULT false NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "invoiceId" uuid
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "invoiceId" uuid NOT NULL,
    amount numeric(14,2) NOT NULL,
    method character varying(50) NOT NULL,
    "paidAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    code character varying NOT NULL,
    module character varying NOT NULL,
    description character varying,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- Name: product_variants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_variants (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "productId" uuid NOT NULL,
    sku character varying NOT NULL,
    attributes jsonb,
    "stockLevel" integer DEFAULT 0 NOT NULL,
    "reorderPoint" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.product_variants OWNER TO postgres;

--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    description text,
    sku character varying NOT NULL,
    "categoryId" uuid NOT NULL,
    "stockLevel" integer DEFAULT 0 NOT NULL,
    "reorderPoint" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "sellingPrice" numeric(14,2),
    "costPrice" numeric(14,2),
    "minStockLevel" integer,
    "lowStockAlertSent" boolean DEFAULT false NOT NULL
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: purchase_order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_order_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "purchaseOrderId" uuid NOT NULL,
    "productId" uuid NOT NULL,
    quantity integer NOT NULL,
    "unitPrice" numeric(14,2) NOT NULL
);


ALTER TABLE public.purchase_order_items OWNER TO postgres;

--
-- Name: purchase_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_orders (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "supplierId" uuid NOT NULL,
    status public.purchase_orders_status_enum DEFAULT 'Pending'::public.purchase_orders_status_enum NOT NULL,
    "totalPrice" numeric(14,2) DEFAULT '0'::numeric NOT NULL,
    "paymentStatus" public.purchase_orders_paymentstatus_enum DEFAULT 'Unpaid'::public.purchase_orders_paymentstatus_enum NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.purchase_orders OWNER TO postgres;

--
-- Name: return_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.return_requests (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "salesOrderId" uuid NOT NULL,
    "productId" uuid NOT NULL,
    quantity integer NOT NULL,
    reason character varying(500),
    status public.return_requests_status_enum DEFAULT 'PENDING'::public.return_requests_status_enum NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.return_requests OWNER TO postgres;

--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_permissions (
    "roleId" uuid NOT NULL,
    "permissionId" uuid NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    description character varying,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: sales_order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales_order_items (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "salesOrderId" uuid NOT NULL,
    "productId" uuid NOT NULL,
    quantity integer NOT NULL,
    "unitPrice" numeric(14,2) NOT NULL,
    "baseUnitPrice" numeric(14,2) DEFAULT '0'::numeric NOT NULL,
    "tierDiscountPercent" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.sales_order_items OWNER TO postgres;

--
-- Name: sales_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales_orders (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "customerId" uuid NOT NULL,
    status public.sales_orders_status_enum DEFAULT 'Pending'::public.sales_orders_status_enum NOT NULL,
    "totalAmount" numeric(14,2) DEFAULT '0'::numeric NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "subtotalBeforeCoupon" numeric(14,2) DEFAULT '0'::numeric NOT NULL,
    "couponDiscountAmount" numeric(14,2) DEFAULT '0'::numeric NOT NULL,
    "couponCode" character varying(40)
);


ALTER TABLE public.sales_orders OWNER TO postgres;

--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.suppliers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying NOT NULL,
    email character varying(255),
    phone character varying(50),
    address text,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.suppliers OWNER TO postgres;

--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_roles (
    "userId" uuid NOT NULL,
    "roleId" uuid NOT NULL
);


ALTER TABLE public.user_roles OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying NOT NULL,
    "passwordHash" character varying NOT NULL,
    name character varying NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, "userId", action, resource, "resourceId", "oldData", "newData", "ipAddress", "userAgent", "createdAt") FROM stdin;
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, "parentId") FROM stdin;
5f85fe40-2fb3-4d6f-80b2-eba0f30015a1	Electronics	\N
3b79a621-14ff-40fc-bf2d-8087e477a288	clothes	\N
ded44b0e-3566-411d-88ee-616aec2415d9	jwellary	\N
\.


--
-- Data for Name: coupons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.coupons (id, code, "discountType", "discountValue", "isActive", label, "createdAt") FROM stdin;
5c2813e6-259b-4757-a8eb-f115429b34e9	SAVE10	percent	10.00	t	\N	2026-03-19 15:00:57.927946
c5b5046e-a03c-4b49-bd34-134ede708ab1	SAVE20	percent	10.00	t	\N	2026-03-20 10:21:45.221424
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (id, name, email, phone, address, "createdAt", "updatedAt") FROM stdin;
831ea373-ef3d-4a41-a558-4903d5a961fe	Ankaj customer	ankaj@gmail.com	123456789	Vadodara	2026-03-17 16:33:07.597557	2026-03-17 16:33:07.597557
bd9cc7ab-7197-4116-81d2-1d0def00ff6e	customer 1	c1@gmail.com	1234567890	Gujrat	2026-03-18 11:35:54.039273	2026-03-18 11:35:54.039273
fa5e0582-cdd0-4aaa-98a1-1585bab0f891	customer-2	c2@gmail.com	123456789	Udaipur	2026-03-18 12:17:33.255872	2026-03-18 12:17:33.255872
\.


--
-- Data for Name: discount_tiers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.discount_tiers (id, "productId", "minQuantity", "discountPercent", label) FROM stdin;
5874a75e-06e0-4267-9af2-d1d23de249c5	154aa144-a2d3-4981-9d26-3d5cc3a78395	6	5	\N
\.


--
-- Data for Name: inventory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory (id, "productId", quantity, "createdAt", "updatedAt", "expiryDate") FROM stdin;
581c3986-645e-4a5f-8829-3e7cfc57cdff	42a68995-8372-420f-a440-c8b62c788315	1	2026-03-17 16:30:43.865714	2026-03-18 12:19:14.498385	2026-03-26
c191fae2-a524-4812-903e-0c240257f826	c7813de4-a9bc-4bed-ad3c-5e51d7a9dace	0	2026-03-18 12:14:28.836107	2026-03-18 17:02:09.315914	\N
2c1b8318-54e5-46f6-9979-d8478ada71c3	ef70e078-c630-4b3f-bed4-86fb39c46d31	3	2026-03-17 16:40:24.108957	2026-03-18 17:15:35.661153	\N
e7ae818d-6710-44c1-978f-bc83e845b458	154aa144-a2d3-4981-9d26-3d5cc3a78395	6	2026-03-17 19:18:37.82499	2026-03-19 15:03:07.413325	\N
\.


--
-- Data for Name: inventory_movements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_movements (id, "productId", "quantityDelta", type, "referenceType", "referenceId", "createdAt") FROM stdin;
3c78c9b8-095e-492c-a175-86359099532d	42a68995-8372-420f-a440-c8b62c788315	10	PURCHASE_RECEIPT	purchase_order	ebeb4c84-37cc-499c-9ec6-cbe09ccc2d57	2026-03-17 16:30:43.909171
cb41b390-ce55-44d8-be05-b2fd07de0832	42a68995-8372-420f-a440-c8b62c788315	-3	SALE	sales_order	f19b48b8-ffb3-45eb-a894-50abfb8cd63e	2026-03-17 16:34:06.350182
ff8d9da1-5311-4a82-a3b7-578055e17c57	42a68995-8372-420f-a440-c8b62c788315	1	RETURN	RETURN_REQUEST	19dae4aa-b16a-4d92-b58f-daf548187d2e	2026-03-17 16:37:36.032197
3884422c-3a90-4ee2-84a0-4a50764d1f10	ef70e078-c630-4b3f-bed4-86fb39c46d31	10	PURCHASE_RECEIPT	purchase_order	6210f8ec-3dee-4085-9a9c-9ec0e91e3963	2026-03-17 16:40:24.126978
79cd53f5-f730-44cf-a074-865c8ef4c78f	ef70e078-c630-4b3f-bed4-86fb39c46d31	-3	SALE	sales_order	7217cb10-3fe1-42b1-9f3e-2cb1868b7545	2026-03-17 16:40:37.229441
1aad3527-11c7-4ede-948c-d9215e4630fd	ef70e078-c630-4b3f-bed4-86fb39c46d31	2	RETURN	RETURN_REQUEST	026e8a0d-e9bb-4389-98e7-172f7f240e91	2026-03-17 16:45:24.538062
78d1cf4d-b9c1-43ec-8988-18ed9582cddd	154aa144-a2d3-4981-9d26-3d5cc3a78395	2	PURCHASE_RECEIPT	purchase_order	4a464689-6d1d-479c-92de-2a6e5a52a5c0	2026-03-17 19:18:37.884785
35b87bac-17f2-4674-bcc3-8e80a7318281	154aa144-a2d3-4981-9d26-3d5cc3a78395	-2	SALE	sales_order	25aa3156-ad17-4b69-9384-f8ccbc66b0fa	2026-03-17 19:20:03.328701
ae3a2bc6-d1e5-4930-8f25-221ae49dcc7f	154aa144-a2d3-4981-9d26-3d5cc3a78395	5	PURCHASE_RECEIPT	purchase_order	8fe7b7c9-d7fb-4913-b821-1f14dbc9d50d	2026-03-18 11:49:45.769022
d4d67a72-4c07-4aaf-9f61-fe0268288a68	154aa144-a2d3-4981-9d26-3d5cc3a78395	-3	SALE	sales_order	660e95d7-80a8-420f-8376-a337012489c5	2026-03-18 11:49:56.902438
730e1067-2fc7-45db-a74c-27a073809bdd	154aa144-a2d3-4981-9d26-3d5cc3a78395	12	PURCHASE_RECEIPT	purchase_order	1a3bd7a1-a730-492f-86b1-99016c8b76f8	2026-03-18 11:51:10.881613
a7a19889-3c7a-4a96-87e0-e056181ea437	154aa144-a2d3-4981-9d26-3d5cc3a78395	-1	SALE	sales_order	c151ff9d-ea7a-42a2-907f-a807e2314a01	2026-03-18 11:52:26.232623
d4115e25-55a2-4a8c-8eeb-35b81383ed23	154aa144-a2d3-4981-9d26-3d5cc3a78395	-12	SALE	sales_order	a9173bbc-97c5-4853-aacd-87c8ed62858e	2026-03-18 11:52:55.653066
9b29b637-50ca-4492-b1eb-2af35e76079d	c7813de4-a9bc-4bed-ad3c-5e51d7a9dace	6	PURCHASE_RECEIPT	purchase_order	edef2151-6058-45b1-8717-f719dffbef4c	2026-03-18 12:14:28.860117
68abde89-064c-4c21-a2e4-9d1ec6b2a025	c7813de4-a9bc-4bed-ad3c-5e51d7a9dace	-5	SALE	sales_order	c83aacd2-8355-42f5-ac8a-5580a59d6166	2026-03-18 12:15:04.7588
deb30489-116c-42d6-81b4-60986e990d80	42a68995-8372-420f-a440-c8b62c788315	-7	SALE	sales_order	ca80a786-a1a6-4fbe-8b67-3327016bccca	2026-03-18 12:19:14.511417
1c4e917c-0216-45f2-9ba7-6cdb5756d5a7	c7813de4-a9bc-4bed-ad3c-5e51d7a9dace	-1	SALE	sales_order	68f7eee0-6094-4614-af8a-e7459e7d52cb	2026-03-18 17:02:09.354171
c4020d14-5284-4a4f-9a9b-1aa95cbf93d6	ef70e078-c630-4b3f-bed4-86fb39c46d31	-4	SALE	sales_order	d4534118-1596-40b2-a2e9-5d4a044d0cd8	2026-03-18 17:09:52.635591
9491a483-7055-457e-a057-9807bb0da1e1	ef70e078-c630-4b3f-bed4-86fb39c46d31	-2	SALE	sales_order	285fc451-4f09-464f-928a-ca5c999b89a2	2026-03-18 17:15:35.676547
92ddca85-d0e9-4a0c-a4f4-f03574a3b4cd	154aa144-a2d3-4981-9d26-3d5cc3a78395	10	PURCHASE_RECEIPT	purchase_order	994341b0-f50d-4fbf-8580-cfd89510d1ae	2026-03-19 14:57:45.703022
a9a5abe7-d2d2-468c-8d0c-717e1c64093b	154aa144-a2d3-4981-9d26-3d5cc3a78395	-5	SALE	sales_order	37fd8f8f-8385-48ff-8a03-7d76fdb8e34b	2026-03-19 15:03:07.426944
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoices (id, "salesOrderId", "customerId", amount, status, "invoiceNumber", "createdAt", "updatedAt", "paidAmount") FROM stdin;
e4bec4bd-b663-49fc-bbd2-573907bd4b1b	f19b48b8-ffb3-45eb-a894-50abfb8cd63e	831ea373-ef3d-4a41-a558-4903d5a961fe	150000.00	Refunded	INV-1773745451168-OIGI4C	2026-03-17 16:34:11.170885	2026-03-17 16:37:36.01792	0.00
4a54e556-41af-4569-93da-56a4c92c7f60	7217cb10-3fe1-42b1-9f3e-2cb1868b7545	831ea373-ef3d-4a41-a558-4903d5a961fe	75000.00	Refunded	INV-1773745838442-ZIIG1H	2026-03-17 16:40:38.443238	2026-03-17 16:45:24.521406	0.00
212c4494-86ca-47b3-a3db-8cb1c595e93a	25aa3156-ad17-4b69-9384-f8ccbc66b0fa	831ea373-ef3d-4a41-a558-4903d5a961fe	1200.00	Paid	INV-1773755405117-ZCSK0D	2026-03-17 19:20:05.11938	2026-03-17 19:20:15.299274	0.00
4d7ca672-3a90-4636-8c91-58db6ab4db4e	660e95d7-80a8-420f-8376-a337012489c5	bd9cc7ab-7197-4116-81d2-1d0def00ff6e	1800.00	Paid	INV-1773814798359-GISVF4	2026-03-18 11:49:58.360852	2026-03-18 11:50:08.105947	0.00
290b8b50-732c-4b6b-b105-543af8aceb54	c151ff9d-ea7a-42a2-907f-a807e2314a01	bd9cc7ab-7197-4116-81d2-1d0def00ff6e	600.00	Paid	INV-1773814947291-VVJFZI	2026-03-18 11:52:27.292715	2026-03-18 11:52:33.809189	0.00
2aeba125-603f-46a0-94d6-9e5a09f7fc66	a9173bbc-97c5-4853-aacd-87c8ed62858e	bd9cc7ab-7197-4116-81d2-1d0def00ff6e	7200.00	Paid	INV-1773814977170-FFH7CQ	2026-03-18 11:52:57.1712	2026-03-18 11:53:02.732283	0.00
ea176314-2b11-4aea-bf96-cac7d154eecd	c83aacd2-8355-42f5-ac8a-5580a59d6166	bd9cc7ab-7197-4116-81d2-1d0def00ff6e	3500.00	Paid	INV-1773816306638-PV7K00	2026-03-18 12:15:06.638934	2026-03-18 12:15:12.973542	0.00
36cac22c-1236-478b-9cc0-07d4d3b1dc86	ca80a786-a1a6-4fbe-8b67-3327016bccca	fa5e0582-cdd0-4aaa-98a1-1585bab0f891	350000.00	Paid	INV-1773816556943-8T9QOB	2026-03-18 12:19:16.943819	2026-03-18 12:19:25.877188	0.00
adee3774-61cf-4b91-adec-db157fcfe6e8	68f7eee0-6094-4614-af8a-e7459e7d52cb	fa5e0582-cdd0-4aaa-98a1-1585bab0f891	700.00	Paid	INV-1773833530956-033XUV	2026-03-18 17:02:10.960421	2026-03-18 17:07:17.473334	0.00
2f516193-27a1-430f-b0da-888cd04c8c78	d4534118-1596-40b2-a2e9-5d4a044d0cd8	fa5e0582-cdd0-4aaa-98a1-1585bab0f891	100000.00	Paid	INV-1773833994588-DTT7UA	2026-03-18 17:09:54.590198	2026-03-18 17:11:33.357365	100000.00
0b277873-0813-4425-8ee5-39483a601916	285fc451-4f09-464f-928a-ca5c999b89a2	bd9cc7ab-7197-4116-81d2-1d0def00ff6e	50000.00	Paid	INV-1773834337144-Q47E0M	2026-03-18 17:15:37.145392	2026-03-18 17:16:51.895243	50000.00
400f4f8a-1734-447e-91b7-20ae3347363a	37fd8f8f-8385-48ff-8a03-7d76fdb8e34b	bd9cc7ab-7197-4116-81d2-1d0def00ff6e	2700.00	Unpaid	INV-1773912789404-A7RX3J	2026-03-19 15:03:09.404763	2026-03-19 15:03:24.086311	2000.00
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, type, "productId", message, read, "createdAt", "invoiceId") FROM stdin;
0431d41f-4075-4abb-8602-5a30ac36a19b	low_stock	c7813de4-a9bc-4bed-ad3c-5e51d7a9dace	Low stock: Headphones (HPH-WT). Current: 3, threshold: 10	t	2026-03-18 12:30:42.851781	\N
3a5efd76-bfcc-453c-ab99-cd32e8c84146	low_stock	154aa144-a2d3-4981-9d26-3d5cc3a78395	Low stock: Tshirts (TSH-BL). Current: 4, threshold: 5	f	2026-03-18 12:40:18.250132	\N
51195a53-e0da-4cc8-b91f-db5cfa2c71d6	low_stock	bbf70bb6-f751-455a-8708-a838328ffcee	Low stock: Charger (CH-BL). Current: 0, threshold: 4	f	2026-03-18 12:40:18.280389	\N
c604ba19-d4a6-440f-a499-d1177ea8c3de	due_payment	\N	Invoice #INV-1773833994588-DTT7UA has ₹20,000 pending	t	2026-03-18 17:10:13.041913	2f516193-27a1-430f-b0da-888cd04c8c78
b361c8ff-3e95-48dd-bc87-a5e5205deb6e	due_payment	\N	Invoice #INV-1773745838442-ZIIG1H has ₹75,000 pending	t	2026-03-18 17:10:32.418411	4a54e556-41af-4569-93da-56a4c92c7f60
016aec72-e194-44ba-9ccc-7ff50067c33e	due_payment	\N	Invoice #INV-1773745451168-OIGI4C has ₹1,50,000 pending	t	2026-03-18 17:10:32.411241	e4bec4bd-b663-49fc-bbd2-573907bd4b1b
e2691831-12ed-4c5f-9591-7a95a91a2ece	due_payment	\N	Invoice #INV-1773833994588-DTT7UA has ₹1,00,000 pending	t	2026-03-18 17:09:54.623104	2f516193-27a1-430f-b0da-888cd04c8c78
12c49371-dc6a-4b7d-b320-4c7b5c8c21cb	due_payment	\N	Payment pending for Vivo mobile - ₹50,000	t	2026-03-18 17:15:37.181306	0b277873-0813-4425-8ee5-39483a601916
914b8655-3ced-4459-8f56-07e67ab7e22f	due_payment	\N	Payment pending for Vivo mobile - ₹10,000	t	2026-03-18 17:15:50.586027	0b277873-0813-4425-8ee5-39483a601916
3a5ba4b6-a244-4319-8c8f-add6e5e30cf4	due_payment	\N	Payment pending for Tshirts - ₹2,700	f	2026-03-19 15:03:09.476132	400f4f8a-1734-447e-91b7-20ae3347363a
238c1fa7-b0c9-42b3-b0bf-c0602854505f	due_payment	\N	Payment pending for Tshirts - ₹700	t	2026-03-19 15:03:24.089352	400f4f8a-1734-447e-91b7-20ae3347363a
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, "invoiceId", amount, method, "paidAt") FROM stdin;
dfb635b6-dbd0-46da-9704-1af2b986a591	e4bec4bd-b663-49fc-bbd2-573907bd4b1b	150000.00	Card	2026-03-17 16:34:38.935528
b770ae63-60c3-45b1-ba6f-9041866fc401	4a54e556-41af-4569-93da-56a4c92c7f60	75000.00	Cash	2026-03-17 16:40:49.486268
278f310d-a93f-40cc-b342-4885a3cb7bd3	212c4494-86ca-47b3-a3db-8cb1c595e93a	1200.00	Cash	2026-03-17 19:20:15.285436
413f9e1a-dbcb-4f29-b13e-2e7e8cafd643	4d7ca672-3a90-4636-8c91-58db6ab4db4e	1800.00	Card	2026-03-18 11:50:08.094702
f8084fd3-52d3-4aec-862d-abc699cd37d9	290b8b50-732c-4b6b-b105-543af8aceb54	600.00	Cash	2026-03-18 11:52:33.803455
3cf710b9-4f0d-4425-b3ad-3861e305c267	2aeba125-603f-46a0-94d6-9e5a09f7fc66	7200.00	Bank	2026-03-18 11:53:02.725203
ebb5df6b-e162-4d19-b4e0-9b269dbf8e89	ea176314-2b11-4aea-bf96-cac7d154eecd	3500.00	Card	2026-03-18 12:15:12.964549
6f1ccddb-66d5-4af0-ac33-83f432d5b78e	36cac22c-1236-478b-9cc0-07d4d3b1dc86	350000.00	Bank	2026-03-18 12:19:25.86933
4ddede1e-42bf-4947-84d1-884d52e117f4	adee3774-61cf-4b91-adec-db157fcfe6e8	700.00	Card	2026-03-18 17:07:17.405985
42d6eaba-d154-495f-9fc5-971b657cf066	2f516193-27a1-430f-b0da-888cd04c8c78	80000.00	Bank	2026-03-18 17:10:13.024548
7b31f0a2-c179-48c1-b617-afd81c6c4915	2f516193-27a1-430f-b0da-888cd04c8c78	20000.00	Cash	2026-03-18 17:11:33.343011
043061f2-96d9-4ae8-899a-758979f701e4	0b277873-0813-4425-8ee5-39483a601916	40000.00	Cash	2026-03-18 17:15:50.571417
a51c3d81-ab35-4e35-9254-2dc85326bbfb	0b277873-0813-4425-8ee5-39483a601916	10000.00	Cash	2026-03-18 17:16:51.890304
b51584ad-84bd-46e8-9403-1a9f242ca005	400f4f8a-1734-447e-91b7-20ae3347363a	2000.00	Card	2026-03-19 15:03:24.077121
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permissions (id, code, module, description, "createdAt") FROM stdin;
\.


--
-- Data for Name: product_variants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_variants (id, "productId", sku, attributes, "stockLevel", "reorderPoint") FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, name, description, sku, "categoryId", "stockLevel", "reorderPoint", "createdAt", "updatedAt", "sellingPrice", "costPrice", "minStockLevel", "lowStockAlertSent") FROM stdin;
bbf70bb6-f751-455a-8708-a838328ffcee	Charger	qwertyui	CH-BL	5f85fe40-2fb3-4d6f-80b2-eba0f30015a1	0	4	2026-03-18 12:05:22.864006	2026-03-18 12:06:26.807876	100.00	80.00	4	f
42a68995-8372-420f-a440-c8b62c788315	Iphone 15	qwerty	IPH15-BL	5f85fe40-2fb3-4d6f-80b2-eba0f30015a1	11	4	2026-03-17 16:26:47.278328	2026-03-18 12:19:14.508476	50000.00	45000.00	\N	f
c7813de4-a9bc-4bed-ad3c-5e51d7a9dace	Headphones	qwert	HPH-WT	5f85fe40-2fb3-4d6f-80b2-eba0f30015a1	2	10	2026-03-18 12:12:48.907905	2026-03-18 17:02:09.34898	700.00	500.00	\N	t
ef70e078-c630-4b3f-bed4-86fb39c46d31	Vivo mobile	qwertyui	V17-BL	5f85fe40-2fb3-4d6f-80b2-eba0f30015a1	14	5	2026-03-17 16:38:55.252441	2026-03-18 17:15:35.672589	25000.00	20000.00	\N	f
154aa144-a2d3-4981-9d26-3d5cc3a78395	Tshirts	qasdfghjk	TSH-BL	3b79a621-14ff-40fc-bf2d-8087e477a288	15	5	2026-03-17 19:17:10.19516	2026-03-19 15:03:07.423904	600.00	500.00	5	f
\.


--
-- Data for Name: purchase_order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_order_items (id, "purchaseOrderId", "productId", quantity, "unitPrice") FROM stdin;
531ecdc9-61ba-4587-b780-da99c1833019	ebeb4c84-37cc-499c-9ec6-cbe09ccc2d57	42a68995-8372-420f-a440-c8b62c788315	10	45000.00
6ca63253-d8f9-4639-8b31-5f8a1345efff	6210f8ec-3dee-4085-9a9c-9ec0e91e3963	ef70e078-c630-4b3f-bed4-86fb39c46d31	10	20000.00
89ab7611-4c17-4aa5-a8d5-3170787a7657	4a464689-6d1d-479c-92de-2a6e5a52a5c0	154aa144-a2d3-4981-9d26-3d5cc3a78395	2	500.00
de6fc539-28ab-46bb-8442-9a2097851118	8fe7b7c9-d7fb-4913-b821-1f14dbc9d50d	154aa144-a2d3-4981-9d26-3d5cc3a78395	5	500.00
19467777-09a1-48fd-93fd-170eddffcd0d	1a3bd7a1-a730-492f-86b1-99016c8b76f8	154aa144-a2d3-4981-9d26-3d5cc3a78395	12	500.00
19dd1fb2-cc6a-48b2-8a7f-7e05d62bfc8c	edef2151-6058-45b1-8717-f719dffbef4c	c7813de4-a9bc-4bed-ad3c-5e51d7a9dace	6	500.00
cc128143-e7b3-4c68-b63b-d5093128884b	994341b0-f50d-4fbf-8580-cfd89510d1ae	154aa144-a2d3-4981-9d26-3d5cc3a78395	10	500.00
4faecee6-8acb-440b-ab46-91d8e52a9000	5ed4f66b-ffd4-4302-852a-1396f440e657	bbf70bb6-f751-455a-8708-a838328ffcee	3	80.00
\.


--
-- Data for Name: purchase_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_orders (id, "supplierId", status, "totalPrice", "paymentStatus", "createdAt", "updatedAt") FROM stdin;
ebeb4c84-37cc-499c-9ec6-cbe09ccc2d57	d9846587-6c66-471d-a60a-0a78be4d68b1	Received	450000.00	Unpaid	2026-03-17 16:29:38.681235	2026-03-17 16:30:43.933761
6210f8ec-3dee-4085-9a9c-9ec0e91e3963	d9846587-6c66-471d-a60a-0a78be4d68b1	Received	200000.00	Unpaid	2026-03-17 16:40:17.786953	2026-03-17 16:40:24.133038
4a464689-6d1d-479c-92de-2a6e5a52a5c0	da895fc3-5352-4411-9137-f0907991555c	Received	1000.00	Paid	2026-03-17 19:18:21.794909	2026-03-17 19:19:33.763449
8fe7b7c9-d7fb-4913-b821-1f14dbc9d50d	da895fc3-5352-4411-9137-f0907991555c	Received	2500.00	Unpaid	2026-03-18 11:49:37.700599	2026-03-18 11:49:45.781505
1a3bd7a1-a730-492f-86b1-99016c8b76f8	da895fc3-5352-4411-9137-f0907991555c	Received	6000.00	Unpaid	2026-03-18 11:51:06.722887	2026-03-18 11:51:10.889098
edef2151-6058-45b1-8717-f719dffbef4c	da895fc3-5352-4411-9137-f0907991555c	Received	3000.00	Paid	2026-03-18 12:14:23.229441	2026-03-18 12:20:20.741824
994341b0-f50d-4fbf-8580-cfd89510d1ae	d9846587-6c66-471d-a60a-0a78be4d68b1	Received	5000.00	Unpaid	2026-03-19 14:57:35.639224	2026-03-19 14:57:45.713671
5ed4f66b-ffd4-4302-852a-1396f440e657	d9846587-6c66-471d-a60a-0a78be4d68b1	Pending	240.00	Unpaid	2026-03-20 11:14:33.070579	2026-03-20 11:14:33.070579
\.


--
-- Data for Name: return_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.return_requests (id, "salesOrderId", "productId", quantity, reason, status, "createdAt", "updatedAt") FROM stdin;
19dae4aa-b16a-4d92-b58f-daf548187d2e	f19b48b8-ffb3-45eb-a894-50abfb8cd63e	42a68995-8372-420f-a440-c8b62c788315	1	not needed	APPROVED	2026-03-17 16:37:01.568798	2026-03-17 16:37:35.9986
026e8a0d-e9bb-4389-98e7-172f7f240e91	7217cb10-3fe1-42b1-9f3e-2cb1868b7545	ef70e078-c630-4b3f-bed4-86fb39c46d31	2	Bubble on screen	APPROVED	2026-03-17 16:42:43.149065	2026-03-17 16:45:24.493718
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_permissions ("roleId", "permissionId") FROM stdin;
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name, description, "createdAt", "updatedAt") FROM stdin;
e115a217-b0ce-4c33-b37f-7adc25d1b888	Admin	Full access	2026-03-09 17:47:53.688574	2026-03-09 17:47:53.688574
98b13b80-9b9b-41fc-bb72-3d8b6c25515b	admin	Administrator with full access	2026-03-10 09:31:46.535208	2026-03-10 09:31:46.535208
3aa343c9-b39d-4785-9d50-5c1cc60bb461	user	Standard user	2026-03-10 09:31:46.571624	2026-03-10 09:31:46.571624
\.


--
-- Data for Name: sales_order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sales_order_items (id, "salesOrderId", "productId", quantity, "unitPrice", "baseUnitPrice", "tierDiscountPercent") FROM stdin;
37b4f80a-10cc-41ee-8356-f6c0c2fecaf3	f19b48b8-ffb3-45eb-a894-50abfb8cd63e	42a68995-8372-420f-a440-c8b62c788315	3	50000.00	0.00	0
59b50511-b9ed-4508-a755-3b061640278c	7217cb10-3fe1-42b1-9f3e-2cb1868b7545	ef70e078-c630-4b3f-bed4-86fb39c46d31	3	25000.00	0.00	0
1880b462-eafc-4553-9089-3d475d51facb	25aa3156-ad17-4b69-9384-f8ccbc66b0fa	154aa144-a2d3-4981-9d26-3d5cc3a78395	2	600.00	0.00	0
364634e2-4c35-449b-baa0-3f80fdfc4d16	c151ff9d-ea7a-42a2-907f-a807e2314a01	154aa144-a2d3-4981-9d26-3d5cc3a78395	1	600.00	0.00	0
61336b3b-ca88-4aa5-92a7-369299a713f9	660e95d7-80a8-420f-8376-a337012489c5	154aa144-a2d3-4981-9d26-3d5cc3a78395	3	600.00	0.00	0
c83c9a26-b860-4f49-bf84-65feba958823	f277224d-16c2-4bf5-9f78-6f9d5d049eda	154aa144-a2d3-4981-9d26-3d5cc3a78395	32	600.00	0.00	0
9344a609-b46a-420b-8ef1-c5000e956335	a9173bbc-97c5-4853-aacd-87c8ed62858e	154aa144-a2d3-4981-9d26-3d5cc3a78395	12	600.00	0.00	0
253483b2-641a-4e32-b86d-f26633ca4318	c83aacd2-8355-42f5-ac8a-5580a59d6166	c7813de4-a9bc-4bed-ad3c-5e51d7a9dace	5	700.00	0.00	0
7f125a55-8dd7-4d7a-97de-3489a425e4d2	50ac6aa8-a6d1-4326-944a-0c74f6ebb840	c7813de4-a9bc-4bed-ad3c-5e51d7a9dace	6	500.00	0.00	0
c40675e6-19aa-46cc-978d-c00eade1220d	ca80a786-a1a6-4fbe-8b67-3327016bccca	42a68995-8372-420f-a440-c8b62c788315	7	50000.00	0.00	0
94e8e186-e397-413c-ac31-9e47aae7341a	68f7eee0-6094-4614-af8a-e7459e7d52cb	c7813de4-a9bc-4bed-ad3c-5e51d7a9dace	1	700.00	0.00	0
5ab1b9a6-9815-4213-80af-d8519c2e8f40	d4534118-1596-40b2-a2e9-5d4a044d0cd8	ef70e078-c630-4b3f-bed4-86fb39c46d31	4	25000.00	0.00	0
ea2574ab-844a-4f8e-ad96-ae35aa83c83f	285fc451-4f09-464f-928a-ca5c999b89a2	ef70e078-c630-4b3f-bed4-86fb39c46d31	2	25000.00	0.00	0
d8ced4be-f5ba-4b4e-96c7-d2f96f479c85	5c85c0d4-52e5-4097-855a-cb191b0c3db8	c7813de4-a9bc-4bed-ad3c-5e51d7a9dace	1	700.00	0.00	0
fe66da7e-874e-4423-9d4d-010130a99def	37fd8f8f-8385-48ff-8a03-7d76fdb8e34b	154aa144-a2d3-4981-9d26-3d5cc3a78395	5	600.00	600.00	0
\.


--
-- Data for Name: sales_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sales_orders (id, "customerId", status, "totalAmount", "createdAt", "updatedAt", "subtotalBeforeCoupon", "couponDiscountAmount", "couponCode") FROM stdin;
f19b48b8-ffb3-45eb-a894-50abfb8cd63e	831ea373-ef3d-4a41-a558-4903d5a961fe	Confirmed	150000.00	2026-03-17 16:33:30.793797	2026-03-17 16:34:06.363055	0.00	0.00	\N
7217cb10-3fe1-42b1-9f3e-2cb1868b7545	831ea373-ef3d-4a41-a558-4903d5a961fe	Confirmed	75000.00	2026-03-17 16:39:37.896134	2026-03-17 16:40:37.235277	0.00	0.00	\N
25aa3156-ad17-4b69-9384-f8ccbc66b0fa	831ea373-ef3d-4a41-a558-4903d5a961fe	Confirmed	1200.00	2026-03-17 19:19:55.140478	2026-03-17 19:20:03.341034	0.00	0.00	\N
660e95d7-80a8-420f-8376-a337012489c5	bd9cc7ab-7197-4116-81d2-1d0def00ff6e	Confirmed	1800.00	2026-03-18 11:41:05.641752	2026-03-18 11:49:56.912089	0.00	0.00	\N
f277224d-16c2-4bf5-9f78-6f9d5d049eda	bd9cc7ab-7197-4116-81d2-1d0def00ff6e	Pending	19200.00	2026-03-18 11:51:38.564021	2026-03-18 11:51:38.564021	0.00	0.00	\N
c151ff9d-ea7a-42a2-907f-a807e2314a01	bd9cc7ab-7197-4116-81d2-1d0def00ff6e	Confirmed	600.00	2026-03-18 11:36:35.687856	2026-03-18 11:52:26.240142	0.00	0.00	\N
a9173bbc-97c5-4853-aacd-87c8ed62858e	bd9cc7ab-7197-4116-81d2-1d0def00ff6e	Confirmed	7200.00	2026-03-18 11:52:51.089271	2026-03-18 11:52:55.659575	0.00	0.00	\N
c83aacd2-8355-42f5-ac8a-5580a59d6166	bd9cc7ab-7197-4116-81d2-1d0def00ff6e	Confirmed	3500.00	2026-03-18 12:15:00.407176	2026-03-18 12:15:04.784912	0.00	0.00	\N
50ac6aa8-a6d1-4326-944a-0c74f6ebb840	fa5e0582-cdd0-4aaa-98a1-1585bab0f891	Pending	3000.00	2026-03-18 12:18:18.899897	2026-03-18 12:18:18.899897	0.00	0.00	\N
ca80a786-a1a6-4fbe-8b67-3327016bccca	fa5e0582-cdd0-4aaa-98a1-1585bab0f891	Confirmed	350000.00	2026-03-18 12:19:10.475506	2026-03-18 12:19:14.525159	0.00	0.00	\N
68f7eee0-6094-4614-af8a-e7459e7d52cb	fa5e0582-cdd0-4aaa-98a1-1585bab0f891	Confirmed	700.00	2026-03-18 17:02:03.615765	2026-03-18 17:02:09.379834	0.00	0.00	\N
d4534118-1596-40b2-a2e9-5d4a044d0cd8	fa5e0582-cdd0-4aaa-98a1-1585bab0f891	Confirmed	100000.00	2026-03-18 17:09:47.398687	2026-03-18 17:09:52.649257	0.00	0.00	\N
285fc451-4f09-464f-928a-ca5c999b89a2	bd9cc7ab-7197-4116-81d2-1d0def00ff6e	Confirmed	50000.00	2026-03-18 17:15:30.659836	2026-03-18 17:15:35.687455	0.00	0.00	\N
5c85c0d4-52e5-4097-855a-cb191b0c3db8	fa5e0582-cdd0-4aaa-98a1-1585bab0f891	Pending	700.00	2026-03-19 14:40:00.390637	2026-03-19 14:40:00.390637	0.00	0.00	\N
37fd8f8f-8385-48ff-8a03-7d76fdb8e34b	bd9cc7ab-7197-4116-81d2-1d0def00ff6e	Confirmed	2700.00	2026-03-19 15:02:49.617208	2026-03-19 15:03:07.441324	3000.00	300.00	SAVE10
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.suppliers (id, name, email, phone, address, "createdAt", "updatedAt") FROM stdin;
d9846587-6c66-471d-a60a-0a78be4d68b1	Aman	aman@gmail.com	11112345	Ahmadabad	2026-03-17 16:27:52.669498	2026-03-17 16:27:52.669498
da895fc3-5352-4411-9137-f0907991555c	Ravi Gupta	ravi@gmail.com	12345678	Jaipur	2026-03-17 19:18:01.193085	2026-03-17 19:18:01.193085
\.


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_roles ("userId", "roleId") FROM stdin;
6b0a5de8-9586-4a61-aadc-19249d5027c0	98b13b80-9b9b-41fc-bb72-3d8b6c25515b
a541c7ad-51e4-4fd5-919a-f3a2cf7aa1dd	3aa343c9-b39d-4785-9d50-5c1cc60bb461
40b1f8f5-8f03-4924-b1ef-9c52e1d1b4b1	98b13b80-9b9b-41fc-bb72-3d8b6c25515b
a8e4bfd9-289d-44a1-9093-bc9bea99658c	98b13b80-9b9b-41fc-bb72-3d8b6c25515b
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, "passwordHash", name, "isActive", "createdAt", "updatedAt") FROM stdin;
6b0a5de8-9586-4a61-aadc-19249d5027c0	admin@gmail.com	$2b$10$54Sk4VeROvbayqKdwSTjVutuPw630SiDHBQuyQaylPDsFLsenxHTG	Admin	t	2026-03-17 15:13:00.496574	2026-03-17 15:13:00.496574
a541c7ad-51e4-4fd5-919a-f3a2cf7aa1dd	user@gmail.com	$2b$10$y.5xBtF5I6sVBSVeKIh9i.Px6rSLM16kzQ5utneKmuuweRDtFlKwi	User	t	2026-03-17 15:33:39.327449	2026-03-17 15:33:39.327449
40b1f8f5-8f03-4924-b1ef-9c52e1d1b4b1	ramyadav8395@gmail.com	$2b$10$vhE5mHnuCdAR61X3i7haSekRBq801gb6xrE7.7qzCRArI.gd/3cQW	Ram pratap	t	2026-03-19 12:04:07.041089	2026-03-19 12:04:07.041089
a8e4bfd9-289d-44a1-9093-bc9bea99658c	user1@gmail.com	$2b$10$szPuEuVHx/4eBSuVCT09WedKs.fLIq5hMKvEPxEY63uh.K52x3YPO	user1	t	2026-03-20 11:12:08.594294	2026-03-20 11:12:08.594294
\.


--
-- Name: purchase_orders PK_05148947415204a897e8beb2553; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT "PK_05148947415204a897e8beb2553" PRIMARY KEY (id);


--
-- Name: products PK_0806c755e0aca124e67c0cf6d7d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY (id);


--
-- Name: customers PK_133ec679a801fab5e070f73d3ea; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT "PK_133ec679a801fab5e070f73d3ea" PRIMARY KEY (id);


--
-- Name: payments PK_197ab7af18c93fbb0c9b28b4a59; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY (id);


--
-- Name: audit_logs PK_1bb179d048bbc581caa3b013439; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY (id);


--
-- Name: categories PK_24dbc6126a28ff948da33e97d3b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY (id);


--
-- Name: product_variants PK_281e3f2c55652d6a22c0aa59fd7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT "PK_281e3f2c55652d6a22c0aa59fd7" PRIMARY KEY (id);


--
-- Name: return_requests PK_38714de8942bd9bc3a450a06889; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_requests
    ADD CONSTRAINT "PK_38714de8942bd9bc3a450a06889" PRIMARY KEY (id);


--
-- Name: sales_orders PK_5328297e067ca929fbe7cf989dd; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_orders
    ADD CONSTRAINT "PK_5328297e067ca929fbe7cf989dd" PRIMARY KEY (id);


--
-- Name: invoices PK_668cef7c22a427fd822cc1be3ce; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "PK_668cef7c22a427fd822cc1be3ce" PRIMARY KEY (id);


--
-- Name: notifications PK_6a72c3c0f683f6462415e653c3a; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY (id);


--
-- Name: inventory PK_82aa5da437c5bbfb80703b08309; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT "PK_82aa5da437c5bbfb80703b08309" PRIMARY KEY (id);


--
-- Name: user_roles PK_88481b0c4ed9ada47e9fdd67475; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT "PK_88481b0c4ed9ada47e9fdd67475" PRIMARY KEY ("userId", "roleId");


--
-- Name: permissions PK_920331560282b8bd21bb02290df; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY (id);


--
-- Name: discount_tiers PK_9b149eda47f274131e9788bde92; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discount_tiers
    ADD CONSTRAINT "PK_9b149eda47f274131e9788bde92" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: sales_order_items PK_a5f8d983ae4db44dcc923faf2ef; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_order_items
    ADD CONSTRAINT "PK_a5f8d983ae4db44dcc923faf2ef" PRIMARY KEY (id);


--
-- Name: suppliers PK_b70ac51766a9e3144f778cfe81e; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT "PK_b70ac51766a9e3144f778cfe81e" PRIMARY KEY (id);


--
-- Name: roles PK_c1433d71a4838793a49dcad46ab; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY (id);


--
-- Name: role_permissions PK_d430a02aad006d8a70f3acd7d03; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT "PK_d430a02aad006d8a70f3acd7d03" PRIMARY KEY ("roleId", "permissionId");


--
-- Name: inventory_movements PK_d7597827c1dcffae889db3ab873; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT "PK_d7597827c1dcffae889db3ab873" PRIMARY KEY (id);


--
-- Name: coupons PK_d7ea8864a0150183770f3e9a8cb; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT "PK_d7ea8864a0150183770f3e9a8cb" PRIMARY KEY (id);


--
-- Name: purchase_order_items PK_e8b7568d25c41e3290db596b312; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT "PK_e8b7568d25c41e3290db596b312" PRIMARY KEY (id);


--
-- Name: product_variants UQ_46f236f21640f9da218a063a866; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT "UQ_46f236f21640f9da218a063a866" UNIQUE (sku);


--
-- Name: roles UQ_648e3f5447f725579d7d4ffdfb7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE (name);


--
-- Name: permissions UQ_8dad765629e83229da6feda1c1d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT "UQ_8dad765629e83229da6feda1c1d" UNIQUE (code);


--
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- Name: invoices UQ_bf8e0f9dd4558ef209ec111782d; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "UQ_bf8e0f9dd4558ef209ec111782d" UNIQUE ("invoiceNumber");


--
-- Name: products UQ_c44ac33a05b144dd0d9ddcf9327; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "UQ_c44ac33a05b144dd0d9ddcf9327" UNIQUE (sku);


--
-- Name: inventory UQ_c8622e1e24c6d054d36e8824490; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT "UQ_c8622e1e24c6d054d36e8824490" UNIQUE ("productId");


--
-- Name: coupons UQ_e025109230e82925843f2a14c48; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT "UQ_e025109230e82925843f2a14c48" UNIQUE (code);


--
-- Name: IDX_06792d0c62ce6b0203c03643cd; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_06792d0c62ce6b0203c03643cd" ON public.role_permissions USING btree ("permissionId");


--
-- Name: IDX_472b25323af01488f1f66a06b6; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_472b25323af01488f1f66a06b6" ON public.user_roles USING btree ("userId");


--
-- Name: IDX_86033897c009fcca8b6505d6be; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_86033897c009fcca8b6505d6be" ON public.user_roles USING btree ("roleId");


--
-- Name: IDX_b4599f8b8f548d35850afa2d12; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_b4599f8b8f548d35850afa2d12" ON public.role_permissions USING btree ("roleId");


--
-- Name: inventory_movements FK_05715a7ea47e49653f164c0dd8c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT "FK_05715a7ea47e49653f164c0dd8c" FOREIGN KEY ("productId") REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: role_permissions FK_06792d0c62ce6b0203c03643cdd; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT "FK_06792d0c62ce6b0203c03643cdd" FOREIGN KEY ("permissionId") REFERENCES public.permissions(id);


--
-- Name: purchase_orders FK_0c3ff892a9f2ed16f59d31cccae; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT "FK_0c3ff892a9f2ed16f59d31cccae" FOREIGN KEY ("supplierId") REFERENCES public.suppliers(id) ON DELETE RESTRICT;


--
-- Name: purchase_order_items FK_1de7eb246940b05765d2c99a7ec; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT "FK_1de7eb246940b05765d2c99a7ec" FOREIGN KEY ("purchaseOrderId") REFERENCES public.purchase_orders(id) ON DELETE CASCADE;


--
-- Name: invoices FK_1df049f8943c6be0c1115541efb; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "FK_1df049f8943c6be0c1115541efb" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON DELETE RESTRICT;


--
-- Name: payments FK_43d19956aeab008b49e0804c145; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT "FK_43d19956aeab008b49e0804c145" FOREIGN KEY ("invoiceId") REFERENCES public.invoices(id) ON DELETE CASCADE;


--
-- Name: user_roles FK_472b25323af01488f1f66a06b67; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT "FK_472b25323af01488f1f66a06b67" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: return_requests FK_5bdd7dfa9d1fa121ea465798c57; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_requests
    ADD CONSTRAINT "FK_5bdd7dfa9d1fa121ea465798c57" FOREIGN KEY ("productId") REFERENCES public.products(id) ON DELETE RESTRICT;


--
-- Name: sales_order_items FK_6b67146a69ed5fe5fe7f3224d31; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_order_items
    ADD CONSTRAINT "FK_6b67146a69ed5fe5fe7f3224d31" FOREIGN KEY ("salesOrderId") REFERENCES public.sales_orders(id) ON DELETE CASCADE;


--
-- Name: user_roles FK_86033897c009fcca8b6505d6be2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT "FK_86033897c009fcca8b6505d6be2" FOREIGN KEY ("roleId") REFERENCES public.roles(id);


--
-- Name: invoices FK_8927499592cf39c177c46399769; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT "FK_8927499592cf39c177c46399769" FOREIGN KEY ("salesOrderId") REFERENCES public.sales_orders(id) ON DELETE RESTRICT;


--
-- Name: sales_order_items FK_95836cf122ca5a4eb2e40ea552c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_order_items
    ADD CONSTRAINT "FK_95836cf122ca5a4eb2e40ea552c" FOREIGN KEY ("productId") REFERENCES public.products(id) ON DELETE RESTRICT;


--
-- Name: sales_orders FK_9978ca165b4c0f27571f3d1d924; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_orders
    ADD CONSTRAINT "FK_9978ca165b4c0f27571f3d1d924" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON DELETE RESTRICT;


--
-- Name: categories FK_9a6f051e66982b5f0318981bcaa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT "FK_9a6f051e66982b5f0318981bcaa" FOREIGN KEY ("parentId") REFERENCES public.categories(id);


--
-- Name: return_requests FK_b2c0602bdf85df0d0eb5d41b79d; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_requests
    ADD CONSTRAINT "FK_b2c0602bdf85df0d0eb5d41b79d" FOREIGN KEY ("salesOrderId") REFERENCES public.sales_orders(id) ON DELETE CASCADE;


--
-- Name: role_permissions FK_b4599f8b8f548d35850afa2d12c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT "FK_b4599f8b8f548d35850afa2d12c" FOREIGN KEY ("roleId") REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: inventory FK_c8622e1e24c6d054d36e8824490; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT "FK_c8622e1e24c6d054d36e8824490" FOREIGN KEY ("productId") REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: audit_logs FK_cfa83f61e4d27a87fcae1e025ab; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "FK_cfa83f61e4d27a87fcae1e025ab" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: discount_tiers FK_ec540b5a3160bafedb9d37bc4aa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discount_tiers
    ADD CONSTRAINT "FK_ec540b5a3160bafedb9d37bc4aa" FOREIGN KEY ("productId") REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: product_variants FK_f515690c571a03400a9876600b5; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT "FK_f515690c571a03400a9876600b5" FOREIGN KEY ("productId") REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: purchase_order_items FK_f87b1b82a3aff16d1cb5e49a656; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT "FK_f87b1b82a3aff16d1cb5e49a656" FOREIGN KEY ("productId") REFERENCES public.products(id) ON DELETE RESTRICT;


--
-- Name: products FK_ff56834e735fa78a15d0cf21926; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "FK_ff56834e735fa78a15d0cf21926" FOREIGN KEY ("categoryId") REFERENCES public.categories(id);


--
-- PostgreSQL database dump complete
--

\unrestrict D21ueEA0jStJgDi1E22HdhMI72XZNda3cVr37VrcXtVTHUKGW6Xbx2XNNaKIArC