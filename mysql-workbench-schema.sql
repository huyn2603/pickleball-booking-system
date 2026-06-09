-- Pickleball Booking System - MySQL Workbench schema
-- Scope: one pickleball venue in Ha Noi, no branches/regions.
-- Target: MySQL 8.0+

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION';

DROP DATABASE IF EXISTS pickleball_booking_system;
CREATE DATABASE pickleball_booking_system
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE pickleball_booking_system;

CREATE TABLE settings (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  venue_name VARCHAR(150) NOT NULL,
  city VARCHAR(100) NOT NULL DEFAULT 'Ha Noi',
  address VARCHAR(255) NOT NULL,
  phone VARCHAR(30) NULL,
  email VARCHAR(150) NULL,
  open_time TIME NOT NULL DEFAULT '05:00:00',
  close_time TIME NOT NULL DEFAULT '22:00:00',
  slot_minutes SMALLINT UNSIGNED NOT NULL DEFAULT 30,
  hold_minutes SMALLINT UNSIGNED NOT NULL DEFAULT 10,
  timezone VARCHAR(80) NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
  currency CHAR(3) NOT NULL DEFAULT 'VND',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT chk_settings_time CHECK (open_time < close_time),
  CONSTRAINT chk_settings_slot CHECK (slot_minutes > 0),
  CONSTRAINT chk_settings_hold CHECK (hold_minutes BETWEEN 1 AND 15)
) ENGINE=InnoDB;

CREATE TABLE roles (
  id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(40) NOT NULL,
  name VARCHAR(80) NOT NULL,
  description VARCHAR(255) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_roles_code (code)
) ENGINE=InnoDB;

CREATE TABLE users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role_id TINYINT UNSIGNED NOT NULL,
  status ENUM('Active','Inactive','Blocked','Unverified') NOT NULL DEFAULT 'Active',
  email_verified_at DATETIME NULL,
  last_login_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_phone (phone),
  KEY idx_users_role_status (role_id, status),
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id),
  CONSTRAINT chk_users_gmail CHECK (email LIKE '%@gmail.com')
) ENGINE=InnoDB;

CREATE TABLE password_reset_otps (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  email VARCHAR(150) NOT NULL,
  otp_hash CHAR(64) NOT NULL,
  reset_token_hash CHAR(64) NULL,
  attempt_count TINYINT UNSIGNED NOT NULL DEFAULT 0,
  expires_at DATETIME NOT NULL,
  verified_at DATETIME NULL,
  used_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_password_reset_email_status (email, expires_at, verified_at, used_at),
  CONSTRAINT fk_password_reset_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chk_password_reset_attempts CHECK (attempt_count <= 10)
) ENGINE=InnoDB;

CREATE TABLE courts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(30) NOT NULL,
  name VARCHAR(120) NOT NULL,
  court_type ENUM('indoor','outdoor') NOT NULL DEFAULT 'indoor',
  surface_type ENUM('standard','premium','synthetic','concrete','wood') NOT NULL DEFAULT 'standard',
  base_price_per_hour INT UNSIGNED NOT NULL,
  peak_price_per_slot INT UNSIGNED NOT NULL DEFAULT 120000,
  off_peak_price_per_slot INT UNSIGNED NOT NULL DEFAULT 80000,
  facilities JSON NULL,
  status ENUM('available','maintenance','inactive') NOT NULL DEFAULT 'available',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_courts_code (code),
  KEY idx_courts_status (status),
  KEY idx_courts_type_surface (court_type, surface_type),
  CONSTRAINT chk_courts_base_price CHECK (base_price_per_hour >= 0)
) ENGINE=InnoDB;

CREATE TABLE price_rules (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  court_id BIGINT UNSIGNED NULL,
  name VARCHAR(120) NOT NULL,
  day_of_week TINYINT UNSIGNED NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  price_per_slot INT UNSIGNED NOT NULL,
  priority SMALLINT UNSIGNED NOT NULL DEFAULT 100,
  valid_from DATE NULL,
  valid_to DATE NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_price_rules_lookup (court_id, day_of_week, is_active),
  CONSTRAINT fk_price_rules_court FOREIGN KEY (court_id) REFERENCES courts(id),
  CONSTRAINT chk_price_rules_time CHECK (start_time < end_time),
  CONSTRAINT chk_price_rules_dow CHECK (day_of_week IS NULL OR day_of_week BETWEEN 1 AND 7)
) ENGINE=InnoDB;

