import { useEffect, useRef, useState } from 'react'
import defaultAvatar from './assets/default-avatar.jpg'
import logoutIcon from './assets/logout-icon.png'
import courtOutdoor from './assets/court-outdoor.webp'
import courtIndoor from './assets/court-indoor.jpg'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
const PAYMENT_BANK = {
  bankId: import.meta.env.VITE_VIETQR_BANK_ID || '970432',
  bankName: import.meta.env.VITE_VIETQR_BANK_NAME || 'VPBank',
  accountNo: import.meta.env.VITE_VIETQR_ACCOUNT_NO || '0365193003',
  accountName: import.meta.env.VITE_VIETQR_ACCOUNT_NAME || 'NGUYEN DANG MINH',
}

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

function buildQrUrl(amount, content) {
  const params = new URLSearchParams({
    amount: String(Number(amount || 0)),
    addInfo: content,
    accountName: PAYMENT_BANK.accountName,
  })
  return `https://img.vietqr.io/image/${PAYMENT_BANK.bankId}-${PAYMENT_BANK.accountNo}-compact2.png?${params.toString()}`
}

function formatDateDisplay(value) {
  if (!value) {
    return 'Chưa chọn'
  }

  const [year, month, day] = String(value).slice(0, 10).split('-')
  return `${day}/${month}/${year}`
}

function timeToMinutes(time) {
  const [hours, minutes] = String(time || '00:00').split(':').map(Number)
  return hours * 60 + minutes
}

function minutesToTime(total) {
  const hours = String(Math.floor(total / 60)).padStart(2, '0')
  const minutes = String(total % 60).padStart(2, '0')
  return `${hours}:${minutes}`
}

function addHoursToTime(time, hours) {
  return minutesToTime(timeToMinutes(time) + Math.round(Number(hours || 0) * 60))
}

function slotCoversRange(slot, startMinutes, endMinutes) {
  return timeToMinutes(slot.startTime) >= startMinutes && timeToMinutes(slot.endTime) <= endMinutes
}

function hasAvailableDuration(slots, startTime, durationHours) {
  const startMinutes = timeToMinutes(startTime)
  const endMinutes = startMinutes + Math.round(Number(durationHours || 0) * 60)
  const coveredSlots = slots.filter((slot) => slotCoversRange(slot, startMinutes, endMinutes))

  if (coveredSlots.length === 0) {
    return false
  }

  const coveredMinutes = coveredSlots.reduce((total, slot) => total + timeToMinutes(slot.endTime) - timeToMinutes(slot.startTime), 0)
  return coveredMinutes === endMinutes - startMinutes && coveredSlots.every((slot) => slot.status === 'available')
}

function calculateBookingTotal(slots, startTime, durationHours) {
  const startMinutes = timeToMinutes(startTime)
  const endMinutes = startMinutes + Math.round(Number(durationHours || 0) * 60)
  return slots
    .filter((slot) => slotCoversRange(slot, startMinutes, endMinutes))
    .reduce((total, slot) => total + Number(slot.price || 0), 0)
}

