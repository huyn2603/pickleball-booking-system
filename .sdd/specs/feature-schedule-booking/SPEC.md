# Feature Specification: feature-schedule-booking

**Feature Branch**: `feature-schedule-booking`
**Created**: 2026-06-22
**Status**: Draft
**Input**: User description: "US-PB-02, US-PB-03 - Xem lich, giu slot va dat san"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Xem lich san theo chi nhanh va ngay (Priority: P1)

Customer xem lich trong cua tung san theo chi nhanh, ngay, loai san va khung gio de chon slot phu hop.

**Why this priority**: Day la buoc dau cua luong dat san.

**Independent Test**: Chon chi nhanh, ngay, bo loc loai san va doi chieu trang thai slot voi du lieu booking/hold/bao tri.

**Acceptance Scenarios**:

1. **Given** Customer chon mot chi nhanh va ngay, **When** mo lich, **Then** he thong chi hien thi san thuoc chi nhanh do.
2. **Given** ton tai slot da `confirmed`, **When** Customer xem lich, **Then** slot hien thi da dat va khong the chon.
3. **Given** ton tai hold `active`, **When** Customer khac xem lich, **Then** slot hien thi dang giu va khong the giu trung.
4. **Given** Customer chon ngay trong qua khu, **When** mo lich, **Then** he thong chi cho xem lich su va khong cho dat moi.

---

### User Story 2 - Giu slot 10 phut truoc khi thanh toan (Priority: P1)

Khi Customer chon slot hop le, he thong tao `slot_holds` co thoi han 10 phut de tranh double booking.

**Why this priority**: Hold la co che trung tam de tranh xung dot khi nhieu nguoi dat cung luc.

**Independent Test**: Tao hold, mo phong request dong thoi, cho het han hold va xac minh slot duoc giai phong dung cach.

**Acceptance Scenarios**:

1. **Given** Customer chon slot hop le, **When** xac nhan giu slot, **Then** he thong tao hold 10 phut neu slot chua bi dat/giu.
2. **Given** hai Customer dat cung mot slot, **When** request den gan dong thoi, **Then** chi mot hold duoc tao thanh cong.
3. **Given** hold het han, **When** Customer chua thanh toan, **Then** hold chuyen `expired` va slot duoc mo lai.
4. **Given** san dang `maintenance` hoac `inactive`, **When** Customer co dat, **Then** he thong tu choi truoc khi tao hold.

---

### User Story 3 - Tao booking tu hold hop le (Priority: P2)

Customer xac nhan thong tin san, ngay, gio, addon va gia du kien tren co so hold hop le de tiep tuc sang thanh toan.

**Why this priority**: Sau khi hold on dinh, viec tao booking pending la buoc chuyen tiep truoc thanh toan.

**Independent Test**: Tao booking tu hold hop le va xac minh backend tu tinh lai tong tien, khong tin gia frontend.

**Acceptance Scenarios**:

1. **Given** hold con han, **When** Customer tiep tuc dat san, **Then** he thong hien thong tin san, gio, gia du kien, addon va dong ho dem nguoc.
2. **Given** frontend gui tong tien tu tinh, **When** backend xu ly booking, **Then** backend bo qua gia khong dang tin cay va tu tinh lai.
3. **Given** hold khong con hop le, **When** Customer tiep tuc thanh toan, **Then** he thong yeu cau chon lai slot.

---

### Edge Cases

- Khong cho phep tao booking moi tren slot thuoc qua khu.
- Hold phai co co che cleanup de tranh khoa slot ao.
- Trang thai slot phai phan biet ro `available`, `held`, `confirmed`, `in_use`, `maintenance`.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST hien thi lich san theo chi nhanh, ngay, san va khung gio.
- **FR-002**: System MUST cho phep loc lich theo loai san va cac tieu chi can thiet.
- **FR-003**: System MUST tao `slot_holds` co thoi han 10 phut cho slot hop le.
- **FR-004**: System MUST ngan double booking giua booking active va hold active.
- **FR-005**: System MUST tu dong giai phong hold het han.
- **FR-006**: System MUST tu tinh lai tong tien booking o backend, khong tin gia frontend.

### Key Entities *(include if feature involves data)*

- **ScheduleSlot**: Kha nang dat cua tung san theo ngay, gio va trang thai.
- **SlotHold**: Ban ghi giu cho tam thoi gom user, san, ngay gio, trang thai va thoi diem het han.
- **BookingDraft**: Booking dang cho thanh toan duoc tao tu hold hop le va tong tien server tinh.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% request dat trung mot slot tai cung thoi diem chi tao toi da mot hold active.
- **SC-002**: Hold het han duoc giai phong trong khoang thoi gian muc tieu duoi 1 phut.
- **SC-003**: 100% tong tien booking draft duoc backend tinh lai tu nguon du lieu tin cay.

## Assumptions

- Moi slot co don vi thoi gian va quy tac chong trung da duoc chuan hoa trong backend.
- Booking chi duoc xac nhan sau khi co ket qua thanh toan hop le.
- Goi y slot thay the duoc tach thanh feature rieng neu can mo rong.
