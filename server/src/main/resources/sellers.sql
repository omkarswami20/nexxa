-- Note: Passwords in the database are BCrypt encoded. 
-- The password for these users is 'password' (hash: $2a$10$N.zmdr9k7uOCQb376NoUnutj8iAt6.VwUEM1El3.r2ms.eJ.M.N.e - example hash)
INSERT INTO sellers (name, email, password, store_name, status) VALUES 
('John Doe', 'john@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnutj8iAt6.VwUEM1El3.r2ms.eJ.M.N.e', 'Johns Store', 'APPROVED'),
('Jane Smith', 'jane@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnutj8iAt6.VwUEM1El3.r2ms.eJ.M.N.e', 'Janes Boutique', 'PENDING_APPROVAL');
