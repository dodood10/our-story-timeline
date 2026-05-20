
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS fbp text,
  ADD COLUMN IF NOT EXISTS fbc text,
  ADD COLUMN IF NOT EXISTS client_ip text,
  ADD COLUMN IF NOT EXISTS client_ua text,
  ADD COLUMN IF NOT EXISTS capi_purchase_sent_at timestamptz;
