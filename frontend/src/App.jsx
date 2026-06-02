import { useState } from 'react'
import heroImage from './assets/hero.png'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

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

function App() {
  const [session, setSession] = useState(readStoredSession)
  const [page, setPage] = useState(() => (readStoredSession() ? 'profile' : 'home'))
  const [mode, setMode] = useState('login')
  const [editingProfile, setEditingProfile] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })

  const isRegister = mode === 'register'
  const isForgotPassword = mode === 'forgot-password'

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  function showAuth(nextMode) {
    setMode(nextMode)
    setPage('auth')
    setMessage('')
    setMessageType('')
  }

  function showHome() {
    setPage('home')
    setMessage('')
    setMessageType('')
  }

  function showProfile() {
    setPage('profile')
    setEditingProfile(false)
    setMessage('')
    setMessageType('')
  }

  function startEditProfile() {
    setEditingProfile(true)
    setMessage('')
    setMessageType('')
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
  }

  async function submitAuth(event) {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setMessageType('')

    // Đăng ký chỉ tạo Customer; đăng nhập trả về role thực tế từ backend.
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
      setPage('profile')
      setMessage(isRegister ? 'Đăng ký thành công.' : 'Đăng nhập thành công.')
      setMessageType('success')
      setForm({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
      })
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
    setMessage('')
    setMessageType('')

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
      setForm((current) => ({
        ...current,
        password: '',
        confirmPassword: '',
      }))
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
    setMessage('')
    setMessageType('')

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

      const nextSession = { token: session.token, user: data.user }
      persistSession(nextSession)
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

  async function deleteProfile() {
    const accepted = window.confirm('Bạn có chắc muốn xóa tài khoản này?')
    if (!accepted) {
      return
    }

    setLoading(true)
    setMessage('')
    setMessageType('')

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.token}` },
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Không thể xóa tài khoản.')
      }

      logout('Tài khoản đã được xóa.')
    } catch (error) {
      setMessage(error.message)
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  function logout(nextMessage = '') {
    localStorage.removeItem('swp_token')
    localStorage.removeItem('swp_user')
    setSession(null)
    setEditingProfile(false)
    setPage('home')
    setMessage(nextMessage)
    setMessageType(nextMessage ? 'success' : '')
  }

  return (
    <main className="site-shell">
      <nav className="global-nav" aria-label="Điều hướng chính">
        <button type="button" className="brand-link" onClick={showHome}>
          <span className="brand-mark">PB</span>
          <span>Pickleball Booking</span>
        </button>

        <div className="nav-actions">
          {session ? (
            <>
              <button type="button" onClick={showHome}>
                Trang chủ
              </button>
              <button type="button" onClick={showProfile}>
                Hồ sơ
              </button>
              <button type="button" className="nav-primary" onClick={() => logout()}>
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => showAuth('login')}>
                Đăng nhập
              </button>
              <button type="button" className="nav-primary" onClick={() => showAuth('register')}>
                Đăng ký
              </button>
            </>
          )}
        </div>
      </nav>

      {page === 'home' && (
        <>
          <section className="home-hero" aria-label="Trang chủ giới thiệu">
            <div className="home-copy">
              <span className="eyebrow">Pickleball Club Hà Nội</span>
              <h1>Đặt sân nhanh. Quản lý gọn. Chơi đúng giờ.</h1>
              <div className="hero-actions">
                <button type="button" className="primary-button compact" onClick={() => showAuth('register')}>
                  Đặt sân ngay
                </button>
                <button type="button" className="secondary-button" onClick={() => showAuth('login')}>
                  Đăng nhập
                </button>
              </div>
            </div>
            <img className="hero-image" src={heroImage} alt="Sân pickleball" />
          </section>

          <section className="intro-section" aria-label="Thông tin cơ sở">
            <article>
              <span>05:00 - 22:00</span>
              <h2>Khung giờ linh hoạt</h2>
              <p>Người chơi có thể xem lịch trống theo ngày, chọn sân và đặt khung giờ phù hợp.</p>
            </article>
            <article>
              <span>Nhiều sân</span>
              <h2>Một cơ sở tại Hà Nội</h2>
              <p>Hệ thống tập trung cho một cơ sở pickleball, dễ theo dõi lịch và vận hành hằng ngày.</p>
            </article>
            <article>
              <span>Thanh toán</span>
              <h2>Xác nhận rõ ràng</h2>
              <p>Booking được ghi nhận theo trạng thái để hạn chế trùng lịch và hỗ trợ xử lý tại quầy.</p>
            </article>
          </section>

          {message && <p className={`floating-message ${messageType}`}>{message}</p>}
        </>
      )}

      {page === 'auth' && (
        <section className="auth-section" aria-label="Đăng nhập và đăng ký">
          <article className="auth-card">
            <div className="form-heading">
              <h2>
                {isForgotPassword
                  ? 'Quên mật khẩu'
                  : isRegister
                    ? 'Tạo tài khoản Customer'
                    : 'Đăng nhập'}
              </h2>
            </div>

            {!isForgotPassword && (
              <div className="switcher" role="tablist" aria-label="Chọn chế độ">
                <button
                  type="button"
                  className={mode === 'login' ? 'active' : ''}
                  onClick={() => showAuth('login')}
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  className={mode === 'register' ? 'active' : ''}
                  onClick={() => showAuth('register')}
                >
                  Đăng ký
                </button>
              </div>
            )}

            {isForgotPassword ? (
              <form className="auth-form" onSubmit={submitForgotPassword}>
                <label>
                  Email
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={updateField}
                    placeholder="pickleball.customer@gmail.com"
                    required
                  />
                </label>

                <label>
                  Mật khẩu mới
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={updateField}
                    placeholder="Ít nhất 6 ký tự"
                    minLength="6"
                    required
                  />
                </label>

                <label>
                  Nhập lại mật khẩu mới
                  <input
                    name="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={updateField}
                    placeholder="Nhập lại mật khẩu"
                    minLength="6"
                    required
                  />
                </label>

                {message && <p className={`message ${messageType}`}>{message}</p>}

                <button className="primary-button" type="submit" disabled={loading}>
                  {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                </button>
              </form>
            ) : (
              <form className="auth-form" onSubmit={submitAuth}>
                {isRegister && (
                  <>
                    <label>
                      Họ tên
                      <input
                        name="fullName"
                        value={form.fullName}
                        onChange={updateField}
                        placeholder="Nguyễn Văn A"
                        required
                      />
                    </label>
                    <label>
                      Số điện thoại
                      <input
                        name="phone"
                        value={form.phone}
                        onChange={updateField}
                        placeholder="0901000000"
                        required
                      />
                    </label>
                  </>
                )}

                <label>
                  Email
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={updateField}
                    placeholder="pickleball.customer@gmail.com"
                    required
                  />
                </label>

                <label>
                  Mật khẩu
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={updateField}
                    placeholder="Ít nhất 6 ký tự"
                    minLength="6"
                    required
                  />
                </label>

                {message && <p className={`message ${messageType}`}>{message}</p>}

                <button className="primary-button" type="submit" disabled={loading}>
                  {loading ? 'Đang xử lý...' : isRegister ? 'Đăng ký' : 'Đăng nhập'}
                </button>
              </form>
            )}

            <div className="form-actions">
              {!isForgotPassword && (
                <button type="button" onClick={() => showAuth('forgot-password')}>
                  Quên mật khẩu?
                </button>
              )}
              {isForgotPassword && (
                <button type="button" onClick={() => showAuth('login')}>
                  Quay lại đăng nhập
                </button>
              )}
            </div>
          </article>
        </section>
      )}

      {page === 'profile' && session && (
        <section className="profile-section" aria-label="Hồ sơ cá nhân">
          <article className="profile-card">
            <div className="profile-heading">
              <span className="eyebrow">Hồ sơ</span>
              <h1>{session.user.fullName}</h1>
            </div>

            {editingProfile ? (
              <form className="auth-form" onSubmit={submitProfile}>
                <label>
                  Họ tên
                  <input
                    name="fullName"
                    value={form.fullName}
                    onChange={updateField}
                    placeholder="Nguyễn Văn A"
                    required
                  />
                </label>
                <label>
                  Email
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={updateField}
                    placeholder="pickleball.customer@gmail.com"
                    required
                  />
                </label>
                <label>
                  Số điện thoại
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={updateField}
                    placeholder="0901000000"
                    required
                  />
                </label>

                {message && <p className={`message ${messageType}`}>{message}</p>}

                <div className="profile-actions">
                  <button className="primary-button compact" type="submit" disabled={loading}>
                    {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                  <button type="button" className="secondary-button" onClick={() => setEditingProfile(false)}>
                    Hủy
                  </button>
                </div>
              </form>
            ) : (
              <>
                <dl className="identity-list">
                  <div>
                    <dt>Họ tên</dt>
                    <dd>{session.user.fullName}</dd>
                  </div>
                  <div>
                    <dt>Email</dt>
                    <dd>{session.user.email}</dd>
                  </div>
                  <div>
                    <dt>Số điện thoại</dt>
                    <dd>{session.user.phone || 'Chưa cập nhật'}</dd>
                  </div>
                  <div>
                    <dt>Vai trò</dt>
                    <dd>{session.user.role}</dd>
                  </div>
                  <div>
                    <dt>Trạng thái</dt>
                    <dd>{session.user.status}</dd>
                  </div>
                </dl>

                {message && <p className={`message ${messageType}`}>{message}</p>}

                <div className="profile-actions">
                  <button type="button" className="primary-button compact" onClick={startEditProfile}>
                    Sửa hồ sơ
                  </button>
                  <button type="button" className="danger-button" onClick={deleteProfile} disabled={loading}>
                    Xóa tài khoản
                  </button>
                </div>
              </>
            )}
          </article>
        </section>
      )}
    </main>
  )
}

export default App
