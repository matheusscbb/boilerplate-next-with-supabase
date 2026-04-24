-- Add 'admin' to user_role enum in a separate transaction.
-- PostgreSQL does not allow using a freshly-added enum value in the same
-- transaction that added it, so this must be its own migration file.

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';
