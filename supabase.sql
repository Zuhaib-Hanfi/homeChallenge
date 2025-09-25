-- Run this in Supabase SQL editor

-- Ensure enum type exists (CREATE TYPE does not support IF NOT EXISTS reliably)
DO $$ BEGIN
	CREATE TYPE public.user_role AS ENUM ('admin','director','manager','customer');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
	id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
	full_name text,
	role public.user_role NOT NULL DEFAULT 'customer',
	created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "profiles are viewable by authenticated users" ON public.profiles
	FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "users can update their own profile" ON public.profiles;
CREATE POLICY "users can update their own profile" ON public.profiles
	FOR UPDATE USING (auth.uid() = id);

-- Allow users to create their own profile row on signup
DROP POLICY IF EXISTS "users can insert their profile" ON public.profiles;
CREATE POLICY "users can insert their profile" ON public.profiles
	FOR INSERT WITH CHECK (auth.uid() = id);

-- Cases
CREATE TABLE IF NOT EXISTS public.cases (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	title text NOT NULL,
	client_name text NOT NULL,
	contact_email text,
	status text NOT NULL DEFAULT 'new',
	created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
	created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cases readable to authenticated" ON public.cases;
CREATE POLICY "cases readable to authenticated" ON public.cases
	FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "cases insert by authenticated" ON public.cases;
CREATE POLICY "cases insert by authenticated" ON public.cases
	FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "cases update by authenticated" ON public.cases;
CREATE POLICY "cases update by authenticated" ON public.cases
	FOR UPDATE USING (auth.role() = 'authenticated');

-- Checklists and items
CREATE TABLE IF NOT EXISTS public.checklists (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
	created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.checklist_items (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	checklist_id uuid NOT NULL REFERENCES public.checklists(id) ON DELETE CASCADE,
	title text NOT NULL,
	is_complete boolean NOT NULL DEFAULT false,
	completed_at timestamptz,
	assigned_to uuid REFERENCES public.profiles(id)
);

ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "checklists readable to authenticated" ON public.checklists;
CREATE POLICY "checklists readable to authenticated" ON public.checklists
	FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "checklists insert by authenticated" ON public.checklists;
CREATE POLICY "checklists insert by authenticated" ON public.checklists
	FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "checklists update by authenticated" ON public.checklists;
CREATE POLICY "checklists update by authenticated" ON public.checklists
	FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "items readable to authenticated" ON public.checklist_items;
CREATE POLICY "items readable to authenticated" ON public.checklist_items
	FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "items insert by authenticated" ON public.checklist_items;
CREATE POLICY "items insert by authenticated" ON public.checklist_items
	FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "items update by authenticated" ON public.checklist_items;
CREATE POLICY "items update by authenticated" ON public.checklist_items
	FOR UPDATE USING (auth.role() = 'authenticated');

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cases_created_at ON public.cases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cases_contact_email ON public.cases(contact_email);
CREATE INDEX IF NOT EXISTS idx_checklists_case_id ON public.checklists(case_id);
CREATE INDEX IF NOT EXISTS idx_items_checklist_id ON public.checklist_items(checklist_id);
CREATE INDEX IF NOT EXISTS idx_items_is_complete ON public.checklist_items(is_complete);

-- Function: create case with default checklist
CREATE OR REPLACE FUNCTION public.create_case_with_checklist(p_title text, p_client_name text, p_contact_email text)
RETURNS uuid AS $$
DECLARE
	new_case_id uuid;
	new_checklist_id uuid;
	default_items text[] := ARRAY['Collect vital statistics','Obtain permits','Schedule service','Coordinate obituary','Arrange transportation'];
BEGIN
	INSERT INTO public.cases(title, client_name, contact_email, created_by)
	VALUES (p_title, p_client_name, p_contact_email, auth.uid())
	RETURNING id INTO new_case_id;

	INSERT INTO public.checklists(case_id) VALUES (new_case_id) RETURNING id INTO new_checklist_id;

	INSERT INTO public.checklist_items(checklist_id, title)
	SELECT new_checklist_id, UNNEST(default_items);

	RETURN new_case_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.create_case_with_checklist(text, text, text) TO anon, authenticated;

-- Customer portal: customers can read their own case by email
DROP POLICY IF EXISTS "customers read by email" ON public.cases;
CREATE POLICY "customers read by email" ON public.cases
	FOR SELECT USING (
		(auth.jwt() ->> 'email') IS NOT NULL AND (contact_email = (auth.jwt() ->> 'email'))
	);
