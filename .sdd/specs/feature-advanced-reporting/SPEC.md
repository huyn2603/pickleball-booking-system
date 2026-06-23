# Feature Specification: feature-advanced-reporting

**Feature Branch**: `feature-advanced-reporting`
**Created**: 2026-06-22
**Status**: Draft
**Input**: User description: "US-PB-18 - Thong ke nang cao"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Thong ke nang cao phuc vu phan tich (Priority: P3)

Owner xem bieu do doanh thu, gio cao diem, top san, ty le huy, addon ban chay va xu huong dat san.

**Why this priority**: Thong ke nang cao ho tro toi uu gia, nhan su va van hanh sau khi bao cao co ban on dinh.

**Independent Test**: Nap du lieu lich su va doi chieu cac chi so top court, peak hour, trend booking voi truy van tong hop.

**Acceptance Scenarios**:

1. **Given** Owner chon 30 ngay gan nhat, **When** mo thong ke, **Then** he thong hien thi doanh thu theo ngay va booking theo trang thai.
2. **Given** mot san co ty le lap day cao, **When** xem top san, **Then** san do xuat hien trong danh sach phan tich.
3. **Given** addon ban chay nhat trong ky, **When** xem dashboard, **Then** he thong hien thi top addon theo doanh thu hoac so luong.

---

### Edge Cases

- Du lieu thong ke khong duoc dem trung booking khi co nhieu giao dich cung booking.
- Cac chi so tong hop phai nhat quan voi bao cao co ban trong cung ky.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST cung cap thong ke nang cao ve peak hour, top court, xu huong dat san va addon ban chay.
- **FR-002**: System MUST dam bao cong thuc tong hop khong dem trung giao dich cho cung mot booking.

### Key Entities *(include if feature involves data)*

- **AdvancedMetric**: Chi so phan tich nang cao gom peak hour, top court, trend va addon.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Thong ke nang cao hien thi du duoc cac chi so phan tich chinh trong ky da chon.
- **SC-002**: 100% chi so tong hop nhat quan voi nguon doi soat da xac dinh.

## Assumptions

- Tinh nang nay co the dung du lieu tong hop thay vi truy van real-time 100%.
