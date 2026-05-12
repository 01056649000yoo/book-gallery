-- Classes
CREATE TABLE classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Books
CREATE TABLE books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  description TEXT,
  cover_image_path TEXT NOT NULL,
  pdf_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- QR Tokens
CREATE TABLE qr_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Storage: private buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('covers', 'covers', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('pdfs', 'pdfs', false);

-- RLS: service role only (app uses service role key server-side)
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_only" ON classes USING (auth.role() = 'service_role');
CREATE POLICY "service_role_only" ON books USING (auth.role() = 'service_role');
CREATE POLICY "service_role_only" ON qr_tokens USING (auth.role() = 'service_role');
