import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../../contexts/AuthContext";
import {
  MdDashboard,
  MdFileUpload,
  MdCheckCircle,
  MdMail,
  MdEdit,
  MdLogout,
  MdSend,
  MdAttachFile,
  MdSearch,
  MdClose,
  MdMoreVert,
  MdInfo,
  MdEmojiEmotions,
  MdCall,
  MdLocalLibrary,
  MdLocalPharmacy,
  MdAccountBalance,
  MdPeople,
  MdStorage,
  MdComputer,
  MdDomain
} from "react-icons/md";
import "./Messages.css";
import axios from "axios";

// Helper function to get department icon and color
const getDepartmentIcon = (deptName) => {
  if (!deptName) return null;
  
  const name = deptName.toLowerCase();
  if (name.includes('library')) return <MdLocalLibrary />;
  if (name.includes('pharmacy')) return <MdLocalPharmacy />;
  if (name.includes('finance') || name.includes('accounts')) return <MdAccountBalance />;
  if (name.includes('hr') || name.includes('human resources')) return <MdPeople />;
  if (name.includes('records') || name.includes('office')) return <MdStorage />;
  if (name.includes('it') || name.includes('technology')) return <MdComputer />;
  if (name.includes('admin') || name.includes('dean') || name.includes('hod')) return <MdDomain />;
  return null;
};

// Helper function to get department status
const getDepartmentStatus = (deptName) => {
  // You can customize these based on actual department response times
  return "Responds within 24 hrs";
};

// Helper function to get avatar color for department
const getDepartmentColor = (deptName) => {
  if (!deptName) return '--primary';
  
  const colors = {
    'library': '#06b6d4', // cyan
    'pharmacy': '#ec4899', // pink
    'finance': '#f59e0b', // amber
    'hr': '#10b981', // emerald
    'records': '#8b5cf6', // violet
    'it': '#3b82f6', // blue
    'admin': '#6366f1', // indigo
    'dean': '#ef4444', // red
    'hod': '#f97316', // orange
  };
  
  const name = deptName.toLowerCase();
  for (const [dept, color] of Object.entries(colors)) {
    if (name.includes(dept)) return color;
  }
  
  return '#4f46e5'; // default primary color
};

