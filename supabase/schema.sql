-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  logo TEXT,
  price DECIMAL(10, 2) NOT NULL,
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('month', 'year')),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  next_renewal DATE,
  payment_method TEXT,
  total_members INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  subscription_email TEXT,
  subscription_password TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create subscription_members table (users in a subscription)
CREATE TABLE IF NOT EXISTS public.subscription_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  is_owner BOOLEAN DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(subscription_id, user_id)
);

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.subscription_members(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('paid', 'pending', 'auto-paid', 'failed')),
  payment_date DATE,
  due_date DATE,
  billing_period_start DATE,
  billing_period_end DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('payment', 'reminder', 'invitation', 'update')),
  is_read BOOLEAN DEFAULT false,
  related_subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create invitations table
CREATE TABLE IF NOT EXISTS public.invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  inviter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  invitee_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for subscriptions
CREATE POLICY "Users can view subscriptions they are members of"
  ON public.subscriptions FOR SELECT
  USING (
    id IN (
      SELECT subscription_id FROM public.subscription_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update their subscriptions"
  ON public.subscriptions FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Users can create subscriptions"
  ON public.subscriptions FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can delete their subscriptions"
  ON public.subscriptions FOR DELETE
  USING (owner_id = auth.uid());

-- RLS Policies for subscription_members
CREATE POLICY "Users can view members of their subscriptions"
  ON public.subscription_members FOR SELECT
  USING (
    subscription_id IN (
      SELECT subscription_id FROM public.subscription_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can add members to their subscriptions"
  ON public.subscription_members FOR INSERT
  WITH CHECK (
    subscription_id IN (
      SELECT id FROM public.subscriptions WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can remove members from their subscriptions"
  ON public.subscription_members FOR DELETE
  USING (
    subscription_id IN (
      SELECT id FROM public.subscriptions WHERE owner_id = auth.uid()
    )
  );

-- RLS Policies for payments
CREATE POLICY "Users can view payments for their subscriptions"
  ON public.payments FOR SELECT
  USING (
    subscription_id IN (
      SELECT subscription_id FROM public.subscription_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create payments for their memberships"
  ON public.payments FOR INSERT
  WITH CHECK (
    member_id IN (
      SELECT id FROM public.subscription_members WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for invitations
CREATE POLICY "Users can view invitations they sent or received"
  ON public.invitations FOR SELECT
  USING (inviter_id = auth.uid() OR invitee_email = (SELECT email FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Anyone can view invitation by token"
  ON public.invitations FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create invitations for their subscriptions"
  ON public.invitations FOR INSERT
  WITH CHECK (
    inviter_id = auth.uid() AND
    subscription_id IN (
      SELECT id FROM public.subscriptions WHERE owner_id = auth.uid()
    )
  );

-- Function to get user subscriptions with credentials, bypassing RLS
CREATE OR REPLACE FUNCTION get_user_subscriptions(user_id UUID)
RETURNS TABLE(
  subscription_id UUID,
  name TEXT,
  logo TEXT,
  price DECIMAL,
  billing_cycle TEXT,
  next_renewal DATE,
  owner_id UUID,
  is_active BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  total_members INTEGER,
  payment_method TEXT,
  subscription_email TEXT,
  subscription_password TEXT,
  amount DECIMAL,
  is_owner BOOLEAN
) LANGUAGE SQL SECURITY DEFINER SET search_path = public AS $$
  SELECT
    s.id,
    s.name,
    s.logo,
    s.price,
    s.billing_cycle,
    s.next_renewal,
    s.owner_id,
    s.is_active,
    s.created_at,
    s.updated_at,
    s.total_members,
    s.payment_method,
    s.subscription_email,
    s.subscription_password,
    sm.amount,
    sm.is_owner
  FROM public.subscriptions s
  INNER JOIN public.subscription_members sm ON s.id = sm.subscription_id
  WHERE sm.user_id = user_id
  ORDER BY s.created_at DESC;
$$ STABLE;

-- Function to leave a subscription (remove current user from members)
CREATE OR REPLACE FUNCTION leave_subscription(sub_id UUID)
RETURNS BOOLEAN LANGUAGE PLPGSQL SECURITY DEFINER SET search_path = public AS $$
DECLARE
  is_owner BOOLEAN;
BEGIN
  -- Verificar que el usuario actual NO es el dueño
  SELECT owner_id = auth.uid()
  INTO is_owner
  FROM subscriptions
  WHERE id = sub_id;

  IF is_owner THEN
    RAISE EXCEPTION 'El dueño no puede salirse de la suscripción';
  END IF;

  -- Eliminar al usuario de los miembros
  DELETE FROM subscription_members
  WHERE subscription_id = sub_id AND user_id = auth.uid();

  RETURN TRUE;
END;
$$;

-- Function to delete a subscription (only owner)
CREATE OR REPLACE FUNCTION delete_user_subscription(sub_id UUID)
RETURNS BOOLEAN LANGUAGE PLPGSQL SECURITY DEFINER SET search_path = public AS $$
DECLARE
  is_owner BOOLEAN;
BEGIN
  -- Verificar que el usuario actual es el dueño
  SELECT owner_id = auth.uid()
  INTO is_owner
  FROM subscriptions
  WHERE id = sub_id;

  IF NOT is_owner THEN
    RAISE EXCEPTION 'Solo el dueño puede eliminar la suscripción';
  END IF;

  -- Eliminar la suscripción (las referencias en cascade se eliminan automáticamente)
  DELETE FROM subscriptions WHERE id = sub_id;

  RETURN TRUE;
END;
$$;

CREATE POLICY "Invitees can update invitation status"
  ON public.invitations FOR UPDATE
  USING (invitee_email = (SELECT email FROM public.profiles WHERE id = auth.uid()))
  WITH CHECK (status IN ('accepted', 'declined'));

-- Create function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_owner ON public.subscriptions(owner_id);
CREATE INDEX IF NOT EXISTS idx_subscription_members_subscription ON public.subscription_members(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_members_user ON public.subscription_members(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_subscription ON public.payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_member ON public.payments(member_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_invitations_subscription ON public.invitations(subscription_id);

-- Create function to notify when a new member is added to a subscription
CREATE OR REPLACE FUNCTION public.notify_on_new_subscription_member()
RETURNS TRIGGER AS $$
DECLARE
  v_owner_id uuid;
  v_owner_name text;
  v_subscription_name text;
BEGIN
  -- Get subscription owner ID and name
  SELECT owner_id, name INTO v_owner_id, v_subscription_name
  FROM public.subscriptions
  WHERE id = NEW.subscription_id;

  -- If the new member is not the owner, create a notification
  IF NEW.user_id != v_owner_id THEN
    -- Get owner's full name
    SELECT full_name INTO v_owner_name
    FROM public.profiles
    WHERE id = v_owner_id;

    -- Create notification for the new member
    INSERT INTO public.notifications (user_id, title, message, type, related_subscription_id, is_read)
    VALUES (
      NEW.user_id,
      '¡Nuevo plan compartido! 🎉',
      v_owner_name || ' te ha agregado a "' || v_subscription_name || '". ¡Revisa los detalles de tu nueva membresía!',
      'invitation',
      NEW.subscription_id,
      false
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_subscription_member_added ON public.subscription_members;

-- Create trigger to automatically notify when member is added
CREATE TRIGGER on_subscription_member_added
  AFTER INSERT ON public.subscription_members
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_new_subscription_member();
