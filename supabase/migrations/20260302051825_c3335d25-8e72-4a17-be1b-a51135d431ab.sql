-- Allow users to view dating profiles of people they are matched with
CREATE POLICY "Users can view matched profiles"
ON public.dating_profiles
FOR SELECT
USING (
  user_id = auth.uid()
  OR id IN (
    SELECT CASE 
      WHEN dm.user_a_id = dp.id THEN dm.user_b_id 
      ELSE dm.user_a_id 
    END
    FROM public.dating_matches dm
    JOIN public.dating_profiles dp ON dp.user_id = auth.uid()
    WHERE dm.user_a_id = dp.id OR dm.user_b_id = dp.id
  )
);