import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const getAuthHeader = (token) => ({
  Authorization: `Bearer ${token}`
});

// ==================== MESSAGES ====================
export const getAdminInbox = async (token) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/admin/messages/inbox`,
      { headers: getAuthHeader(token) }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getAdminSentMessages = async (token) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/admin/messages/sent`,
      { headers: getAuthHeader(token) }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const sendMessageToDepartment = async (token, data) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/admin/messages/send-to-department`,
      data,
      { headers: getAuthHeader(token) }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const sendBroadcastMessage = async (token, data) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/admin/messages/broadcast`,
      data,
      { headers: getAuthHeader(token) }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const replyToMessage = async (token, messageId, data) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/admin/messages/${messageId}/reply`,
      data,
      { headers: getAuthHeader(token) }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const markMessageAsRead = async (token, messageId) => {
  try {
    const response = await axios.put(
      `${API_URL}/api/admin/messages/${messageId}/read`,
      {},
      { headers: getAuthHeader(token) }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteMessage = async (token, messageId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/api/admin/messages/${messageId}`,
      { headers: getAuthHeader(token) }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