CREATE TABLE categories (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  description VARCHAR(255) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_categories_name (name)
) ENGINE=InnoDB;

CREATE TABLE addon_services (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_id BIGINT UNSIGNED NOT NULL,
  code VARCHAR(40) NOT NULL,
  name VARCHAR(120) NOT NULL,
  service_type ENUM('rental','sale') NOT NULL,
  unit_price INT UNSIGNED NOT NULL,
  stock_quantity INT UNSIGNED NOT NULL DEFAULT 0,
  status ENUM('active','inactive','out_of_stock') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_addon_services_code (code),
  KEY idx_addon_services_category_status (category_id, status),
  CONSTRAINT fk_addon_services_category FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB;

CREATE TABLE promotions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(120) NOT NULL,
  description VARCHAR(255) NULL,
  discount_type ENUM('percentage','fixed_amount') NOT NULL,
  discount_value INT UNSIGNED NOT NULL,
  max_discount_amount INT UNSIGNED NULL,
  min_order_amount INT UNSIGNED NOT NULL DEFAULT 0,
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  usage_limit INT UNSIGNED NULL,
  used_count INT UNSIGNED NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_promotions_code (code),
  KEY idx_promotions_active_dates (is_active, start_date, end_date),
  CONSTRAINT chk_promotions_dates CHECK (start_date < end_date),
  CONSTRAINT chk_promotions_percent CHECK (discount_type <> 'percentage' OR discount_value BETWEEN 1 AND 100)
) ENGINE=InnoDB;

CREATE TABLE vouchers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  promotion_id BIGINT UNSIGNED NOT NULL,
  voucher_code VARCHAR(50) NOT NULL,
  max_usage INT UNSIGNED NOT NULL DEFAULT 1,
  used_count INT UNSIGNED NOT NULL DEFAULT 0,
  status ENUM('active','inactive','expired','used_up') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_vouchers_code (voucher_code),
  KEY idx_vouchers_promotion_status (promotion_id, status),
  CONSTRAINT fk_vouchers_promotion FOREIGN KEY (promotion_id) REFERENCES promotions(id),
  CONSTRAINT chk_vouchers_usage CHECK (used_count <= max_usage)
) ENGINE=InnoDB;

CREATE TABLE bookings (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  booking_code VARCHAR(50) NOT NULL,
  customer_id BIGINT UNSIGNED NOT NULL,
  staff_id BIGINT UNSIGNED NULL,
  court_id BIGINT UNSIGNED NOT NULL,
  promotion_id BIGINT UNSIGNED NULL,
  voucher_id BIGINT UNSIGNED NULL,
  booking_date DATE NOT NULL,
  sub_total INT UNSIGNED NOT NULL DEFAULT 0,
  discount_amount INT UNSIGNED NOT NULL DEFAULT 0,
  total_amount INT UNSIGNED NOT NULL DEFAULT 0,
  payment_status ENUM('unpaid','pending','paid','partially_refunded','refunded','failed') NOT NULL DEFAULT 'unpaid',
  booking_status ENUM('pending','confirmed','checked_in','completed','cancelled','expired','no_show') NOT NULL DEFAULT 'pending',
  source ENUM('online','counter','admin') NOT NULL DEFAULT 'online',
  expires_at DATETIME NULL,
  checked_in_at DATETIME NULL,
  checked_out_at DATETIME NULL,
  cancel_reason VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_bookings_code (booking_code),
  KEY idx_bookings_customer_created (customer_id, created_at),
  KEY idx_bookings_staff_date (staff_id, booking_date),
  KEY idx_bookings_court_date_status (court_id, booking_date, booking_status),
  KEY idx_bookings_payment_status (payment_status, booking_status),
  CONSTRAINT fk_bookings_customer FOREIGN KEY (customer_id) REFERENCES users(id),
  CONSTRAINT fk_bookings_staff FOREIGN KEY (staff_id) REFERENCES users(id),
  CONSTRAINT fk_bookings_court FOREIGN KEY (court_id) REFERENCES courts(id),
  CONSTRAINT fk_bookings_promotion FOREIGN KEY (promotion_id) REFERENCES promotions(id),
  CONSTRAINT fk_bookings_voucher FOREIGN KEY (voucher_id) REFERENCES vouchers(id),
  CONSTRAINT chk_bookings_amounts CHECK (discount_amount <= sub_total AND total_amount = sub_total - discount_amount)
) ENGINE=InnoDB;

