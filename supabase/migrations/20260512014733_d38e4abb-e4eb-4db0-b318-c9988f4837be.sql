
CREATE TABLE public.couple_syncs (
  code TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.couple_syncs ENABLE ROW LEVEL SECURITY;

-- Anyone with the secret code can read/write that row.
-- Codes are 12+ random characters generated client-side.
CREATE POLICY "anyone can read by code"
  ON public.couple_syncs FOR SELECT
  USING (true);

CREATE POLICY "anyone can insert"
  ON public.couple_syncs FOR INSERT
  WITH CHECK (length(code) >= 8);

CREATE POLICY "anyone can update by code"
  ON public.couple_syncs FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER couple_syncs_updated
  BEFORE UPDATE ON public.couple_syncs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
