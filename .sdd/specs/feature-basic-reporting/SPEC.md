# Feature Specification: feature-basic-reporting

**Feature Branch**: `feature-basic-reporting`
**Created**: 2026-06-22
**Status**: Draft
**Input**: User description: "US-PB-09 - Bao cao co ban"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Bao cao co ban theo ngay thang chi nhanh (Priority: P1)

Owner/Admin xem nhanh doanh thu, so booking, trang thai dat san va ty le lap day theo chi nhanh hoac toan he thong.

**Why this priority**: Bao cao co ban can thiet cho doi soat van hanh va ra quyet dinh hang ngay.

**Independent Test**: Chon ngay/thang/chi nhanh va doi chieu so lieu booking, payment, refund voi dashboard.

**Acceptance Scenarios**:

1. **Given** Owner chon chi nhanh va ngay, **When** mo dashboard, **Then** hien thi tong booking, doanh thu va ty le lap day.
2. **Given** Admin chon toan he thong, **When** xem bao cao thang, **Then** hien thi tong hop theo tung chi nhanh.
3. **Given** du lieu co booking da huy va refund, **When** tinh doanh thu, **Then** he thong khong tinh vao doanh thu thuc nhan nhung truong hop khong hop le.

---

### Edge Cases

- So lieu doanh thu phai tach ro doanh thu gross, net, refund va phi huy.
- Bao cao theo quyen phai ton trong pham vi chi nhanh cua user.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST cung cap bao cao doanh thu, booking va ty le lap day theo ngay, thang va chi nhanh.
- **FR-002**: System MUST cho phep Owner/Admin chuyen pham vi xem giua tung chi nhanh va toan he thong theo quyen.
- **FR-003**: System MUST tinh doanh thu thuc nhan co tru refund va booking huy toan bo.

### Key Entities *(include if feature involves data)*

- **ReportSnapshot**: Tap hop chi so tong hop theo ky, chi nhanh va pham vi quyen.
- **RevenueMetric**: So lieu doanh thu gross/net, refund, phi huy va thanh toan theo phuong thuc.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Owner/Admin co the xem bao cao co ban trong duoi 10 giay voi bo loc thong dung.
- **SC-002**: 100% doanh thu net tren dashboard khop voi so lieu giao dich da doi soat.

## Assumptions

- Doi soat doanh thu lay booking, payment va refund lam nguon su that.
