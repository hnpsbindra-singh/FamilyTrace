import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { familyAPI, messageAPI } from '../services/api'
import { useToast } from '../context/ToastContext'
import './FamilyPage.css'

function normalizeMembers(family) {
  const names = family?.memberName || family?.memberNames || []
  const ids = family?.memberIds || family?.memberId || []
  const members = family?.members

  if (Array.isArray(members) && members.length > 0) {
    return members.map((member, index) => ({
      id: member.id || member.userId || ids[index] || null,
      name: member.name || member.userName || member.username || names[index] || 'Member',
    }))
  }

  return names.map((name, index) => ({
    id: ids[index] || null,
    name,
  }))
}

function MemberRow({ member, index, onMessage }) {
  const canMessage = Boolean(member.id)
  return (
    <div className="member-row fade-up" style={{ animationDelay: `${index * 0.05}s` }}>
      <div className="member-avatar">{member.name[0].toUpperCase()}</div>
      <div className="member-info">
        <div className="member-name">{member.name}</div>
        {!canMessage && (
          <div className="member-note">Email needs this member's user id from the family API.</div>
        )}
      </div>
      <button
        className="btn btn-ghost member-msg-btn"
        disabled={!canMessage}
        title={canMessage ? 'Send email' : 'Backend response does not include this member id'}
        onClick={() => onMessage(member)}>
        Message
      </button>
    </div>
  )
}

export default function FamilyPage() {
  const { id } = useParams()
  const toast = useToast()
  const navigate = useNavigate()
  const [family, setFamily] = useState(null)
  const [loading, setLoading] = useState(true)
  // showMsg: { id, name }
  const [showMsg, setShowMsg] = useState(null)
  // subject = email subject line, Description = email body
  // Recipient is resolved server-side from SecurityContextHolder + userId
  const [msgForm, setMsgForm] = useState({ subject: '', Description: '' })
  const [msgLoading, setMsgLoading] = useState(false)
  const [leaveLoading, setLeaveLoading] = useState(false)

  useEffect(() => {
    familyAPI.details(id)
      .then(r => setFamily(r.data))
      .catch(() => toast('Failed to load family', 'error'))
      .finally(() => setLoading(false))
  }, [id])

  const handleLeave = async () => {
    if (!window.confirm('Are you sure you want to leave this family?')) return
    setLeaveLoading(true)
    try {
      await familyAPI.leave(id)
      toast('Left the family', 'success')
      navigate('/')
    } catch (err) {
      toast(err.response?.data || 'Failed to leave', 'error')
    } finally { setLeaveLoading(false) }
  }

  const handleMessage = async (e) => {
    e.preventDefault()
    if (!showMsg?.id) {
      toast('Cannot send email because this member id is missing from the family details response.', 'error')
      return
    }
    setMsgLoading(true)
    try {
      await messageAPI.send(id, showMsg.id, msgForm)
      toast('Message sent!', 'success')
      setShowMsg(null)
      setMsgForm({ subject: '', Description: '' })
    } catch (err) {
      toast(err.response?.data || 'Failed to send message', 'error')
    } finally { setMsgLoading(false) }
  }

  if (loading) return (
    <div className="page-loading">
      <span className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  )

  if (!family) return <div className="page-empty">Family not found.</div>

  const members = normalizeMembers(family)

  return (
    <div className="family-page fade-up">
      <div className="family-header">
        <div className="family-header-info">
          <div className="family-header-avatar">{family.familyName[0].toUpperCase()}</div>
          <div>
            <h1 className="family-page-title">{family.familyName}</h1>
            <p className="family-page-sub">Created by {family.createdBy}</p>
          </div>
        </div>
        <div className="family-header-actions">
          <Link to={`/map/${id}`} className="btn btn-primary">Live Map</Link>
          <button className="btn btn-danger" onClick={handleLeave} disabled={leaveLoading}>
            {leaveLoading ? <span className="spinner" /> : 'Leave Family'}
          </button>
        </div>
      </div>

      <div className="family-code-row card">
        <div>
          <div className="label">Family Code</div>
          <div className="family-code-value">{family.familyCode}</div>
        </div>
        <div className="family-code-tip">Share this code so others can join</div>
      </div>

      <div className="card members-card">
        <h2 className="section-title">
          Members <span className="member-count">{members.length}</span>
        </h2>
        <div className="members-list">
          {members.map((member, i) => (
            <MemberRow
              key={member.id || `${member.name}-${i}`}
              member={member}
              index={i}
              onMessage={setShowMsg}
            />
          ))}
        </div>
      </div>

      {showMsg && (
        <div className="modal-overlay" onClick={() => setShowMsg(null)}>
          <div className="modal-box card" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">
              Message to <span style={{ color: 'var(--accent)' }}>{showMsg.name}</span>
            </h3>
            <p className="modal-hint">
              The email will be sent to <strong>{showMsg.name}</strong>'s registered email address.
            </p>
            <form onSubmit={handleMessage}>
              <div className="field">
                <label className="label">Email Subject</label>
                <input className="input" placeholder="e.g. Dinner plans tonight"
                  value={msgForm.subject}
                  onChange={e => setMsgForm({ ...msgForm, subject: e.target.value })}
                  required />
              </div>
              <div className="field">
                <label className="label">Message</label>
                <textarea className="input" rows={4} placeholder="Write your message…"
                  value={msgForm.Description}
                  onChange={e => setMsgForm({ ...msgForm, Description: e.target.value })}
                  required style={{ resize: 'vertical' }} />
              </div>
              <div className="form-btns">
                <button type="button" className="btn btn-ghost"
                  onClick={() => setShowMsg(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={msgLoading}>
                  {msgLoading ? <span className="spinner" /> : 'Send Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
