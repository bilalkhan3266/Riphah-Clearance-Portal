// ==========================================
// services/authService.js
// Business Logic Layer (testable, reusable)
// ==========================================
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { hashPassword, comparePassword } = require('../utils/hashPassword');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens
} = require('../utils/generateToken');

class AuthService {
  /**
   * Register a new student user
   */
  async register({ fullName, email, password, sapId }) {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('Email already registered');
    }
    
    // Check if SAP ID is taken
    if (sapId) {
      const existingSap = await User.findOne({ sapId });
      if (existingSap) {
        throw new Error('SAP ID already registered');
      }
    }
    
    // Hash password
    const passwordHash = await hashPassword(password);
    
    // Create user
    const user = await User.create({
      fullName,
      email,
      passwordHash,
      sapId,
      role: 'student'
    });
    
    // Log registration
    await AuditLog.log({
      action: 'register',
      email,
      status: 'success'
    });
    
    // Return user without password
    return {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      sapId: user.sapId,
      isVerified: user.isVerified
    };
  }
  
  /**
   * Login user and return tokens
   */
  async login({ email, password, ipAddress, userAgent }) {
    // Find user and include password field
    const user = await User.findOne({ email }).select('+passwordHash');
    
    if (!user) {
      await AuditLog.log({
        action: 'login_failed',
        email,
        ipAddress,
        userAgent,
        status: 'failure',
        metadata: { reason: 'user_not_found' }
      });
      throw new Error('Invalid email or password');
    }
    
    // Check if account is locked
    if (user.isLocked) {
      await AuditLog.log({
        userId: user._id,
        action: 'login_failed',
        email,
        ipAddress,
        userAgent,
        status: 'failure',
        metadata: { reason: 'account_locked' }
      });
      throw new Error('Account is temporarily locked due to multiple failed login attempts. Please try again later.');
    }
    
    // Check if account is active
    if (!user.isActive) {
      throw new Error('Account has been deactivated. Please contact administrator.');
    }
    
    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    
    if (!isPasswordValid) {
      // Increment login attempts
      await user.incLoginAttempts();
      
      await AuditLog.log({
        userId: user._id,
        action: 'login_failed',
        email,
        ipAddress,
        userAgent,
        status: 'failure',
        metadata: { reason: 'invalid_password' }
      });
      
      throw new Error('Invalid email or password');
    }
    
    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }
    
    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user._id,
      email: user.email,
      role: user.role
    });
    
    const refreshToken = await generateRefreshToken(user._id, ipAddress);
    
    // Log successful login
    await AuditLog.log({
      userId: user._id,
      action: 'login_success',
      email,
      ipAddress,
      userAgent,
      status: 'success'
    });
    
    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        sapId: user.sapId,
        isVerified: user.isVerified
      }
    };
  }
  
  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken({ refreshToken, ipAddress }) {
    // Verify refresh token
    const tokenDoc = await verifyRefreshToken(refreshToken);
    
    const user = tokenDoc.userId;
    
    // Generate new access token
    const accessToken = generateAccessToken({
      userId: user._id,
      email: user.email,
      role: user.role
    });
    
    // Optionally rotate refresh token (recommended for security)
    const newRefreshToken = await generateRefreshToken(user._id, ipAddress);
    
    // Revoke old refresh token
    await tokenDoc.revoke(newRefreshToken);
    
    // Log token refresh
    await AuditLog.log({
      userId: user._id,
      action: 'token_refresh',
      email: user.email,
      ipAddress,
      status: 'success'
    });
    
    return {
      accessToken,
      refreshToken: newRefreshToken
    };
  }
  
  /**
   * Logout user (revoke refresh token)
   */
  async logout({ refreshToken, userId, ipAddress }) {
    await revokeRefreshToken(refreshToken);
    
    await AuditLog.log({
      userId,
      action: 'logout',
      email: '', // Can be populated if needed
      ipAddress,
      status: 'success'
    });
  }
  
  /**
   * Get user by ID
   */
  async getUserById(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    return {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      sapId: user.sapId,
      isVerified: user.isVerified,
      createdAt: user.createdAt
    };
  }
}

module.exports = new AuthService();
