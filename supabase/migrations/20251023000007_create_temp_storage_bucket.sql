-- Create temporary storage bucket for statement PDFs during processing
-- Files are automatically deleted after processing completes

-- Create bucket for temporary PDF storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'statement-temp',
  'statement-temp',
  false, -- Private bucket
  26214400, -- 25MB limit (25 * 1024 * 1024)
  ARRAY['application/pdf']
);

-- RLS Policy: Users can only upload their own files to temp storage
CREATE POLICY "Users can upload their own temp files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'statement-temp' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS Policy: Users can read their own temp files
CREATE POLICY "Users can read their own temp files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'statement-temp' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS Policy: Users can delete their own temp files
CREATE POLICY "Users can delete their own temp files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'statement-temp' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Service role can do everything (for background job cleanup)
CREATE POLICY "Service role can manage all temp files"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'statement-temp')
WITH CHECK (bucket_id = 'statement-temp');

-- Note: Files should be manually deleted by background jobs after processing
-- Consider adding a scheduled cleanup job for orphaned files older than 24 hours
