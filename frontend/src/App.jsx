import { useState } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function App() {
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')
  const [session, setSession] = useState(() => {
    const token = localStorage.getItem('swp_token')
    const user = localStorage.getItem('swp_user')
    return token && user ? { token, user: JSON.parse(user) } : null
  })
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  })

  const isRegister = mode === 'register'

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  function changeMode(nextMode) {
    setMode(nextMode)
    setMessage('')
    setMessageType('')
  }

  async function submitAuth(event) {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setMessageType('')

    const endpoint = isRegister ? '/auth/register' : '/auth/login'
    const payload = isRegister
      ? form
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

      localStorage.setItem('swp_token', data.token)
      localStorage.setItem('swp_user', JSON.stringify(data.user))
      setSession(data)
      setMessage(isRegister ? 'Đăng ký thành công.' : 'Đăng nhập thành công.')
      setMessageType('success')
    } catch (error) {
      setMessage(error.message)
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    localStorage.removeItem('swp_token')
    localStorage.removeItem('swp_user')
    setSession(null)
    setMessage('')
    setMessageType('')
  }

  return (
    <main className="auth-page">
      <section className="brand-panel" aria-label="Pickleball club">
        <div className="brand-copy">
          <span className="eyebrow">Pickleball Club</span>
          <h1>Đặt sân, vào trận, chơi hết mình.</h1>
          <p>Đăng nhập để quản lý lịch đặt sân hoặc tạo tài khoản mới trong vài giây.</p>
        </div>

        <div className="court-scene" aria-hidden="true">
          <div className="court">
            <span className="net"></span>
            <span className="kitchen left"></span>
            <span className="kitchen right"></span>
          </div>
          <div className="paddle paddle-one"></div>
          <div className="paddle paddle-two"></div>
          <div className="ball"></div>
        </div>
      </section>

      <section className="auth-panel" aria-label="Form xác thực">
        {session ? (
          <div className="profile-card">
            <span className="success-badge">{message || 'Đăng nhập thành công.'}</span>
            <h2>{session.user.fullName}</h2>
            <p>{session.user.email}</p>

            <dl className="profile-list">
              <div>
                <dt>Vai trò</dt>
                <dd>{session.user.role}</dd>
              </div>
              <div>
                <dt>Trạng thái</dt>
                <dd>{session.user.status}</dd>
              </div>
              <div>
                <dt>Số điện thoại</dt>
                <dd>{session.user.phone}</dd>
              </div>
            </dl>

            <button type="button" className="primary-button" onClick={logout}>
              Đăng xuất
            </button>
          </div>
        ) : (
          <>
            <div className="form-heading">
              <span className="form-kicker">Pickleball Booking</span>
              <h2>{isRegister ? 'Tạo tài khoản' : 'Đăng nhập'}</h2>
              <p>
                {isRegister
                  ? 'Điền thông tin để tạo tài khoản Customer.'
                  : 'Nhập email và mật khẩu để vào hệ thống.'}
              </p>
            </div>

            <div className="switcher" role="tablist" aria-label="Chọn chế độ">
              <button
                type="button"
                className={mode === 'login' ? 'active' : ''}
                onClick={() => changeMode('login')}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                className={mode === 'register' ? 'active' : ''}
                onClick={() => changeMode('register')}
              >
                Đăng ký
              </button>
            </div>

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
                  placeholder="customer@pickleball.com"
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
          </>
        )}
      </section>
    </main>
  )
}

export default App
