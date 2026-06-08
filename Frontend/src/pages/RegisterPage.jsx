import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import { useToast } from '../context/ToastContext'
import './AuthPage.css'

const STEPS = ['register', 'verify']

export default function RegisterPage() {
  const toast = useToast()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({ name: '', username: '', password: '', role: 'PARENT' })
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authAPI.register(form)
      await authAPI.sendOtp(form.username)
      toast('OTP sent to your email!', 'success')
      setStep(1)
    } catch (err) {
      toast(err.response?.data?.message || err.response?.data || 'Registration failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await authAPI.verifyOtp(form.username, otp)
      toast('Account verified! Please log in.', 'success')
      navigate('/login')
    } catch (err) {
      toast(err.response?.data?.message || err.response?.data || 'OTP verification failed', 'error')
    } finally {
      setLoading(false)
    }
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
            <h1 className="auth-title">Create account</h1>
            <p className="auth-sub">Join and start tracking your family</p>
            <form onSubmit={handleRegister}>
              <div className="field">
                <label className="label">Full Name</label>
                <input className="input" placeholder="John Doe"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="field">
                <label className="label">Email</label>
                <input className="input" type="email" placeholder="you@example.com"
                  value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
              </div>
              <div className="field">
                <label className="label">Password</label>
                <input className="input" type="password" placeholder="••••••••"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
              </div>
              <div className="field">
                <label className="label">Role</label>
                <select className="input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="PARENT">Parent</option>
                  <option value="CHILD">Child</option>
                </select>
              </div>
              <button className="btn btn-primary auth-btn" type="submit" disabled={loading}>
                {loading ? <span className="spinner" /> : 'Create Account'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="auth-title">Verify email</h1>
            <p className="auth-sub">Enter the 6-digit OTP sent to <strong>{form.username}</strong></p>
            <form onSubmit={handleVerify}>
              <div className="field">
                <label className="label">OTP Code</label>
                <input className="input otp-input" placeholder="000000" maxLength={6}
                  value={otp} onChange={e => setOtp(e.target.value)} required />
              </div>
              <button className="btn btn-primary auth-btn" type="submit" disabled={loading}>
                {loading ? <span className="spinner" /> : 'Verify'}
              </button>
            </form>
            <button className="btn btn-ghost auth-btn" style={{ marginTop: 8 }}
              onClick={() => authAPI.sendOtp(form.username).then(() => toast('OTP resent!'))}>
              Resend OTP
            </button>
          </>
        )}

        <p className="auth-footer-text">
          Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
