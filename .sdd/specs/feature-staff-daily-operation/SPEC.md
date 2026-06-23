# Feature Specification: feature-staff-daily-operation

**Feature Branch**: `feature-staff-daily-operation`
**Created**: 2026-06-22
**Status**: Draft
**Input**: User description: "US-PB-06 - Staff quan ly lich trong ngay"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Staff quan ly booking trong ngay (Priority: P1)

Staff xem dashboard booking theo chi nhanh duoc phan cong, check-in/check-out va ghi nhan xu ly tai quay.

**Why this priority**: Day la luong van hanh cot loi tai san trong ngay.

**Independent Test**: Dang nhap Staff, xem danh sach booking dung chi nhanh, check-in/check-out va xac minh phan quyen.

**Acceptance Scenarios**:

1. **Given** Staff dang nhap, **When** mo dashboard, **Then** he thong chi hien thi booking thuoc chi nhanh duoc gan.
2. **Given** Customer den san, **When** Staff check-in bang ma booking, **Then** booking chuyen `checked_in` va luu nguoi thao tac.
3. **Given** buoi choi ket thuc, **When** Staff check-out, **Then** booking chuyen `completed` va luu thoi gian ra.
4. **Given** Staff khong thuoc chi nhanh cua booking, **When** co thao tac, **Then** he thong tu choi theo phan quyen.

---

### Edge Cases

- Staff khong duoc thao tac booking ngoai pham vi chi nhanh duoc gan.
- Booking da `completed` hoac `cancelled` khong duoc check-in/check-out lai.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST cung cap dashboard van hanh theo chi nhanh cho Staff.
- **FR-002**: System MUST ho tro check-in va check-out booking, luu thoi gian va nguoi thao tac.
- **FR-003**: System MUST ap dung phan quyen theo chi nhanh doi voi moi thao tac Staff.

### Key Entities *(include if feature involves data)*

- **StaffAssignment**: Quan he giua Staff va chi nhanh/phan vi duoc thao tac.
- **DailyOperationLog**: Nhat ky thao tac check-in, check-out va xu ly tai quay.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% thao tac check-in/check-out luu du nguoi thuc hien va timestamp.
- **SC-002**: 100% Staff chi xem va thao tac duoc booking trong pham vi chi nhanh duoc cap.

## Assumptions

- Moi Staff duoc gan toi thieu mot chi nhanh hop le.
