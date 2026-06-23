# Feature Specification: feature-auth

**Feature Branch**: `feature-auth`
**Created**: 2026-06-22
**Status**: Draft
**Input**: User description: "US-PB-01 - Dang ky/Dang nhap"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Dang ky va dang nhap bang Gmail (Priority: P1)

Guest dang ky tai khoan Customer bang email Gmail va dang nhap de nhan token truy cap.

**Why this priority**: Day la cua vao bat buoc cho cac chuc nang dat san va quan ly tai khoan.

**Independent Test**: Dang ky tai khoan moi, dang nhap lai bang tai khoan vua tao, xac minh token va role trong response.

**Acceptance Scenarios**:

1. **Given** Guest nhap email Gmail hop le, **When** gui form dang ky, **Then** he thong tao tai khoan Customer va tra ve token.
2. **Given** email da ton tai, **When** Guest dang ky lai, **Then** he thong tu choi va bao email da duoc su dung.
3. **Given** Customer dang nhap dung thong tin, **When** gui form dang nhap, **Then** he thong tra ve token, thong tin nguoi dung va role.
4. **Given** Customer nhap sai thong tin, **When** gui form dang nhap, **Then** he thong tra ve loi chung va khong tiet lo truong nao sai.

---

### User Story 2 - Quen mat khau bang OTP email (Priority: P2)

Customer co the yeu cau OTP qua email de dat lai mat khau.

**Why this priority**: Ho tro khoi phuc tai khoan giup giam mat user va phu hop luong notification.

**Independent Test**: Yeu cau OTP, xac minh OTP duoc luu dang hash, con han, va dat lai mat khau thanh cong.

**Acceptance Scenarios**:

1. **Given** Customer quen mat khau, **When** yeu cau OTP, **Then** he thong tao OTP co han su dung va gui email neu SMTP hop le.
2. **Given** OTP sai hoac het han, **When** Customer dat lai mat khau, **Then** he thong tu choi va khong thay doi mat khau.
3. **Given** OTP hop le, **When** Customer dat lai mat khau moi, **Then** he thong cap nhat mat khau va vo hieu hoa OTP da dung.

---

### Edge Cases

- Dang ky bang email khong phai `@gmail.com` phai bi chan dong nhat o frontend va backend.
- Response auth khong duoc tra password hoac password hash.
- OTP phai vo hieu hoa sau khi su dung hoac het han.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST cho phep Guest dang ky tai khoan Customer bang email Gmail hop le.
- **FR-002**: System MUST tu choi dang ky neu email da ton tai hoac khong dung quy tac domain.
- **FR-003**: System MUST cho phep Customer dang nhap bang email va mat khau, tra ve token va role.
- **FR-004**: System MUST khong bao gio tra password hoac password hash trong response.
- **FR-005**: System MUST ho tro quy trinh quen mat khau bang OTP co han su dung.
- **FR-006**: System MUST luu OTP o dang hash va ghi nhan thoi diem het han.

### Key Entities *(include if feature involves data)*

- **User**: Tai khoan dang nhap gom email, password hash, role, trang thai va branch duoc gan.
- **PasswordResetOtp**: Yeu cau OTP gom user, otp hash, thoi diem het han va trang thai da dung/chua dung.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% luong dang ky hop le hoan tat thanh cong ma khong can ho tro thu cong.
- **SC-002**: 100% response auth khong chua password hoac password hash.
- **SC-003**: Customer co the hoan tat dang nhap trong duoi 30 giay sau khi nhap thong tin hop le.

## Assumptions

- Email dang ky chi chap nhan Gmail trong pham vi v1.
- Token hien tai da co co che ky va xac thuc o backend.
- Chuc nang gui email OTP phu thuoc cau hinh SMTP cua moi truong.
