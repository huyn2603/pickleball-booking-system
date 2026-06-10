import { useEffect, useState } from 'react'
import defaultAvatar from './assets/default-avatar.jpg'
import logoutIcon from './assets/logout-icon.png'
import courtOutdoor from './assets/court-outdoor.webp'
import courtIndoor from './assets/court-indoor.jpg'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const roleLabels = {
  Admin: 'Admin',
  Owner: 'Chủ sân',
  Staff: 'Nhân viên',
  Customer: 'Khách hàng',
}

function getTodayString() {
  const now = new Date()
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-')
}

function formatMoney(value) {
  return `${Math.round(Number(value || 0) / 1000)}K`
}

function formatFullMoney(value) {
  return `${Number(value || 0).toLocaleString('vi-VN')}đ`
}

const bookingStatusLabels = {
  pending: 'Đang giữ',
  confirmed: 'Đã xác nhận',
  checked_in: 'Đang chơi',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
  expired: 'Hết hạn',
  no_show: 'No-show',
}

const paymentStatusLabels = {
  unpaid: 'Chưa thanh toán',
  pending: 'Đang xử lý',
  paid: 'Đã thanh toán',
  partially_refunded: 'Hoàn một phần',
  refunded: 'Đã hoàn tiền',
  failed: 'Thất bại',
}

const addonDisplay = {
  'BALL-SET': { name: 'Bộ bóng pickleball', category: 'Bóng', description: 'Bóng tập luyện và thi đấu tại sân' },
  WATER: { name: 'Nước suối', category: 'Đồ uống', description: 'Nước đóng chai bán tại quầy' },
  'RACKET-STD': { name: 'Thuê vợt tiêu chuẩn', category: 'Vợt', description: 'Vợt pickleball cho khách thuê theo buổi' },
}

function readStoredSession() {
  const token = localStorage.getItem('swp_token')
  const user = localStorage.getItem('swp_user')

  if (!token || !user) {
    return null
  }

  try {
    return { token, user: JSON.parse(user) }
  } catch {
    localStorage.removeItem('swp_token')
    localStorage.removeItem('swp_user')
    return null
  }
}

function getAvatarKey(user) {
  return user?.id ? `swp_avatar_${user.id}` : `swp_avatar_${user?.email || 'guest'}`
}

function readStoredAvatar(user) {
  if (!user) {
    return defaultAvatar
  }

  return user.avatarUrl || localStorage.getItem(getAvatarKey(user)) || defaultAvatar
}

