-- Rename products table to domains
ALTER TABLE products RENAME TO domains;

-- Update the pillar_products junction table
ALTER TABLE pillar_products RENAME TO pillar_domains;
ALTER TABLE pillar_domains RENAME COLUMN product_id TO domain_id;

-- Update RLS policies on the renamed table
DROP POLICY "Users can create own products" ON domains;
DROP POLICY "Users can delete own products" ON domains;
DROP POLICY "Users can update own products" ON domains;
DROP POLICY "Users can view own products" ON domains;

CREATE POLICY "Users can create own domains" 
ON domains 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own domains" 
ON domains 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own domains" 
ON domains 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view own domains" 
ON domains 
FOR SELECT 
USING (auth.uid() = user_id);

-- Update RLS policies on the junction table
DROP POLICY "Users can create own pillar_products" ON pillar_domains;
DROP POLICY "Users can delete own pillar_products" ON pillar_domains;
DROP POLICY "Users can view own pillar_products" ON pillar_domains;

CREATE POLICY "Users can create own pillar_domains" 
ON pillar_domains 
FOR INSERT 
WITH CHECK (EXISTS ( SELECT 1
   FROM strategic_pillars
  WHERE ((strategic_pillars.id = pillar_domains.pillar_id) AND (strategic_pillars.user_id = auth.uid()))));

CREATE POLICY "Users can delete own pillar_domains" 
ON pillar_domains 
FOR DELETE 
USING (EXISTS ( SELECT 1
   FROM strategic_pillars
  WHERE ((strategic_pillars.id = pillar_domains.pillar_id) AND (strategic_pillars.user_id = auth.uid()))));

CREATE POLICY "Users can view own pillar_domains" 
ON pillar_domains 
FOR SELECT 
USING (EXISTS ( SELECT 1
   FROM strategic_pillars
  WHERE ((strategic_pillars.id = pillar_domains.pillar_id) AND (strategic_pillars.user_id = auth.uid()))));