# Feature Specification: feature-voucher

**Feature Branch**: `feature-voucher`
**Created**: 2026-06-22
**Status**: Draft
**Input**: User description: "US-PB-15 - Voucher va khuyen mai"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ap dung voucher cho booking hop le (Priority: P2)

Customer nhap voucher hop le truoc thanh toan, he thong kiem tra dieu kien, so lan su dung va gia tri giam.

**Why this priority**: Voucher tac dong den chuyen doi dat san va can duoc backend kiem soat chat che.

**Independent Test**: Tao voucher, ap ma hop le, het han, het luot va doi chieu so tien giam backend tinh.

**Acceptance Scenarios**:

1. **Given** voucher con hieu luc, **When** Customer nhap ma, **Then** backend kiem tra dieu kien va tinh giam gia.
2. **Given** voucher het luot dung hoac het han, **When** Customer ap ma, **Then** he thong tu choi va khong giam tong tien.
3. **Given** booking bi huy, **When** doi soat refund, **Then** he thong luu thong tin discount da ap dung.

---

### Edge Cases

- Voucher khong duoc ket hop trai quy tac voi khuyen mai khac neu chinh sach chua cho phep.
- Voucher het han khong duoc cache sai va ap dung cho booking moi.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST ho tro voucher gom hieu luc, dieu kien ap dung, so lan su dung va muc giam.
- **FR-002**: System MUST xac minh voucher o backend truoc khi tinh tong tien cuoi cung.
- **FR-003**: System MUST luu thong tin giam gia da ap dung de doi soat refund.

### Key Entities *(include if feature involves data)*

- **Voucher**: Ma khuyen mai gom gia tri giam, hieu luc, so lan su dung va dieu kien ap dung.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% voucher hop le duoc backend tinh dung.
- **SC-002**: 100% voucher khong hop le bi tu choi truoc khi xac nhan thanh toan.

## Assumptions

- Voucher duoc ap dung truoc khi thanh toan booking.
