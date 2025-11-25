// ==========================================
// controllers/authController.js
// HTTP Layer (handles requests/responses)
// ==========================================
const authService = require('../services/authService');

class AuthController {
  /**
   * POST /auth/register
   */
  async register(req, res, next) {
    try {
      const { fullName, email, password, sapId } = req.body;
      
      const user = await authService.register({
        fullName,
        email,
        password,
        sapId
      });
      
      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * POST /auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('user-agent');
      
      const result = await authService.login({
        email,
        password,
        ipAddress,
        userAgent
      });
      
      // Set refresh token as httpOnly cookie (more secure)
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          accessToken: result.accessToken,
          user: result.user
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * POST /auth/refresh
   */
  async refresh(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      
      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token required'
        });
      }
      
      const ipAddress = req.ip || req.connection.remoteAddress;
      
      const result = await authService.refreshAccessToken({
        refreshToken,
        ipAddress
      });
      
      // Update refresh token cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
      
      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: result.accessToken
        }
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * POST /auth/logout
   */
  async logout(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      const userId = req.user.userId; // From auth middleware
      const ipAddress = req.ip || req.connection.remoteAddress;
      
      if (refreshToken) {
        await authService.logout({
          refreshToken,
          userId,
          ipAddress
        });
      }
      
      // Clear refresh token cookie
      res.clearCookie('refreshToken');
      
      res.status(200).json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * GET /auth/me
   */
  async getMe(req, res, next) {
    try {
      const userId = req.user.userId; // From auth middleware
      
      const user = await authService.getUserById(userId);
      
      res.status(200).json({
        success: true,
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();