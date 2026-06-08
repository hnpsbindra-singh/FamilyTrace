import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import './AuthPage.css'

export default function LoginPage() {
  const { login } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authAPI.login(form)
      login(res.data)
      toast('Welcome back!', 'success')
      navigate('/')
    } catch (err) {
      toast(err.response?.data?.message || err.response?.data || 'Login failed', 'error')
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
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Sign in to track your family in real time</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label className="label">Email / Username</label>
            <input className="input" type="text" placeholder="you@example.com"
              value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
          </div>
          <div className="field">
            <label className="label">Password</label>
            <input className="input" type="password" placeholder="••••••••"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>

          <div className="auth-links">
            <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
          </div>

          <button className="btn btn-primary auth-btn" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer-text">
          Don't have an account? <Link to="/register" className="auth-link">Register</Link>
        </p>
      </div>
    </div>
  )
}
