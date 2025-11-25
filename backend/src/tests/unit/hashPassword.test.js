// ==========================================
// tests/unit/hashPassword.test.js
// ==========================================
const { hashPassword, comparePassword } = require('../../src/utils/hashPassword');

describe('Password Hashing Utilities', () => {
  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      const password = 'Test@1234';
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash).not.toBe(password); // Hash should be different from plain text
      expect(hash.length).toBeGreaterThan(50); // bcrypt hashes are typically 60 chars
    });
    
    it('should generate different hashes for the same password', async () => {
      const password = 'Test@1234';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      expect(hash1).not.toBe(hash2); // Different salts should produce different hashes
    });
    
    it('should handle empty string', async () => {
      const password = '';
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
    });
  });
  
  describe('comparePassword', () => {
    it('should return true for matching password and hash', async () => {
      const password = 'Test@1234';
      const hash = await hashPassword(password);
      
      const isMatch = await comparePassword(password, hash);
      
      expect(isMatch).toBe(true);
    });
    
    it('should return false for non-matching password', async () => {
      const correctPassword = 'Test@1234';
      const wrongPassword = 'Wrong@5678';
      const hash = await hashPassword(correctPassword);
      
      const isMatch = await comparePassword(wrongPassword, hash);
      
      expect(isMatch).toBe(false);
    });
    
    it('should return false for empty password against valid hash', async () => {
      const password = 'Test@1234';
      const hash = await hashPassword(password);
      
      const isMatch = await comparePassword('', hash);
      
      expect(isMatch).toBe(false);
    });
    
    it('should be case-sensitive', async () => {
      const password = 'Test@1234';
      const hash = await hashPassword(password);
      
      const isMatchLower = await comparePassword('test@1234', hash);
      const isMatchUpper = await comparePassword('TEST@1234', hash);
      
      expect(isMatchLower).toBe(false);
      expect(isMatchUpper).toBe(false);
    });
  });
});


// ==========================================
// tests/unit/generateToken.test.js
// ==========================================
const {
  generateAccessToken,
  verifyAccessToken
} = require('../../src/utils/generateToken');

// Mock environment variables for testing
process.env.JWT_ACCESS_SECRET = 'test-secret-key-for-access-token';
process.env.JWT_ACCESS_EXPIRY = '15m';

describe('Token Generation Utilities', () => {
  describe('generateAccessToken', () => {
    it('should generate a valid JWT token', () => {
      const payload = {
        userId: '123456',
        email: 'test@example.com',
        role: 'student'
      };
      
      const token = generateAccessToken(payload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts: header.payload.signature
    });
    
    it('should encode payload data correctly', () => {
      const payload = {
        userId: '123456',
        email: 'test@example.com',
        role: 'student'
      };
      
      const token = generateAccessToken(payload);
      const decoded = verifyAccessToken(token);
      
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
      expect(decoded.iat).toBeDefined(); // Issued at timestamp
      expect(decoded.exp).toBeDefined(); // Expiry timestamp
    });
    
    it('should include expiry time', () => {
      const payload = { userId: '123456' };
      const token = generateAccessToken(payload);
      const decoded = verifyAccessToken(token);
      
      const expiryTime = decoded.exp - decoded.iat;
      expect(expiryTime).toBe(15 * 60); // 15 minutes in seconds
    });
  });
  
  describe('verifyAccessToken', () => {
    it('should verify a valid token', () => {
      const payload = {
        userId: '123456',
        email: 'test@example.com',
        role: 'admin'
      };
      
      const token = generateAccessToken(payload);
      const decoded = verifyAccessToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(payload.userId);
    });
    
    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.jwt.token';
      
      expect(() => {
        verifyAccessToken(invalidToken);
      }).toThrow('Invalid access token');
    });
    
    it('should throw error for token with wrong secret', () => {
      // Generate token with different secret
      const jwt = require('jsonwebtoken');
      const token = jwt.sign({ userId: '123' }, 'wrong-secret', { expiresIn: '15m' });
      
      expect(() => {
        verifyAccessToken(token);
      }).toThrow('Invalid access token');
    });
    
    it('should throw error for expired token', () => {
      const jwt = require('jsonwebtoken');
      const expiredToken = jwt.sign(
        { userId: '123' },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: '-1s' } // Already expired
      );
      
      expect(() => {
        verifyAccessToken(expiredToken);
      }).toThrow('Access token has expired');
    });
  });
});


// ==========================================
// jest.config.js (place in root directory)
// ==========================================
module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/config/**'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};


// ==========================================
// tests/setup.js
// ==========================================
// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test-access-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.JWT_ACCESS_EXPIRY = '15m';
process.env.JWT_REFRESH_EXPIRY = '7d';

// Increase timeout for async operations
jest.setTimeout(10000);