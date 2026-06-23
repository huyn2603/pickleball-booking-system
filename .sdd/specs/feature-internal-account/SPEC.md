# Feature Specification: feature-internal-account

**Feature Branch**: `feature-internal-account`
**Created**: 2026-06-22
**Status**: Draft
**Input**: User description: "US-PB-14 - Quan ly tai khoan noi bo"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin Owner quan ly tai khoan noi bo (Priority: P2)

Admin/Owner tao, cap nhat, khoa/mo tai khoan Staff hoac Customer va quan ly pham vi quyen truy cap.

**Why this priority**: Tai khoan noi bo can cho van hanh, nhung co the phat hanh sau auth co ban.

**Independent Test**: Tao Staff moi, gan chi nhanh, khoa tai khoan va xac minh user bi khoa khong dang nhap duoc.

**Acceptance Scenarios**:

1. **Given** Admin tao Staff moi, **When** nhap email Gmail va gan chi nhanh, **Then** Staff co the dang nhap va chi thay du lieu trong pham vi duoc gan.
2. **Given** nhan vien nghi viec, **When** Owner chuyen trang thai sang inactive, **Then** tai khoan khong the dang nhap nhung lich su thao tac van duoc giu.
3. **Given** Admin cap nhat thong tin Customer, **When** luu thay doi, **Then** he thong validate email, role va khong tra password trong response.

---

### Edge Cases

- Tai khoan noi bo bi khoa khong duoc tiep tuc thao tac bang token cu.
- Staff khong duoc tu nang quyen ngoai pham vi role duoc cap.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST cho phep Admin/Owner tao, cap nhat, khoa/mo tai khoan Staff va Customer.
- **FR-002**: System MUST ap dung phan quyen va pham vi truy cap cho tai khoan noi bo.
- **FR-003**: System MUST khong tra password hoac password hash trong response quan ly tai khoan.

### Key Entities *(include if feature involves data)*

- **ManagedAccount**: Tai khoan Staff/Customer duoc Admin/Owner quan ly ve role, branch va trang thai.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Tai khoan bi khoa khong con truy cap duoc he thong tu thoi diem khoa.
- **SC-002**: 100% response quan ly tai khoan khong chua password hoac password hash.

## Assumptions

- Quan ly tai khoan noi bo tap trung vao role, status va branch assignment.