function App() {
  const [session, setSession] = useState(readStoredSession)
  const [page, setPage] = useState('home')
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false)
  const [avatarSrc, setAvatarSrc] = useState(() => readStoredAvatar(readStoredSession()?.user))
  const [courts, setCourts] = useState([])
  const [courtsLoading, setCourtsLoading] = useState(false)
  const [courtView, setCourtView] = useState('list')
  const [courtFilter, setCourtFilter] = useState('all')
  const [courtPage, setCourtPage] = useState(1)
  const [selectedCourtId, setSelectedCourtId] = useState(null)
  const [ownerView, setOwnerView] = useState('courts')
  const [editingCourtId, setEditingCourtId] = useState(null)
  const [mode, setMode] = useState('login')
  const [editingProfile, setEditingProfile] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [accounts, setAccounts] = useState(null)
  const [accountsLoading, setAccountsLoading] = useState(false)
  const [staffDashboard, setStaffDashboard] = useState({ date: getTodayString(), bookings: [], addons: [] })
  const [staffLoading, setStaffLoading] = useState(false)
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [courtForm, setCourtForm] = useState({
    code: '',
    name: '',
    address: '',
    type: 'outdoor',
    surfaceType: 'standard',
    basePricePerHour: 160000,
    facilities: 'lighting, parking',
    status: 'available',
  })
  const [staffForm, setStaffForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '123456',
  })

  const isRegister = mode === 'register'
  const isForgotPassword = mode === 'forgot-password'
  const role = session?.user?.role
  const canManageAccounts = role === 'Admin' || role === 'Owner'
  const filteredCourts = courtFilter === 'all' ? courts : courts.filter((court) => court.type === courtFilter)
  const courtsPerPage = courtView === 'grid' ? 9 : 5
  const totalCourtPages = Math.max(1, Math.ceil(filteredCourts.length / courtsPerPage))
  const safeCourtPage = Math.min(courtPage, totalCourtPages)
  const pagedCourts = filteredCourts.slice((safeCourtPage - 1) * courtsPerPage, safeCourtPage * courtsPerPage)
  const selectedCourt = courts.find((court) => Number(court.id) === Number(selectedCourtId))

  useEffect(() => {
    if (session && canManageAccounts) {
      fetchAccounts()
    }
  }, [session?.token, role])

  useEffect(() => {
    if (session) {
      fetchCourts()
    }
  }, [session?.token])

  useEffect(() => {
    if (session && role === 'Staff') {
      fetchStaffDashboard()
    }
  }, [session?.token, role])

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  function updateCourtField(event) {
    setCourtForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  function updateStaffField(event) {
    setStaffForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  function resetCourtForm() {
    setEditingCourtId(null)
    setCourtForm({
      code: '',
      name: '',
      address: '',
      type: 'outdoor',
      surfaceType: 'standard',
      basePricePerHour: 160000,
      facilities: 'lighting, parking',
      status: 'available',
    })
  }

  function resetNotice() {
    setMessage('')
    setMessageType('')
  }

  function showAuth(nextMode) {
    setMode(nextMode)
    setPage('auth')
    resetNotice()
  }

  function showHome() {
    setPage('home')
    setAvatarMenuOpen(false)
    resetNotice()
  }

  function showDashboard() {
    setPage('dashboard')
    setEditingProfile(false)
    setAvatarMenuOpen(false)
    resetNotice()
  }

  function showManagement() {
    setAvatarMenuOpen(false)
    resetNotice()

    if (!session) {
      showAuth('login')
      return
    }

    showDashboard()
  }

  function showCourts() {
    setAvatarMenuOpen(false)
    resetNotice()

    if (!session) {
      showAuth('login')
      return
    }

    setPage('courts')
    fetchCourts()
  }

  function showCourtDetail(court) {
    setAvatarMenuOpen(false)
    resetNotice()

    if (!session) {
      showAuth('login')
      return
    }

    setSelectedCourtId(court.id)
    setPage('court-detail')
  }

  // eslint-disable-next-line no-unused-vars
  function addCourtPlaceholder(event) {
    event.preventDefault()
    setMessage('Danh sách sân hiện lấy từ database. Chức năng thêm sân cần API quản lý sân riêng.')
    setMessageType('error')
  }

  async function addCourt(event) {
    event.preventDefault()
    setLoading(true)
    resetNotice()

    try {
      const response = await fetch(`${API_URL}/courts${editingCourtId ? `/${editingCourtId}` : ''}`, {
        method: editingCourtId ? 'PATCH' : 'POST',
        headers: {
          Authorization: `Bearer ${session.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...courtForm,
          basePricePerHour: Number(courtForm.basePricePerHour || 0),
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Không thể lưu sân.')
      }

      setMessage(editingCourtId ? 'Đã sửa sân.' : 'Đã thêm sân.')
      setMessageType('success')
      resetCourtForm()
      await fetchCourts()
    } catch (error) {
      setMessage(error.message)
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  function startEditCourt(court) {
    setEditingCourtId(court.id)
    setOwnerView('courts')
    setCourtForm({
      code: court.code || '',
      name: court.name || '',
      address: court.address || '',
      type: court.type || 'outdoor',
      surfaceType: court.surfaceType || 'standard',
      basePricePerHour: court.basePricePerHour || 160000,
      facilities: Array.isArray(court.facilities) ? court.facilities.join(', ') : '',
      status: court.status || 'available',
    })
  }

  async function deleteCourt(court) {
    if (!window.confirm(`Bạn có chắc chắn xóa sân ${court.code} không?`)) {
      return
    }

    setLoading(true)
    resetNotice()

    try {
      const response = await fetch(`${API_URL}/courts/${court.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.token}` },
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Không thể xóa sân.')
      }

      setMessage('Đã xóa sân.')
      setMessageType('success')
      await fetchCourts()
    } catch (error) {
      setMessage(error.message)
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  async function addStaff(event) {
    event.preventDefault()
    setLoading(true)
    resetNotice()

    try {
      const response = await fetch(`${API_URL}/auth/accounts`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...staffForm, role: 'Staff' }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Không thể thêm nhân viên.')
      }

      setStaffForm({ fullName: '', email: '', phone: '', password: '123456' })
      setMessage('Đã thêm nhân viên.')
      setMessageType('success')
      await fetchAccounts()
    } catch (error) {
      setMessage(error.message)
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  function getPageItems() {
    if (totalCourtPages <= 7) {
      return Array.from({ length: totalCourtPages }, (_, index) => index + 1)
    }

    if (safeCourtPage <= 5) {
      return [1, 2, 3, 4, 5, 'ellipsis', totalCourtPages]
    }

    if (safeCourtPage >= totalCourtPages - 4) {
      return [1, 'ellipsis', totalCourtPages - 4, totalCourtPages - 3, totalCourtPages - 2, totalCourtPages - 1, totalCourtPages]
    }

    return [1, 'ellipsis-left', safeCourtPage - 1, safeCourtPage, safeCourtPage + 1, 'ellipsis-right', totalCourtPages]
  }

  function showPersonalInfo() {
    setPage('dashboard')
    setEditingProfile(false)
    setAvatarMenuOpen(false)
    resetNotice()
    setForm((current) => ({
      ...current,
      fullName: session.user.fullName || '',
      email: session.user.email || '',
      phone: session.user.phone || '',
    }))
  }

  function persistSession(nextSession) {
    localStorage.setItem('swp_token', nextSession.token)
    localStorage.setItem('swp_user', JSON.stringify(nextSession.user))
    setSession(nextSession)
    setAvatarSrc(readStoredAvatar(nextSession.user))
  }

  async function fetchCourts() {
    if (!session?.token) {
      return
    }

    setCourtsLoading(true)
    try {
      const response = await fetch(`${API_URL}/courts`, {
        headers: { Authorization: `Bearer ${session.token}` },
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Không thể tải danh sách sân.')
      }

      setCourts(data.courts || [])
      setCourtPage(1)
    } catch (error) {
      setMessage(error.message)
      setMessageType('error')
    } finally {
      setCourtsLoading(false)
    }
  }

  async function fetchAccounts() {
    if (!session?.token) {
      return
    }

    setAccountsLoading(true)

    try {
      const response = await fetch(`${API_URL}/auth/accounts`, {
        headers: { Authorization: `Bearer ${session.token}` },
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Không thể tải danh sách tài khoản.')
      }

      setAccounts(data.accounts || { banned: [], byRole: {} })
    } catch (error) {
      setMessage(error.message)
      setMessageType('error')
    } finally {
      setAccountsLoading(false)
    }
  }

  async function fetchStaffDashboard() {
    if (!session?.token) {
      return
    }

    setStaffLoading(true)
    try {
      const response = await fetch(`${API_URL}/staff/dashboard?date=${staffDashboard.date}`, {
        headers: { Authorization: `Bearer ${session.token}` },
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Khong the tai dashboard Staff.')
      }

      setStaffDashboard({
        date: data.date,
        bookings: data.bookings || [],
        addons: data.addons || [],
      })
    } catch (error) {
      setMessage(error.message)
      setMessageType('error')
    } finally {
      setStaffLoading(false)
    }
  }

  async function handleStaffBookingAction(booking, action, extra = {}) {
    const endpoints = {
      checkIn: `/staff/bookings/${booking.id}/check-in`,
      checkOut: `/staff/bookings/${booking.id}/check-out`,
      payment: `/staff/bookings/${booking.id}/payment`,
    }

    setStaffLoading(true)
    resetNotice()
    try {
      const response = await fetch(`${API_URL}${endpoints[action]}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.token}`,
          'Content-Type': 'application/json',
        },
        body: action === 'payment' ? JSON.stringify(extra) : undefined,
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Khong the cap nhat booking.')
      }

      setMessage(data.extraMinutes ? `${data.message} Phat sinh ${data.extraMinutes} phut.` : data.message)
      setMessageType('success')
      await fetchStaffDashboard()
    } catch (error) {
      setMessage(error.message)
      setMessageType('error')
    } finally {
      setStaffLoading(false)
    }
  }

  async function handleAddonStock(addon, stockQuantity) {
    setStaffLoading(true)
    resetNotice()
    try {
      const response = await fetch(`${API_URL}/staff/addons/${addon.id}/stock`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${session.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stockQuantity }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Khong the cap nhat addon.')
      }

      setMessage(data.message)
      setMessageType('success')
      await fetchStaffDashboard()
    } catch (error) {
      setMessage(error.message)
      setMessageType('error')
    } finally {
      setStaffLoading(false)
    }
  }

  async function submitAuth(event) {
    event.preventDefault()
    setLoading(true)
    resetNotice()

    const endpoint = isRegister ? '/auth/register' : '/auth/login'
    const payload = isRegister
      ? {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          password: form.password,
        }
      : { email: form.email, password: form.password }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Không thể xử lý yêu cầu.')
      }

      persistSession(data)
      setPage('home')
      setMessage(isRegister ? 'Đăng ký thành công.' : 'Đăng nhập thành công.')
      setMessageType('success')
      setForm({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' })
    } catch (error) {
      setMessage(error.message)
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  async function submitForgotPassword(event) {
    event.preventDefault()
    setLoading(true)
    resetNotice()

    if (form.password !== form.confirmPassword) {
      setLoading(false)
      setMessage('Mật khẩu xác nhận chưa khớp.')
      setMessageType('error')
      return
    }

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Không thể đặt lại mật khẩu.')
      }

      setMode('login')
      setMessage(data.message || 'Mật khẩu đã được đặt lại. Vui lòng đăng nhập.')
      setMessageType('success')
      setForm((current) => ({ ...current, password: '', confirmPassword: '' }))
    } catch (error) {
      setMessage(error.message)
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  async function submitProfile(event) {
    event.preventDefault()
    setLoading(true)
    resetNotice()

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${session.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Không thể cập nhật hồ sơ.')
      }

      persistSession({ token: session.token, user: data.user })
      setEditingProfile(false)
      setMessage('Hồ sơ đã được cập nhật.')
      setMessageType('success')
    } catch (error) {
      setMessage(error.message)
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  async function manageAccount(user, action) {
    const isDelete = action === 'delete'
    const willUnban = action === 'unban'
    const accepted = isDelete
      ? window.confirm('Bạn có chắc chắn xóa tài khoản này không?')
      : true

    if (!accepted) {
      return
    }

    setLoading(true)
    resetNotice()

    try {
      const response = await fetch(`${API_URL}/auth/accounts/${user.id}${isDelete ? '' : '/status'}`, {
        method: isDelete ? 'DELETE' : 'PATCH',
        headers: {
          Authorization: `Bearer ${session.token}`,
          'Content-Type': 'application/json',
        },
        body: isDelete ? undefined : JSON.stringify({ status: willUnban ? 'Active' : 'Blocked' }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Không thể cập nhật tài khoản.')
      }

      setMessage(isDelete ? 'Đã xóa tài khoản.' : willUnban ? 'Đã mở ban tài khoản.' : 'Đã ban tài khoản.')
      setMessageType('success')
      await fetchAccounts()
    } catch (error) {
      setMessage(error.message)
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  function startEditProfile() {
    setEditingProfile(true)
    resetNotice()
    setForm((current) => ({
      ...current,
      fullName: session.user.fullName || '',
      email: session.user.email || '',
      phone: session.user.phone || '',
    }))
  }

  function changeAvatar(event) {
    const file = event.target.files?.[0]
    if (!file || !session?.user) {
      return
    }

    const reader = new FileReader()
    reader.onload = async () => {
      const nextAvatar = String(reader.result || defaultAvatar)

      try {
        setLoading(true)
        resetNotice()

        const response = await fetch(`${API_URL}/auth/me`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${session.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fullName: session.user.fullName,
            email: session.user.email,
            phone: session.user.phone,
            avatarUrl: nextAvatar,
          }),
        })
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Không thể cập nhật avatar.')
        }

        persistSession({ token: session.token, user: data.user })
        localStorage.setItem(getAvatarKey(data.user), nextAvatar)
        setAvatarSrc(nextAvatar)
        setMessage('Avatar đã được lưu vào database.')
        setMessageType('success')
      } catch (error) {
        setMessage(error.message)
        setMessageType('error')
      } finally {
        setLoading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  function logout(nextMessage = '') {
    localStorage.removeItem('swp_token')
    localStorage.removeItem('swp_user')
    setSession(null)
    setAccounts(null)
    setAvatarMenuOpen(false)
    setAvatarSrc(defaultAvatar)
    setEditingProfile(false)
    setPage('home')
    setMessage(nextMessage)
    setMessageType(nextMessage ? 'success' : '')
  }

  return (
    <main className="site-shell">
      <nav className="utility-nav" aria-label="Liên kết nhanh">
        <span>Pickleball Booking System</span>
        <div>
          <button type="button">Trợ giúp</button>
          <button type="button">Blog</button>
          <button type="button">Bản đồ</button>
        </div>
      </nav>

      <nav className="global-nav" aria-label="Điều hướng chính">
        <button type="button" className="brand-link" onClick={showHome}>
          <span className="brand-logo">PB</span>
          <span>Pickleball</span>
        </button>

        <div
          className="nav-center"
          onClick={(event) => {
            if (event.target === event.currentTarget.children[2]) {
              showManagement()
            }
          }}
        >
          <button type="button" onClick={showCourts}>Tìm sân</button>
          <button type="button">Loại sân</button>
          <button type="button">Phần mềm quản lý</button>
        </div>

        <div className="nav-actions">
          {session ? (
            <div className="avatar-menu-wrap">
              <button
                type="button"
                className="avatar-trigger"
                onClick={() => setAvatarMenuOpen((open) => !open)}
                aria-label="Mở menu tài khoản"
                aria-expanded={avatarMenuOpen}
              >
                <img src={avatarSrc} alt="Avatar người dùng" />
              </button>
              {avatarMenuOpen && (
                <div className="avatar-menu" role="menu">
                  <div className="avatar-menu-head">
                    <img src={avatarSrc} alt="" />
                    <div>
                      <strong>{session.user.fullName}</strong>
                      <span>{roleLabels[session.user.role] || session.user.role}</span>
                    </div>
                  </div>
                  <button type="button" onClick={showPersonalInfo} role="menuitem">
                    <span className="menu-icon">i</span>
                    Xem thông tin cá nhân
                  </button>
                  <button type="button" role="menuitem">
                    <span className="menu-icon">?</span>
                    Trợ giúp và hỗ trợ
                  </button>
                  <button type="button" onClick={() => logout()} role="menuitem">
                    <span className="menu-icon image-icon"><img src={logoutIcon} alt="" /></span>
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button type="button" className="nav-outline" onClick={() => showAuth('login')}>Đăng nhập</button>
              <button type="button" className="nav-outline" onClick={() => showAuth('register')}>Đăng ký</button>
            </>
          )}
        </div>
      </nav>

      {page === 'home' && (
        <>
          <section className="home-hero" aria-label="Đặt sân pickleball">
            <div className="hero-background" />
            <div className="hero-content">
              <h1>
                <span className="hero-title-line">Đặt sân pickleball</span>
                <span className="hero-title-line">nhanh - dễ - tiện</span>
              </h1>
              <p>Tìm và đặt sân pickleball ngay trong vài giây. Xem giá thực, lịch trống theo thời gian thực.</p>
              <div className="hero-actions">
                <button type="button" className="primary-button" onClick={showCourts}>Tìm sân ngay</button>
              </div>
            </div>
          </section>

          <section className="search-panel" aria-label="Tìm sân thể thao ngay">
            <div className="search-title">Tìm sân thể thao ngay</div>
            <label>
              Địa điểm
              <input value="Hà Nội" readOnly />
            </label>
            <label>
              Loại sân
              <select defaultValue="all">
                <option value="all">Tất cả sân pickleball</option>
                <option>Pickleball ngoài trời</option>
                <option>Pickleball trong nhà</option>
              </select>
            </label>
            <label>
              Ngày & giờ
              <input type="datetime-local" />
            </label>
            <button type="button" className="primary-button" onClick={showCourts}>Tìm ngay</button>
          </section>

          <section className="category-strip" aria-label="Danh mục">
            <article>
              <span>Danh mục</span>
              <h2>Pickleball nổi bật</h2>
              <p>Sân tiêu chuẩn, khung giờ linh hoạt, xác nhận nhanh cho người chơi cá nhân và nhóm.</p>
            </article>
            <article>
              <span>Vận hành</span>
              <h2>Quản lý sân gọn</h2>
              <p>Owner và Staff theo dõi sân, nhân sự, doanh thu trong cùng một bảng điều khiển.</p>
            </article>
            <article>
              <span>Tài khoản</span>
              <h2>Phân quyền rõ</h2>
              <p>Admin xem account bị ban và danh sách Customer, Owner, Staff theo từng nhóm.</p>
            </article>
          </section>

          {message && <p className={`floating-message ${messageType}`}>{message}</p>}
        </>
      )}

      {page === 'auth' && (
        <section className="auth-section" aria-label="Đăng nhập và đăng ký">
          <article className="auth-card">
            <div className="form-heading">
              {isForgotPassword && <h2>Quên mật khẩu</h2>}
            </div>

            {!isForgotPassword && (
              <div className="switcher" role="tablist" aria-label="Chọn chế độ">
                <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => showAuth('login')}>
                  Đăng nhập
                </button>
                <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => showAuth('register')}>
                  Đăng ký
                </button>
              </div>
            )}

            {isForgotPassword ? (
              <form className="auth-form" onSubmit={submitForgotPassword}>
                <Field name="email" type="email" label="Email" value={form.email} onChange={updateField} placeholder="pickleball.customer@gmail.com" />
                <Field name="password" type="password" label="Mật khẩu mới" value={form.password} onChange={updateField} placeholder="Ít nhất 6 ký tự" minLength="6" />
                <Field name="confirmPassword" type="password" label="Nhập lại mật khẩu mới" value={form.confirmPassword} onChange={updateField} placeholder="Nhập lại mật khẩu" minLength="6" />
                {message && <p className={`message ${messageType}`}>{message}</p>}
                <button className="primary-button wide" type="submit" disabled={loading}>{loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}</button>
              </form>
            ) : (
              <form className="auth-form" onSubmit={submitAuth}>
                {isRegister && (
                  <>
                    <Field name="fullName" label="Họ tên" value={form.fullName} onChange={updateField} placeholder="Nguyễn Văn A" />
                    <Field name="phone" label="Số điện thoại" value={form.phone} onChange={updateField} placeholder="0901000000" />
                  </>
                )}
                <Field name="email" type="email" label="Email" value={form.email} onChange={updateField} placeholder="pickleball.customer@gmail.com" />
                <Field name="password" type="password" label="Mật khẩu" value={form.password} onChange={updateField} placeholder="Ít nhất 6 ký tự" minLength="6" />
                {message && <p className={`message ${messageType}`}>{message}</p>}
                <button className="primary-button wide" type="submit" disabled={loading}>{loading ? 'Đang xử lý...' : isRegister ? 'Đăng ký' : 'Đăng nhập'}</button>
              </form>
            )}

            <div className="form-actions">
              {!isForgotPassword && <button type="button" onClick={() => showAuth('forgot-password')}>Quên mật khẩu?</button>}
              {isForgotPassword && <button type="button" onClick={() => showAuth('login')}>Quay lại đăng nhập</button>}
            </div>
          </article>
        </section>
      )}

      {page === 'courts' && session && (
        <section className="courts-section" aria-label="Danh sách sân pickleball Hà Nội">
          <aside className="courts-sidebar" aria-label="Bộ lọc sân">
            <article>
              <div className="filter-heading">
                <h2>Loại sân</h2>
                <button type="button" onClick={() => { setCourtFilter('all'); setCourtPage(1) }}>Xóa lọc</button>
              </div>
              <div className="filter-list">
                <button type="button" className={courtFilter === 'all' ? 'active' : ''} onClick={() => { setCourtFilter('all'); setCourtPage(1) }}>Tất cả sân pickleball</button>
                <button type="button" className={courtFilter === 'outdoor' ? 'active' : ''} onClick={() => { setCourtFilter('outdoor'); setCourtPage(1) }}>Sân ngoài trời</button>
                <button type="button" className={courtFilter === 'indoor' ? 'active' : ''} onClick={() => { setCourtFilter('indoor'); setCourtPage(1) }}>Sân trong nhà</button>
              </div>
            </article>
            <article>
              <h2>Sắp xếp</h2>
              <select defaultValue="az">
                <option value="az">Tên A-Z</option>
                <option value="district">Khu vực Hà Nội</option>
                <option value="count">Số sân nhiều nhất</option>
              </select>
            </article>
          </aside>

          <div className="courts-content">
            <div className="courts-toolbar">
              <strong>{courtsLoading ? 'Đang tải sân từ database...' : `${filteredCourts.length} sân · Trang ${safeCourtPage}/${totalCourtPages}`}</strong>
              <div className="view-toggle" aria-label="Đổi kiểu hiển thị">
                <button type="button" className={courtView === 'list' ? 'active' : ''} onClick={() => { setCourtView('list'); setCourtPage(1) }}>☷</button>
                <button type="button" className={courtView === 'grid' ? 'active' : ''} onClick={() => { setCourtView('grid'); setCourtPage(1) }}>▦</button>
              </div>
            </div>

            {message && <p className={`message ${messageType}`}>{message}</p>}

            <div className={courtView === 'grid' ? 'court-grid' : 'court-list'}>
              {!courtsLoading && pagedCourts.length === 0 && (
                <p className="empty-text">Chưa có sân nào trong database.</p>
              )}
              {pagedCourts.map((court) => (
                <CourtCard key={court.id} court={court} view={courtView} onDetail={showCourtDetail} />
              ))}
            </div>

            <div className="pagination-row" aria-label="Phân trang danh sách sân">
              <button type="button" className="page-arrow" onClick={() => setCourtPage((page) => Math.max(1, page - 1))} disabled={safeCourtPage === 1}>
                ‹
              </button>
              {getPageItems().map((item) => (
                typeof item === 'number' ? (
                  <button
                    type="button"
                    key={item}
                    className={item === safeCourtPage ? 'active' : ''}
                    onClick={() => setCourtPage(item)}
                  >
                    {item}
                  </button>
                ) : (
                  <span key={item}>...</span>
                )
              ))}
              <button type="button" className="page-arrow" onClick={() => setCourtPage((page) => Math.min(totalCourtPages, page + 1))} disabled={safeCourtPage === totalCourtPages}>
                ›
              </button>
            </div>
          </div>
        </section>
      )}

      {page === 'court-detail' && session && selectedCourt && (
        <CourtDetailPage court={selectedCourt} token={session.token} onBack={showCourts} />
      )}

      {page === 'dashboard' && session && (
        <section className="dashboard-section" aria-label="Bảng điều khiển">
          <header className="dashboard-header">
            <div>
              <span className="hero-badge dark">Tài khoản {roleLabels[role] || role}</span>
              <h1>{session.user.fullName}</h1>
            </div>
            <button type="button" className="secondary-button" onClick={startEditProfile}>Sửa hồ sơ</button>
          </header>

          {message && <p className={`message ${messageType}`}>{message}</p>}

          {editingProfile ? (
            <form className="profile-editor" onSubmit={submitProfile}>
              <div className="avatar-editor">
                <label className="avatar-image-upload" aria-label="Thay avatar">
                  <img src={avatarSrc} alt="Avatar hiện tại" />
                  <input type="file" accept="image/*" onChange={changeAvatar} />
                </label>
              </div>
              <Field name="fullName" label="Họ tên" value={form.fullName} onChange={updateField} placeholder="Nguyễn Văn A" />
              <Field name="email" type="email" label="Email" value={form.email} onChange={updateField} placeholder="pickleball.customer@gmail.com" />
              <Field name="phone" label="Số điện thoại" value={form.phone} onChange={updateField} placeholder="0901000000" />
              <div className="profile-actions">
                <button className="primary-button" type="submit" disabled={loading}>{loading ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
                <button type="button" className="secondary-button" onClick={() => setEditingProfile(false)}>Hủy</button>
              </div>
            </form>
          ) : (
            <ProfileCard user={session.user} />
          )}

          {role === 'Admin' && <AdminAccounts accounts={accounts} accountsLoading={accountsLoading} loading={loading} onManage={manageAccount} />}
          {role === 'Owner' && (
            <OwnerTools
              accounts={accounts}
              accountsLoading={accountsLoading}
              loading={loading}
              courts={courts}
              courtsLoading={courtsLoading}
              ownerView={ownerView}
              onOwnerView={setOwnerView}
              onManage={manageAccount}
              onRefresh={fetchAccounts}
              onRefreshCourts={fetchCourts}
              courtForm={courtForm}
              editingCourtId={editingCourtId}
              onCourtField={updateCourtField}
              onAddCourt={addCourt}
              onEditCourt={startEditCourt}
              onDeleteCourt={deleteCourt}
              onCancelCourtEdit={resetCourtForm}
              staffForm={staffForm}
              onStaffField={updateStaffField}
              onAddStaff={addStaff}
            />
          )}
          {role === 'Staff' && (
            <StaffToolsPanel
              dashboard={staffDashboard}
              loading={staffLoading}
              onRefresh={fetchStaffDashboard}
              onBookingAction={handleStaffBookingAction}
              onAddonStock={handleAddonStock}
            />
          )}
          {role === 'Customer' && <CustomerTools />}
        </section>
      )}
    </main>
  )
}

function Field({ label, ...props }) {
  return (
    <label>
      {label}
      <input required {...props} />
    </label>
  )
}

function ProfileCard({ user }) {
  return (
    <article className="profile-card">
      <dl className="identity-list">
        <div><dt>Họ tên</dt><dd>{user.fullName}</dd></div>
        <div><dt>Email</dt><dd>{user.email}</dd></div>
        <div><dt>Số điện thoại</dt><dd>{user.phone || 'Chưa cập nhật'}</dd></div>
        <div><dt>Vai trò</dt><dd>{roleLabels[user.role] || user.role}</dd></div>
        <div><dt>Trạng thái</dt><dd>{user.status}</dd></div>
      </dl>
    </article>
  )
}

function AdminAccounts({ accounts, accountsLoading, loading, onManage }) {
  const roles = ['Customer', 'Owner', 'Staff']

  return (
    <section className="management-grid" aria-label="Admin quản lý tài khoản">
      <AccountGroup title="Tài khoản bị ban" users={accounts?.banned || []} empty="Chưa có tài khoản bị ban." loading={accountsLoading} />
      {roles.map((role) => (
        <AccountGroup
          key={role}
          title={`Danh sách ${roleLabels[role]}`}
          users={accounts?.byRole?.[role] || []}
          empty={`Chưa có ${roleLabels[role]}.`}
          loading={accountsLoading}
          actions={role === 'Customer' ? { loading, onManage } : null}
        />
      ))}
    </section>
  )
}

// eslint-disable-next-line no-unused-vars
function LegacyOwnerTools({ accounts, accountsLoading, loading, onManage, onRefresh, courtForm, onCourtField, onAddCourt }) {
  return (
    <section className="management-grid" aria-label="Owner quản lý Customer">
      <article className="feature-panel owner-court-form">
        <div className="panel-heading">
          <h2>Thêm cơ sở sân</h2>
          <span>Owner</span>
        </div>
        <form onSubmit={onAddCourt}>
          <Field name="name" label="Tên cơ sở" value={courtForm.name} onChange={onCourtField} placeholder="Pickleball Ba Đình Club" />
          <label>
            Khu vực Hà Nội
            <select name="district" value={courtForm.district} onChange={onCourtField}>
              <option>Tây Hồ</option>
              <option>Cầu Giấy</option>
              <option>Hoàn Kiếm</option>
              <option>Đống Đa</option>
              <option>Long Biên</option>
              <option>Thanh Xuân</option>
              <option>Nam Từ Liêm</option>
              <option>Hà Đông</option>
              <option>Ba Đình</option>
            </select>
          </label>
          <label>
            Loại sân
            <select name="type" value={courtForm.type} onChange={onCourtField}>
              <option value="outdoor">Sân ngoài trời</option>
              <option value="indoor">Sân trong nhà</option>
            </select>
          </label>
          <Field name="count" type="number" min="1" label="Số sân" value={courtForm.count} onChange={onCourtField} />
          <button type="submit" className="primary-button">Thêm cơ sở</button>
        </form>
      </article>
      <AccountGroup
        title="Danh sách Customer từ database"
        users={accounts?.byRole?.Customer || []}
        empty="Database chưa có Customer để quản lý."
        loading={accountsLoading}
        headerAction={<button type="button" className="secondary-button small" onClick={onRefresh} disabled={accountsLoading}>Tải lại</button>}
        actions={{ loading, onManage }}
      />
      <AccountGroup
        title="Danh sách Staff từ database"
        users={accounts?.byRole?.Staff || []}
        empty="Database chưa có Staff để quản lý."
        loading={accountsLoading}
        headerAction={<button type="button" className="secondary-button small" onClick={onRefresh} disabled={accountsLoading}>Tải lại</button>}
        actions={{ loading, onManage }}
      />
    </section>
  )
}

function OwnerTools({
  accounts,
  accountsLoading,
  loading,
  courts,
  courtsLoading,
  ownerView,
  onOwnerView,
  onManage,
  onRefresh,
  onRefreshCourts,
  courtForm,
  editingCourtId,
  onCourtField,
  onAddCourt,
  onEditCourt,
  onDeleteCourt,
  onCancelCourtEdit,
  staffForm,
  onStaffField,
  onAddStaff,
}) {
  const ownerTabs = [
    { id: 'courts', label: 'Xem danh sách sân' },
    { id: 'customers', label: 'Xem danh sách khách hàng' },
    { id: 'staff', label: 'Xem danh sách nhân viên' },
  ]

  return (
    <section className="owner-workspace" aria-label="Owner quản lý dữ liệu">
      <div className="owner-tabs" role="tablist" aria-label="Chọn danh sách quản lý">
        {ownerTabs.map((tab) => (
          <button type="button" key={tab.id} className={ownerView === tab.id ? 'active' : ''} onClick={() => onOwnerView(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      {ownerView === 'courts' && (
        <section className="management-grid two-col" aria-label="Danh sách sân">
          <CourtEditor courtForm={courtForm} editingCourtId={editingCourtId} loading={loading} onCourtField={onCourtField} onAddCourt={onAddCourt} onCancelCourtEdit={onCancelCourtEdit} />
          <CourtManagementList courts={courts} loading={loading} courtsLoading={courtsLoading} onRefresh={onRefreshCourts} onEditCourt={onEditCourt} onDeleteCourt={onDeleteCourt} />
        </section>
      )}

      {ownerView === 'customers' && (
        <section className="management-grid" aria-label="Danh sách khách hàng">
          <AccountGroup
            title="Danh sách khách hàng"
            users={accounts?.byRole?.Customer || []}
            empty="Database chưa có khách hàng."
            loading={accountsLoading}
            headerAction={<button type="button" className="secondary-button small" onClick={onRefresh} disabled={accountsLoading}>Tải lại</button>}
            actions={{ loading, onManage, allowBan: true, allowDelete: true }}
          />
        </section>
      )}

      {ownerView === 'staff' && (
        <section className="management-grid two-col" aria-label="Danh sách nhân viên">
          <StaffEditor staffForm={staffForm} loading={loading} onStaffField={onStaffField} onAddStaff={onAddStaff} />
          <AccountGroup
            title="Danh sách nhân viên"
            users={accounts?.byRole?.Staff || []}
            empty="Database chưa có nhân viên."
            loading={accountsLoading}
            headerAction={<button type="button" className="secondary-button small" onClick={onRefresh} disabled={accountsLoading}>Tải lại</button>}
            actions={{ loading, onManage, allowBan: false, allowDelete: true }}
          />
        </section>
      )}
    </section>
  )
}

function CourtEditor({ courtForm, editingCourtId, loading, onCourtField, onAddCourt, onCancelCourtEdit }) {
  return (
    <article className="feature-panel owner-court-form">
      <div className="panel-heading">
        <h2>{editingCourtId ? 'Sửa sân' : 'Thêm sân'}</h2>
        <span>Owner</span>
      </div>
      <form onSubmit={onAddCourt}>
        <Field name="code" label="Mã sân" value={courtForm.code} onChange={onCourtField} placeholder="A3" />
        <Field name="name" label="Tên sân" value={courtForm.name} onChange={onCourtField} placeholder="Sân A3" />
        <Field name="address" label="Địa chỉ sân" value={courtForm.address} onChange={onCourtField} placeholder="12 Trịnh Công Sơn, Tây Hồ, Hà Nội" />
        <label>
          Loại sân
          <select name="type" value={courtForm.type} onChange={onCourtField}>
            <option value="outdoor">Sân ngoài trời</option>
            <option value="indoor">Sân trong nhà</option>
          </select>
        </label>
        <label>
          Mặt sân
          <select name="surfaceType" value={courtForm.surfaceType} onChange={onCourtField}>
            <option value="standard">Tiêu chuẩn</option>
            <option value="premium">Premium</option>
            <option value="synthetic">Synthetic</option>
            <option value="concrete">Concrete</option>
            <option value="wood">Wood</option>
          </select>
        </label>
        <Field name="basePricePerHour" type="number" min="0" label="Giá mỗi giờ" value={courtForm.basePricePerHour} onChange={onCourtField} />
        <Field name="facilities" label="Tiện ích" value={courtForm.facilities} onChange={onCourtField} placeholder="lighting, parking" />
        <label>
          Trạng thái
          <select name="status" value={courtForm.status} onChange={onCourtField}>
            <option value="available">Đang hoạt động</option>
            <option value="maintenance">Bảo trì</option>
            <option value="inactive">Tạm ngưng</option>
          </select>
        </label>
        <div className="row-actions">
          <button type="submit" className="primary-button" disabled={loading}>{editingCourtId ? 'Lưu sân' : 'Thêm sân'}</button>
          {editingCourtId && <button type="button" className="secondary-button" onClick={onCancelCourtEdit}>Hủy</button>}
        </div>
      </form>
    </article>
  )
}

function CourtManagementList({ courts, loading, courtsLoading, onRefresh, onEditCourt, onDeleteCourt }) {
  return (
    <article className="account-group">
      <div className="panel-heading">
        <h2>Danh sách sân</h2>
        <button type="button" className="secondary-button small" onClick={onRefresh} disabled={courtsLoading}>Tải lại</button>
      </div>
      <div className="account-list">
        {courtsLoading && <p className="empty-text">Đang tải sân từ database...</p>}
        {!courtsLoading && courts.length === 0 && <p className="empty-text">Database chưa có sân.</p>}
        {courts.map((court) => (
          <div className="account-row" key={court.id}>
            <div>
              <strong>{court.code} - {court.name}</strong>
              <span>{court.address}</span>
              <small>{court.type === 'outdoor' ? 'Sân ngoài trời' : 'Sân trong nhà'} - {court.statusLabel || court.status}</small>
            </div>
            <div className="row-actions">
              <button type="button" className="secondary-button small" onClick={() => onEditCourt(court)} disabled={loading}>Sửa</button>
              <button type="button" className="danger-button small" onClick={() => onDeleteCourt(court)} disabled={loading}>Xóa</button>
            </div>
          </div>
        ))}
      </div>
    </article>
  )
}

function StaffEditor({ staffForm, loading, onStaffField, onAddStaff }) {
  return (
    <article className="feature-panel">
      <div className="panel-heading">
        <h2>Thêm nhân viên</h2>
        <span>Staff</span>
      </div>
      <form onSubmit={onAddStaff}>
        <Field name="fullName" label="Họ tên" value={staffForm.fullName} onChange={onStaffField} placeholder="Nguyễn Văn A" />
        <Field name="email" type="email" label="Email" value={staffForm.email} onChange={onStaffField} placeholder="pickleball.staff11@gmail.com" />
        <Field name="phone" label="Số điện thoại" value={staffForm.phone} onChange={onStaffField} placeholder="0911000011" />
        <Field name="password" type="password" minLength="6" label="Mật khẩu" value={staffForm.password} onChange={onStaffField} />
        <button type="submit" className="primary-button" disabled={loading}>Thêm nhân viên</button>
      </form>
    </article>
  )
}

// eslint-disable-next-line no-unused-vars
function StaffTools() {
  return (
    <section className="management-grid" aria-label="Staff quản lý vận hành">
      <FeaturePanel title="Quản lý sân" items={['Mở/khóa sân theo ca', 'Cập nhật lịch trống', 'Ghi nhận bảo trì']} />
      <FeaturePanel title="Quản lý Staff" items={['Xem lịch nhân viên', 'Bàn giao ca', 'Theo dõi nhiệm vụ']} />
      <FeaturePanel title="Quản lý doanh thu" items={['Tổng doanh thu ngày', 'Booking đã thanh toán', 'Báo cáo cuối ca']} />
    </section>
  )
}

function StaffToolsPanel({ dashboard, loading, onRefresh, onBookingAction, onAddonStock }) {
  const bookings = dashboard.bookings || []
  const addons = dashboard.addons || []
  const totalRevenue = bookings.reduce((sum, booking) => sum + Number(booking.paidAmount || 0), 0)
  const activeBookings = bookings.filter((booking) => ['confirmed', 'checked_in'].includes(booking.bookingStatus)).length

  function updateStock(addon) {
    const display = addonDisplay[addon.code] || {}
    const nextValue = window.prompt(`Nhập số lượng mới cho ${display.name || addon.name}`, addon.stockQuantity)
    if (nextValue === null) {
      return
    }

    const stockQuantity = Number(nextValue)
    if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
      window.alert('Số lượng phải là số nguyên không âm.')
      return
    }

    onAddonStock(addon, stockQuantity)
  }

  return (
    <section className="staff-workspace" aria-label="Bảng vận hành của nhân viên">
      <div className="staff-stat-grid">
        <article>
          <span>Booking hôm nay</span>
          <strong>{bookings.length}</strong>
        </article>
        <article>
          <span>Đang vận hành</span>
          <strong>{activeBookings}</strong>
        </article>
        <article>
          <span>Đã thu</span>
          <strong>{formatFullMoney(totalRevenue)}</strong>
        </article>
      </div>

      <article className="staff-panel">
        <div className="panel-heading">
          <h2>Lịch booking ngày {dashboard.date}</h2>
          <button type="button" className="secondary-button small" onClick={onRefresh} disabled={loading}>
            {loading ? 'Đang tải...' : 'Tải lại'}
          </button>
        </div>
        <div className="staff-table-wrap">
          <table className="staff-table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Khách</th>
                <th>Sân</th>
                <th>Giờ</th>
                <th>Trạng thái</th>
                <th>Thanh toán</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 && (
                <tr>
                  <td colSpan="7" className="empty-cell">Chưa có booking trong ngày này.</td>
                </tr>
              )}
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td><strong>{booking.bookingCode}</strong></td>
                  <td>
                    <span>{booking.customerName}</span>
                    <small>{booking.customerPhone || booking.customerEmail}</small>
                  </td>
                  <td>{booking.courtCode} - {booking.courtName}</td>
                  <td>{booking.startTime || '--'} - {booking.endTime || '--'}</td>
                  <td><span className={`status-pill ${booking.bookingStatus}`}>{bookingStatusLabels[booking.bookingStatus] || booking.bookingStatus}</span></td>
                  <td>
                    <span>{paymentStatusLabels[booking.paymentStatus] || booking.paymentStatus}</span>
                    <small>{formatFullMoney(booking.totalAmount)}</small>
                  </td>
                  <td>
                    <div className="row-actions">
                      {booking.paymentStatus !== 'paid' && (
                        <button
                          type="button"
                          className="secondary-button small"
                          onClick={() => onBookingAction(booking, 'payment', { paymentMethod: 'cash' })}
                          disabled={loading}
                        >
                          Thu tiền
                        </button>
                      )}
                      {booking.bookingStatus === 'confirmed' && (
                        <button type="button" className="primary-button small" onClick={() => onBookingAction(booking, 'checkIn')} disabled={loading}>
                          Check-in
                        </button>
                      )}
                      {booking.bookingStatus === 'checked_in' && (
                        <button type="button" className="primary-button small" onClick={() => onBookingAction(booking, 'checkOut')} disabled={loading}>
                          Check-out
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      <article className="staff-panel">
        <div className="panel-heading">
          <h2>Dịch vụ kèm tại cơ sở</h2>
          <span>{addons.length}</span>
        </div>
        <div className="addon-grid">
          {addons.map((addon) => {
            const display = addonDisplay[addon.code] || {}
            const isInactive = addon.status !== 'active' || addon.stockQuantity === 0

            return (
            <div className={`addon-card ${isInactive ? 'inactive' : ''}`} key={addon.id}>
              <div className="addon-copy">
                <small>{display.category || addon.categoryName}</small>
                <strong>{display.name || addon.name}</strong>
                <span>{display.description || 'Dịch vụ kèm cho booking tại sân'}</span>
              </div>
              <div className="addon-stock">
                <span className={`inventory-status ${isInactive ? 'inactive' : 'active'}`}>
                  {isInactive ? 'Tạm hết' : 'Đang bán'}
                </span>
                <strong>{addon.stockQuantity}</strong>
                <small>{formatFullMoney(addon.unitPrice)}</small>
                <button type="button" className="secondary-button small" onClick={() => updateStock(addon)} disabled={loading}>
                  Cập nhật
                </button>
              </div>
            </div>
            )
          })}
        </div>
      </article>
    </section>
  )
}

function CustomerTools() {
  return (
    <section className="management-grid" aria-label="Customer">
      <FeaturePanel title="Đặt sân" items={['Tìm sân pickleball', 'Chọn ngày giờ', 'Theo dõi lịch đặt']} />
      <FeaturePanel title="Hồ sơ" items={['Cập nhật thông tin', 'Xem trạng thái tài khoản', 'Đăng xuất an toàn']} />
    </section>
  )
}

function CourtDetailPage({ court, token, onBack }) {
  const [courtDetail, setCourtDetail] = useState(court)
  const [availability, setAvailability] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailMessage, setDetailMessage] = useState('')
  const selectedDate = getTodayString()
  const activeCourt = courtDetail || court
  const isOutdoor = activeCourt.type === 'outdoor'
  const image = isOutdoor ? courtOutdoor : courtIndoor
  const typeLabel = isOutdoor ? 'Sân ngoài trời' : 'Sân trong nhà'
  const mapSrc = 'https://www.openstreetmap.org/export/embed.html?bbox=105.805%2C21.015%2C105.845%2C21.045&layer=mapnik&marker=21.030%2C105.825'
  const priceRules = activeCourt.priceRules || []
  const slots = availability?.slots || []

  useEffect(() => {
    async function fetchCourtDetail() {
      setDetailLoading(true)
      setDetailMessage('')

      try {
        const [detailResponse, availabilityResponse] = await Promise.all([
          fetch(`${API_URL}/courts/${court.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/courts/${court.id}/availability?date=${selectedDate}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        const detailData = await detailResponse.json()
        const availabilityData = await availabilityResponse.json()

        if (!detailResponse.ok) {
          throw new Error(detailData.message || 'Không thể tải chi tiết sân.')
        }

        if (!availabilityResponse.ok) {
          throw new Error(availabilityData.message || 'Không thể tải lịch trống.')
        }

        setCourtDetail(detailData.court)
        setAvailability(availabilityData.availability)
      } catch (error) {
        setDetailMessage(error.message)
      } finally {
        setDetailLoading(false)
      }
    }

    fetchCourtDetail()
  }, [court.id, token, selectedDate])

  return (
    <section className="court-detail-page" aria-label="Chi tiết sân pickleball">
      <nav className="breadcrumb" aria-label="Đường dẫn">
        <button type="button" onClick={onBack}>Trang chủ</button>
        <span>/</span>
        <button type="button" onClick={onBack}>Tìm sân</button>
        <span>/</span>
        <strong>{activeCourt.name}</strong>
      </nav>

      <img className="court-detail-hero" src={image} alt={`${activeCourt.name} - ${typeLabel}`} />

      <div className="court-detail-layout">
        <div className="court-detail-main">
          {detailMessage && <p className="message error">{detailMessage}</p>}
          {detailLoading && <p className="message">Đang tải chi tiết sân từ database...</p>}

          <article className="detail-card court-overview-card">
            <div className="overview-actions">
              <span className="sport-chip">Pickleball</span>
              <div>
                <button type="button" className="secondary-button small">Lưu</button>
                <button type="button" className="secondary-button small">Chia sẻ</button>
              </div>
            </div>
            <h1>{activeCourt.name}</h1>
            <p className="detail-address">{activeCourt.address}</p>
            <div className="court-meta-row">
              <span>Mã sân: <strong>{activeCourt.code}</strong></span>
              <span>Mở cửa: <strong>{activeCourt.hours}</strong></span>
              <span>Hotline: <strong>{activeCourt.hotline}</strong></span>
              <span>Loại sân: <strong>{typeLabel}</strong></span>
              <span className="status-text">{activeCourt.statusLabel || activeCourt.status}</span>
            </div>
            <div className="detail-divider" />
            <h2>Giới thiệu</h2>
            <p>{activeCourt.intro}</p>
            <h2>Thông tin sân</h2>
            <div className="subcourt-list">
              <span>{activeCourt.code} - {activeCourt.name} <small>({activeCourt.surfaceType})</small></span>
              <span>Giá cơ bản <small>{formatMoney(activeCourt.basePricePerHour)}/h</small></span>
              {activeCourt.facilities?.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </article>

          <article className="detail-card">
            <h2>Bảng giá thuê sân</h2>
            <div className="price-table" role="table" aria-label="Bảng giá thuê sân">
              <div className="price-row header" role="row">
                <span>Khung giờ</span>
                <span>Áp dụng</span>
                <span>Giá</span>
              </div>
              {priceRules.map((row) => (
                <div className="price-row" role="row" key={row.id}>
                  <span>{row.startTime}-{row.endTime}</span>
                  <strong>{row.dayOfWeek ? `Thứ ${row.dayOfWeek}` : 'Tất cả ngày'}</strong>
                  <strong>{formatMoney(row.pricePerSlot)}/slot</strong>
                </div>
              ))}
            </div>
            <p className="muted-note">Giá áp dụng theo từng khung giờ và đã bao gồm phí thuê sân.</p>
          </article>

          <article className="detail-card">
            <h2>Lịch trống hôm nay ({selectedDate})</h2>
            <div className="slot-board">
              <div className="slot-group">
                <div className="slot-heading">
                  <strong>{activeCourt.code} - {activeCourt.name}</strong>
                  <span>{formatMoney(activeCourt.basePricePerHour)}/h</span>
                </div>
                <div className="time-grid">
                  {slots.map((slot) => (
                    <button type="button" className={slot.status === 'booked' ? 'booked' : ''} key={`${slot.startTime}-${slot.endTime}`} disabled={slot.status === 'booked'}>
                      {slot.startTime}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="slot-legend">
              <span><i className="available-dot" />Trống</span>
              <span><i />Đã đặt</span>
            </div>
            <button type="button" className="primary-button wide">Đặt sân ngay</button>
          </article>

          <article className="detail-card">
            <h2>Vị trí</h2>
            <iframe
              title={`Bản đồ ${activeCourt.name}`}
              className="court-map"
              src={mapSrc}
              loading="lazy"
            />
            <div className="map-actions">
              <a className="secondary-button small" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeCourt.locationQuery)}`} target="_blank" rel="noreferrer">Chỉ đường</a>
              <a className="secondary-button small" href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(activeCourt.locationQuery)}`} target="_blank" rel="noreferrer">Xem bản đồ</a>
            </div>
          </article>
        </div>

        <aside className="court-detail-side" aria-label="Đặt sân nhanh">
          <BookingSummaryCard court={activeCourt} />
          <article className="detail-card contact-card">
            <h2>Thông tin liên hệ</h2>
            <strong>{activeCourt.hotline}</strong>
            <span>{activeCourt.address}</span>
            <span>{activeCourt.hours} hằng ngày</span>
            <button type="button" className="secondary-button wide">Liên hệ chủ sân</button>
          </article>
        </aside>
      </div>
    </section>
  )
}

function BookingSummaryCard({ court }) {
  return (
    <article className="detail-card booking-summary">
      <h2>{court.count} sân</h2>
      <dl>
        <div><dt>Ngày đặt</dt><dd>Chọn ngày</dd></div>
        <div><dt>Giờ đặt</dt><dd>Chọn giờ</dd></div>
        <div><dt>Thời lượng</dt><dd>1 giờ</dd></div>
      </dl>
      <button type="button" className="primary-button wide">Đặt sân ngay</button>
      <button type="button" className="secondary-button wide">Gọi: {court.hotline}</button>
      <p>Đặt cọc an toàn - Hủy trước 2h miễn phí</p>
    </article>
  )
}

function CourtCard({ court, view, onDetail }) {
  const isOutdoor = court.type === 'outdoor'
  const image = isOutdoor ? courtOutdoor : courtIndoor
  const typeLabel = isOutdoor ? 'Sân ngoài trời' : 'Sân trong nhà'

  return (
    <article className="court-card">
      <img src={image} alt={`${court.name} - ${typeLabel}`} />
      <div className="court-info">
        <div>
          <h2><span className="court-dot" />{court.name}</h2>
          <p><span className="pin-dot" />{court.district}</p>
          <span>{typeLabel}</span>
        </div>
        <strong>{court.count} sân</strong>
      </div>
      {view === 'list' && (
        <div className="court-actions">
          <button type="button" className="secondary-button small" onClick={() => onDetail(court)}>Chi tiết</button>
          <button type="button" className="primary-button small">Đặt sân</button>
        </div>
      )}
    </article>
  )
}

function AccountGroup({ title, users, empty, loading = false, headerAction, actions }) {
  const showBan = actions && actions.allowBan !== false
  const showDelete = actions && actions.allowDelete !== false

  return (
    <article className="account-group">
      <div className="panel-heading">
        <h2>{title}</h2>
        {headerAction || <span>{loading ? 'DB' : users.length}</span>}
      </div>
      <div className="account-list">
        {loading && <p className="empty-text">Đang tải danh sách từ database...</p>}
        {!loading && users.length === 0 && <p className="empty-text">{empty}</p>}
        {users.map((user) => (
          <div className="account-row" key={user.id}>
            <div>
              <strong>{user.fullName}</strong>
              <span>{user.email}</span>
              <small>{roleLabels[user.role] || user.role} - {user.status}</small>
            </div>
            {actions && (
              <div className="row-actions">
                {showBan && (
                  <button
                    type="button"
                    className="secondary-button small"
                    onClick={() => actions.onManage(user, user.status === 'Blocked' ? 'unban' : 'ban')}
                    disabled={actions.loading}
                  >
                    {user.status === 'Blocked' ? 'Mở ban' : 'Ban'}
                  </button>
                )}
                {showDelete && (
                  <button type="button" className="danger-button small" onClick={() => actions.onManage(user, 'delete')} disabled={actions.loading}>
                    Xóa
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </article>
  )
}

function FeaturePanel({ title, items }) {
  return (
    <article className="feature-panel">
      <div className="panel-heading">
        <h2>{title}</h2>
        <span>Staff</span>
      </div>
      <ul>
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </article>
  )
}

export default App
