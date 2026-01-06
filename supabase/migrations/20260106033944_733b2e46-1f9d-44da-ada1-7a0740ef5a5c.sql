-- Create event_photos table for homepage gallery
CREATE TABLE public.event_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  image_url TEXT NOT NULL,
  title TEXT,
  category TEXT,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.event_photos ENABLE ROW LEVEL SECURITY;

-- Public read access (photos are public content)
CREATE POLICY "Anyone can view event photos" ON public.event_photos
  FOR SELECT USING (true);

-- Admin manage
CREATE POLICY "Admins can manage event photos" ON public.event_photos
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Add previous_member_count to meetup_stats for tracking weekly growth
ALTER TABLE public.meetup_stats ADD COLUMN IF NOT EXISTS previous_member_count INTEGER DEFAULT 0;

-- Seed with existing gallery photos (featured selection)
INSERT INTO public.event_photos (image_url, title, category, is_featured, display_order) VALUES
  ('https://lh3.googleusercontent.com/aida-public/AB6AXuAXh3-Wz1Ht5LXdzLlxBGGoD-vvkf03_EeF8VK_pPENmUgO6w_WZrOYNekTYu0QV_Bp1gpcAh8nP1L60yri9c-DzpFXGcSqzrj_4plcBFjCs7oSohyQbJYScVtpYuE9153qiPY1lNzJD2FKwHe2oXK2giczyNSKnMEKh8MZupU54kBNbVpuHP0_v3HUQiea3T_JiJN81rZJxs9rB4NCR4krlezQy19X0L_Veb8ZBFeU806KufGlpHqGOTitzHTmSjCRoY1nNixnKNqH', 'The Midnight Gala', 'Galas', true, 1),
  ('https://lh3.googleusercontent.com/aida-public/AB6AXuAdryPO4PJ2X7tXO92z_cw_qIKfTxU_67YSjiH_wVhXxh55rgLhUxGhQGcxoRlSbUsoXOdMY5rLl4-sd1ndRkdJqLS0F_LNsI_907Y2nZ1b4vIJmA4MUwpsSd-hmKSJU8r0qEs9GPm7n52eIv1fx-CfjA6aYME1DqymA6T22FHn9o-oK_ohaMq4sig8bQycNXUb2VhrRUyGsiOSgIxKGFHijN_VifgA5B06IYV3CTjJjGHUaNh7h9hgQ7v7O7ndK1vE5y47UrA2bJer', 'Summer Garden Party', 'Seasonal Soirées', true, 2),
  ('https://lh3.googleusercontent.com/aida-public/AB6AXuCBEwh7892z_8-C0CE1ZbCMzsXtacvkMBagOtFMpteMAs5z7gi7hA2tEIEOqQ8j-YXIVfoT_FxPufpLwnwUXwE9uxP1xduBuekiNIHwI0qkfA7MSmhY3rMB4gojuBvoMAFli5lWXu8hBVqP-EKPpC4navu4ldWgUlc_lO9ze0QxoDCzNl_rl9cF4qiJS9EEppikOfF3HXEG-bgmKw4p3hvQ__MYY8OSUF5lRdC01xAGHBnuO6VV73nHPtFZtrEdH2tvzX8ESyDvPGeY', 'Art & Wine Tasting', 'Art & Wine', true, 3),
  ('https://lh3.googleusercontent.com/aida-public/AB6AXuD8umriz-21OMC55Ayd293oQs7rnKLRq3vEyyrpgES4dNmb5KpYhHQT6M6VqPsLQoBdQHLzJrrErFkRL4LgUuXIyohI2kfyoaMKZqdzR_dc5vdfTAyyFR9XxtLxudZFC8gGVzfCMguTJeyaBflZHElhgpHY6CFEkCoJcSLux-R_hP4DQmTg9LV479oLyCsH5ygeZv2lb3yRzGyV9O82sVRmf1M6h9AkoMM7JMWBNJzz_vsNzdajQqnEuHHBtDqGMoS17l8oL4IB5039', 'Holiday Ball', 'Galas', true, 4),
  ('https://lh3.googleusercontent.com/aida-public/AB6AXuBShhczH-yuHl77SAEB4GNAFHZZ63RtN8Tf6dW4odrQnX0Nfg-3f56OF5NSjc-3FUz7IgrhOepEbmBj2heEALJxF5oKejGocfigcfpK8j7Gsp1fCPhvkAk4M3e50thcSHryPSlveEUNhuFqa53v8P9CcI2r7a_nF4Ri4_S0yjTbqqPZ1EHSuMgWjrkaaEKdg92PkbjpXefCQmDpqfpDN1Umn1rnk3sXTDHBfineUzGn4MjOJCrXygvhrvmaVGhUlfwBOdQ9oJhGSVOB', 'Masquerade Night', 'Galas', true, 5),
  ('https://lh3.googleusercontent.com/aida-public/AB6AXuD2NppcmiWzu8dkw4M2B5aljbZOsam4xRkIZ2GoG9NTB4DsvH8NRnRBLtrhrlXq_VVuEOoDjdIgSTtrplt4FKYcNRcQFEyuIiFl5dOHCwQQBm3o9JuR6bc8OX8gaKesl7XlVRiDeAff-l3W9EA3GevRcjDOLLWqcKuonzbROe-ditId_5tQjohrhxDXeQNC5bqjj38dccAHEH_e8BcW1ysj00sc9ysf-oCYuwgMgeVFgcoN6orHFO7aeGy6hPOC2yT5Wfj51GAw8PXN', 'Autumn Soirée', 'Seasonal Soirées', true, 6),
  ('https://lh3.googleusercontent.com/aida-public/AB6AXuDWbcMhp9CnqCo04DRW5tfiu7EP13nNKERg0j0AfkB0PnVQU4VnGrjByU8E6edWXkH9LF9i8IFxbumVKxsvGa92zA2LjCoYozavuqstZNkXVAzjs_RgV8lCh6nOY6coth3yFvHlmzOGzwlSV2Z18ixJOWIdWUa-xR-AKaGKrI1lTRcEq5ykzkGVUKdS1djEtFmyNDpBQTmFjnsJkE3aVC0M_Nl1Vnx-xPkBiFzYRh1BAlTp0Cmsi0d4cw3lafg9NjhL76tYKNCEmktT', 'Cocktail Hour', 'Cocktail Hours', true, 7),
  ('https://lh3.googleusercontent.com/aida-public/AB6AXuD2nVkaaWk4c0OMStzn7yGMtnpn8yD4coFr_5eoDBh-oWE6kYAft0xJmaIu6XYetVRSP-HvNWbN1_OHBB1mMuLaAPK6r1ZLSW9_eCkBEXPauX7vRJlN73J_8ZeSxom5zPSHeljx8infEYJxLgJi9KJOizHeiBNjLXW_5kgyc-nzrZ1tJfEQFVAFapzaTgf_r2Jh5xBqGW01fauLh9ZZ82FBlsG1vRtjIrYkfPT8RumrjBpghoe6Ls8JL_v2bvvFNm-kfUd_c-1Tx6Ad', 'Garden Brunch', 'Seasonal Soirées', true, 8);