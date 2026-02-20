-- RPC function: returns random active gadgets the user hasn't swiped yet
CREATE OR REPLACE FUNCTION get_fresh_gadgets(p_user_id UUID, p_limit INT DEFAULT 25)
RETURNS SETOF gadgets
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT *
  FROM gadgets
  WHERE is_active = true
    AND content_status = 'approved'
    AND id NOT IN (
      SELECT gadget_id FROM swipes WHERE user_id = p_user_id
    )
  ORDER BY random()
  LIMIT p_limit;
$$;
