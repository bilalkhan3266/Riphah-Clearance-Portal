import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MdSend, MdSearch, MdRefresh, MdMail, MdMailOutline } from 'react-icons/md';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export default function DepartmentMessages({ departmentName }) {
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [newFacultyId, setNewFacultyId] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [showCompose, setShowCompose] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departmentName]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConv]);

  const token = localStorage.getItem('token');

  const fetchConversations = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/department-messages/${departmentName}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setConversations(res.data.data || []);
        // refresh selected conversation messages
        if (selectedConv) {
          const updated = (res.data.data || []).find(c => c._id === selectedConv._id);
          if (updated) setSelectedConv(updated);
        }
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = async (conv) => {
    setSelectedConv(conv);
    setReplyText('');
    // Mark as read
    try {
      await axios.put(`${API_URL}/api/department-messages/${departmentName}/read/${conv._id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchConversations();
    } catch (err) { /* ignore */ }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selectedConv) return;
    setSending(true);
    try {
      await axios.post(`${API_URL}/api/department-messages/${departmentName}/reply/${selectedConv._id}`,
        { message: replyText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReplyText('');
      setSuccess('Reply sent!');
      fetchConversations();
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reply');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSending(false);
    }
  };

  const handleCompose = async () => {
    if (!newFacultyId.trim() || !newMessage.trim()) {
      setError('Faculty ID and message are required');
      setTimeout(() => setError(''), 3000);
      return;
    }
    setSending(true);
    try {
      await axios.post(`${API_URL}/api/department-messages/${departmentName}/send`,
        { facultyId: newFacultyId, message: newMessage, subject: newSubject || 'Department Communication' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewFacultyId('');
      setNewMessage('');
      setNewSubject('');
      setShowCompose(false);
      setSuccess('Message sent!');
      fetchConversations();
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSending(false);
    }
  };

  const filtered = conversations.filter(c => {
    const name = c.faculty_name || c.faculty_id?.full_name || '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const formatTime = (d) => {
    if (!d) return '';
    const dt = new Date(d);
    const now = new Date();
    const diff = now - dt;
    if (diff < 86400000 && dt.getDate() === now.getDate()) {
      return dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (diff < 604800000) {
      return dt.toLocaleDateString([], { weekday: 'short' });
    }
    return dt.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const s = {
    container: { display: 'flex', height: 'calc(100vh - 200px)', minHeight: '500px', background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' },
    sidebar: { width: '340px', borderRight: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', background: '#FAFBFC' },
    sidebarHeader: { padding: '16px', borderBottom: '1px solid #E5E7EB' },
    searchBox: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#F3F4F6', borderRadius: '8px', marginTop: '12px' },
    searchInput: { flex: 1, border: 'none', background: 'none', outline: 'none', fontSize: '13px' },
    convList: { flex: 1, overflowY: 'auto' },
    convItem: (active) => ({
      padding: '14px 16px', cursor: 'pointer', borderBottom: '1px solid #F3F4F6', transition: 'all 0.15s',
      background: active ? '#EEF2FF' : 'transparent', borderLeft: active ? '3px solid #4F46E5' : '3px solid transparent'
    }),
    convName: { fontSize: '14px', fontWeight: 600, color: '#1F2937', margin: 0 },
    convPreview: { fontSize: '12px', color: '#6B7280', margin: '4px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    convMeta: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' },
    convTime: { fontSize: '11px', color: '#9CA3AF' },
    unreadBadge: { background: '#4F46E5', color: 'white', borderRadius: '10px', padding: '2px 8px', fontSize: '11px', fontWeight: 600 },
    chatArea: { flex: 1, display: 'flex', flexDirection: 'column' },
    chatHeader: { padding: '16px 20px', borderBottom: '1px solid #E5E7EB', background: '#FAFBFC' },
    chatName: { margin: 0, fontSize: '16px', fontWeight: 600, color: '#1F2937' },
    chatSub: { margin: '2px 0 0', fontSize: '12px', color: '#6B7280' },
    chatMessages: { flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' },
    msgBubble: (isMine) => ({
      maxWidth: '70%', padding: '10px 14px', borderRadius: '12px', fontSize: '13px', lineHeight: '1.5',
      alignSelf: isMine ? 'flex-end' : 'flex-start',
      background: isMine ? '#4F46E5' : '#F3F4F6',
      color: isMine ? 'white' : '#1F2937'
    }),
    msgTime: (isMine) => ({ fontSize: '10px', color: isMine ? 'rgba(255,255,255,0.7)' : '#9CA3AF', marginTop: '4px' }),
    chatInput: { padding: '16px 20px', borderTop: '1px solid #E5E7EB', display: 'flex', gap: '10px', alignItems: 'center' },
    input: { flex: 1, padding: '10px 14px', border: '1px solid #D1D5DB', borderRadius: '8px', outline: 'none', fontSize: '13px' },
    sendBtn: { padding: '10px 18px', background: '#4F46E5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500 },
    emptyChat: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#9CA3AF' },
    composeBtn: { padding: '8px 16px', background: '#4F46E5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' },
    composeOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    composeModal: { background: 'white', borderRadius: '14px', padding: '28px', width: '440px', maxWidth: '90vw' },
    label: { display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' },
    formInput: { width: '100%', padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '13px', marginBottom: '14px', outline: 'none', boxSizing: 'border-box' },
    alert: (type) => ({ padding: '10px 16px', borderRadius: '8px', fontSize: '13px', margin: '0 16px 12px', background: type === 'success' ? '#D1FAE5' : '#FEE2E2', color: type === 'success' ? '#065F46' : '#991B1B', border: `1px solid ${type === 'success' ? '#6EE7B7' : '#FCA5A5'}` })
  };

  return (
    <div style={{ padding: '16px' }}>
      {success && <div style={s.alert('success')}>{success}</div>}
      {error && <div style={s.alert('error')}>{error}</div>}

      <div style={s.container}>
        {/* Conversation List Sidebar */}
        <div style={s.sidebar}>
          <div style={s.sidebarHeader}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Conversations</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={fetchConversations} style={{ ...s.composeBtn, background: '#F3F4F6', color: '#374151', padding: '6px 10px' }} title="Refresh">
                  <MdRefresh style={{ fontSize: '16px' }} />
                </button>
                <button onClick={() => setShowCompose(true)} style={s.composeBtn}>
                  <MdMail style={{ fontSize: '14px' }} /> New
                </button>
              </div>
            </div>
            <div style={s.searchBox}>
              <MdSearch style={{ color: '#9CA3AF', fontSize: '18px' }} />
              <input style={s.searchInput} placeholder="Search faculty..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          <div style={s.convList}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>Loading...</div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
                <MdMailOutline style={{ fontSize: '36px', marginBottom: '8px' }} />
                <p style={{ margin: 0, fontSize: '13px' }}>No conversations yet</p>
              </div>
            ) : (
              filtered.map(conv => (
                <div key={conv._id} style={s.convItem(selectedConv?._id === conv._id)} onClick={() => handleSelectConversation(conv)}>
                  <p style={s.convName}>{conv.faculty_name || conv.faculty_id?.full_name || 'Faculty'}</p>
                  <p style={s.convPreview}>{conv.last_message_preview || conv.subject || 'No messages'}</p>
                  <div style={s.convMeta}>
                    <span style={s.convTime}>{formatTime(conv.last_message_at)}</span>
                    {(conv.unread_by_department || 0) > 0 && (
                      <span style={s.unreadBadge}>{conv.unread_by_department}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        {selectedConv ? (
          <div style={s.chatArea}>
            <div style={s.chatHeader}>
              <h3 style={s.chatName}>{selectedConv.faculty_name || selectedConv.faculty_id?.full_name || 'Faculty'}</h3>
              <p style={s.chatSub}>{selectedConv.subject || 'Clearance Discussion'} · {selectedConv.messages?.length || 0} messages</p>
            </div>

            <div style={s.chatMessages}>
              {(selectedConv.messages || []).map(msg => {
                const isMine = msg.sender_role === departmentName || msg.sender_role === 'department';
                return (
                  <div key={msg._id} style={{ alignSelf: isMine ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                    <div style={s.msgBubble(isMine)}>
                      {msg.message}
                    </div>
                    <div style={s.msgTime(isMine)}>
                      {isMine ? 'You' : (msg.sender_name || 'Faculty')} · {formatTime(msg.created_at)}
                      {!isMine && msg.is_read && ' · Read'}
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            <div style={s.chatInput}>
              <input
                style={s.input}
                placeholder="Type your reply..."
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(); } }}
              />
              <button style={{ ...s.sendBtn, opacity: sending ? 0.6 : 1 }} onClick={handleReply} disabled={sending || !replyText.trim()}>
                <MdSend style={{ fontSize: '16px' }} /> {sending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        ) : (
          <div style={s.emptyChat}>
            <MdMail style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.3 }} />
            <p style={{ margin: 0, fontSize: '15px', fontWeight: 500 }}>Select a conversation</p>
            <p style={{ margin: '4px 0 0', fontSize: '13px' }}>or start a new one</p>
          </div>
        )}
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div style={s.composeOverlay} onClick={() => setShowCompose(false)}>
          <div style={s.composeModal} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: 600 }}>New Message</h3>
            <label style={s.label}>Faculty ID (User ObjectId) *</label>
            <input style={s.formInput} placeholder="Enter faculty user ID" value={newFacultyId} onChange={e => setNewFacultyId(e.target.value)} />
            <label style={s.label}>Subject</label>
            <input style={s.formInput} placeholder="Optional subject" value={newSubject} onChange={e => setNewSubject(e.target.value)} />
            <label style={s.label}>Message *</label>
            <textarea style={{ ...s.formInput, height: '80px', resize: 'vertical' }} placeholder="Type your message..." value={newMessage} onChange={e => setNewMessage(e.target.value)} />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowCompose(false)} style={{ padding: '10px 20px', background: '#F3F4F6', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>Cancel</button>
              <button onClick={handleCompose} disabled={sending} style={{ ...s.sendBtn, opacity: sending ? 0.6 : 1 }}>
                <MdSend style={{ fontSize: '14px' }} /> {sending ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
