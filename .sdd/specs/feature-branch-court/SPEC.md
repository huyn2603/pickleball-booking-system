# Feature Specification: feature-branch-court

**Feature Branch**: `feature-branch-court`
**Created**: 2026-06-22
**Status**: Draft
**Input**: User description: "US-PB-07 - Quan ly chi nhanh va san"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Quan ly chi nhanh va san (Priority: P1)

Admin/Owner quan ly danh sach chi nhanh, san, loai san, trang thai san va thong tin van hanh.

**Why this priority**: Booking phu thuoc vao du lieu chi nhanh va san chinh xac.

**Independent Test**: Tao chi nhanh moi, them san moi, doi trang thai san va xac minh san hien dung trong man hinh lich/dat san.

**Acceptance Scenarios**:

1. **Given** Admin tao chi nhanh moi, **When** nhap ma, ten, dia chi, hotline va gio mo cua, **Then** chi nhanh duoc luu va co the gan san.
2. **Given** Owner them san moi vao chi nhanh, **When** nhap ma san, loai san, mat san va gia co ban, **Then** san xuat hien trong danh sach va co the xem lich neu trang thai `available`.
3. **Given** san can bao tri, **When** Staff/Admin chuyen trang thai sang `maintenance`, **Then** san khong cho dat moi trong thoi gian do.
4. **Given** san da co booking tuong lai, **When** Admin muon xoa san, **Then** he thong uu tien inactive thay vi xoa vat ly.

---

### Edge Cases

- San `inactive` hoac `maintenance` khong duoc xuat hien nhu lua chon dat hop le.
- Xoa hoac doi ma chi nhanh/san phai bao toan audit trail va lien ket booking lich su.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST cho phep Admin/Owner tao, cap nhat va vo hieu hoa chi nhanh.
- **FR-002**: System MUST cho phep Admin/Owner tao, cap nhat va vo hieu hoa san thuoc tung chi nhanh.
- **FR-003**: System MUST quan ly trang thai san toi thieu gom `available`, `inactive`, `maintenance`.
- **FR-004**: System MUST ngan xoa vat ly san neu viec xoa lam mat lich su booking hoac audit.

### Key Entities *(include if feature involves data)*

- **Branch**: Chi nhanh van hanh gom ma, ten, dia chi, gio mo cua, hotline va trang thai.
- **Court**: San thuoc chi nhanh gom ma san, loai san, mat san, gia co ban va trang thai.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% san moi duoc gan vao mot chi nhanh hop le truoc khi mo dat lich.
- **SC-002**: Khong co booking moi nao duoc tao tren san dang `maintenance` hoac `inactive`.

## Assumptions

- Quyen tao/sua chi nhanh va san thuoc Admin/Owner.
- Bao tri san co the duoc Staff kich hoat trong pham vi quyen duoc cap.
