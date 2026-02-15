-- =====================================================
-- Align music_releases.release_type with app contract
-- =====================================================
-- App and API contract uses: single | ep | album | mixtape
-- This migration converts any legacy 'compilation' values to 'mixtape'
-- and enforces the aligned check constraint.

BEGIN;

UPDATE music_releases
SET release_type = 'mixtape'
WHERE release_type = 'compilation';

ALTER TABLE music_releases
DROP CONSTRAINT IF EXISTS music_releases_release_type_check;

ALTER TABLE music_releases
ADD CONSTRAINT music_releases_release_type_check
CHECK (
  release_type IN ('single', 'ep', 'album', 'mixtape')
);

COMMENT ON CONSTRAINT music_releases_release_type_check ON music_releases
IS 'Allowed release types aligned with frontend/backend contract: single, ep, album, mixtape';

COMMIT;