CREATE TABLE booking_slots (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  booking_id BIGINT UNSIGNED NOT NULL,
  court_id BIGINT UNSIGNED NOT NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  price INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_booking_slots_booking (booking_id),
  KEY idx_booking_slots_lookup (court_id, booking_date, start_time, end_time),
  CONSTRAINT fk_booking_slots_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_booking_slots_court FOREIGN KEY (court_id) REFERENCES courts(id),
  CONSTRAINT chk_booking_slots_time CHECK (start_time < end_time)
) ENGINE=InnoDB;

CREATE TABLE slot_holds (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  hold_code VARCHAR(50) NOT NULL,
  customer_id BIGINT UNSIGNED NOT NULL,
  court_id BIGINT UNSIGNED NOT NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status ENUM('active','converted','expired','cancelled') NOT NULL DEFAULT 'active',
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_slot_holds_code (hold_code),
  KEY idx_slot_holds_lookup (court_id, booking_date, start_time, end_time, status),
  KEY idx_slot_holds_expires (expires_at, status),
  CONSTRAINT fk_slot_holds_customer FOREIGN KEY (customer_id) REFERENCES users(id),
  CONSTRAINT fk_slot_holds_court FOREIGN KEY (court_id) REFERENCES courts(id),
  CONSTRAINT chk_slot_holds_time CHECK (start_time < end_time)
) ENGINE=InnoDB;

CREATE TABLE booking_addons (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  booking_id BIGINT UNSIGNED NOT NULL,
  addon_service_id BIGINT UNSIGNED NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  unit_price INT UNSIGNED NOT NULL,
  line_total INT UNSIGNED AS (quantity * unit_price) STORED,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_booking_addons_booking (booking_id),
  CONSTRAINT fk_booking_addons_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_booking_addons_service FOREIGN KEY (addon_service_id) REFERENCES addon_services(id),
  CONSTRAINT chk_booking_addons_quantity CHECK (quantity > 0)
) ENGINE=InnoDB;

