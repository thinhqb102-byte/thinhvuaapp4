
-- Prevent privilege escalation via UPDATE on user_roles
CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Lock down direct execution of the SECURITY DEFINER helper.
-- RLS policies invoke it as the table owner, so revoking from anon/authenticated/public is safe.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
