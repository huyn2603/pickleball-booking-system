# Feature Specification: feature-payment-refund

**Feature Branch**: `feature-payment-refund`
**Created**: 2026-06-22
**Status**: Draft
**Input**: User description: "US-PB-04, US-PB-05 - Thanh toan, xac nhan booking va hoan tien"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Xac nhan thanh toan va chuyen booking sang confirmed (Priority: P1)

He thong ghi nhan thanh toan cho booking, luu giao dich va dong bo trang thai booking/payment/hold.

**Why this priority**: Booking chi tao gia tri kinh doanh khi duoc thanh toan va xac nhan.

**Independent Test**: Thanh toan mot hold hop le va xac minh booking `confirmed`, payment `paid`, hold `converted`.

**Acceptance Scenarios**:

1. **Given** Customer co hold hop le, **When** thanh toan thanh cong, **Then** booking duoc tao hoac cap nhat sang `confirmed`.
2. **Given** Staff thu tien tai quay, **When** xac nhan thanh toan, **Then** he thong luu payment method, so tien, nguoi xu ly va thoi gian.
3. **Given** thanh toan that bai, **When** he thong nhan ket qua loi, **Then** giao dich duoc luu `failed` va booking khong duoc xac nhan.
4. **Given** backend tinh gia khac gia frontend gui len, **When** xu ly thanh toan, **Then** backend dung gia do server tinh.

---

### User Story 2 - Huy booking va hoan tien theo chinh sach (Priority: P1)

Customer huy booking theo moc thoi gian truoc gio choi va he thong tinh refund/cancellation fee dung quy tac.

**Why this priority**: Hoan tien la phan bat buoc de van hanh minh bach va giai quyet tranh chap.

**Independent Test**: Huy booking o cac moc >24h, 2-24h, <2h va sau check-in de xac minh refund/chuyen xu ly thu cong.

**Acceptance Scenarios**:

1. **Given** Customer huy truoc gio choi it nhat 24 gio, **When** xac nhan huy, **Then** booking chuyen `cancelled` va tao refund 100%.
2. **Given** Customer huy trong khoang 2-24 gio, **When** xac nhan huy, **Then** he thong hoan 50% va ghi nhan phi huy.
3. **Given** Customer huy trong vong 2 gio truoc gio choi, **When** xac nhan huy, **Then** he thong khong hoan tu dong hoac chuyen duyet ngoai le.
4. **Given** booking da check-in, **When** yeu cau huy, **Then** he thong khong cho huy tu dong.
5. **Given** san dong dot xuat vi bao tri, **When** booking bi anh huong, **Then** he thong danh dau hoan 100% va ghi log ly do.

---

### Edge Cases

- Khong duoc xoa lich su giao dich thanh toan, that bai hoac hoan tien.
- Refund mot phan phai bao toan tong tien thuc thu va phi huy trong bao cao.
- Thanh toan thanh cong nhung ghi booking that bai phai duoc xu ly transaction hoac co che bu tru.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST ghi nhan giao dich thanh toan trong `payment_transactions`.
- **FR-002**: System MUST dong bo trang thai booking, payment va hold trong cung nghiep vu xac nhan thanh toan.
- **FR-003**: System MUST ho tro ghi nhan thanh toan tai quay boi Staff.
- **FR-004**: System MUST luu giao dich that bai de phuc vu audit va doi soat.
- **FR-005**: System MUST ap dung chinh sach refund theo moc thoi gian truoc gio choi.
- **FR-006**: System MUST ngan huy tu dong doi voi booking da check-in hoac da qua nguong cho phep.

### Key Entities *(include if feature involves data)*

- **PaymentTransaction**: Giao dich thanh toan hoac that bai gom booking, so tien, phuong thuc, trang thai va nguoi xu ly.
- **RefundTransaction**: Giao dich hoan tien gom so tien hoan, ly do, phi huy va trang thai.
- **BookingPaymentState**: Tap trang thai booking/pay/hold can duoc dong bo theo transaction.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% booking `confirmed` co toi thieu mot giao dich thanh toan hop le lien ket.
- **SC-002**: 100% refund duoc tinh dung theo chinh sach da khai bao hoac duoc ghi nhan ngoai le ro rang.
- **SC-003**: Khong co truong hop hold van `active` sau khi booking da thanh toan thanh cong.

## Assumptions

- v1 chap nhan thanh toan tai quay, tien mat hoac chuyen khoan.
- Chinh sach refund hien tai co 3 moc co dinh: >24h, 2-24h, <2h.
- Cac giao dich tai chinh can bao toan audit trail de phuc vu doi soat.
