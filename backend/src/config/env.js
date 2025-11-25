// ==========================================
// config/env.js
// Environment variable utilities
// ==========================================

/**
 * Get environment variable with optional default
 */
function getEnv(key, defaultValue = undefined) {
  const value = process.env[key];
  
  if (value === undefined) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  
  return value;
}

/**
 * Get environment variable as boolean
 */
function getEnvBoolean(key, defaultValue = false) {
  const value = getEnv(key, String(defaultValue));
  return value === 'true' || value === '1';
}

/**
 * Get environment variable as number
 */
function getEnvNumber(key, defaultValue = 0) {
  const value = getEnv(key, String(defaultValue));
  const num = parseInt(value, 10);
  
  if (isNaN(num)) {
    throw new Error(`Environment variable ${key} must be a valid number`);
  }
  
  return num;
}

module.exports = {
  getEnv,
  getEnvBoolean,
  getEnvNumber
};