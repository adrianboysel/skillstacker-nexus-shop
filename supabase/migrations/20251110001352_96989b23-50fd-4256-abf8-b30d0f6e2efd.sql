-- Add DELETE policies for profiles table

-- Allow users to delete their own profile (GDPR compliance)
CREATE POLICY "Users can delete own profile"
  ON public.profiles
  FOR DELETE
  USING (auth.uid() = user_id);

-- Allow admins to delete any profile
CREATE POLICY "Admins can delete any profile"
  ON public.profiles
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));