CREATE TABLE payment_transactions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  transaction_code VARCHAR(60) NOT NULL,
  booking_id BIGINT UNSIGNED NOT NULL,
  customer_id BIGINT UNSIGNED NOT NULL,
  amount INT UNSIGNED NOT NULL,
  payment_method ENUM('cash','bank_transfer','momo','vnpay','zalopay','card') NOT NULL,
  gateway_reference VARCHAR(120) NULL,
  status ENUM('pending','success','failed','cancelled','refunded') NOT NULL DEFAULT 'pending',
  retry_count TINYINT UNSIGNED NOT NULL DEFAULT 0,
  paid_at DATETIME NULL,
  note VARCHAR(255) NULL,
  raw_response JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_payment_transactions_code (transaction_code),
  UNIQUE KEY uq_payment_gateway_reference (gateway_reference),
  KEY idx_payment_booking_status (booking_id, status),
  KEY idx_payment_customer_created (customer_id, created_at),
  CONSTRAINT fk_payment_booking FOREIGN KEY (booking_id) REFERENCES bookings(id),
  CONSTRAINT fk_payment_customer FOREIGN KEY (customer_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE refunds (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  refund_code VARCHAR(60) NOT NULL,
  booking_id BIGINT UNSIGNED NOT NULL,
  payment_transaction_id BIGINT UNSIGNED NULL,
  customer_id BIGINT UNSIGNED NOT NULL,
  processed_by BIGINT UNSIGNED NULL,
  amount_requested INT UNSIGNED NOT NULL,
  refund_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
  reason VARCHAR(255) NOT NULL,
  status ENUM('requested','approved','rejected','processing','completed','failed') NOT NULL DEFAULT 'requested',
  refund_transaction_id VARCHAR(120) NULL,
  rejection_reason VARCHAR(255) NULL,
  processed_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_refunds_code (refund_code),
  UNIQUE KEY uq_refund_transaction_id (refund_transaction_id),
  KEY idx_refunds_booking_status (booking_id, status),
  KEY idx_refunds_customer_created (customer_id, created_at),
  CONSTRAINT fk_refunds_booking FOREIGN KEY (booking_id) REFERENCES bookings(id),
  CONSTRAINT fk_refunds_payment FOREIGN KEY (payment_transaction_id) REFERENCES payment_transactions(id),
  CONSTRAINT fk_refunds_customer FOREIGN KEY (customer_id) REFERENCES users(id),
  CONSTRAINT fk_refunds_processed_by FOREIGN KEY (processed_by) REFERENCES users(id),
  CONSTRAINT chk_refunds_percent CHECK (refund_percent BETWEEN 0 AND 100)
) ENGINE=InnoDB;

CREATE TABLE feedback (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  booking_id BIGINT UNSIGNED NOT NULL,
  customer_id BIGINT UNSIGNED NOT NULL,
  rating TINYINT UNSIGNED NOT NULL,
  content TEXT NULL,
  status ENUM('new','flagged','reviewed','resolved','hidden') NOT NULL DEFAULT 'new',
  handled_by BIGINT UNSIGNED NULL,
  handled_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_feedback_booking (booking_id),
  KEY idx_feedback_customer_created (customer_id, created_at),
  KEY idx_feedback_status_rating (status, rating),
  CONSTRAINT fk_feedback_booking FOREIGN KEY (booking_id) REFERENCES bookings(id),
  CONSTRAINT fk_feedback_customer FOREIGN KEY (customer_id) REFERENCES users(id),
  CONSTRAINT fk_feedback_handled_by FOREIGN KEY (handled_by) REFERENCES users(id),
  CONSTRAINT chk_feedback_rating CHECK (rating BETWEEN 1 AND 5)
) ENGINE=InnoDB;

CREATE TABLE email_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  related_booking_id BIGINT UNSIGNED NULL,
  recipient_email VARCHAR(150) NOT NULL,
  email_type ENUM('registration','booking_confirmation','booking_cancelled','booking_reminder','refund_status','promotion') NOT NULL,
  subject VARCHAR(255) NULL,
  status ENUM('pending','sent','failed') NOT NULL DEFAULT 'pending',
  retry_count TINYINT UNSIGNED NOT NULL DEFAULT 0,
  provider_message_id VARCHAR(120) NULL,
  error_message VARCHAR(500) NULL,
  sent_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_email_logs_booking (related_booking_id),
  KEY idx_email_logs_status_retry (status, retry_count),
  CONSTRAINT fk_email_logs_booking FOREIGN KEY (related_booking_id) REFERENCES bookings(id),
  CONSTRAINT chk_email_logs_retry CHECK (retry_count <= 3)
) ENGINE=InnoDB;

CREATE TABLE audit_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NULL,
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100) NOT NULL,
  record_id BIGINT UNSIGNED NULL,
  old_data JSON NULL,
  new_data JSON NULL,
  ip_address VARCHAR(45) NULL,
  user_agent VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_audit_logs_user_created (user_id, created_at),
  KEY idx_audit_logs_table_record (table_name, record_id),
  CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

DELIMITER $$

