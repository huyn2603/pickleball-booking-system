# Feature Specification: feature-pricing

**Feature Branch**: `feature-pricing`
**Created**: 2026-06-22
**Status**: Draft
**Input**: User description: "US-PB-10 - Quan ly gia theo khung gio"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cau hinh gia theo khung gio (Priority: P2)

Admin/Owner cau hinh `price_rules` theo he thong, chi nhanh hoac san de backend tinh gia dung.

**Why this priority**: Gia anh huong truc tiep den booking, thanh toan va doi soat doanh thu.

**Independent Test**: Tao rule gio cao diem, rule cap chi nhanh, rule cap san va xac minh backend ap dung dung thu tu uu tien.

**Acceptance Scenarios**:

1. **Given** Admin tao rule gio cao diem 17:00-21:00, **When** Customer dat trong khung gio nay, **Then** backend ap dung gia cao diem.
2. **Given** chi nhanh co gia rieng, **When** Customer dat tai chi nhanh do, **Then** rule cap chi nhanh uu tien hon rule toan he thong khi priority phu hop.
3. **Given** san premium co gia rieng, **When** Customer dat dung san do, **Then** rule cap san uu tien cao nhat.
4. **Given** Admin thay doi gia, **When** booking cu da `confirmed`, **Then** tong tien booking cu khong bi thay doi.

---

### Edge Cases

- Khong cho phep tao rule gia trung thoi gian neu logic priority khong xac dinh duoc ket qua.
- Rule gia het han khong duoc tiep tuc tac dong den booking moi.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST ho tro `price_rules` o cap he thong, chi nhanh va san.
- **FR-002**: System MUST xac dinh thu tu uu tien rule gia de backend tinh gia nhat quan.
- **FR-003**: System MUST bao toan tong tien cua booking da `confirmed` khi rule gia thay doi sau do.

### Key Entities *(include if feature involves data)*

- **PriceRule**: Quy tac tinh gia theo pham vi ap dung, khung gio, ngay trong tuan, muc gia va priority.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% booking moi duoc backend tinh gia dua tren `price_rules` hoac gia mac dinh hop le.
- **SC-002**: Khong co booking da `confirmed` bi thay doi tong tien do sua rule gia.

## Assumptions

- Gia mac dinh cua san duoc dung khi khong co `price_rules` hop le.
- Quyen tao/sua rule gia thuoc Admin/Owner.
