# Feature Specification: feature-addon

**Feature Branch**: `feature-addon`
**Created**: 2026-06-22
**Status**: Draft
**Input**: User description: "US-PB-08 - Quan ly dich vu dinh kem"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Quan ly danh muc addon va ton kho (Priority: P1)

Owner/Staff/Admin quan ly danh muc addon nhu thue vot, bong, nuoc uong cung gia, ton kho va trang thai kha dung.

**Why this priority**: Addon la nguon doanh thu bo sung va anh huong truc tiep den tong tien booking.

**Independent Test**: Tao addon moi, cap nhat ton kho, vo hieu hoa addon va xac minh booking moi chi nhin thay addon hop le.

**Acceptance Scenarios**:

1. **Given** Owner tao addon moi, **When** nhap ten, gia va so luong, **Then** addon xuat hien trong danh sach co the ap dung.
2. **Given** addon het hang, **When** Customer muon them vao booking, **Then** he thong tu choi va hien trang thai khong kha dung.
3. **Given** Owner vo hieu hoa addon, **When** xem booking cu, **Then** lich su addon van duoc giu de doi soat.

---

### User Story 2 - Them addon vao booking va tinh tien (Priority: P1)

Customer co the chon addon trong luong dat san, backend tinh them chi phi addon va luu chi tiet vao booking.

**Why this priority**: Chuc nang nay tao gia tri thuc su cho addon va can co trong luong booking/thanh toan.

**Independent Test**: Chon addon khi dat san, thanh toan va xac minh `booking_addons` cung tong tien duoc tinh dung.

**Acceptance Scenarios**:

1. **Given** Customer chon addon hop le, **When** thanh toan booking, **Then** backend cong them chi phi addon vao tong tien.
2. **Given** Staff cap nhat ton kho sau ca, **When** luu thay doi, **Then** booking sau do su dung ton kho moi.
3. **Given** addon vuot qua ton kho hien co, **When** Customer gui request, **Then** backend tu choi so luong khong hop le.

---

### Edge Cases

- Addon da bi vo hieu hoa van phai giu du lieu trong booking lich su.
- Ton kho khong duoc am sau khi dat dong thoi nhieu booking.
- Gia addon thay doi khong anh huong den booking da xac nhan truoc do.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST cho phep tao, cap nhat, vo hieu hoa addon.
- **FR-002**: System MUST quan ly gia, don vi, ton kho va trang thai kha dung cua addon.
- **FR-003**: System MUST chi cho phep chon addon dang kha dung va con ton kho.
- **FR-004**: System MUST luu chi tiet addon da chon vao booking de doi soat lich su.
- **FR-005**: System MUST tinh tong tien addon o backend thay vi tin gia frontend.

### Key Entities *(include if feature involves data)*

- **Addon**: Mat hang dich vu dinh kem gom ten, gia, ton kho, trang thai va loai.
- **BookingAddon**: Chi tiet addon gan voi booking gom so luong, don gia tai thoi diem dat va thanh tien.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% booking co addon deu luu du chi tiet addon da mua/thue.
- **SC-002**: Khong co booking moi nao dat thanh cong addon het hang.
- **SC-003**: 100% tong tien addon duoc backend tinh lai chinh xac.

## Assumptions

- Addon co the la san pham ban dut hoac dich vu cho thue, nhung deu su dung mot mo hinh quan ly co ban.
- Quy tac tru ton kho duoc ap dung tai thoi diem booking xac nhan hoac thanh toan thanh cong.