export default function Messages() {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const [messages, setMessages] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sending, setSending] = useState(false);
  
  // Chat interface states
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageFilter, setMessageFilter] = useState("all"); // all, sent, received, unread
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessageText, setNewMessageText] = useState("");
  const [replyingToId, setReplyingToId] = useState(null);
  const [replySending, setReplySending] = useState(false);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const maxFileSize = 5 * 1024 * 1024; // 5MB per file
    const maxTotalFiles = 5;

    if (attachedFiles.length + files.length > maxTotalFiles) {
      setError(`❌ Maximum ${maxTotalFiles} files allowed`);
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > maxFileSize) {
        setError(`❌ File "${file.name}" exceeds 5MB limit`);
        return false;
      }
      return true;
    });

    setAttachedFiles([...attachedFiles, ...validFiles]);
    setSuccess(`✅ ${validFiles.length} file(s) attached`);
  };

  // Remove attached file
  const removeAttachedFile = (index) => {
    setAttachedFiles(attachedFiles.filter((_, i) => i !== index));
  };

  // Helper function to group messages by conversation
  const groupMessagesByConversation = () => {
    const conversations = {};

    messages.forEach(msg => {
      const isSent = msg.sender_id === user?.id;
      const deptName = isSent 
        ? (msg.receiver_department || msg.recipient_department || "Unknown")
        : (msg.sender_name || msg.sender_role || "Unknown");

      if (!conversations[deptName]) {
        conversations[deptName] = {
          name: deptName,
          messages: [],
          unreadCount: 0,
          lastMessage: null,
          lastTime: null,
          lastMessageSender: null
        };
      }

      conversations[deptName].messages.push(msg);

      // Count unread messages from this conversation
      if (!msg.is_read && !isSent) {
        conversations[deptName].unreadCount += 1;
      }

      // Track last message and time
      const msgTime = new Date(msg.created_at || msg.createdAt).getTime();
      if (!conversations[deptName].lastTime || msgTime > conversations[deptName].lastTime) {
        conversations[deptName].lastMessage = msg.message?.substring(0, 50);
        conversations[deptName].lastTime = msgTime;
        conversations[deptName].lastMessageSender = isSent ? "You" : deptName;
      }
    });

    // Sort by last message time (most recent first)
    return Object.values(conversations).sort((a, b) => 
      (b.lastTime || 0) - (a.lastTime || 0)
    );
  };

  // Helper function to filter conversations
  const getFilteredConversations = (convs) => {
    return convs.filter(conv => {
      const matchesSearch = conv.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (messageFilter === "unread") {
        return matchesSearch && conv.unreadCount > 0;
      }
      
      return matchesSearch;
    });
  };

  // Helper function to filter messages in selected conversation
  const getFilteredMessages = (convMessages) => {
    return convMessages.filter(msg => {
      const isSent = msg.sender_id === user?.id;
      
      if (messageFilter === "all") return true;
      if (messageFilter === "sent") return isSent;
      if (messageFilter === "received") return !isSent;
      if (messageFilter === "unread") return !msg.is_read && !isSent;
      
      return true;
    });
  };

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedConversation]);

  // ====== FETCH MESSAGES ON MOUNT ======
  useEffect(() => {
    if (user) {
      fetchDepartments();
      fetchMessages();
      
      const interval = setInterval(fetchMessages, 20000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ✅ FETCH DEPARTMENTS FROM BACKEND
  const fetchDepartments = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5001";
      const response = await axios.get(apiUrl + "/api/departments");

      if (response.data.success) {
        setDepartments(response.data.data || []);
      } else {
        const defaultDepts = [
          "Library",
          "Finance & Accounts",
          "Human Resources",
          "Records Office",
          "IT Department",
          "Administration",
          "ORIC",
          "Warden Office",
          "HOD Office",
          "Dean Office"
        ];
        setDepartments(defaultDepts);
      }
    } catch (err) {
      console.error("❌ Error fetching departments:", err);
      const defaultDepts = [
        "Library",
        "Finance & Accounts",
        "Human Resources",
        "Records Office",
        "IT Department",
        "Administration",
        "ORIC",
        "Warden Office",
        "HOD Office",
        "Dean Office"
      ];
      setDepartments(defaultDepts);
    }
  };

  // ✅ FETCH MESSAGES FROM BACKEND
  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5001";

      if (!token) {
        setError("❌ No authentication token. Please login again.");
        return;
      }

      const response = await axios.get(apiUrl + "/api/my-messages", {
        headers: { 
          Authorization: "Bearer " + token,
          "Content-Type": "application/json"
        }
      });

      if (response.data.success) {
        setMessages(response.data.data || []);
        setError("");
      } else {
        setError(response.data.message || "Failed to load messages");
      }
    } catch (err) {
      console.error("Fetch Messages Error:", err);
      
      if (err.response?.status === 401) {
        setError("❌ Session expired. Please login again.");
      } else if (err.response?.data?.message) {
        setError("❌ " + err.response.data.message);
      } else {
        setError("❌ Failed to load messages");
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ MARK MESSAGE AS READ
  const markMessageAsRead = async (messageId) => {
    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5001";

      if (!token) return;

      await axios.put(
        apiUrl + `/api/mark-message-read/${messageId}`,
        {},
        {
          headers: { 
            Authorization: "Bearer " + token,
            "Content-Type": "application/json"
          }
        }
      );

      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg._id === messageId ? { ...msg, is_read: true } : msg
        )
      );
    } catch (err) {
      console.error("Error marking message as read:", err);
    }
  };

  // ✅ SEND NEW MESSAGE IN CONVERSATION
  const handleSendMessage = async () => {
    if (!selectedConversation || !newMessageText.trim()) {
      return;
    }

    setSending(true);
    setError("");
    
    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5001";

      if (!token) {
        setError("❌ No authentication token. Please login again.");
        setSending(false);
        return;
      }

      const response = await axios.post(
        apiUrl + "/api/send",
        {
          recipientDepartment: selectedConversation,
          subject: "Message",
          message: newMessageText.trim()
        },
        { 
          headers: { 
            Authorization: "Bearer " + token, 
            "Content-Type": "application/json" 
          } 
        }
      );

      if (response.data.success) {
        setNewMessageText("");
        setSuccess("✅ Message sent successfully!");
        await fetchMessages();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(response.data.message || "❌ Failed to send message");
      }
    } catch (err) {
      console.error("❌ Send Message Error:", err);
      if (err.response?.data?.message) {
        setError("❌ " + err.response.data.message);
      } else {
        setError("❌ Failed to send message. Please try again.");
      }
    } finally {
      setSending(false);
    }
  };

  // ✅ REPLY TO A MESSAGE
  const handleReplySubmit = async (messageId) => {
    if (!newMessageText.trim()) {
      setError("❌ Please enter your reply");
      return;
    }

    replySending && setReplySending(true);
    setError("");
    
    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5001";

      if (!token) {
        setError("❌ No authentication token. Please login again.");
        return;
      }

      const response = await axios.post(
        apiUrl + `/api/messages/reply/${messageId}`,
        { message: newMessageText.trim() },
        {
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json"
          }
        }
      );

      if (response.data.success) {
        setNewMessageText("");
        setReplyingToId(null);
        setSuccess("✅ Reply sent successfully!");
        await fetchMessages();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(response.data.message || "❌ Failed to send reply");
      }
    } catch (err) {
      console.error("❌ Reply Error:", err);
      if (err.response?.data?.message) {
        setError("❌ " + err.response.data.message);
      } else {
        setError("❌ Failed to send reply. Please try again.");
      }
    } finally {
      setReplySending(false);
    }
  };

  // ✅ START NEW CONVERSATION WITH DEPARTMENT
  const handleStartNewConversation = async (deptName) => {
    try {
      const token = localStorage.getItem("token");
      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5001";

      if (!token) {
        setError("❌ No authentication token. Please login again.");
        return;
      }

      // First, send an initial message to start conversation
      const response = await axios.post(
        apiUrl + "/api/send",
        {
          recipientDepartment: deptName,
          subject: "Initial Message",
          message: "Hello, I would like to inquire about my clearance."
        },
        { 
          headers: { 
            Authorization: "Bearer " + token, 
            "Content-Type": "application/json" 
          } 
        }
      );

      if (response.data.success) {
        setSelectedConversation(deptName);
        setNewMessageText("");
        setSuccess("✅ Conversation started!");
        await fetchMessages();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      console.error("Error starting conversation:", err);
      setError("Failed to start conversation");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const displayName = user?.full_name || "Faculty";
  const displayId = user?.faculty_id || "N/A";
  const displayDepartment = user?.department || "N/A";
  const displayUniversity = user?.university || "Riphah International University";

  // Get all conversations
  const conversations = groupMessagesByConversation();
  const filteredConversations = getFilteredConversations(conversations);
  
  // Get current conversation details
  const currentConvMessages = selectedConversation 
    ? conversations.find(c => c.name === selectedConversation)?.messages || []
    : [];
  const filteredMessages = getFilteredMessages(currentConvMessages);

  // Mark messages as read for selected conversation
  useEffect(() => {
    filteredMessages.forEach(msg => {
      const isSent = msg.sender_id === user?.id;
      if (!isSent && !msg.is_read) {
        setTimeout(() => markMessageAsRead(msg._id), 500);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation, filteredMessages]);

  return (
    <div className="faculty-dashboard-page">
      {/* SIDEBAR */}
      <aside className="fd-sidebar">
        <div className="fd-profile">
          <div className="fd-avatar">{displayName.charAt(0).toUpperCase()}</div>
          <div>
            <h3 className="fd-name">{displayName}</h3>
            <p className="fd-small">{displayId} • {displayDepartment}</p>
            <p className="fd-small" style={{fontSize: '0.75rem', marginTop: '4px'}}>{displayUniversity}</p>
          </div>
        </div>

        <nav className="fd-nav">
          <button onClick={() => navigate("/faculty-dashboard")} className="fd-nav-btn">
            <MdDashboard className="nav-icon" /> Dashboard
          </button>
          <button onClick={() => navigate("/faculty-clearance")} className="fd-nav-btn">
            <MdFileUpload className="nav-icon" /> Submit Clearance
          </button>
          <button onClick={() => navigate("/faculty-clearance-status")} className="fd-nav-btn">
            <MdCheckCircle className="nav-icon" /> Clearance Status
          </button>
          <button onClick={() => navigate("/faculty-messages")} className="fd-nav-btn active">
            <MdMail className="nav-icon" /> Messages
          </button>
          <button onClick={() => navigate("/faculty-dashboard", { state: { scrollToAutoVerify: true } })} className="fd-nav-btn">
            <MdCheckCircle className="nav-icon" /> Auto Verify
          </button>
          <button onClick={() => navigate("/faculty-edit-profile")} className="fd-nav-btn">
            <MdEdit className="nav-icon" /> Edit Profile
          </button>
          <button onClick={handleLogout} className="fd-nav-btn logout">
            <MdLogout className="nav-icon" /> Logout
          </button>
        </nav>

        <footer className="fd-footer">© 2025 Riphah</footer>
      </aside>

      {/* MAIN CONTENT */}
      <main className="fd-main">
        <header className="fd-header-banner">
          <div className="fd-header-content">
            <div className="fd-header-left">
              <h1 className="fd-header-title"><MdMail style={{ marginRight: "8px" }} /> Messages</h1>
              <p className="fd-header-desc">Chat with departments about your clearance requests</p>
            </div>
          </div>
        </header>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>⏳ Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">�</div>
            <h2>No messages yet</h2>
            <p>Start a conversation with a department about your clearance requests</p>
            {departments.length > 0 && (
              <div style={{ marginTop: "32px" }}>
                <p style={{ marginBottom: "20px", color: "#4f46e5", fontWeight: "600", fontSize: "14px" }}>Select a department to start:</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", maxWidth: "800px" }}>
                  {departments.slice(0, 6).map((dept, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleStartNewConversation(dept)}
                      style={{
                        padding: "12px 16px",
                        border: "1.5px solid #e5e7eb",
                        color: "#1f2937",
                        background: "#f9fafb",
                        borderRadius: "10px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "600",
                        transition: "all 0.3s ease",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "#4f46e5";
                        e.target.style.color = "white";
                        e.target.style.borderColor = "#4f46e5";
                        e.target.style.boxShadow = "0 4px 12px rgba(79, 70, 229, 0.2)";
                        e.target.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "#f9fafb";
                        e.target.style.color = "#1f2937";
                        e.target.style.borderColor = "#e5e7eb";
                        e.target.style.boxShadow = "none";
                        e.target.style.transform = "translateY(0)";
                      }}
                    >
                      <span style={{ fontSize: "18px" }}>
                        {getDepartmentIcon(dept) ? getDepartmentIcon(dept) : (typeof dept === 'string' ? dept : dept.name || 'Department').charAt(0)}
                      </span>
                      {typeof dept === 'string' ? dept : dept.name || 'Department'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="chat-container">
            {/* LEFT SIDEBAR - CONVERSATIONS LIST */}
            <div className="conversations-panel">
              <div className="conversations-header">
                <h2>Conversations</h2>
                <button 
                  className="compose-btn"
                  onClick={() => setShowComposeModal(true)}
                  title="Start new conversation"
                >
                  ✉️
                </button>
              </div>

              {/* SEARCH BAR */}
              <div className="conversations-search">
                <MdSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>

              {/* FILTER BUTTONS */}
              <div className="conversations-filters">
                <button
                  className={`filter-btn ${messageFilter === "all" ? "active" : ""}`}
                  onClick={() => setMessageFilter("all")}
                >
                  All
                </button>
                <button
                  className={`filter-btn ${messageFilter === "sent" ? "active" : ""}`}
                  onClick={() => setMessageFilter("sent")}
                >
                  Sent
                </button>
                <button
                  className={`filter-btn ${messageFilter === "received" ? "active" : ""}`}
                  onClick={() => setMessageFilter("received")}
                >
                  Received
                </button>
                <button
                  className={`filter-btn ${messageFilter === "unread" ? "active" : ""}`}
                  onClick={() => setMessageFilter("unread")}
                >
                  Unread
                </button>
              </div>

              {/* CONVERSATIONS LIST */}
              <div className="conversations-list">
                {filteredConversations.length === 0 ? (
                  <div style={{ padding: "20px", textAlign: "center", color: "#999" }}>
                    <p>No conversations found</p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => (
                    <div
                      key={conv.name}
                      className={`conversation-item ${selectedConversation === conv.name ? "active" : ""}`}
                      onClick={() => setSelectedConversation(conv.name)}
                    >
                      <div 
                        className="conversation-avatar"
                        style={{ 
                          background: `linear-gradient(135deg, ${getDepartmentColor(conv.name)} 0%, ${getDepartmentColor(conv.name)}dd 100%)`
                        }}
                        title={getDepartmentIcon(conv.name) ? conv.name : null}
                      >
                        {getDepartmentIcon(conv.name) ? (
                          <span style={{ fontSize: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {getDepartmentIcon(conv.name)}
                          </span>
                        ) : (
                          conv.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="conversation-content">
                        <div className="conversation-header">
                          <h3>{conv.name}</h3>
                          {conv.unreadCount > 0 && (
                            <span className="unread-badge">{conv.unreadCount}</span>
                          )}
                        </div>
                        <p className="conversation-preview">
                          <span className="preview-sender">{conv.lastMessageSender}:</span> {conv.lastMessage || "No messages"}
                        </p>
                        <p className="conversation-time">
                          {conv.lastTime ? new Date(conv.lastTime).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* RIGHT SIDE - CHAT WINDOW */}
            <div className="chat-panel">
              {!selectedConversation ? (
                <div className="no-chat-selected">
                  <div style={{ fontSize: "60px", marginBottom: "20px" }}>💬</div>
                  <h2>Select a Conversation</h2>
                  <p>Choose a department from the list to start chatting</p>
                </div>
              ) : (
                <>
                  {/* CHAT HEADER */}
                  <div className="chat-header">
                    <div className="chat-header-info">
                      <div 
                        className="chat-avatar"
                        style={{ 
                          background: `linear-gradient(135deg, ${getDepartmentColor(selectedConversation)} 0%, ${getDepartmentColor(selectedConversation)}dd 100%)`
                        }}
                      >
                        {getDepartmentIcon(selectedConversation) ? (
                          <span style={{ fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {getDepartmentIcon(selectedConversation)}
                          </span>
                        ) : (
                          selectedConversation.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div>
                        <h3>{selectedConversation}</h3>
                        <p style={{ fontSize: '12px', color: '#10b981', fontWeight: '600' }}>● {getDepartmentStatus(selectedConversation)}</p>
                      </div>
                    </div>
                    <div className="chat-header-actions">
                      <button className="chat-header-btn" title="Call">
                        <MdCall />
                      </button>
                      <button className="chat-header-btn" title="Info">
                        <MdInfo />
                      </button>
                      <button className="chat-header-btn" title="Options">
                        <MdMoreVert />
                      </button>
                    </div>
                  </div>

                  {/* MESSAGES AREA */}
                  <div className="messages-area">
                    {filteredMessages.length === 0 ? (
                      <div className="no-messages">
                        <p>No messages in this conversation</p>
                      </div>
                    ) : (
                      filteredMessages.map((msg) => {
                        const isSent = msg.sender_id === user?.id;
                        
                        return (
                          <div key={msg._id} className={`message-row ${isSent ? "sent" : "received"}`}>
                            {!isSent && (
                              <div className="message-avatar">
                                {selectedConversation.charAt(0).toUpperCase()}
                              </div>
                            )}
                            
                            <div className="message-bubble-wrapper">
                              <div className="message-bubble">
                                <p className="message-text">{msg.message}</p>
                                <span className="message-time">
                                  {new Date(msg.created_at || msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              
                              {msg.remarks && (
                                <div className="message-remarks-chat">
                                  <strong>Department's Reply:</strong> {msg.remarks}
                                </div>
                              )}

                              {/* Reply button for received messages */}
                              {!isSent && (
                                <div className="message-actions">
                                  {replyingToId === msg._id ? (
                                    <span className="replying-indicator">Replying...</span>
                                  ) : (
                                    <button
                                      className="reply-btn"
                                      onClick={() => setReplyingToId(msg._id)}
                                    >
                                      ↩️ Reply
                                    </button>
                                  )}
                                </div>
                              )}

                              {/* Reply input */}
                              {replyingToId === msg._id && (
                                <div className="reply-input-inline">
                                  <textarea
                                    value={newMessageText}
                                    onChange={(e) => setNewMessageText(e.target.value)}
                                    placeholder="Type your reply..."
                                    rows="2"
                                    className="reply-textarea-inline"
                                  />
                                  <div className="reply-actions-inline">
                                    <button
                                      onClick={() => handleReplySubmit(msg._id)}
                                      className="reply-send-btn"
                                      disabled={replySending || !newMessageText.trim()}
                                    >
                                      {replySending ? "Sending..." : "Send"}
                                    </button>
                                    <button
                                      onClick={() => {
                                        setReplyingToId(null);
                                        setNewMessageText("");
                                      }}
                                      className="reply-cancel-btn"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                            {isSent && (
                              <div className="message-status">
                                {msg.is_read ? "✓✓" : "✓"}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* MESSAGE INPUT AREA */}
                  <div className="message-input-area">
                    {/* Attached Files Display */}
                    {attachedFiles.length > 0 && (
                      <div className="attached-files-preview">
                        <div className="attached-files-title">📎 Attached Files ({attachedFiles.length})</div>
                        <div className="attached-files-list">
                          {attachedFiles.map((file, index) => (
                            <div key={index} className="attached-file-item">
                              <span className="file-name">📄 {file.name}</span>
                              <span className="file-size">({(file.size / 1024).toFixed(1)} KB)</span>
                              <button
                                onClick={() => removeAttachedFile(index)}
                                className="remove-file-btn"
                                title="Remove file"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="message-input-container">
                      {/* Hidden File Input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="*/*"
                        onChange={handleFileSelect}
                        style={{ display: "none" }}
                      />

                      <button 
                        className="input-icon-btn" 
                        title="Attach file"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <MdAttachFile />
                      </button>
                      
                      <textarea
                        value={newMessageText}
                        onChange={(e) => setNewMessageText(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && e.ctrlKey) {
                            handleSendMessage();
                          }
                        }}
                        placeholder="Type your message... (Ctrl+Enter to send)"
                        className="message-input"
                        rows="1"
                      />
                      
                      <button className="input-icon-btn" title="Emoji">
                        <MdEmojiEmotions />
                      </button>
                      
                      <button
                        onClick={handleSendMessage}
                        disabled={sending || !newMessageText.trim()}
                        className="send-btn"
                        title="Send message"
                      >
                        {sending ? <span>⟳</span> : <MdSend />}
                      </button>
                    </div>
                    <p className="input-hint">Press Ctrl+Enter to send</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* COMPOSE NEW MESSAGE MODAL */}
        {showComposeModal && (
          <div className="modal-overlay" onClick={() => setShowComposeModal(false)}>
            <div className="compose-modal" onClick={(e) => e.stopPropagation()}>
              <div className="compose-modal-header">
                <h2>Start New Conversation</h2>
                <button 
                  className="modal-close-btn"
                  onClick={() => setShowComposeModal(false)}
                >
                  ✕
                </button>
              </div>
              
              <div className="compose-modal-content">
                <p>Select a department to start messaging:</p>
                <div className="department-grid">
                  {departments.map((dept, idx) => (
                    <button
                      key={idx}
                      className="department-btn"
                      onClick={() => {
                        handleStartNewConversation(typeof dept === 'string' ? dept : dept.name || 'Department');
                        setShowComposeModal(false);
                      }}
                    >
                      <div 
                        className="dept-avatar"
                        style={{ 
                          background: `linear-gradient(135deg, ${getDepartmentColor(typeof dept === 'string' ? dept : dept.name)} 0%, ${getDepartmentColor(typeof dept === 'string' ? dept : dept.name)}dd 100%)`
                        }}
                      >
                        {getDepartmentIcon(typeof dept === 'string' ? dept : dept.name) ? (
                          <span style={{ fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {getDepartmentIcon(typeof dept === 'string' ? dept : dept.name)}
                          </span>
                        ) : (
                          (typeof dept === 'string' ? dept : dept.name || 'D').charAt(0).toUpperCase()
                        )}
                      </div>
                      <span>{typeof dept === 'string' ? dept : dept.name || 'Department'}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