CREATE TRIGGER trg_booking_slots_no_overlap_insert
BEFORE INSERT ON booking_slots
FOR EACH ROW
BEGIN
  IF EXISTS (
    SELECT 1
    FROM booking_slots bs
    JOIN bookings b ON b.id = bs.booking_id
    WHERE bs.court_id = NEW.court_id
      AND bs.booking_date = NEW.booking_date
      AND b.booking_status IN ('pending','confirmed','checked_in')
      AND NEW.start_time < bs.end_time
      AND NEW.end_time > bs.start_time
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Court slot overlaps an active booking';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM slot_holds sh
    WHERE sh.court_id = NEW.court_id
      AND sh.booking_date = NEW.booking_date
      AND sh.status = 'active'
      AND sh.expires_at > NOW()
      AND NEW.start_time < sh.end_time
      AND NEW.end_time > sh.start_time
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Court slot overlaps an active hold';
  END IF;
END$$

CREATE TRIGGER trg_slot_holds_no_overlap_insert
BEFORE INSERT ON slot_holds
FOR EACH ROW
BEGIN
  IF EXISTS (
    SELECT 1
    FROM slot_holds sh
    WHERE sh.court_id = NEW.court_id
      AND sh.booking_date = NEW.booking_date
      AND sh.status = 'active'
      AND sh.expires_at > NOW()
      AND NEW.start_time < sh.end_time
      AND NEW.end_time > sh.start_time
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Court hold overlaps an active hold';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM booking_slots bs
    JOIN bookings b ON b.id = bs.booking_id
    WHERE bs.court_id = NEW.court_id
      AND bs.booking_date = NEW.booking_date
      AND b.booking_status IN ('pending','confirmed','checked_in')
      AND NEW.start_time < bs.end_time
      AND NEW.end_time > bs.start_time
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Court hold overlaps an active booking';
  END IF;
END$$

DELIMITER ;

INSERT INTO roles (code, name, description) VALUES
  ('Admin', 'Admin', 'System administrator'),
  ('Owner', 'Owner', 'Venue owner'),
  ('Staff', 'Staff', 'Court and booking operator'),
  ('Customer', 'Customer', 'Online booking user');

INSERT INTO settings (venue_name, city, address, phone, email)
VALUES ('Pickleball Ha Noi', 'Ha Noi', 'Ha Noi, Viet Nam', '0900000000', 'pickleballhanoi@gmail.com');

INSERT INTO users (full_name, email, phone, password, role_id, status, email_verified_at) VALUES
  ('System Admin', 'pickleball.admin@gmail.com', '0900000001', '123456', 1, 'Active', NOW()),
  ('Venue Owner', 'pickleball.owner@gmail.com', '0900000002', '123456', 2, 'Active', NOW()),
  ('Counter Staff', 'pickleball.staff@gmail.com', '0900000003', '123456', 3, 'Active', NOW()),
  ('Demo Customer', 'pickleball.customer@gmail.com', '0900000004', '123456', 4, 'Active', NOW());

INSERT INTO courts (code, name, court_type, surface_type, base_price_per_hour, facilities) VALUES
  ('A1', 'San A1', 'indoor', 'standard', 160000, JSON_ARRAY('lighting','parking','locker')),
  ('A2', 'San A2', 'indoor', 'standard', 160000, JSON_ARRAY('lighting','parking')),
  ('B1', 'San B1', 'outdoor', 'synthetic', 140000, JSON_ARRAY('lighting','parking'));

INSERT INTO price_rules (court_id, name, day_of_week, start_time, end_time, price_per_slot, priority) VALUES
  (NULL, 'Off peak', NULL, '05:00:00', '17:00:00', 80000, 100),
  (NULL, 'Peak evening', NULL, '17:00:00', '21:00:00', 120000, 10),
  (NULL, 'Late off peak', NULL, '21:00:00', '22:00:00', 80000, 100);

INSERT INTO categories (name, description) VALUES
  ('Racket', 'Rental rackets'),
  ('Ball', 'Pickleball balls'),
  ('Drink', 'Beverages');

INSERT INTO addon_services (category_id, code, name, service_type, unit_price, stock_quantity) VALUES
  (1, 'RACKET-STD', 'Standard racket rental', 'rental', 50000, 20),
  (2, 'BALL-SET', 'Ball set', 'rental', 20000, 30),
  (3, 'WATER', 'Water bottle', 'sale', 10000, 100);

INSERT INTO promotions (code, name, description, discount_type, discount_value, max_discount_amount, min_order_amount, start_date, end_date, usage_limit)
VALUES ('WELCOME20', 'Welcome discount', '20 percent discount for new customers', 'percentage', 20, 100000, 100000, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 1000);

INSERT INTO vouchers (promotion_id, voucher_code, max_usage)
VALUES (1, 'WELCOME20-DEMO', 1);

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
