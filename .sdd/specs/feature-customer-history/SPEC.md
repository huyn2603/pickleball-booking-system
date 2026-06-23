# Feature Specification: feature-customer-history

**Feature Branch**: `feature-customer-history`
**Created**: 2026-06-22
**Status**: Draft
**Input**: User description: "US-PB-11 - Lich su giao dich Customer"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Customer xem lich su giao dich (Priority: P2)

Customer xem lich su booking, payment, refund va addon cua chinh minh.

**Why this priority**: Tinh nang nay tao su minh bach cho khach hang va ho tro dat lai sau nay.

**Independent Test**: Mo lich su theo bo loc, xem chi tiet tung booking va doi chieu du lieu giao dich.

**Acceptance Scenarios**:

1. **Given** Customer dang nhap, **When** mo lich su dat san, **Then** he thong hien danh sach booking moi nhat truoc.
2. **Given** Customer xem chi tiet mot booking, **When** mo man hinh chi tiet, **Then** hien thi san, gio, addon, payment va refund neu co.
3. **Given** Customer loc theo thang hoac trang thai, **When** ap dung bo loc, **Then** danh sach chi hien thi booking phu hop.

---

### Edge Cases

- Customer chi duoc xem lich su va thong tin giao dich cua chinh minh.
- Booking da bi xoa mem hoac addon da vo hieu hoa van phai hien du lieu lich su.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST cung cap lich su booking, payment, refund va addon cho tung Customer.
- **FR-002**: System MUST ho tro xem chi tiet booking lich su.
- **FR-003**: System MUST ho tro loc lich su theo thoi gian hoac trang thai.

### Key Entities *(include if feature involves data)*

- **CustomerHistory**: Tong hop booking, payment, refund va addon cua Customer.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Customer co the tim thay booking da dat trong lich su trong duoi 30 giay.
- **SC-002**: 100% du lieu lich su chi hien thi cho dung chu tai khoan.

## Assumptions

- Lich su giao dich lay booking, payment va refund lam nguon su that.
