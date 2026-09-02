-- Migration: Add photos column to disaster_records table
-- Run this SQL to add photo support for disaster records

ALTER TABLE disaster_records 
ADD COLUMN photos JSON DEFAULT NULL;

-- The photos column will store a JSON array of photo URLs
-- Example: ["/uploads/1234567890-photo1.jpg", "/uploads/1234567891-photo2.jpg"]
