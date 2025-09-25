-- SEED SCRIPT (Supabase SQL editor compatible)
-- 1) Edit the emails below to match users that already exist in Auth > Users
-- 2) Run this entire script once

WITH params AS (
	SELECT
		'admin@example.com'::text    AS admin_email,
		'director@example.com'::text AS director_email,
		'manager@example.com'::text  AS manager_email,
		'customer@example.com'::text AS customer_email
)
-- Create/Upsert profiles with roles
, u AS (
	SELECT
		(SELECT id FROM auth.users WHERE email = (SELECT admin_email FROM params))    AS admin_id,
		(SELECT id FROM auth.users WHERE email = (SELECT director_email FROM params)) AS director_id,
		(SELECT id FROM auth.users WHERE email = (SELECT manager_email FROM params))  AS manager_id,
		(SELECT id FROM auth.users WHERE email = (SELECT customer_email FROM params)) AS customer_id
)
INSERT INTO public.profiles(id, full_name, role)
SELECT admin_id, 'Alice Admin', 'admin'::public.user_role FROM u WHERE admin_id IS NOT NULL
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role;

WITH params AS (
	SELECT 'director@example.com'::text AS email
), u AS (
	SELECT (SELECT id FROM auth.users WHERE email = (SELECT email FROM params)) AS uid
)
INSERT INTO public.profiles(id, full_name, role)
SELECT uid, 'Derek Director', 'director'::public.user_role FROM u WHERE uid IS NOT NULL
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role;

WITH params AS (
	SELECT 'manager@example.com'::text AS email
), u AS (
	SELECT (SELECT id FROM auth.users WHERE email = (SELECT email FROM params)) AS uid
)
INSERT INTO public.profiles(id, full_name, role)
SELECT uid, 'Mona Manager', 'manager'::public.user_role FROM u WHERE uid IS NOT NULL
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role;

WITH params AS (
	SELECT 'customer@example.com'::text AS email
), u AS (
	SELECT (SELECT id FROM auth.users WHERE email = (SELECT email FROM params)) AS uid
)
INSERT INTO public.profiles(id, full_name, role)
SELECT uid, 'Carl Customer', 'customer'::public.user_role FROM u WHERE uid IS NOT NULL
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role;

-- Sample cases with default checklist via RPC
DO $$
DECLARE admin_id uuid; cust_email text;
BEGIN
	SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@example.com';
	SELECT 'customer@example.com' INTO cust_email;
	IF admin_id IS NULL THEN RAISE NOTICE 'Admin user not found, skipping case seed'; RETURN; END IF;
	PERFORM set_config('request.jwt.claims', json_build_object('sub', admin_id, 'role','authenticated')::text, true);
	PERFORM public.create_case_with_checklist('Smith Family — Direct Cremation', 'John Smith', cust_email);
	PERFORM public.create_case_with_checklist('Johnson Family — Traditional Service', 'Emma Johnson', cust_email);
END $$;

-- Optional: mark first item complete in the first checklist
DO $$
DECLARE cl uuid; itm uuid;
BEGIN
	SELECT c.id INTO cl FROM public.checklists c
	JOIN public.cases ca ON ca.id = c.case_id
	ORDER BY ca.created_at ASC LIMIT 1;
	IF cl IS NULL THEN RETURN; END IF;
	SELECT id INTO itm FROM public.checklist_items WHERE checklist_id = cl ORDER BY title LIMIT 1;
	IF itm IS NULL THEN RETURN; END IF;
	UPDATE public.checklist_items SET is_complete = true, completed_at = now() WHERE id = itm;
END $$;
