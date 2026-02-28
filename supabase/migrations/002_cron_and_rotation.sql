-- ============================================
-- GADGET ROTATION FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION rotate_gadgets() RETURNS void AS $$
DECLARE
  active_count INTEGER;
BEGIN
  -- Count current active gadgets
  SELECT count(*) INTO active_count FROM gadgets WHERE is_active = true;

  -- Only deactivate if we have more than 60 active gadgets
  IF active_count > 60 THEN
    -- Deactivate gadgets older than 30 days with < 5% like rate
    UPDATE gadgets
    SET is_active = false, updated_at = now()
    WHERE is_active = true
      AND fetched_at < now() - interval '30 days'
      AND view_count > 20
      AND (right_swipe_count + super_swipe_count)::numeric / GREATEST(view_count, 1) < 0.05;
  END IF;

  -- Re-count after deactivation
  SELECT count(*) INTO active_count FROM gadgets WHERE is_active = true;

  -- If we dropped below 60, reactivate most recent deactivated gadgets
  IF active_count < 60 THEN
    UPDATE gadgets
    SET is_active = true, updated_at = now()
    WHERE id IN (
      SELECT id FROM gadgets
      WHERE is_active = false
      ORDER BY fetched_at DESC
      LIMIT (60 - active_count)
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- CRON SCHEDULES
-- ============================================

-- Scrape weekly on Mondays at 6 AM UTC
-- NOTE: Replace <project-ref> with your actual Supabase project reference
-- SELECT cron.schedule(
--   'scrape-gadgets-job',
--   '0 6 * * 1',
--   $$SELECT net.http_post(
--     url := 'https://<project-ref>.supabase.co/functions/v1/scrape-gadgets',
--     headers := jsonb_build_object(
--       'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
--     )
--   )$$
-- );

-- Rotate gadgets daily at 3 AM
-- SELECT cron.schedule(
--   'rotate-gadgets-job',
--   '0 3 * * *',
--   'SELECT rotate_gadgets()'
-- );
