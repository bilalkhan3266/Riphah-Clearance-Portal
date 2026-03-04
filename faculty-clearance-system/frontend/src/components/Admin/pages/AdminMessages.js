import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../../contexts/AuthContext';
import {
  MdSend, MdReply, MdDelete, MdSearch, MdInbox, MdOutbox,
  MdCheckCircle, MdError, MdClose, MdMail
} from 'react-icons/md';
import {
  getAdminInbox, getAdminSentMessages, sendMessageToDepartment,
  sendBroadcastMessage, replyToMessage, deleteMessage
} from '../services/messageService';
import { getAllDepartments } from '../services/adminService';

export default function AdminMessages() {
  const { token } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('inbox');
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);

  const [composeData, setComposeData] = useState({
    recipient: 'broadcast', department: '', subject: '', content: ''
  });
  const [replyData, setReplyData] = useState({ content: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => { if (token) { fetchMessages(); fetchDepartments(); } }, [token, activeTab]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const r = activeTab === 'inbox' ? await getAdminInbox(token) : await getAdminSentMessages(token);
      if (r.success && Array.isArray(r.data)) setMessages(r.data);
    } catch (err) { showMsg(err.message || 'Failed to load messages', 'error'); }
    finally { setLoading(false); }
  };

  const fetchDepartments = async () => {
    try {
      const r = await getAllDepartments(token);
      if (r.success && Array.isArray(r.data)) setDepartments(r.data);
    } catch (err) { console.error('Failed to load departments:', err); }
  };

  const showMsg = (msg, type = 'success') => {
    setStatusMessage(msg); setMessageType(type);
    setTimeout(() => setStatusMessage(''), 5000);
  };

  const validateComposeForm = () => {
    const e = {};
    if (!composeData.subject.trim()) e.subject = 'Subject is required';
    if (!composeData.content.trim()) e.content = 'Message content is required';
    if (composeData.recipient === 'specific' && !composeData.department) e.department = 'Select a department';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleComposeChange = (e) => {
    const { name, value } = e.target;
    setComposeData(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!validateComposeForm()) return;
    try {
      setLoading(true);
      const r = composeData.recipient === 'broadcast'
        ? await sendBroadcastMessage(token, { subject: composeData.subject, content: composeData.content })
        : await sendMessageToDepartment(token, { department: composeData.department, subject: composeData.subject, content: composeData.content });
      if (r.success) {
        showMsg('Message sent successfully');
        setComposeData({ recipient: 'broadcast', department: '', subject: '', content: '' });
        setShowCompose(false); setActiveTab('sent'); fetchMessages();
      }
    } catch (err) { showMsg(err.message || 'Failed to send message', 'error'); }
    finally { setLoading(false); }
  };

  const handleReplyMessage = async (e) => {
    e.preventDefault();
    if (!replyData.content.trim()) { setErrors({ content: 'Reply cannot be empty' }); return; }
    if (!selectedMessage) return;
    try {
      setLoading(true);
      const r = await replyToMessage(token, selectedMessage._id, { content: replyData.content });
      if (r.success) { showMsg('Reply sent'); setReplyData({ content: '' }); setShowReplyBox(false); fetchMessages(); }
    } catch (err) { showMsg(err.message || 'Failed to send reply', 'error'); }
    finally { setLoading(false); }
  };

  const handleDeleteMessage = async () => {
    if (!selectedMessage || !window.confirm('Delete this message?')) return;
    try {
      setLoading(true);
      const r = await deleteMessage(token, selectedMessage._id);
      if (r.success) { showMsg('Message deleted'); setSelectedMessage(null); fetchMessages(); }
    } catch (err) { showMsg(err.message || 'Failed to delete', 'error'); }
    finally { setLoading(false); }
  };

  const filteredMessages = messages.filter(m =>
    (m.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.content || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (d) => {
    const date = new Date(d);
    const now = new Date();
    const diff = now - date;
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diff < 604800000) return date.toLocaleDateString([], { weekday: 'short' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #9333EA 100%)',
        borderRadius: '16px', padding: '24px 32px', color: 'white', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '140px', height: '140px', background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}>Messages</h2>
            <p style={{ margin: '6px 0 0', fontSize: '14px', opacity: 0.85 }}>
              {messages.length} message{messages.length !== 1 ? 's' : ''} in {activeTab}
            </p>
          </div>
          <button onClick={() => { setShowCompose(true); setSelectedMessage(null); }} style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px',
            background: 'white', border: 'none', color: '#4F46E5', borderRadius: '8px',
            cursor: 'pointer', fontSize: '13px', fontWeight: 600
          }}>
            <MdSend style={{ fontSize: '16px' }} /> Compose
          </button>
        </div>
      </div>

      {/* Alert */}
      {statusMessage && (
        <div style={{
          padding: '14px 20px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px',
          background: messageType === 'success' ? '#ECFDF5' : '#FEF2F2',
          border: `1px solid ${messageType === 'success' ? '#A7F3D0' : '#FECACA'}`,
          color: messageType === 'success' ? '#065F46' : '#991B1B'
        }}>
          {messageType === 'success' ? <MdCheckCircle size={18} /> : <MdError size={18} />}
          <span style={{ flex: 1 }}>{statusMessage}</span>
          <button onClick={() => setStatusMessage('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}><MdClose size={18} /></button>
        </div>
      )}

      {/* Messages Layout */}
      <div style={{
        display: 'grid', gridTemplateColumns: '340px 1fr', gap: '16px',
        minHeight: '500px', maxHeight: 'calc(100vh - 320px)'
      }}>
        {/* Left Sidebar */}
        <div style={{
          background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB',
          display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB' }}>
            {[
              { key: 'inbox', label: 'Inbox', icon: <MdInbox size={16} /> },
              { key: 'sent', label: 'Sent', icon: <MdOutbox size={16} /> }
            ].map(tab => (
              <button key={tab.key} onClick={() => { setActiveTab(tab.key); setSelectedMessage(null); setShowCompose(false); }} style={{
                flex: 1, padding: '14px 16px', background: activeTab === tab.key ? '#EEF2FF' : 'transparent',
                border: 'none', borderBottom: activeTab === tab.key ? '2px solid #4F46E5' : '2px solid transparent',
                cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                color: activeTab === tab.key ? '#4F46E5' : '#6B7280',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
              }}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ padding: '12px', borderBottom: '1px solid #F3F4F6' }}>
            <div style={{ position: 'relative' }}>
              <MdSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF', fontSize: '16px' }} />
              <input type="text" placeholder="Search messages..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', padding: '9px 12px 9px 34px', border: '1px solid #E5E7EB', borderRadius: '8px',
                  fontSize: '13px', outline: 'none', boxSizing: 'border-box', background: '#F9FAFB'
                }}
              />
            </div>
          </div>

          {/* Message List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '6px' }}>
            {loading && messages.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#9CA3AF' }}>
                <div className="spinner" style={{ margin: '0 auto 12px' }}></div>
                <p style={{ margin: 0, fontSize: '12px' }}>Loading...</p>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#9CA3AF' }}>
                <MdMail style={{ fontSize: '36px', opacity: 0.3, marginBottom: '8px', display: 'block', margin: '0 auto 8px' }} />
                <p style={{ margin: 0, fontSize: '13px' }}>No messages</p>
              </div>
            ) : (
              filteredMessages.map(msg => (
                <div key={msg._id} onClick={() => { setSelectedMessage(msg); setShowCompose(false); setShowReplyBox(false); }}
                  style={{
                    padding: '12px 14px', borderRadius: '8px', cursor: 'pointer', marginBottom: '4px',
                    background: selectedMessage?._id === msg._id ? '#EEF2FF' : 'transparent',
                    borderLeft: selectedMessage?._id === msg._id ? '3px solid #4F46E5' : '3px solid transparent',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => { if (selectedMessage?._id !== msg._id) e.currentTarget.style.background = '#F9FAFB'; }}
                  onMouseLeave={e => { if (selectedMessage?._id !== msg._id) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#1F2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                      {msg.sender_id || 'Admin'}
                    </span>
                    <span style={{ fontSize: '11px', color: '#9CA3AF', flexShrink: 0 }}>
                      {formatDate(msg.created_at || msg.createdAt)}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {msg.subject}
                  </div>
                  <div style={{ fontSize: '12px', color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {msg.content}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Content */}
        <div style={{
          background: 'white', borderRadius: '12px', border: '1px solid #E5E7EB',
          display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}>
          {showCompose ? (
            /* Compose Form */
            <form onSubmit={handleSendMessage} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{
                padding: '20px 24px', borderBottom: '1px solid #E5E7EB',
                background: '#F9FAFB', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '8px', background: '#EEF2FF',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4F46E5'
                  }}><MdSend size={18} /></div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1F2937' }}>New Message</h3>
                    <p style={{ margin: 0, fontSize: '12px', color: '#6B7280' }}>Compose and send a message</p>
                  </div>
                </div>
                <button type="button" onClick={() => setShowCompose(false)} style={{
                  background: '#F3F4F6', border: 'none', borderRadius: '6px', width: '28px', height: '28px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280'
                }}><MdClose size={16} /></button>
              </div>

              <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                      Send To <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <select name="recipient" value={composeData.recipient} onChange={handleComposeChange} style={{
                      width: '100%', padding: '10px 14px', border: '1px solid #E5E7EB', borderRadius: '8px',
                      fontSize: '13px', background: 'white', cursor: 'pointer', outline: 'none', boxSizing: 'border-box'
                    }}>
                      <option value="broadcast">Broadcast to All</option>
                      <option value="specific">Specific Department</option>
                    </select>
                  </div>
                  {composeData.recipient === 'specific' && (
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                        Department <span style={{ color: '#EF4444' }}>*</span>
                      </label>
                      <select name="department" value={composeData.department} onChange={handleComposeChange} style={{
                        width: '100%', padding: '10px 14px', border: `1px solid ${errors.department ? '#EF4444' : '#E5E7EB'}`,
                        borderRadius: '8px', fontSize: '13px', background: 'white', cursor: 'pointer', outline: 'none', boxSizing: 'border-box'
                      }}>
                        <option value="">Select Department</option>
                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      {errors.department && <p style={{ color: '#EF4444', fontSize: '12px', margin: '4px 0 0' }}>{errors.department}</p>}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    Subject <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input type="text" name="subject" value={composeData.subject} onChange={handleComposeChange}
                    placeholder="Enter message subject" style={{
                      width: '100%', padding: '10px 14px', border: `1px solid ${errors.subject ? '#EF4444' : '#E5E7EB'}`,
                      borderRadius: '8px', fontSize: '13px', outline: 'none', boxSizing: 'border-box'
                    }} />
                  {errors.subject && <p style={{ color: '#EF4444', fontSize: '12px', margin: '4px 0 0' }}>{errors.subject}</p>}
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                    Message <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <textarea name="content" value={composeData.content} onChange={handleComposeChange}
                    placeholder="Type your message..." rows={8} style={{
                      width: '100%', padding: '12px 14px', border: `1px solid ${errors.content ? '#EF4444' : '#E5E7EB'}`,
                      borderRadius: '8px', fontSize: '13px', outline: 'none', resize: 'vertical', fontFamily: 'inherit',
                      boxSizing: 'border-box', minHeight: '120px'
                    }} />
                  {errors.content && <p style={{ color: '#EF4444', fontSize: '12px', margin: '4px 0 0' }}>{errors.content}</p>}
                </div>
              </div>

              <div style={{ padding: '16px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowCompose(false)} style={{
                  padding: '10px 20px', background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: '8px',
                  fontSize: '13px', fontWeight: 500, cursor: 'pointer', color: '#374151'
                }}>Cancel</button>
                <button type="submit" disabled={loading} style={{
                  padding: '10px 24px', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', border: 'none',
                  borderRadius: '8px', color: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px', opacity: loading ? 0.6 : 1
                }}>
                  <MdSend size={14} /> {loading ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>

          ) : selectedMessage ? (
            /* Message Detail View */
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Message Header */}
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', background: '#F9FAFB' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 600, color: '#1F2937' }}>{selectedMessage.subject}</h3>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#6B7280', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{
                          width: '24px', height: '24px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: 'white',
                          background: 'linear-gradient(135deg, #4F46E5, #7C3AED)'
                        }}>
                          {(selectedMessage.sender_id || 'A')[0].toUpperCase()}
                        </span>
                        <strong style={{ color: '#374151' }}>{selectedMessage.sender_id || 'Admin'}</strong>
                      </span>
                      <span>{new Date(selectedMessage.created_at || selectedMessage.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {activeTab === 'inbox' && (
                      <button onClick={() => setShowReplyBox(!showReplyBox)} style={{
                        padding: '8px 14px', fontSize: '12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                        background: '#EEF2FF', color: '#4338CA', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500
                      }}>
                        <MdReply size={14} /> Reply
                      </button>
                    )}
                    <button onClick={handleDeleteMessage} disabled={loading} style={{
                      padding: '8px 14px', fontSize: '12px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                      background: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500
                    }}>
                      <MdDelete size={14} /> Delete
                    </button>
                  </div>
                </div>
              </div>

              {/* Message Body */}
              <div style={{ flex: 1, padding: '24px', overflowY: 'auto', fontSize: '14px', lineHeight: 1.7, color: '#374151' }}>
                <div style={{ whiteSpace: 'pre-wrap' }}>{selectedMessage.content}</div>
              </div>

              {/* Reply Box */}
              {showReplyBox && (
                <form onSubmit={handleReplyMessage} style={{ borderTop: '1px solid #E5E7EB', padding: '16px 24px', background: '#F9FAFB' }}>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6B7280', marginBottom: '6px' }}>Reply</label>
                    <textarea name="content" value={replyData.content}
                      onChange={(e) => { setReplyData({ content: e.target.value }); if (errors.content) setErrors({}); }}
                      placeholder="Type your reply..." rows={3} style={{
                        width: '100%', padding: '10px 14px', border: `1px solid ${errors.content ? '#EF4444' : '#E5E7EB'}`,
                        borderRadius: '8px', fontSize: '13px', outline: 'none', resize: 'vertical', fontFamily: 'inherit',
                        boxSizing: 'border-box'
                      }} />
                    {errors.content && <p style={{ color: '#EF4444', fontSize: '12px', margin: '4px 0 0' }}>{errors.content}</p>}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={() => { setShowReplyBox(false); setReplyData({ content: '' }); }} style={{
                      padding: '8px 16px', background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: '6px',
                      fontSize: '12px', cursor: 'pointer', color: '#374151'
                    }}>Cancel</button>
                    <button type="submit" disabled={loading} style={{
                      padding: '8px 18px', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', border: 'none',
                      borderRadius: '6px', color: 'white', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '4px', opacity: loading ? 0.6 : 1
                    }}>
                      <MdSend size={12} /> {loading ? 'Sending...' : 'Send Reply'}
                    </button>
                  </div>
                </form>
              )}
            </div>

          ) : (
            /* Empty State */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9CA3AF' }}>
              <MdMail style={{ fontSize: '56px', opacity: 0.2, marginBottom: '16px' }} />
              <p style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 500, color: '#6B7280' }}>
                {activeTab === 'inbox' ? 'Select a message to read' : 'Select a sent message'}
              </p>
              <p style={{ margin: 0, fontSize: '13px' }}>Or compose a new message</p>
              <button onClick={() => setShowCompose(true)} style={{
                marginTop: '16px', padding: '10px 20px', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                border: 'none', borderRadius: '8px', color: 'white', fontSize: '13px', fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
              }}>
                <MdSend size={14} /> Compose Message
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
