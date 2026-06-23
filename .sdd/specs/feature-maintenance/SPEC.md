# Feature Specification: feature-maintenance

**Feature Branch**: `feature-maintenance`
**Created**: 2026-06-22
**Status**: Draft
**Input**: User description: "US-PB-16 - Quan ly bao tri san"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Dong san tam thoi de bao tri (Priority: P2)

Staff/Admin co the dong san tam thoi, ghi ly do bao tri va xem danh sach booking bi anh huong de xu ly.

**Why this priority**: Bao tri giup van hanh an toan va giam xung dot khi san gap su co.

**Independent Test**: Chuyen san sang `maintenance`, doi chieu lich dat bi anh huong va mo lai san sau khi sua xong.

**Acceptance Scenarios**:

1. **Given** Staff phat hien san hong, **When** chuyen trang thai sang `maintenance` kem ly do, **Then** san khong con xuat hien nhu slot co the dat.
2. **Given** san da co booking trong thoi gian bao tri, **When** xac nhan bao tri, **Then** he thong liet ke booking bi anh huong de lien he hoac hoan tien.
3. **Given** san sua xong, **When** Admin chuyen lai `available`, **Then** lich dat moi hoat dong binh thuong.

---

### Edge Cases

- Bao tri khan cap phai danh dau cac booking can xu ly ngoai le ma khong lam mat audit trail.
- San dang bao tri khong duoc hien trong goi y slot thay the nhu mot lua chon hop le.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST ho tro chuyen san sang `maintenance` kem ly do.
- **FR-002**: System MUST liet ke booking bi anh huong khi san bi bao tri.
- **FR-003**: System MUST ngan booking moi tren san dang bao tri cho den khi mo lai.

### Key Entities *(include if feature involves data)*

- **MaintenanceWindow**: Khoang thoi gian bao tri, ly do va danh sach booking lien quan.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: San dang `maintenance` khong phat sinh booking moi.
- **SC-002**: 100% booking bi anh huong co the duoc liet ke de Staff xu ly.

## Assumptions

- Chuc nang thong bao khach khi bao tri co the dua qua feature notification.
