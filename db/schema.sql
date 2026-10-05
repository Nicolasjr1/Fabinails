CREATE TABLE IF NOT EXISTS "Service" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "price" INTEGER NOT NULL,
  "duration" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS "Appointment" (
  "id" TEXT PRIMARY KEY,
  "clientName" TEXT NOT NULL,
  "clientWhatsapp" TEXT NOT NULL,
  "serviceId" TEXT NOT NULL REFERENCES "Service"("id"),
  "date" TEXT NOT NULL,
  "time" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "status" TEXT NOT NULL DEFAULT 'active',
  CONSTRAINT "Appointment_date_time_key" UNIQUE ("date", "time")
);

CREATE INDEX IF NOT EXISTS "Appointment_date_time_idx" ON "Appointment"("date", "time");
CREATE INDEX IF NOT EXISTS "Appointment_status_idx" ON "Appointment"("status");

CREATE TABLE IF NOT EXISTS "BookingHold" (
  "token" TEXT PRIMARY KEY,
  "serviceId" TEXT NOT NULL REFERENCES "Service"("id"),
  "date" TEXT NOT NULL,
  "time" TEXT NOT NULL,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "BookingHold_date_time_key" UNIQUE ("date", "time")
);

CREATE INDEX IF NOT EXISTS "BookingHold_expiresAt_idx" ON "BookingHold"("expiresAt");

CREATE TABLE IF NOT EXISTS "BlockedDay" (
  date TEXT PRIMARY KEY,
  reason TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
