-- ============================================
--  BADMINTON EXPENSE MANAGER - Database Setup
-- ============================================

CREATE DATABASE IF NOT EXISTS badminton_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE badminton_db;

-- Spring Boot / Hibernate will auto-create tables via ddl-auto=update
-- This script just ensures the database exists with correct charset.

-- Optional: Create a dedicated user (change password as needed)
-- CREATE USER IF NOT EXISTS 'badminton'@'localhost' IDENTIFIED BY 'badminton123';
-- GRANT ALL PRIVILEGES ON badminton_db.* TO 'badminton'@'localhost';
-- FLUSH PRIVILEGES;

SELECT 'Database badminton_db ready!' AS status;
