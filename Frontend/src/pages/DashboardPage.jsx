import { useState, useEffect } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { familyAPI } from '../services/api'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import './DashboardPage.css'

export default function DashboardPage() {
  const toast = useToast()
  const { user } = useAuth()
  const { families, setFamilies } = useOutletContext()
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [createForm, setCreateForm] = useState({ familyName: '', familyCode: '' })
  const [joinCode, setJoinCode] = useState('')
  const [loading, setLoading] = useState(false)

  const loadFamilies = () => {
    familyAPI.viewAll().then(r => setFamilies(r.data)).catch(() => {})
  }

  useEffect(() => { loadFamilies() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await familyAPI.create(createForm)
      toast('Family created!', 'success')
      setShowCreate(false)
      setCreateForm({ familyName: '', familyCode: '' })
      loadFamilies()
    } catch (err) {
      toast(err.response?.data || 'Failed to create family', 'error')
    } finally { setLoading(false) }
  }

  const handleJoin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await familyAPI.join({ familyCode: joinCode })
      toast('Joined family!', 'success')
      setShowJoin(false)
      setJoinCode('')
      loadFamilies()
    } catch (err) {
      toast(err.response?.data || 'Failed to join family', 'error')
    } finally { setLoading(false) }
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="dashboard fade-up">
      <div className="dash-header">
        <div>
          <h1 className="dash-title">{greeting}<span className="accent-dot">.</span></h1>
          <p className="dash-sub">Here's an overview of your families</p>
        </div>
        <div className="dash-actions">
          <button className="btn btn-ghost" onClick={() => { setShowJoin(true); setShowCreate(false) }}>
            + Join Family
          </button>
          <button className="btn btn-primary" onClick={() => { setShowCreate(true); setShowJoin(false) }}>
            + Create Family
          </button>
        </div>
      </div>

      {showCreate && (
        <div className="card form-card fade-up">
          <h3 className="form-card-title">Create a New Family</h3>
          <form onSubmit={handleCreate}>
            <div className="form-row">
              <div className="field">
                <label className="label">Family Name</label>
                <input className="input" placeholder="The Smiths"
                  value={createForm.familyName} onChange={e => setCreateForm({ ...createForm, familyName: e.target.value })} required />
              </div>
              <div className="field">
                <label className="label">Family Code</label>
                <input className="input" placeholder="secret-code-123"
                  value={createForm.familyCode} onChange={e => setCreateForm({ ...createForm, familyCode: e.target.value })} required />
              </div>
            </div>
            <div className="form-btns">
              <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <span className="spinner" /> : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      {showJoin && (
        <div className="card form-card fade-up">
          <h3 className="form-card-title">Join a Family</h3>
          <form onSubmit={handleJoin}>
            <div className="field">
              <label className="label">Family Code</label>
              <input className="input" placeholder="Enter the code shared by your family"
                value={joinCode} onChange={e => setJoinCode(e.target.value)} required />
            </div>
            <div className="form-btns">
              <button type="button" className="btn btn-ghost" onClick={() => setShowJoin(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <span className="spinner" /> : 'Join'}
              </button>
            </div>
          </form>
        </div>
      )}

      {families.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">◈</div>
          <h3>No families yet</h3>
          <p>Create a family or join one using a code</p>
        </div>
      ) : (
        <div className="families-grid">
          {families.map((f, i) => (
            <div key={f.id} className="family-card card fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="family-card-top">
                <div className="family-avatar">
                  {f.familyName[0].toUpperCase()}
                </div>
                <div className="family-code-badge">
                  <span className="code-label">Code:</span> {f.familyCode}
                </div>
              </div>
              <h3 className="family-name">{f.familyName}</h3>
              <p className="family-creator">Created by {f.createdBy}</p>
              <div className="family-card-actions">
                <Link to={`/family/${f.id}`} className="btn btn-ghost family-btn">
                  View Details
                </Link>
                <Link to={`/map/${f.id}`} className="btn btn-primary family-btn">
                  Live Map
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
