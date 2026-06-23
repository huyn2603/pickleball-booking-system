# Feature Specification: feature-slot-suggestion

**Feature Branch**: `feature-slot-suggestion`
**Created**: 2026-06-22
**Status**: Draft
**Input**: User description: "US-PB-19 - Goi y slot thay the"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Goi y slot gan nhat khi slot da kin (Priority: P3)

Khi Customer chon mot slot khong con trong, he thong goi y slot khac gan ve thoi gian, cung chi nhanh hoac chi nhanh khac de giam ty le roi bo.

**Why this priority**: Day la tinh nang toi uu chuyen doi, co gia tri bo sung sau khi luong xem lich/dat san da on dinh.

**Independent Test**: Chon slot da kin va xac minh he thong dua ra danh sach slot thay the theo quy tac uu tien mong muon.

**Acceptance Scenarios**:

1. **Given** slot 18:00-19:00 da kin, **When** Customer co dat, **Then** he thong goi y 17:00-18:00 hoac 19:00-20:00 neu con trong.
2. **Given** chi nhanh hien tai kin lich, **When** Customer muon tim san, **Then** he thong goi y chi nhanh khac con san trong cung ngay.
3. **Given** ton tai nhieu slot thay the, **When** hien thi danh sach, **Then** he thong uu tien slot cung chi nhanh, cung loai san va gan gio mong muon hon.

---

### Edge Cases

- Khong hien thi slot thay the tren san `maintenance` hoac `inactive`.
- Goi y khong duoc dua ra slot da co hold active hoac booking active.
- Neu khong co slot thay the hop le, he thong phai hien ro khong co goi y.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST tim va de xuat slot thay the khi slot nguoi dung chon khong con trong.
- **FR-002**: System MUST co quy tac xep hang uu tien theo do gan thoi gian, cung chi nhanh va cung loai san.
- **FR-003**: System MUST loai bo cac slot `maintenance`, `inactive`, da booking hoac dang hold khoi ket qua goi y.
- **FR-004**: System MUST cho phep mo rong goi y sang chi nhanh khac khi chi nhanh hien tai khong con slot.
- **FR-005**: System MUST thong bao ro khi khong tim duoc slot thay the hop le.

### Key Entities *(include if feature involves data)*

- **SuggestedSlot**: Slot de xuat gom san, chi nhanh, ngay gio, muc do phu hop va ly do duoc goi y.
- **SuggestionRule**: Quy tac xep hang goi y theo do gan ve gio, loai san va khoang cach chi nhanh.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% truong hop slot da kin deu tra ve ket qua goi y hoac thong bao khong tim thay ro rang.
- **SC-002**: Ket qua goi y uu tien dung slot cung chi nhanh khi ton tai lua chon hop le.
- **SC-003**: Khong co slot khong hop le nao xuat hien trong danh sach goi y.

## Assumptions

- Tinh nang nay la phan mo rong cua luong xem lich/dat san, nhung duoc tach spec rieng de de uu tien backlog.
- v1 co the dua tren chi nhanh thay the cung thanh pho, chua can tinh khoang cach dia ly thuc te.
