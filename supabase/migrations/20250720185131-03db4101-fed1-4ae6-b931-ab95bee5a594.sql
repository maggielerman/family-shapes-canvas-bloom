-- Fix RLS performance by optimizing auth.uid() calls
-- Replace auth.uid() with (select auth.uid()) to prevent re-evaluation per row

-- Drop all existing policies and recreate with optimized auth calls
-- This is the safest approach to ensure consistency

-- User Profiles policies
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;

CREATE POLICY "Users can insert own profile" ON public.user_profiles
FOR INSERT WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
FOR UPDATE USING ((select auth.uid()) = id);

CREATE POLICY "Users can view own profile" ON public.user_profiles
FOR SELECT USING ((select auth.uid()) = id);

-- User Settings policies
DROP POLICY IF EXISTS "Users can insert their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can view their own settings" ON public.user_settings;

CREATE POLICY "Users can insert their own settings" ON public.user_settings
FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own settings" ON public.user_settings
FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can view their own settings" ON public.user_settings
FOR SELECT USING ((select auth.uid()) = user_id);

-- Organizations policies
DROP POLICY IF EXISTS "Users can create organizations" ON public.organizations;
DROP POLICY IF EXISTS "Users can update organizations" ON public.organizations;
DROP POLICY IF EXISTS "Users can delete organizations" ON public.organizations;
DROP POLICY IF EXISTS "Users can view organizations" ON public.organizations;

CREATE POLICY "Users can create organizations" ON public.organizations
FOR INSERT WITH CHECK (owner_id = (select auth.uid()));

CREATE POLICY "Users can update organizations" ON public.organizations
FOR UPDATE USING (owner_id = (select auth.uid())) WITH CHECK (owner_id = (select auth.uid()));

CREATE POLICY "Users can delete organizations" ON public.organizations
FOR DELETE USING (owner_id = (select auth.uid()));

CREATE POLICY "Users can view organizations" ON public.organizations
FOR SELECT USING (
  (owner_id = (select auth.uid())) OR 
  (visibility = 'public'::text) OR 
  (EXISTS (
    SELECT 1 FROM organization_memberships m
    WHERE ((m.organization_id = organizations.id) AND (m.user_id = (select auth.uid())))
  ))
);

-- Groups policies
DROP POLICY IF EXISTS "Users can delete their own groups" ON public.groups;
DROP POLICY IF EXISTS "Users can insert groups" ON public.groups;
DROP POLICY IF EXISTS "Users can update their own groups" ON public.groups;
DROP POLICY IF EXISTS "Users can view their own groups" ON public.groups;

CREATE POLICY "Users can delete their own groups" ON public.groups
FOR DELETE USING (owner_id = (select auth.uid()));

CREATE POLICY "Users can insert groups" ON public.groups
FOR INSERT WITH CHECK (owner_id = (select auth.uid()));

CREATE POLICY "Users can update their own groups" ON public.groups
FOR UPDATE USING (owner_id = (select auth.uid()));

CREATE POLICY "Users can view their own groups" ON public.groups
FOR SELECT USING (owner_id = (select auth.uid()));

-- Persons policies
DROP POLICY IF EXISTS "Users can delete their own persons" ON public.persons;
DROP POLICY IF EXISTS "Users can insert persons" ON public.persons;
DROP POLICY IF EXISTS "Users can update their own persons" ON public.persons;
DROP POLICY IF EXISTS "Users can view their own persons" ON public.persons;
DROP POLICY IF EXISTS "Tenant-scoped person updates" ON public.persons;

CREATE POLICY "Users can delete their own persons" ON public.persons
FOR DELETE USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert persons" ON public.persons
FOR INSERT WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own persons" ON public.persons
FOR UPDATE USING (user_id = (select auth.uid()));

CREATE POLICY "Users can view their own persons" ON public.persons
FOR SELECT USING (user_id = (select auth.uid()));

CREATE POLICY "Tenant-scoped person updates" ON public.persons
FOR UPDATE USING (
  (user_id = (select auth.uid())) OR 
  (EXISTS (
    SELECT 1 FROM group_memberships gm
    JOIN groups g ON gm.group_id = g.id
    WHERE gm.person_id = persons.id 
    AND (
      g.owner_id = (select auth.uid()) OR 
      (gm.user_id = (select auth.uid()) AND gm.role = ANY (ARRAY['admin'::text, 'editor'::text]))
    )
  ))
);

-- Family Trees policies
DROP POLICY IF EXISTS "Users can create their own family trees" ON public.family_trees;
DROP POLICY IF EXISTS "Users can delete their own family trees" ON public.family_trees;
DROP POLICY IF EXISTS "Users can update their own family trees" ON public.family_trees;
DROP POLICY IF EXISTS "Users can view their own family trees" ON public.family_trees;

CREATE POLICY "Users can create their own family trees" ON public.family_trees
FOR INSERT WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete their own family trees" ON public.family_trees
FOR DELETE USING (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own family trees" ON public.family_trees
FOR UPDATE USING (user_id = (select auth.uid()));

CREATE POLICY "Users can view their own family trees" ON public.family_trees
FOR SELECT USING (user_id = (select auth.uid()));

-- Connections policies
DROP POLICY IF EXISTS "Users can manage connections for their persons" ON public.connections;
DROP POLICY IF EXISTS "Users can view connections for their persons" ON public.connections;
DROP POLICY IF EXISTS "Tenant-scoped connection access" ON public.connections;
DROP POLICY IF EXISTS "Tenant-scoped connection management" ON public.connections;

CREATE POLICY "Users can manage connections for their persons" ON public.connections
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM persons
    WHERE persons.id = connections.from_person_id 
    AND persons.user_id = (select auth.uid())
  )
);

CREATE POLICY "Users can view connections for their persons" ON public.connections
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM persons
    WHERE persons.id = connections.from_person_id 
    AND persons.user_id = (select auth.uid())
  )
);

CREATE POLICY "Tenant-scoped connection access" ON public.connections
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM groups g
    WHERE g.id = connections.group_id 
    AND (
      g.visibility = 'public'::text OR 
      g.owner_id = (select auth.uid()) OR 
      EXISTS (
        SELECT 1 FROM group_memberships gm
        WHERE gm.group_id = g.id AND gm.user_id = (select auth.uid())
      )
    )
  )
);

CREATE POLICY "Tenant-scoped connection management" ON public.connections
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM groups g
    WHERE g.id = connections.group_id 
    AND (
      g.owner_id = (select auth.uid()) OR 
      EXISTS (
        SELECT 1 FROM group_memberships gm
        WHERE gm.group_id = g.id 
        AND gm.user_id = (select auth.uid()) 
        AND gm.role = ANY (ARRAY['admin'::text, 'editor'::text])
      )
    )
  )
);