const slotStatusLabels = {
  available: 'Trống',
  booked: 'Đã đặt',
  held: 'Đang giữ',
  in_use: 'Đang sử dụng',
  maintenance: 'Bảo trì',
  inactive: 'Tạm ngưng',
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
  const [branches, setBranches] = useState([])
  const [courtsLoading, setCourtsLoading] = useState(false)
  const [courtView, setCourtView] = useState('list')
  const [courtFilter, setCourtFilter] = useState('all')
  const [courtTypeMenuOpen, setCourtTypeMenuOpen] = useState(false)
  const [courtSort, setCourtSort] = useState('code')
  const [courtPage, setCourtPage] = useState(1)
  const [selectedCourtId, setSelectedCourtId] = useState(null)
  const [ownerView, setOwnerView] = useState('courts')
  const [editingCourtId, setEditingCourtId] = useState(null)
  const [bookingNotice, setBookingNotice] = useState('')
  const [mode, setMode] = useState('login')
  const [editingProfile, setEditingProfile] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [googleReady, setGoogleReady] = useState(() => Boolean(window.google?.accounts?.id))
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [accounts, setAccounts] = useState(null)
  const [customerSearch, setCustomerSearch] = useState('')
  const [forgotPasswordStep, setForgotPasswordStep] = useState('request')
  const [resetToken, setResetToken] = useState('')
  const [accountsLoading, setAccountsLoading] = useState(false)
  const [staffDashboard, setStaffDashboard] = useState({
    date: getTodayString(),
    search: '',
    bookings: [],
    addons: [],
    courts: [],
  })
  const [staffLoading, setStaffLoading] = useState(false)
  const [myBookings, setMyBookings] = useState([])
  const [myBookingsLoading, setMyBookingsLoading] = useState(false)
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    otp: '',
  })
  const [courtForm, setCourtForm] = useState({
    branchId: '',
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
  const sortedCourts = [...filteredCourts].sort((left, right) => {
    if (courtSort === 'price') {
      return Number(left.basePricePerHour || 0) - Number(right.basePricePerHour || 0)
    }

    if (courtSort === 'status') {
      return String(left.statusLabel || left.status).localeCompare(String(right.statusLabel || right.status), 'vi')
    }

    return String(left.code || left.name).localeCompare(String(right.code || right.name), 'vi', { numeric: true })
  })
  const courtsPerPage = courtView === 'grid' ? 9 : 5
  const totalCourtPages = Math.max(1, Math.ceil(sortedCourts.length / courtsPerPage))
  const safeCourtPage = Math.min(courtPage, totalCourtPages)
  const pagedCourts = sortedCourts.slice((safeCourtPage - 1) * courtsPerPage, safeCourtPage * courtsPerPage)
  const selectedCourt = courts.find((court) => Number(court.id) === Number(selectedCourtId))
  const googleButtonRef = useRef(null)
  const googleInitializedRef = useRef(false)

  useEffect(() => {
    if (session && canManageAccounts) {
      fetchAccounts()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.token, role])

  useEffect(() => {
    if (session) {
      fetchCourts()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.token])

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      return undefined
    }

    if (window.google?.accounts?.id) {
      return undefined
    }

    const handleLoad = () => setGoogleReady(true)
    const existingScript = document.querySelector('script[data-google-identity="true"]')
    if (existingScript) {
      existingScript.addEventListener('load', handleLoad)
      return () => existingScript.removeEventListener('load', handleLoad)
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.dataset.googleIdentity = 'true'
    script.onload = handleLoad
    document.body.appendChild(script)

    return () => {
      script.onload = null
    }
  }, [])

  useEffect(() => {
    if (page !== 'auth' || isForgotPassword || !GOOGLE_CLIENT_ID || !googleReady || !googleButtonRef.current || !window.google?.accounts?.id) {
      return
    }

    if (!googleInitializedRef.current) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: ({ credential }) => loginWithGoogle(credential),
      })
      googleInitializedRef.current = true
    }

    googleButtonRef.current.innerHTML = ''
    window.google.accounts.id.renderButton(googleButtonRef.current, {
      theme: 'outline',
      size: 'large',
      shape: 'pill',
      width: '320',
      text: isRegister ? 'signup_with' : 'signin_with',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, isForgotPassword, isRegister, googleReady])

  useEffect(() => {
    if (session && (role === 'Staff' || role === 'Owner')) {
      fetchStaffDashboard()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.token, role])

  useEffect(() => {
    if (session && role === 'Customer') {
      fetchMyBookings()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  function updateCustomerSearch(event) {
    setCustomerSearch(event.target.value)
  }

  function resetCourtForm() {
    setEditingCourtId(null)
    setCourtForm({
      branchId: '',
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
    setForgotPasswordStep('request')
    setResetToken('')
    setForm((current) => ({
      ...current,
      password: '',
      confirmPassword: '',
      otp: '',
    }))
    resetNotice()
  }

  function showHome() {
    setPage('home')
    setAvatarMenuOpen(false)
    resetNotice()
  }

  function showOwnerFeature(nextView = 'courts') {
    setAvatarMenuOpen(false)
    setCourtTypeMenuOpen(false)
    resetNotice()

    if (!session) {
      showAuth('login')
      return
    }

    if (role === 'Owner') {
      setOwnerView(nextView)
    }

    setPage('dashboard')
    setEditingProfile(false)
  }

  function showManagement() {
    showOwnerFeature('courts')
  }

  function showCourts() {
    setAvatarMenuOpen(false)
    setCourtTypeMenuOpen(false)
    resetNotice()

    if (!session) {
      showAuth('login')
      return
    }

    setPage('courts')
    fetchCourts()
  }

  function applyCourtTypeFilter(type) {
    setCourtFilter(type)
    setCourtPage(1)
    setCourtTypeMenuOpen(false)

    if (!session) {
      showAuth('login')
      return
    }

    setPage('courts')
    fetchCourts()
  }

  function showCourtDetail(court) {
    setAvatarMenuOpen(false)
    setCourtTypeMenuOpen(false)
    resetNotice()
    setBookingNotice('')

    if (!session) {
      showAuth('login')
      return
    }

    setSelectedCourtId(court.id)
    setPage('court-detail')
  }

  function showBooking(court) {
    setAvatarMenuOpen(false)
    setCourtTypeMenuOpen(false)
    resetNotice()
    setBookingNotice('')

    if (!session) {
      showAuth('login')
      return
    }

    setSelectedCourtId(court.id)
    setPage('booking')
  }

  function changeBookingCourt() {
    setCourtFilter('all')
    setCourtPage(1)
    showCourts()
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
          branchId: Number(courtForm.branchId || 0) || null,
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
      branchId: court.branchId || '',
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

  function showMyBookings() {
    setAvatarMenuOpen(false)
    setCourtTypeMenuOpen(false)
    setEditingProfile(false)
    resetNotice()

    if (!session) {
      showAuth('login')
      return
    }

    setPage('my-bookings')
    fetchMyBookings()
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

      setCourts(data.data?.courts || data.courts || [])
      setBranches(data.branches || [])
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

  async function fetchStaffDashboard(filters = {}) {
    if (!session?.token) {
      return
    }

    const date = filters.date ?? staffDashboard.date
    const search = filters.search ?? staffDashboard.search ?? ''
    const params = new URLSearchParams({ date })
    if (search.trim()) {
      params.set('search', search.trim())
    }

    setStaffLoading(true)
    try {
      const response = await fetch(`${API_URL}/staff/dashboard?${params.toString()}`, {
        headers: { Authorization: `Bearer ${session.token}` },
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Khong the tai dashboard Staff.')
      }

      setStaffDashboard({
        date: data.date,
        search,
        bookings: data.bookings || [],
        addons: data.addons || [],
        courts: data.courts || [],
      })
    } catch (error) {
      setMessage(error.message)
      setMessageType('error')
    } finally {
      setStaffLoading(false)
    }
  }

  async function fetchMyBookings() {
    if (!session?.token || session.user?.role !== 'Customer') {
      return
    }

    setMyBookingsLoading(true)
    try {
      const response = await fetch(`${API_URL}/bookings/my`, {
        headers: { Authorization: `Bearer ${session.token}` },
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Không thể tải lịch đặt sân của bạn.')
      }

      setMyBookings(data.data?.bookings || data.bookings || [])
    } catch (error) {
      setMessage(error.message)
      setMessageType('error')
    } finally {
      setMyBookingsLoading(false)
    }
  }

  async function handleStaffBookingAction(booking, action, extra = {}) {
    const endpoints = {
      confirm: `/staff/bookings/${booking.id}/confirm`,
      cancel: `/staff/bookings/${booking.id}/cancel`,
      checkIn: `/staff/bookings/${booking.id}/check-in`,
      checkOut: `/staff/bookings/${booking.id}/check-out`,
      noShow: `/staff/bookings/${booking.id}/no-show`,
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
        body: ['payment', 'cancel', 'noShow'].includes(action) ? JSON.stringify(extra) : undefined,
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

  async function handleStaffCourtStatus(court, status) {
    const reason = status === 'maintenance'
      ? window.prompt(`Nhập lý do bảo trì ${court.code} - ${court.name}`)
      : 'Hoàn tất bảo trì'
    if (reason === null || (status === 'maintenance' && !reason.trim())) {
      return
    }

    setStaffLoading(true)
    resetNotice()
    try {
      const response = await fetch(`${API_URL}/staff/courts/${court.id}/status`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${session.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, reason }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Không thể cập nhật trạng thái sân.')
      }

      const affected = data.affectedBookings || []
      const details = affected.length
        ? ` Booking ảnh hưởng: ${affected.map((item) => item.bookingCode).join(', ')}.`
        : ''
      setMessage(`${data.message}${details}`)
      setMessageType(affected.length ? 'error' : 'success')
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
      setForm({ fullName: '', email: '', phone: '', password: '', confirmPassword: '', otp: '' })
    } catch (error) {
      setMessage(error.message)
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  async function loginWithGoogle(credential) {
    if (!credential) {
      setMessage('Không nhận được thông tin đăng nhập từ Google.')
      setMessageType('error')
      return
    }

    setGoogleLoading(true)
    resetNotice()

    try {
      const response = await fetch(`${API_URL}/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Không thể đăng nhập bằng Gmail.')
      }

      persistSession(data)
      setPage('home')
      setMessage('Đăng nhập bằng Gmail thành công.')
      setMessageType('success')
      setForm({ fullName: '', email: '', phone: '', password: '', confirmPassword: '', otp: '' })
    } catch (error) {
      setMessage(error.message)
      setMessageType('error')
    } finally {
      setGoogleLoading(false)
    }
  }

  async function requestForgotPasswordOtp(event) {
    event.preventDefault()
    setLoading(true)
    resetNotice()

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Không thể gửi mã OTP.')
      }

      setForgotPasswordStep('verify')
      setResetToken('')
      setForm((current) => ({ ...current, otp: '', password: '', confirmPassword: '' }))
      setMessage(data.message || 'Mã OTP đã được gửi đến email của bạn.')
      setMessageType('success')
    } catch (error) {
      setMessage(error.message)
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  async function verifyForgotPasswordOtp(event) {
    event.preventDefault()
    setLoading(true)
    resetNotice()

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, otp: form.otp }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Không thể xác minh OTP.')
      }

      setResetToken(data.resetToken || '')
      setForgotPasswordStep('reset')
      setForm((current) => ({ ...current, password: '', confirmPassword: '' }))
      setMessage(data.message || 'OTP hợp lệ. Bạn có thể đặt mật khẩu mới.')
      setMessageType('success')
    } catch (error) {
      setMessage(error.message)
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  async function submitForgotPasswordReset(event) {
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
      const response = await fetch(`${API_URL}/auth/forgot-password/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password, resetToken }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Không thể đặt lại mật khẩu.')
      }

      setMode('login')
      setForgotPasswordStep('request')
      setResetToken('')
      setMessage(data.message || 'Mật khẩu đã được đặt lại. Vui lòng đăng nhập.')
      setMessageType('success')
      setForm({ fullName: '', email: form.email, phone: '', password: '', confirmPassword: '', otp: '' })
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
    const isEdit = action === 'edit'
    const willUnban = action === 'unban'
    if (isEdit) {
      const fullName = window.prompt('Họ tên', user.fullName || '')
      if (fullName === null) {
        return
      }
      const email = window.prompt('Email', user.email || '')
      if (email === null) {
        return
      }
      const phone = window.prompt('Số điện thoại', user.phone || '')
      if (phone === null) {
        return
      }

      setLoading(true)
      resetNotice()

      try {
        const response = await fetch(`${API_URL}/auth/accounts/${user.id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${session.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fullName, email, phone, branchId: user.branchId, status: user.status }),
        })
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Không thể cập nhật tài khoản.')
        }

        setMessage('Đã cập nhật tài khoản.')
        setMessageType('success')
        await fetchAccounts()
      } catch (error) {
        setMessage(error.message)
        setMessageType('error')
      } finally {
        setLoading(false)
      }
      return
    }

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

  async function viewCustomerHistory(user) {
    setLoading(true)
    resetNotice()

    try {
      const response = await fetch(`${API_URL}/auth/accounts/${user.id}/bookings`, {
        headers: { Authorization: `Bearer ${session.token}` },
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Không thể tải lịch sử đặt sân.')
      }

      const lines = (data.bookings || []).slice(0, 10).map((booking) => (
        `${booking.bookingDate} | ${booking.courtCode} - ${booking.courtName} | ${booking.startTime || '--'}-${booking.endTime || '--'} | ${booking.bookingStatus} | ${formatFullMoney(booking.totalAmount)}`
      ))
      window.alert(lines.length ? lines.join('\n') : 'Khách hàng này chưa có lịch sử đặt sân.')
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
    setMyBookings([])
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

        <div className="nav-center">
          <button type="button" onClick={showCourts}>Tìm sân</button>
          <div className="nav-dropdown-wrap">
            <button
              type="button"
              className={courtTypeMenuOpen ? 'active' : ''}
              onClick={() => {
                setAvatarMenuOpen(false)
                setCourtTypeMenuOpen((open) => !open)
              }}
              aria-haspopup="menu"
              aria-expanded={courtTypeMenuOpen}
            >
              Loai san
            </button>
            {courtTypeMenuOpen && (
              <div className="nav-dropdown" role="menu" aria-label="Loc loai san">
                <button type="button" className={courtFilter === 'all' ? 'active' : ''} onClick={() => applyCourtTypeFilter('all')} role="menuitem">
                  Tat ca san pickleball
                </button>
                <button type="button" className={courtFilter === 'outdoor' ? 'active' : ''} onClick={() => applyCourtTypeFilter('outdoor')} role="menuitem">
                  San ngoai troi
                </button>
                <button type="button" className={courtFilter === 'indoor' ? 'active' : ''} onClick={() => applyCourtTypeFilter('indoor')} role="menuitem">
                  San trong nha
                </button>
              </div>
            )}
          </div>
          {role === 'Customer' && (
            <button type="button" onClick={showMyBookings}>Sân của tôi</button>
          )}
          <button type="button" onClick={showManagement}>Phan mem quan ly</button>
          {role === 'Owner' && (
            <>
              <button type="button" onClick={() => showOwnerFeature('courts')}>Quan ly san</button>
              <button type="button" onClick={() => showOwnerFeature('bookings')}>Lich dat</button>
              <button type="button" onClick={() => showOwnerFeature('customers')}>Khach hang</button>
              <button type="button" onClick={() => showOwnerFeature('staff')}>Nhan vien</button>
              <button type="button" onClick={() => showOwnerFeature('services')}>Dich vu</button>
              <button type="button" onClick={() => showOwnerFeature('revenue')}>Doanh thu</button>
            </>
          )}
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
                  {role === 'Customer' && (
                    <button type="button" onClick={showMyBookings} role="menuitem">
                      <span className="menu-icon">B</span>
                      Lịch đặt sân của tôi
                    </button>
                  )}
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
              <form
                className="auth-form"
                onSubmit={
                  forgotPasswordStep === 'request'
                    ? requestForgotPasswordOtp
                    : forgotPasswordStep === 'verify'
                      ? verifyForgotPasswordOtp
                      : submitForgotPasswordReset
                }
              >
                <div className="otp-step-badge">Bước {forgotPasswordStep === 'request' ? '1/3 - Gửi OTP' : forgotPasswordStep === 'verify' ? '2/3 - Xác minh OTP' : '3/3 - Đổi mật khẩu'}</div>
                <Field
                  name="email"
                  type="email"
                  label="Email"
                  value={form.email}
                  onChange={updateField}
                  placeholder="pickleball.customer@gmail.com"
                  readOnly={forgotPasswordStep !== 'request'}
                />
                {forgotPasswordStep === 'verify' && (
                  <Field name="otp" label="Mã OTP" value={form.otp} onChange={updateField} placeholder="Nhập 6 số OTP" />
                )}
                {forgotPasswordStep === 'reset' && (
                  <>
                    <Field name="password" type="password" label="Mật khẩu mới" value={form.password} onChange={updateField} placeholder="Ít nhất 6 ký tự" minLength="6" />
                    <Field name="confirmPassword" type="password" label="Nhập lại mật khẩu mới" value={form.confirmPassword} onChange={updateField} placeholder="Nhập lại mật khẩu" minLength="6" />
                  </>
                )}
                {message && <p className={`message ${messageType}`}>{message}</p>}
                <button className="primary-button wide" type="submit" disabled={loading}>
                  {loading
                    ? 'Đang xử lý...'
                    : forgotPasswordStep === 'request'
                      ? 'Gửi mã OTP'
                      : forgotPasswordStep === 'verify'
                        ? 'Xác minh OTP'
                        : 'Đặt lại mật khẩu'}
                </button>
                {forgotPasswordStep !== 'request' && (
                  <button
                    type="button"
                    className="secondary-button wide"
                    onClick={forgotPasswordStep === 'verify' ? requestForgotPasswordOtp : () => setForgotPasswordStep('verify')}
                    disabled={loading}
                  >
                    {forgotPasswordStep === 'verify' ? 'Gửi lại mã OTP' : 'Quay lại bước OTP'}
                  </button>
                )}
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

            {!isForgotPassword && (
              <div className="social-auth-block">
                <div className="auth-divider"><span>hoặc tiếp tục với Gmail</span></div>
                {GOOGLE_CLIENT_ID ? (
                  <>
                    <div className="google-button-wrap" ref={googleButtonRef} />
                    {googleLoading && <p className="message">Đang xác thực Gmail...</p>}
                  </>
                ) : (
                  <p className="message">Chưa cấu hình Google Client ID nên nút đăng nhập Gmail đang tắt.</p>
                )}
              </div>
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
              <select value={courtSort} onChange={(event) => { setCourtSort(event.target.value); setCourtPage(1) }}>
                <option value="code">Mã sân A-Z</option>
                <option value="status">Trạng thái</option>
                <option value="price">Giá thấp nhất</option>
              </select>
            </article>
          </aside>

          <div className="courts-content">
            <div className="courts-toolbar">
              <strong>{courtsLoading ? 'Đang tải sân từ database...' : `${sortedCourts.length} sân · Trang ${safeCourtPage}/${totalCourtPages}`}</strong>
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
                <CourtCard key={court.id} court={court} onDetail={showCourtDetail} />
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
        <CourtDetailPage court={selectedCourt} token={session.token} onBack={showCourts} onBook={showBooking} />
      )}

      {page === 'booking' && session && selectedCourt && (
        <BookingPage
          court={selectedCourt}
          user={session.user}
          token={session.token}
          notice={bookingNotice}
          onNotice={setBookingNotice}
          onBack={() => showCourtDetail(selectedCourt)}
          onChangeCourt={changeBookingCourt}
          onViewMyBookings={showMyBookings}
        />
      )}

      {page === 'my-bookings' && session && role === 'Customer' && (
        <MyBookingsPage
          bookings={myBookings}
          loading={myBookingsLoading}
          message={message}
          messageType={messageType}
          onRefresh={fetchMyBookings}
          onBookAnother={showCourts}
        />
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

          {role === 'Admin' && <AdminAccounts accounts={accounts} accountsLoading={accountsLoading} loading={loading} onManage={manageAccount} onRefresh={fetchAccounts} />}
          {role === 'Owner' && (
            <OwnerTools
              accounts={accounts}
              accountsLoading={accountsLoading}
              loading={loading}
              courts={courts}
              branches={branches}
              courtsLoading={courtsLoading}
              dashboard={staffDashboard}
              dashboardLoading={staffLoading}
              ownerView={ownerView}
              onOwnerView={setOwnerView}
              onManage={manageAccount}
              customerSearch={customerSearch}
              onCustomerSearch={updateCustomerSearch}
              onCustomerHistory={viewCustomerHistory}
              onRefresh={fetchAccounts}
              onRefreshCourts={fetchCourts}
              onRefreshDashboard={fetchStaffDashboard}
              onBookingAction={handleStaffBookingAction}
              onAddonStock={handleAddonStock}
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
              onCourtStatus={handleStaffCourtStatus}
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

function MyBookingsPage({ bookings, loading, message, messageType, onRefresh, onBookAnother }) {
  const activeStatuses = ['pending', 'confirmed', 'checked_in']
  const activeBookings = bookings.filter((booking) => activeStatuses.includes(booking.bookingStatus))
  const historyBookings = bookings.filter((booking) => !activeStatuses.includes(booking.bookingStatus))

  return (
    <section className="dashboard-section" aria-label="Lịch đặt sân của tôi">
      <header className="dashboard-header">
        <div>
          <span className="hero-badge dark">Booking</span>
          <h1>Sân của tôi</h1>
        </div>
        <div className="profile-actions compact-actions">
          <button type="button" className="secondary-button" onClick={onRefresh} disabled={loading}>
            {loading ? 'Đang tải...' : 'Tải lại'}
          </button>
          <button type="button" className="primary-button" onClick={onBookAnother}>Đặt sân mới</button>
        </div>
      </header>

      {message && <p className={`message ${messageType}`}>{message}</p>}

      <section className="my-bookings-layout">
        <BookingListPanel
          title="Đang và sắp tới"
          bookings={activeBookings}
          empty="Bạn chưa có sân đang đặt hoặc sắp tới."
          loading={loading}
        />
        <BookingListPanel
          title="Đã đặt trước đây"
          bookings={historyBookings}
          empty="Chưa có lịch sử đặt sân."
          loading={loading}
        />
      </section>
    </section>
  )
}

function BookingListPanel({ title, bookings, empty, loading }) {
  return (
    <article className="staff-panel booking-history-panel">
      <div className="panel-heading">
        <h2>{title}</h2>
        <span>{loading ? '...' : bookings.length}</span>
      </div>
      <div className="booking-history-list">
        {loading && <p className="empty-text">Đang tải lịch đặt sân...</p>}
        {!loading && bookings.length === 0 && <p className="empty-text">{empty}</p>}
        {bookings.map((booking) => (
          <article className="booking-history-card" key={booking.id}>
            <div>
              <strong>{booking.courtCode} - {booking.courtName}</strong>
              <span>{formatDateDisplay(booking.bookingDate)} | {booking.startTime || '--'} - {booking.endTime || '--'}</span>
              <small>{booking.branchName || 'Pickleball Hà Nội'}</small>
            </div>
            <div>
              <span className={`status-pill ${booking.bookingStatus}`}>{bookingStatusLabels[booking.bookingStatus] || booking.bookingStatus}</span>
              <span>{paymentStatusLabels[booking.paymentStatus] || booking.paymentStatus}</span>
              <strong>{formatFullMoney(booking.totalAmount)}</strong>
            </div>
            <code>{booking.bookingCode}</code>
          </article>
        ))}
      </div>
    </article>
  )
}

function AdminAccounts({ accounts, accountsLoading, loading, onManage, onRefresh }) {
  const roles = ['Customer', 'Owner', 'Staff']

  return (
    <section className="management-grid admin-accounts-grid" aria-label="Admin quản lý tài khoản">
      <AccountGroup
        title="Tài khoản bị ban"
        users={accounts?.banned || []}
        empty="Chưa có tài khoản bị ban."
        loading={accountsLoading}
        headerAction={<button type="button" className="secondary-button small" onClick={onRefresh} disabled={accountsLoading}>Tải lại</button>}
        actions={{ loading, onManage, allowBan: true, allowDelete: false }}
      />
      {roles.map((role) => (
        <AccountGroup
          key={role}
          title={`Danh sách ${roleLabels[role]}`}
          users={accounts?.byRole?.[role] || []}
          empty={`Chưa có ${roleLabels[role]}.`}
          loading={accountsLoading}
          headerAction={<button type="button" className="secondary-button small" onClick={onRefresh} disabled={accountsLoading}>Tải lại</button>}
          actions={{ loading, onManage, allowBan: true, allowDelete: true }}
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
  branches,
  courtsLoading,
  dashboard,
  dashboardLoading,
  ownerView,
  onOwnerView,
  onManage,
  customerSearch,
  onCustomerSearch,
  onCustomerHistory,
  onRefresh,
  onRefreshCourts,
  onRefreshDashboard,
  onBookingAction,
  onAddonStock,
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
    { id: 'bookings', label: 'Lịch đặt sân' },
    { id: 'customers', label: 'Xem danh sách khách hàng' },
    { id: 'staff', label: 'Xem danh sách nhân viên' },
    { id: 'services', label: 'Dịch vụ kèm' },
    { id: 'revenue', label: 'Doanh thu' },
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
          <CourtEditor branches={branches} courtForm={courtForm} editingCourtId={editingCourtId} loading={loading} onCourtField={onCourtField} onAddCourt={onAddCourt} onCancelCourtEdit={onCancelCourtEdit} />
          <CourtManagementList courts={courts} loading={loading} courtsLoading={courtsLoading} onRefresh={onRefreshCourts} onEditCourt={onEditCourt} onDeleteCourt={onDeleteCourt} />
        </section>
      )}

      {ownerView === 'bookings' && (
        <OwnerBookingPanel dashboard={dashboard} loading={dashboardLoading} onRefresh={onRefreshDashboard} onBookingAction={onBookingAction} />
      )}

      {ownerView === 'customers' && (
        <section className="management-grid" aria-label="Danh sách khách hàng">
          <OwnerCustomerPanel
            customers={accounts?.byRole?.Customer || []}
            search={customerSearch}
            loading={loading}
            accountsLoading={accountsLoading}
            onSearch={onCustomerSearch}
            onManage={onManage}
            onHistory={onCustomerHistory}
            onRefresh={onRefresh}
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
            actions={{ loading, onManage, allowBan: false, allowDelete: true, allowEdit: true }}
          />
        </section>
      )}

      {ownerView === 'services' && (
        <OwnerServicesPanel addons={dashboard.addons || []} loading={dashboardLoading} onRefresh={onRefreshDashboard} onAddonStock={onAddonStock} />
      )}

      {ownerView === 'revenue' && (
        <OwnerRevenuePanel dashboard={dashboard} loading={dashboardLoading} onRefresh={onRefreshDashboard} />
      )}
    </section>
  )
}

function CourtEditor({ branches, courtForm, editingCourtId, loading, onCourtField, onAddCourt, onCancelCourtEdit }) {
  return (
    <article className="feature-panel owner-court-form">
      <div className="panel-heading">
        <h2>{editingCourtId ? 'Sửa sân' : 'Thêm sân'}</h2>
        <span>Owner</span>
      </div>
      <form onSubmit={onAddCourt}>
        <label>
          Chi nhánh
          <select name="branchId" value={courtForm.branchId} onChange={onCourtField}>
            <option value="">Chi nhánh mặc định</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </select>
        </label>
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

function OwnerBookingPanel({ dashboard, loading, onRefresh, onBookingAction }) {
  const bookings = dashboard.bookings || []

  return (
    <article className="staff-panel">
      <div className="panel-heading">
        <h2>Lịch đặt sân ngày {dashboard.date}</h2>
        <button type="button" className="secondary-button small" onClick={onRefresh} disabled={loading}>
          {loading ? 'Đang tải...' : 'Tải lại'}
        </button>
      </div>
      <div className="staff-table-wrap">
        <table className="staff-table">
          <thead>
            <tr>
              <th>Mã</th>
              <th>Khách hàng</th>
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
                    {booking.bookingStatus === 'pending' && (
                      <button type="button" className="primary-button small" onClick={() => onBookingAction(booking, 'confirm')} disabled={loading}>Xác nhận</button>
                    )}
                    {!['cancelled', 'completed', 'expired'].includes(booking.bookingStatus) && (
                      <button type="button" className="danger-button small" onClick={() => onBookingAction(booking, 'cancel', { cancelReason: 'Cancelled by owner' })} disabled={loading}>Hủy</button>
                    )}
                    {booking.paymentStatus !== 'paid' && (
                      <button type="button" className="secondary-button small" onClick={() => onBookingAction(booking, 'payment', { paymentMethod: 'cash' })} disabled={loading}>Thu tiền</button>
                    )}
                    {booking.bookingStatus === 'confirmed' && (
                      <button type="button" className="secondary-button small" onClick={() => onBookingAction(booking, 'checkIn')} disabled={loading}>Check-in</button>
                    )}
                    {booking.bookingStatus === 'checked_in' && (
                      <button type="button" className="secondary-button small" onClick={() => onBookingAction(booking, 'checkOut')} disabled={loading}>Check-out</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  )
}

function OwnerServicesPanel({ addons, loading, onRefresh, onAddonStock }) {
  function updateStock(addon) {
    const nextValue = window.prompt(`Nhập số lượng mới cho ${addon.name}`, addon.stockQuantity)
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
    <article className="staff-panel">
      <div className="panel-heading">
        <h2>Dịch vụ đi kèm</h2>
        <button type="button" className="secondary-button small" onClick={onRefresh} disabled={loading}>Tải lại</button>
      </div>
      <div className="addon-grid">
        {addons.length === 0 && <p className="empty-text">Database chưa có dịch vụ đi kèm.</p>}
        {addons.map((addon) => (
          <div className={`addon-card ${addon.status !== 'active' ? 'inactive' : ''}`} key={addon.id}>
            <div className="addon-copy">
              <small>{addon.categoryName}</small>
              <strong>{addon.name}</strong>
              <span>{addon.serviceType === 'rental' ? 'Cho thuê thiết bị' : 'Bán tại quầy'}</span>
            </div>
            <div className="addon-stock">
              <span className={`inventory-status ${addon.status === 'active' ? 'active' : 'inactive'}`}>{addon.status}</span>
              <strong>{addon.stockQuantity}</strong>
              <small>{formatFullMoney(addon.unitPrice)}</small>
              <button type="button" className="secondary-button small" onClick={() => updateStock(addon)} disabled={loading}>Cập nhật</button>
            </div>
          </div>
        ))}
      </div>
    </article>
  )
}

function OwnerRevenuePanel({ dashboard, loading, onRefresh }) {
  const bookings = dashboard.bookings || []
  const paidBookings = bookings.filter((booking) => booking.paymentStatus === 'paid')
  const totalRevenue = bookings.reduce((sum, booking) => sum + Number(booking.paidAmount || 0), 0)
  const pendingRevenue = bookings.reduce((sum, booking) => sum + (booking.paymentStatus === 'paid' ? 0 : Number(booking.totalAmount || 0)), 0)

  return (
    <section className="staff-workspace">
      <div className="staff-stat-grid">
        <article>
          <span>Booking trong ngày</span>
          <strong>{bookings.length}</strong>
        </article>
        <article>
          <span>Đã thanh toán</span>
          <strong>{paidBookings.length}</strong>
        </article>
        <article>
          <span>Doanh thu đã thu</span>
          <strong>{formatFullMoney(totalRevenue)}</strong>
        </article>
      </div>
      <article className="staff-panel">
        <div className="panel-heading">
          <h2>Báo cáo doanh thu ngày {dashboard.date}</h2>
          <button type="button" className="secondary-button small" onClick={onRefresh} disabled={loading}>Tải lại</button>
        </div>
        <dl className="identity-list">
          <div><dt>Tổng dự kiến</dt><dd>{formatFullMoney(totalRevenue + pendingRevenue)}</dd></div>
          <div><dt>Đã thu</dt><dd>{formatFullMoney(totalRevenue)}</dd></div>
          <div><dt>Chưa thu</dt><dd>{formatFullMoney(pendingRevenue)}</dd></div>
          <div><dt>Booking paid</dt><dd>{paidBookings.length}</dd></div>
          <div><dt>Ngày</dt><dd>{dashboard.date}</dd></div>
        </dl>
      </article>
    </section>
  )
}

function OwnerCustomerPanel({ customers, search, loading, accountsLoading, onSearch, onManage, onHistory, onRefresh }) {
  const keyword = search.trim().toLowerCase()
  const filteredCustomers = keyword
    ? customers.filter((customer) => [customer.fullName, customer.email, customer.phone].some((value) => String(value || '').toLowerCase().includes(keyword)))
    : customers

  return (
    <article className="account-group">
      <div className="panel-heading">
        <h2>Danh sách khách hàng</h2>
        <button type="button" className="secondary-button small" onClick={onRefresh} disabled={accountsLoading}>Tải lại</button>
      </div>
      <label className="inline-search">
        Tìm khách hàng
        <input value={search} onChange={onSearch} placeholder="Tên, email hoặc số điện thoại" />
      </label>
      <div className="account-list">
        {accountsLoading && <p className="empty-text">Đang tải khách hàng từ database...</p>}
        {!accountsLoading && filteredCustomers.length === 0 && <p className="empty-text">Không tìm thấy khách hàng.</p>}
        {filteredCustomers.map((customer) => (
          <div className="account-row" key={customer.id}>
            <div>
              <strong>{customer.fullName}</strong>
              <span>{customer.email}</span>
              <small>{customer.phone || 'Chưa cập nhật'} - {customer.status}</small>
            </div>
            <div className="row-actions">
              <button type="button" className="secondary-button small" onClick={() => onHistory(customer)} disabled={loading}>Lịch sử</button>
              <button type="button" className="secondary-button small" onClick={() => onManage(customer, customer.status === 'Blocked' ? 'unban' : 'ban')} disabled={loading}>
                {customer.status === 'Blocked' ? 'Mở ban' : 'Ban'}
              </button>
              <button type="button" className="danger-button small" onClick={() => onManage(customer, 'delete')} disabled={loading}>Xóa</button>
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

function StaffToolsPanel({ dashboard, loading, onRefresh, onBookingAction, onAddonStock, onCourtStatus }) {
  const bookings = dashboard.bookings || []
  const addons = dashboard.addons || []
  const courts = dashboard.courts || []
  const totalRevenue = bookings.reduce((sum, booking) => sum + Number(booking.paidAmount || 0), 0)
  const activeBookings = bookings.filter((booking) => ['confirmed', 'checked_in'].includes(booking.bookingStatus)).length

  function cancelBooking(booking) {
    const cancelReason = window.prompt(`Nhập lý do hủy booking ${booking.bookingCode}`)
    if (cancelReason?.trim()) {
      onBookingAction(booking, 'cancel', { cancelReason })
    }
  }

  function markNoShow(booking) {
    const reason = window.prompt(`Lý do no-show cho booking ${booking.bookingCode}`, 'Khách không đến sân')
    if (reason?.trim()) {
      onBookingAction(booking, 'noShow', { reason })
    }
  }

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
        <div className="staff-filter-bar">
          <label>
            Ngày vận hành
            <input
              type="date"
              value={dashboard.date}
              onChange={(event) => onRefresh({ date: event.target.value })}
            />
          </label>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              const search = new FormData(event.currentTarget).get('staffSearch')
              onRefresh({ search: String(search || '') })
            }}
          >
            <label>
              Tìm booking
              <input
                name="staffSearch"
                defaultValue={dashboard.search}
                placeholder="Mã, tên, email hoặc SĐT"
              />
            </label>
            <button type="submit" className="secondary-button small" disabled={loading}>Tìm</button>
            <button type="button" className="secondary-button small" onClick={() => onRefresh({ search: '' })} disabled={loading}>Xóa lọc</button>
          </form>
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
                      {booking.bookingStatus === 'pending' && (
                        <button type="button" className="primary-button small" onClick={() => onBookingAction(booking, 'confirm')} disabled={loading}>
                          Xác nhận
                        </button>
                      )}
                      {booking.bookingStatus === 'confirmed' && (
                        <>
                          <button type="button" className="primary-button small" onClick={() => onBookingAction(booking, 'checkIn')} disabled={loading}>
                            Check-in
                          </button>
                          <button type="button" className="secondary-button small" onClick={() => markNoShow(booking)} disabled={loading}>
                            No-show
                          </button>
                        </>
                      )}
                      {booking.bookingStatus === 'checked_in' && (
                        <button type="button" className="primary-button small" onClick={() => onBookingAction(booking, 'checkOut')} disabled={loading}>
                          Check-out
                        </button>
                      )}
                      {['pending', 'confirmed', 'checked_in'].includes(booking.bookingStatus) && (
                        <button type="button" className="danger-button small" onClick={() => cancelBooking(booking)} disabled={loading}>
                          Hủy
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
          <h2>Trạng thái sân tại chi nhánh</h2>
          <span>{courts.length}</span>
        </div>
        <div className="staff-court-grid">
          {courts.length === 0 && <p className="empty-text">Chưa có sân trong phạm vi được phân công.</p>}
          {courts.map((court) => (
            <div className={`staff-court-card ${court.status}`} key={court.id}>
              <div>
                <small>{court.branchName}</small>
                <strong>{court.code} - {court.name}</strong>
                <span>{court.status === 'maintenance' ? 'Đang bảo trì' : court.status === 'available' ? 'Đang hoạt động' : 'Tạm ngưng'}</span>
              </div>
              {court.status === 'maintenance' ? (
                <button type="button" className="primary-button small" onClick={() => onCourtStatus(court, 'available')} disabled={loading}>
                  Mở lại sân
                </button>
              ) : (
                <button type="button" className="secondary-button small" onClick={() => onCourtStatus(court, 'maintenance')} disabled={loading || court.status === 'inactive'}>
                  Bảo trì
                </button>
              )}
            </div>
          ))}
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

function CourtDetailPage({ court, token, onBack, onBook }) {
  const [courtDetail, setCourtDetail] = useState(court)
  const [availability, setAvailability] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailMessage, setDetailMessage] = useState('')
  const [selectedDate, setSelectedDate] = useState(getTodayString)
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

        setCourtDetail(detailData.data?.court || detailData.court)
        setAvailability(availabilityData.data?.availability || availabilityData.availability)
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
          {detailLoading && <p className="message">Đang tải chi tiết sân...</p>}

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
              <span>{activeCourt.code} - {activeCourt.name} <small>({activeCourt.surfaceLabel || activeCourt.surfaceType})</small></span>
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
            <div className="slot-title-row">
              <h2>Lịch trống theo ngày</h2>
              <label>
                Ngày xem
                <input type="date" min={getTodayString()} value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
              </label>
            </div>
            <div className="slot-board">
              <div className="slot-group">
                <div className="slot-heading">
                  <strong>{activeCourt.code} - {activeCourt.name}</strong>
                  <span>{selectedDate} · {formatMoney(activeCourt.basePricePerHour)}/h</span>
                </div>
                <div className="time-grid">
                  {!detailLoading && slots.length === 0 && (
                    <p className="empty-text">Không còn slot trống để đặt trong ngày này.</p>
                  )}
                  {slots.map((slot) => (
                    <button
                      type="button"
                      className={slot.status === 'available' ? '' : slot.status}
                      key={`${slot.startTime}-${slot.endTime}`}
                      disabled={slot.status !== 'available'}
                      title={`${slot.startTime}-${slot.endTime} · ${slotStatusLabels[slot.status] || slot.status}`}
                    >
                      <span>{slot.startTime}</span>
                      <small>{slotStatusLabels[slot.status] || slot.status}</small>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="slot-legend">
              <span><i className="available-dot" />Trống</span>
              <span><i className="held-dot" />Đang giữ</span>
              <span><i />Đã đặt</span>
              <span><i className="maintenance-dot" />Bảo trì</span>
            </div>
            <button type="button" className="primary-button wide" onClick={() => onBook(activeCourt)}>Đặt sân ngay</button>
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
          <BookingSummaryCard court={activeCourt} onBook={onBook} />
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

function BookingPage({ court, user, token, notice, onNotice, onBack, onChangeCourt, onViewMyBookings }) {
  const [courtDetail, setCourtDetail] = useState(court)
  const [availability, setAvailability] = useState(null)
  const [selectedDate, setSelectedDate] = useState(getTodayString)
  const [durationHours, setDurationHours] = useState(1)
  const [selectedTime, setSelectedTime] = useState('')
  const [loadingBookingData, setLoadingBookingData] = useState(false)
  const [bookingSubmitting, setBookingSubmitting] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [holdResult, setHoldResult] = useState(null)
  const [bookingResult, setBookingResult] = useState(null)
  const [contact, setContact] = useState({
    fullName: user.fullName || '',
    phone: user.phone || '',
    email: user.email || '',
    note: '',
  })
  const activeCourt = courtDetail || court
  const slots = availability?.slots || []
  const endTime = selectedTime ? addHoursToTime(selectedTime, durationHours) : ''
  const totalAmount = selectedTime ? calculateBookingTotal(slots, selectedTime, durationHours) : 0
  const paymentAmount = holdResult?.totalAmount || totalAmount
  const paymentContent = holdResult?.hold?.holdCode || ''
  const paymentQrUrl = holdResult ? buildQrUrl(paymentAmount, paymentContent) : ''
  const canConfirm = selectedTime && contact.fullName.trim() && contact.phone.trim() && totalAmount > 0
  const selectableSlotCount = slots.filter((slot) => slot.status === 'available' && hasAvailableDuration(slots, slot.startTime, durationHours)).length
  const submitHint = selectedTime
    ? 'Lịch sẽ được giữ tối đa 10 phút sau khi xác nhận.'
    : loadingBookingData
      ? 'Đang tải lịch trống của sân.'
      : selectableSlotCount > 0
        ? 'Chọn một giờ bắt đầu ở bên trái để tiếp tục đặt sân.'
        : 'Ngày này không còn khung giờ phù hợp, vui lòng chọn ngày khác.'
  const durationOptions = [1, 1.5, 2]

  useEffect(() => {
    let cancelled = false

    async function fetchBookingData() {
      setSelectedTime('')
      setHoldResult(null)
      setBookingResult(null)
      onNotice('')
      setLoadingBookingData(true)
      setBookingError('')

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
          throw new Error(detailData.message || 'Không thể tải thông tin sân.')
        }

        if (!availabilityResponse.ok) {
          throw new Error(availabilityData.message || 'Không thể tải lịch trống.')
        }

        if (!cancelled) {
          setCourtDetail(detailData.data?.court || detailData.court)
          setAvailability(availabilityData.data?.availability || availabilityData.availability)
        }
      } catch (error) {
        if (!cancelled) {
          setBookingError(error.message)
        }
      } finally {
        if (!cancelled) {
          setLoadingBookingData(false)
        }
      }
    }

    fetchBookingData()
    return () => {
      cancelled = true
    }
  }, [court.id, selectedDate, token, onNotice])

  useEffect(() => {
    if (!holdResult?.hold?.holdCode || bookingResult) {
      return undefined
    }

    let cancelled = false
    const checkPaymentStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/bookings/payment-status/${encodeURIComponent(holdResult.hold.holdCode)}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Không thể kiểm tra trạng thái thanh toán.')
        }

        const statusData = data.data || data
        if (!cancelled && statusData.status === 'paid' && statusData.booking) {
          setBookingResult({ booking: statusData.booking })
          onNotice('CK thành công. Booking đã được xác nhận.')
        }

        if (!cancelled && statusData.status === 'expired') {
          setHoldResult(null)
          onNotice(statusData.message || 'Phiên thanh toán đã hết hạn, vui lòng chọn lại.')
        }
      } catch {
        // Keep polling quietly; visible errors here would distract from the payment flow.
      }
    }

    checkPaymentStatus()
    const intervalId = window.setInterval(checkPaymentStatus, 5000)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [holdResult?.hold?.holdCode, bookingResult, token, onNotice])

  function updateContact(event) {
    setContact((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  async function confirmBooking(event) {
    event.preventDefault()

    if (!canConfirm) {
      if (!selectedTime) {
        onNotice(submitHint)
        return
      }

      if (!contact.fullName.trim() || !contact.phone.trim()) {
        onNotice('Vui lòng nhập đủ họ tên và số điện thoại.')
        return
      }

      onNotice('Khung giờ này chưa có giá hợp lệ, vui lòng chọn khung giờ khác.')
      return
    }

    if (bookingResult) {
      return
    }

    setBookingSubmitting(true)
    setBookingError('')
    onNotice('')

    try {
      const endpoint = holdResult ? `${API_URL}/bookings/from-hold` : `${API_URL}/bookings/hold`
      const body = holdResult
        ? { holdCode: holdResult.hold?.holdCode }
        : {
            courtId: activeCourt.id,
            date: selectedDate,
            startTime: selectedTime,
            durationHours,
          }
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Không thể xử lý đặt sân. Vui lòng thử lại.')
      }

      if (holdResult) {
        setBookingResult(data.data || data)
        onNotice(data.message || 'CK thành công. Booking đã được xác nhận.')
      } else {
        setHoldResult(data.data || data)
        onNotice(data.message || 'Đã giữ lịch tạm thời. Vui lòng quét QR và thanh toán trong 10 phút.')
      }
    } catch (error) {
      setBookingError(error.message)
    } finally {
      setBookingSubmitting(false)
    }
  }

  return (
    <section className="booking-page" aria-label="Đặt sân pickleball">
      <header className="booking-header">
        <button type="button" className="secondary-button small" onClick={onBack}>Quay lại chi tiết</button>
      </header>

      <form className="booking-layout" onSubmit={confirmBooking}>
        <div className="booking-main">
          {bookingError && <p className="message error">{bookingError}</p>}
          {notice && <p className="message">{notice}</p>}

          <article className="booking-step-card">
            <div className="booking-step-title">
              <span>1</span>
              <h2>Cơ sở đã chọn</h2>
            </div>
            <div className="booking-venue-card">
              <img src={activeCourt.type === 'outdoor' ? courtOutdoor : courtIndoor} alt={activeCourt.name} />
              <div>
                <strong>{activeCourt.venueName || 'Pickleball Ha Noi'}</strong>
                <span>{activeCourt.address || 'Ha Noi'}</span>
                <small>{activeCourt.hours || '05:00 - 22:00'} · Giữ lịch 10 phút khi xác nhận</small>
              </div>
            </div>
          </article>

          <article className="booking-step-card">
            <div className="booking-step-title">
              <span>2</span>
              <h2>Chọn sân và lịch</h2>
            </div>

            <div className="selected-booking-court">
              <div>
                <strong>{activeCourt.code} - {activeCourt.name}</strong>
                <span>{activeCourt.type === 'outdoor' ? 'Sân ngoài trời' : 'Sân trong nhà'} · {activeCourt.statusLabel || activeCourt.status}</span>
              </div>
              <button type="button" className="secondary-button small" onClick={onChangeCourt}>Đổi sân</button>
            </div>

            <div className="booking-grid-controls">
              <label>
                Ngày đặt sân
                <input type="date" min={getTodayString()} value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
              </label>
              <div className="booking-control-group">
                <strong>Thời lượng</strong>
                <div className="duration-options">
                  {durationOptions.map((item) => (
                    <button
                      type="button"
                      className={durationHours === item ? 'active' : ''}
                      key={item}
                      onClick={() => {
                        setDurationHours(item)
                        setSelectedTime('')
                        setHoldResult(null)
                        setBookingResult(null)
                      }}
                    >
                      {item}h
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="booking-control-group">
              <strong>Chọn giờ bắt đầu</strong>
              {loadingBookingData && <p className="muted-note">Đang tải lịch trống...</p>}
              <div className="booking-slot-grid">
                {!loadingBookingData && slots.length === 0 && (
                  <p className="empty-text">Không còn slot phù hợp trong ngày này.</p>
                )}
                {slots.map((slot) => {
                  const available = slot.status === 'available' && hasAvailableDuration(slots, slot.startTime, durationHours)
                  return (
                    <button
                      type="button"
                      className={`${selectedTime === slot.startTime ? 'active' : ''} ${available ? '' : 'disabled'}`}
                      key={`${slot.startTime}-${slot.endTime}`}
                      disabled={!available}
                      onClick={() => {
                        setSelectedTime(slot.startTime)
                        setHoldResult(null)
                        setBookingResult(null)
                      }}
                    >
                      <span>{slot.startTime}</span>
                      <small>{available ? formatMoney(calculateBookingTotal(slots, slot.startTime, durationHours)) : slotStatusLabels[slot.status] || 'Không đủ slot'}</small>
                    </button>
                  )
                })}
              </div>
            </div>
          </article>

          {holdResult && !bookingResult && (
            <article className="booking-step-card payment-qr-card">
              <div className="booking-step-title">
                <span>3</span>
                <h2>Thanh toán chuyển khoản</h2>
              </div>
              <div className="payment-qr-layout">
                <img src={paymentQrUrl} alt="QR chuyển khoản đặt sân" />
                <dl>
                  <div><dt>Sân</dt><dd>{activeCourt.code} - {activeCourt.name}</dd></div>
                  <div><dt>Ngày giờ</dt><dd>{formatDateDisplay(selectedDate)} · {selectedTime} - {endTime}</dd></div>
                  <div><dt>Ngân hàng</dt><dd>{PAYMENT_BANK.bankName}</dd></div>
                  <div><dt>Số tài khoản</dt><dd>{PAYMENT_BANK.accountNo}</dd></div>
                  <div><dt>Chủ tài khoản</dt><dd>{PAYMENT_BANK.accountName}</dd></div>
                  <div><dt>Số tiền</dt><dd>{formatFullMoney(paymentAmount)}</dd></div>
                  <div><dt>Nội dung</dt><dd>{paymentContent}</dd></div>
                </dl>
              </div>
              <p className="muted-note">Sau khi chuyển khoản thành công, bấm xác nhận thanh toán để hệ thống ghi nhận giao dịch và xác nhận booking.</p>
            </article>
          )}

          <article className="booking-step-card">
            <div className="booking-step-title">
              <span>{holdResult ? '4' : '3'}</span>
              <h2>Thông tin liên hệ</h2>
            </div>
            <div className="booking-contact-grid">
              <label>
                Họ tên *
                <input name="fullName" value={contact.fullName} onChange={updateContact} placeholder="Nguyễn Văn A" required />
              </label>
              <label>
                Số điện thoại *
                <input name="phone" value={contact.phone} onChange={updateContact} placeholder="0901234567" required />
              </label>
              <label>
                Email
                <input name="email" type="email" value={contact.email} onChange={updateContact} placeholder="email@gmail.com" />
              </label>
              <label className="booking-note-field">
                Ghi chú
                <textarea name="note" value={contact.note} onChange={updateContact} placeholder="Yêu cầu đặc biệt..." />
              </label>
            </div>
          </article>
        </div>

        <aside className="booking-summary-panel">
          <h2>Tóm tắt</h2>
          <dl>
            <div><dt>Cơ sở</dt><dd>{activeCourt.venueName || 'Pickleball Ha Noi'}</dd></div>
            <div><dt>Sân</dt><dd>{activeCourt.code} - {activeCourt.name}</dd></div>
            <div><dt>Ngày</dt><dd>{formatDateDisplay(selectedDate)}</dd></div>
            <div><dt>Giờ</dt><dd>{selectedTime ? `${selectedTime} - ${endTime}` : 'Chưa chọn'}</dd></div>
            <div><dt>Thời lượng</dt><dd>{durationHours} giờ</dd></div>
            {holdResult?.hold && <div><dt>Mã giữ lịch</dt><dd>{holdResult.hold.holdCode}</dd></div>}
            {bookingResult?.booking && <div><dt>Mã booking</dt><dd>{bookingResult.booking.bookingCode}</dd></div>}
          </dl>
          <div className="booking-total-row">
            <strong>Tổng thanh toán</strong>
            <span>{holdResult?.totalAmount ? formatFullMoney(holdResult.totalAmount) : totalAmount ? formatFullMoney(totalAmount) : '-'}</span>
          </div>
          <button type="submit" className="primary-button wide" disabled={bookingSubmitting || Boolean(bookingResult)}>
            {bookingSubmitting
              ? holdResult ? 'Đang xác nhận thanh toán...' : 'Đang giữ lịch...'
              : bookingResult ? 'Đã thanh toán'
                : holdResult ? 'Tôi đã chuyển khoản'
                  : 'Giữ lịch và hiện QR'}
          </button>
          {bookingResult && (
            <button type="button" className="secondary-button wide" onClick={onViewMyBookings}>
              Xem lịch đặt của tôi
            </button>
          )}
          <p>{bookingResult ? 'Thanh toán thành công, booking đã được xác nhận.' : holdResult ? 'Lịch đang được giữ trong 10 phút để bạn hoàn tất chuyển khoản.' : submitHint}</p>
        </aside>
      </form>
    </section>
  )
}

function BookingSummaryCard({ court, onBook }) {
  return (
    <article className="detail-card booking-summary">
      <h2>{court.code}</h2>
      <dl>
        <div><dt>Trạng thái</dt><dd>{court.statusLabel || court.status}</dd></div>
        <div><dt>Ngày đặt</dt><dd>Chọn ngày</dd></div>
        <div><dt>Giờ đặt</dt><dd>Chọn giờ</dd></div>
        <div><dt>Thời lượng</dt><dd>1 giờ</dd></div>
      </dl>
      <button type="button" className="primary-button wide" onClick={() => onBook(court)}>Đặt sân ngay</button>
      <button type="button" className="secondary-button wide">Gọi: {court.hotline}</button>
      <p>Đặt cọc an toàn - Hủy trước 2h miễn phí</p>
    </article>
  )
}

function CourtCard({ court, onDetail }) {
  const isOutdoor = court.type === 'outdoor'
  const image = isOutdoor ? courtOutdoor : courtIndoor
  const typeLabel = isOutdoor ? 'Sân ngoài trời' : 'Sân trong nhà'

  return (
    <article className="court-card">
      <img src={image} alt={`${court.name} - ${typeLabel}`} />
      <div className="court-info">
        <div>
          <h2><span className="court-dot" />{court.name}</h2>
          <p><span className="pin-dot" />{court.code} · {court.district}</p>
          <span>{typeLabel}</span>
        </div>
        <strong>{court.statusLabel || court.status}</strong>
      </div>
      <div className="court-actions">
        <button type="button" className="secondary-button small" onClick={() => onDetail(court)}>Chi tiết</button>
      </div>
    </article>
  )
}

function AccountGroup({ title, users, empty, loading = false, headerAction, actions }) {
  const showBan = actions && actions.allowBan !== false
  const showDelete = actions && actions.allowDelete !== false
  const showEdit = actions && actions.allowEdit === true

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
                {showEdit && (
                  <button type="button" className="secondary-button small" onClick={() => actions.onManage(user, 'edit')} disabled={actions.loading}>
                    Sửa
                  </button>
                )}
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
