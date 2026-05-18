
-- Secure sync: no direct table reads for anon; access only via RPC with code parameter.

DROP POLICY IF EXISTS "anyone can read by code" ON public.couple_syncs;
DROP POLICY IF EXISTS "anyone can insert" ON public.couple_syncs;
DROP POLICY IF EXISTS "anyone can update by code" ON public.couple_syncs;

CREATE POLICY "deny direct select for anon"
  ON public.couple_syncs FOR SELECT
  TO anon, authenticated
  USING (false);

CREATE POLICY "deny direct insert for anon"
  ON public.couple_syncs FOR INSERT
  TO anon, authenticated
  WITH CHECK (false);

CREATE POLICY "deny direct update for anon"
  ON public.couple_syncs FOR UPDATE
  TO anon, authenticated
  USING (false);

CREATE OR REPLACE FUNCTION public.get_couple_sync(p_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  IF p_code IS NULL OR length(trim(p_code)) < 8 THEN
    RETURN NULL;
  END IF;
  SELECT data INTO result
  FROM public.couple_syncs
  WHERE code = upper(trim(p_code));
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.upsert_couple_sync(p_code text, p_data jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_code IS NULL OR length(trim(p_code)) < 8 THEN
    RAISE EXCEPTION 'Código inválido';
  END IF;
  IF p_data IS NULL THEN
    RAISE EXCEPTION 'Dados inválidos';
  END IF;
  INSERT INTO public.couple_syncs (code, data)
  VALUES (upper(trim(p_code)), p_data)
  ON CONFLICT (code) DO UPDATE
  SET data = EXCLUDED.data, updated_at = now();
END;
$$;

REVOKE ALL ON FUNCTION public.get_couple_sync(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.upsert_couple_sync(text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_couple_sync(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_couple_sync(text, jsonb) TO anon, authenticated;
