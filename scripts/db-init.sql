-- One-time database bootstrap. Run as the `postgres` superuser AFTER
-- installing PostgreSQL but BEFORE the first `pnpm db:push`.
--
-- Easiest path: open pgAdmin → right-click "Login/Group Roles → postgres" →
-- Query Tool → paste the lines below → Execute (F5).
--
-- Or via psql (Start menu → "SQL Shell (psql)"):
--   \i C:/Users/SmartBee/Desktop/adVexa/scripts/db-init.sql

CREATE DATABASE advexa
  WITH ENCODING = 'UTF8'
       LC_COLLATE = 'en-US'
       LC_CTYPE = 'en-US'
       TEMPLATE = template0;

-- Optional: dedicated app user (recommended for production; for local dev
-- the default `postgres` superuser is fine).
-- CREATE USER advexa_app WITH PASSWORD 'change_me_in_prod';
-- GRANT ALL PRIVILEGES ON DATABASE advexa TO advexa_app;
