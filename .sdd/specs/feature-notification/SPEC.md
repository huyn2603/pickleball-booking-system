# Feature Specification: feature-notification

**Feature Branch**: `feature-notification`
**Created**: 2026-06-22
**Status**: Draft
**Input**: User description: "US-PB-12 - Email thong bao"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Gui email cho su kien quan trong (Priority: P2)

He thong gui email cho cac su kien quan trong nhu dang ky, OTP quen mat khau, xac nhan booking, nhac lich va xac nhan huy.

**Why this priority**: Email tang tinh minh bach va cham soc khach hang, nhung flow cot loi van co the hoat dong neu email tam thoi loi.

**Independent Test**: Kich hoat tung su kien va doi chieu noi dung email, log gui mail va retry khi that bai.

**Acceptance Scenarios**:

1. **Given** booking chuyen `confirmed`, **When** email service duoc cau hinh, **Then** Customer nhan email xac nhan gom ma booking, chi nhanh, san, ngay gio.
2. **Given** con 2 gio truoc gio choi, **When** job nhac lich chay, **Then** Customer nhan email nhac lich neu booking chua bi huy.
3. **Given** gui email that bai, **When** service tra loi, **Then** he thong ghi `email_logs`, tang retry count va khong lam hong booking flow.
4. **Given** Customer yeu cau OTP, **When** email service san sang, **Then** OTP duoc gui toi dung dia chi email dang ky.

---

### Edge Cases

- He thong khong duoc fail booking flow chi vi gui email that bai.
- Email nhac lich khong duoc gui cho booking da huy hoac da hoan tat.
- Retry can tranh gui trung qua nhieu lan cho cung mot su kien.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST gui email cho cac su kien dang ky, OTP, xac nhan booking, nhac lich va huy booking.
- **FR-002**: System MUST luu log gui email gom loai su kien, nguoi nhan, thoi diem, ket qua va retry count.
- **FR-003**: System MUST ho tro retry khi gui email that bai.
- **FR-004**: System MUST khong lam gian doan nghiep vu chinh neu email service gap loi tam thoi.
- **FR-005**: System MUST sinh noi dung email co du thong tin nghiep vu toi thieu cho tung su kien.

### Key Entities *(include if feature involves data)*

- **EmailNotification**: Yeu cau gui email gom loai su kien, nguoi nhan, payload du lieu va trang thai xu ly.
- **EmailLog**: Nhat ky gui email gom ket qua, ma loi, retry count va timestamp.
- **ReminderJob**: Tac vu dinh ky dung de gui email nhac lich.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% booking `confirmed` tao ra yeu cau gui email xac nhan khi email service duoc bat.
- **SC-002**: Loi gui email khong lam that bai luong booking hoac reset password.
- **SC-003**: 100% email reminder chi gui cho booking con hieu luc.

## Assumptions

- SMTP hoac nha cung cap email duoc cau hinh theo moi truong.
- Email template co the o dang co ban trong v1, chua can tu bien giao dien phuc tap.
