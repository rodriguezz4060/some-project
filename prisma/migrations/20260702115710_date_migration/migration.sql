-- Safe date parser: tries ISO format first, then DD.MM.YYYY
CREATE OR REPLACE FUNCTION parse_date_safe(text) RETURNS date AS $$
BEGIN
  IF $1 IS NULL OR $1 = '' THEN
    RETURN NULL;
  END IF;
  BEGIN
    RETURN $1::date;
  EXCEPTION WHEN OTHERS THEN
    BEGIN
      RETURN to_date($1, 'DD.MM.YYYY');
    EXCEPTION WHEN OTHERS THEN
      RETURN NULL;
    END;
  END;
END;
$$ LANGUAGE plpgsql;

-- BzvpPersonnel
ALTER TABLE "BzvpPersonnel" ALTER COLUMN "birthDate" SET DATA TYPE date USING parse_date_safe("birthDate");
ALTER TABLE "BzvpPersonnel" ALTER COLUMN "arrivalDate" SET DATA TYPE date USING parse_date_safe("arrivalDate");
ALTER TABLE "BzvpPersonnel" ALTER COLUMN "ubdDate" SET DATA TYPE date USING parse_date_safe("ubdDate");
DROP INDEX IF EXISTS "BzvpPersonnel_status_idx";
CREATE INDEX IF NOT EXISTS "BzvpPersonnel_status_idx" ON "BzvpPersonnel"("status");
CREATE INDEX IF NOT EXISTS "BzvpPersonnel_arrivalDate_idx" ON "BzvpPersonnel"("arrivalDate");

-- MilitaryPersonnel
ALTER TABLE "MilitaryPersonnel" ALTER COLUMN "birthDate" SET DATA TYPE date USING parse_date_safe("birthDate");

-- MedicalRecord
ALTER TABLE "MedicalRecord" ALTER COLUMN "diagnosisDate" SET DATA TYPE date USING parse_date_safe("diagnosisDate");

-- Achievement
ALTER TABLE "Achievement" ALTER COLUMN "date" SET DATA TYPE date USING parse_date_safe("date");

-- Equipment
ALTER TABLE "Equipment" ALTER COLUMN "issuedDate" SET DATA TYPE date USING parse_date_safe("issuedDate");

-- PositionEntry: remove records with unparseable dates first, then alter
DELETE FROM "PositionEntry" WHERE "startDate" IS NULL OR "startDate" = '' OR parse_date_safe("startDate") IS NULL;
ALTER TABLE "PositionEntry" ALTER COLUMN "startDate" SET DATA TYPE date USING parse_date_safe("startDate");
ALTER TABLE "PositionEntry" ALTER COLUMN "endDate" SET DATA TYPE date USING parse_date_safe("endDate");

-- FuelRecord
ALTER TABLE "FuelRecord" ALTER COLUMN "date" SET DATA TYPE date USING parse_date_safe("date");
DROP INDEX IF EXISTS "FuelRecord_date_idx";
CREATE INDEX IF NOT EXISTS "FuelRecord_date_idx" ON "FuelRecord"("date");

-- Cleanup
DROP FUNCTION IF EXISTS parse_date_safe;
