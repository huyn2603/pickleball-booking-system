# Feature Specification: feature-feedback

**Feature Branch**: `feature-feedback`
**Created**: 2026-06-22
**Status**: Draft
**Input**: User description: "US-PB-13 - Feedback va danh gia"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Customer gui feedback sau buoi choi (Priority: P2)

Sau khi booking hoan tat, Customer gui danh gia sao va nhan xet, Owner/Staff theo doi va xu ly phan hoi.

**Why this priority**: Feedback ho tro cai thien chat luong dich vu va bo sung dau vao cho dashboard van hanh.

**Independent Test**: Gui danh gia cho booking `completed`, ngan gui trung va xem danh sach feedback theo muc do uu tien.

**Acceptance Scenarios**:

1. **Given** booking da `completed`, **When** Customer gui danh gia 1-5 sao, **Then** he thong luu feedback gan voi dung booking.
2. **Given** Customer da danh gia booking do, **When** gui lan nua, **Then** he thong khong tao feedback trung neu quy tac moi booking mot feedback duoc ap dung.
3. **Given** feedback diem thap, **When** Owner xem danh sach, **Then** feedback do duoc uu tien xu ly.

---

### Edge Cases

- Customer khong duoc gui feedback cho booking khong thuoc minh.
- Feedback bi an hoac da xu ly van phai giu audit trail toi thieu.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST cho phep Customer gui feedback cho booking da hoan tat.
- **FR-002**: System MUST ngan feedback trung neu quy tac moi booking mot feedback duoc ap dung.
- **FR-003**: System MUST cho phep Owner/Staff xem va uu tien feedback can xu ly.

### Key Entities *(include if feature involves data)*

- **Feedback**: Danh gia sao, nhan xet, booking lien ket va trang thai xu ly.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% feedback duoc gan dung voi booking `completed`.
- **SC-002**: Khong co feedback trung cho cung mot booking khi quy tac mot feedback duoc bat.

## Assumptions

- Feedback diem thap duoc xem la dau vao cho dashboard van hanh va bao cao chat luong.
