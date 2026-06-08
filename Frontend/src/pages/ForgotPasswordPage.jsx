import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import { useToast } from '../context/ToastContext'
import './AuthPage.css'

export default function ForgotPasswordPage() {
  const toast = useToast()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [username, setUsername] = useState('')
  const [form, setForm] = useState({ otp: '', newPassword: '' })
  const [loading, setLoading] = useState(false)

  const sendOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authAPI.sendResetOtp(username)
      toast('Reset OTP sent!', 'success')
      setStep(1)
    } catch (err) {
      toast(err.response?.data || 'Failed to send OTP', 'error')
    } finally { setLoading(false) }
  }

  const resetPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authAPI.resetPassword({ username, ...form })
      toast('Password reset! Please log in.', 'success')
      navigate('/login')
    } catch (err) {
      toast(err.response?.data || 'Reset failed', 'error')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg-orb orb1" />
        <div className="auth-bg-orb orb2" />
      </div>
      <div className="auth-card fade-up">
        <div className="auth-brand">
          <span className="auth-brand-icon">◈</span>
          <span className="auth-brand-name">FamilyTrace</span>
        </div>

        {step === 0 ? (
          <>
            <h1 className="auth-title">Reset password</h1>
            <p className="auth-sub">We'll send an OTP to your email</p>
            <form onSubmit={sendOtp}>
              <div className="field">
                <label className="label">Email</label>
                <input className="input" type="email" placeholder="you@example.com"
                  value={username} onChange={e => setUsername(e.target.value)} required />
              </div>
              <button className="btn btn-primary auth-btn" type="submit" disabled={loading}>
                {loading ? <span className="spinner" /> : 'Send OTP'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="auth-title">New password</h1>
            <p className="auth-sub">Enter the OTP and your new password</p>
            <form onSubmit={resetPassword}>
              <div className="field">
                <label className="label">OTP Code</label>
                <input className="input otp-input" placeholder="000000" maxLength={6}
                  value={form.otp} onChange={e => setForm({ ...form, otp: e.target.value })} required />
              </div>
              <div className="field">
                <label className="label">New Password</label>
                <input className="input" type="password" placeholder="••••••••"
                  value={form.newPassword} onChange={e => setForm({ ...form, newPassword: e.target.value })} required />
              </div>
              <button className="btn btn-primary auth-btn" type="submit" disabled={loading}>
                {loading ? <span className="spinner" /> : 'Reset Password'}
              </button>
            </form>
          </>
        )}

        <p className="auth-footer-text">
          <Link to="/login" className="auth-link">← Back to login</Link>
        </p>
      </div>
    </div>
  )
}
