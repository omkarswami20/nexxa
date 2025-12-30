# Fix Seller Status Enum Error

## Problem
The database column `status` in the `sellers` table doesn't have the new enum values we added:
- PENDING
- PENDING_ADMIN_APPROVAL  
- ACTIVE

## Solution

Run this SQL command in your MySQL database:

```sql
ALTER TABLE sellers 
MODIFY COLUMN status ENUM('PENDING', 'PENDING_ADMIN_APPROVAL', 'APPROVED', 'DENIED', 'ACTIVE') NOT NULL DEFAULT 'PENDING';
```

## How to Run

### Option 1: Using MySQL Command Line
```bash
mysql -u root -p nexashop
```
Then paste the ALTER TABLE command above.

### Option 2: Using MySQL Workbench or phpMyAdmin
1. Connect to your database
2. Select the `nexashop` database
3. Run the ALTER TABLE command above

### Option 3: Using the SQL file
The SQL file is located at: `server/src/main/resources/update_seller_status.sql`

## After Running

The seller registration should work without the "Data truncated" error.

