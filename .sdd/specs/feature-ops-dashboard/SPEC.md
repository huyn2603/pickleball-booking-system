# Feature Specification: feature-ops-dashboard

**Feature Branch**: `feature-ops-dashboard`
**Created**: 2026-06-22
**Status**: Draft
**Input**: User description: "US-PB-20 - Dashboard van hanh nang cao"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Dashboard van hanh nang cao theo chi nhanh (Priority: P3)

Owner/Admin xem hieu suat tung chi nhanh, nhan su, feedback chua xu ly va cac diem bat thuong can can thiep.

**Why this priority**: Dashboard tong hop chien luoc co gia tri cao nhung khac voi bao cao doi soat co ban.

**Independent Test**: Tong hop du lieu theo chi nhanh va xac minh so sanh doanh thu, ty le lap day, feedback xau va hieu suat nhan su.

**Acceptance Scenarios**:

1. **Given** Admin mo dashboard toan he thong, **When** chon thang hien tai, **Then** hien thi so sanh chi nhanh theo doanh thu va ty le lap day.
2. **Given** mot chi nhanh co nhieu feedback xau, **When** Owner xem dashboard, **Then** chi nhanh do duoc danh dau can xu ly.
3. **Given** hieu suat nhan su co chenh lech lon, **When** xem dashboard, **Then** Owner co the nhan ra khu vuc can toi uu van hanh.

---

### Edge Cases

- Nguoi dung khong co quyen xem toan he thong khong duoc xem dashboard ngoai pham vi.
- Chi so dashboard phai su dung cung quy tac tinh doanh thu nhu bao cao.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST cung cap dashboard van hanh nang cao gom chi so chi nhanh, nhan su va feedback.
- **FR-002**: System MUST ap dung phan quyen khi hien thi dashboard toan he thong hoac theo chi nhanh.

### Key Entities *(include if feature involves data)*

- **OperationalDashboardMetric**: Chi so van hanh gom lap day, ty le huy, feedback, addon va nhan su.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Dashboard van hanh hien thi du duoc cac chi so chinh cho tung chi nhanh trong ky da chon.
- **SC-002**: 100% nguoi dung khong co quyen khong xem duoc du lieu ngoai pham vi chi nhanh.

## Assumptions

- Dashboard nay co the dung du lieu tong hop tu reporting va feedback.
