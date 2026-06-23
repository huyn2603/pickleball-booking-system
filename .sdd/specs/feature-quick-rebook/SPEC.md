# Feature Specification: feature-quick-rebook

**Feature Branch**: `feature-quick-rebook`
**Created**: 2026-06-22
**Status**: Draft
**Input**: User description: "US-PB-17 - Tai dat nhanh"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Dat lai nhanh tu lich su (Priority: P3)

Customer co the dat lai san tung choi tu lich su de giam thao tac khi thuong xuyen dat cung gio hoac cung chi nhanh.

**Why this priority**: Tinh nang nay toi uu trai nghiem nguoi dung quay lai nhung phu thuoc vao lich su va luong dat san da san sang.

**Independent Test**: Chon booking da `completed`, bam `Dat lai` va xac minh form dat san duoc dien san hoac thong bao slot cu da kin.

**Acceptance Scenarios**:

1. **Given** Customer co booking da `completed`, **When** chon `Dat lai`, **Then** he thong mo form dat san voi chi nhanh, san va khung gio duoc dien san.
2. **Given** slot cu khong con trong, **When** Customer dat lai, **Then** he thong thong bao va goi y slot gan nhat neu co.

---

### Edge Cases

- Dat lai nhanh van phai kiem tra hold, booking active va tinh kha dung hien tai cua san.
- Form dat lai khong duoc copy lai du lieu khong con hop le nhu voucher het han.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST cho phep khoi tao dat lai nhanh tu booking lich su hop le.
- **FR-002**: System MUST kiem tra lai kha dung cua slot truoc khi tao hold moi.
- **FR-003**: System MUST thong bao hoac goi y phuong an thay the neu slot cu khong con trong.

### Key Entities *(include if feature involves data)*

- **RebookRequest**: Yeu cau dat lai tu booking lich su va du lieu duoc dien san.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Customer co the khoi tao dat lai nhanh trong duoi 15 giay tu man hinh lich su.
- **SC-002**: 100% dat lai nhanh van phai qua kiem tra kha dung slot hien tai.

## Assumptions

- Tinh nang nay phu thuoc vao feature lich su customer va luong dat san hien co.
