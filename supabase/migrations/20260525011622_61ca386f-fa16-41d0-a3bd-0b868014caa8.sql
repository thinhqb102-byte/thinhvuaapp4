
-- 1) Remove hardcoded phone-based admin backdoor in handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _phone TEXT;
  _full_name TEXT;
  _vip_code TEXT;
BEGIN
  _phone := COALESCE(NEW.raw_user_meta_data->>'phone', '');
  _full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);
  _vip_code := CASE WHEN _phone <> '' THEN 'VIP' || _phone ELSE NULL END;

  INSERT INTO public.profiles (id, email, full_name, phone, vip_code, vip_status, vip_expires_at)
  VALUES (
    NEW.id,
    NEW.email,
    _full_name,
    NULLIF(_phone, ''),
    _vip_code,
    'pending'::public.vip_status,
    NULL
  );

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');

  RETURN NEW;
END;
$function$;

-- 2) Restrict self-updates on profiles so users can't self-promote to VIP
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND vip_status   IS NOT DISTINCT FROM (SELECT p.vip_status   FROM public.profiles p WHERE p.id = auth.uid())
  AND vip_expires_at IS NOT DISTINCT FROM (SELECT p.vip_expires_at FROM public.profiles p WHERE p.id = auth.uid())
  AND vip_code     IS NOT DISTINCT FROM (SELECT p.vip_code     FROM public.profiles p WHERE p.id = auth.uid())
);
