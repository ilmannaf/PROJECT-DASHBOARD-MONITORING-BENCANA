-- Add the number of tank trucks and the activity documentation photo.
ALTER TABLE water_distributions
  ADD COLUMN tank_truck_count INT NOT NULL DEFAULT 1,
  ADD COLUMN documentation_photo VARCHAR(255) NULL;