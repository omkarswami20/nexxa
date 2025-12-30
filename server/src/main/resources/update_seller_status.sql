-- SQL script to update sellers table status enum
-- Run this manually if you're not using Flyway/Liquibase

-- For MySQL/MariaDB:
ALTER TABLE sellers 
MODIFY COLUMN status ENUM('PENDING', 'PENDING_ADMIN_APPROVAL', 'APPROVED', 'DENIED', 'ACTIVE') NOT NULL DEFAULT 'PENDING';

-- Update existing records if needed:
-- If you have old 'PENDING_APPROVAL' values, update them to 'PENDING_ADMIN_APPROVAL':
-- UPDATE sellers SET status = 'PENDING_ADMIN_APPROVAL' WHERE status = 'PENDING_APPROVAL';

-- If you have old 'APPROVED' values that should be 'ACTIVE':
-- UPDATE sellers SET status = 'ACTIVE' WHERE status = 'APPROVED';

