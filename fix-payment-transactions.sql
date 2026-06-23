-- Run this file if MySQL Workbench shows:
-- Error Code: 1046. No database selected

USE pickleball_booking_system;

INSERT INTO payment_transactions (
  transaction_code,
  booking_id,
  customer_id,
  amount,
  payment_method,
  status,
  paid_at,
  note
) VALUES
  ('PAY-DEMO-001', 1, 15, 160000, 'bank_transfer', 'success', NOW(), 'Demo paid booking'),
  ('PAY-DEMO-003', 3, 17, 145000, 'cash', 'success', NOW(), 'Demo counter booking')
ON DUPLICATE KEY UPDATE
  booking_id = VALUES(booking_id),
  customer_id = VALUES(customer_id),
  amount = VALUES(amount),
  payment_method = VALUES(payment_method),
  status = VALUES(status),
  paid_at = VALUES(paid_at),
  note = VALUES(note);
