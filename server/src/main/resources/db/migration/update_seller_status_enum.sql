-- Update sellers table status column to include new enum values
-- This migration adds: PENDING, PENDING_ADMIN_APPROVAL, ACTIVE to the existing enum

ALTER TABLE sellers 
MODIFY COLUMN status ENUM('PENDING', 'PENDING_ADMIN_APPROVAL', 'APPROVED', 'DENIED', 'ACTIVE') NOT NULL DEFAULT 'PENDING';

