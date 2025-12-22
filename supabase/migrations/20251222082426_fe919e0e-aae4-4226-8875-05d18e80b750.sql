-- Drop the existing SELECT policy that requires authentication
DROP POLICY IF EXISTS "Users can view their own orders or admin can view all" ON public.orders;

-- Create a new SELECT policy that allows viewing by email or admin
CREATE POLICY "Users can view orders by email or admin can view all" 
ON public.orders 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR true
);

-- Also update order_items policy to allow viewing items for any order
DROP POLICY IF EXISTS "Users can view their own order items or admin can view all" ON public.order_items;

CREATE POLICY "Anyone can view order items" 
ON public.order_items 
FOR SELECT 
USING (true);