import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const getAuthHeader = (token) => ({
  Authorization: `Bearer ${token}`
});

// ==================== ADMIN STATS ====================
export const getAdminStats = async (token) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/admin/stats`,
      { headers: getAuthHeader(token) }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getDepartmentStats = async (token) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/admin/department-stats`,
      { headers: getAuthHeader(token) }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ==================== ADMIN PROFILE ====================
export const getAdminProfile = async (token) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/admin/profile`,
      { headers: getAuthHeader(token) }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateAdminProfile = async (token, data) => {
  try {
    const response = await axios.put(
      `${API_URL}/api/admin/profile`,
      data,
      { headers: getAuthHeader(token) }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const changeAdminPassword = async (token, data) => {
  try {
    const response = await axios.put(
      `${API_URL}/api/admin/change-password`,
      data,
      { headers: getAuthHeader(token) }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const uploadAdminProfilePicture = async (token, file) => {
  try {
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    const response = await axios.post(
      `${API_URL}/api/admin/upload-profile-picture`,
      formData,
      {
        headers: {
          ...getAuthHeader(token),
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ==================== USER MANAGEMENT ====================
export const getAllUsers = async (token) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/admin/users`,
      { headers: getAuthHeader(token) }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createUser = async (token, userData) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/admin/users`,
      userData,
      { headers: getAuthHeader(token) }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateUser = async (token, userId, userData) => {
  try {
    const response = await axios.put(
      `${API_URL}/api/admin/users/${userId}`,
      userData,
      { headers: getAuthHeader(token) }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteUser = async (token, userId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/api/admin/users/${userId}`,
      { headers: getAuthHeader(token) }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ==================== DEPARTMENTS ====================
export const getAllDepartments = async (token) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/admin/departments`,
      { headers: getAuthHeader(token) }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getDepartmentUsers = async (token, departmentId) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/admin/departments/${departmentId}/users`,
      { headers: getAuthHeader(token) }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
