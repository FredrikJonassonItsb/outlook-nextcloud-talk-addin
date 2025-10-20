/**
 * Storage utility for secure data persistence
 * Uses Office.context.roamingSettings for add-in data
 */

/**
 * Initialize storage
 */
function initStorage() {
  return new Promise((resolve, reject) => {
    if (typeof Office !== 'undefined' && Office.context) {
      resolve();
    } else {
      reject(new Error('Office context not available'));
    }
  });
}

/**
 * Save data to roaming settings
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 */
async function setItem(key, value) {
  try {
    if (typeof Office !== 'undefined' && Office.context && Office.context.roamingSettings) {
      Office.context.roamingSettings.set(key, value);
      await Office.context.roamingSettings.saveAsync();
    } else {
      // Fallback to localStorage for testing
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (error) {
    console.error('Storage setItem error:', error);
    throw error;
  }
}

/**
 * Get data from roaming settings
 * @param {string} key - Storage key
 * @returns {any} Stored value
 */
function getItem(key) {
  try {
    if (typeof Office !== 'undefined' && Office.context && Office.context.roamingSettings) {
      return Office.context.roamingSettings.get(key);
    } else {
      // Fallback to localStorage for testing
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    }
  } catch (error) {
    console.error('Storage getItem error:', error);
    return null;
  }
}

/**
 * Remove data from roaming settings
 * @param {string} key - Storage key
 */
async function removeItem(key) {
  try {
    if (typeof Office !== 'undefined' && Office.context && Office.context.roamingSettings) {
      Office.context.roamingSettings.remove(key);
      await Office.context.roamingSettings.saveAsync();
    } else {
      // Fallback to localStorage for testing
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.error('Storage removeItem error:', error);
    throw error;
  }
}

/**
 * Clear all stored data
 */
async function clear() {
  try {
    if (typeof Office !== 'undefined' && Office.context && Office.context.roamingSettings) {
      const settings = Office.context.roamingSettings;
      const keys = Object.keys(settings.get());
      keys.forEach(key => settings.remove(key));
      await settings.saveAsync();
    } else {
      // Fallback to localStorage for testing
      localStorage.clear();
    }
  } catch (error) {
    console.error('Storage clear error:', error);
    throw error;
  }
}

/**
 * Save authentication tokens
 * @param {object} tokens - Token object with accessToken, refreshToken, expiresIn
 */
async function saveTokens(tokens) {
  const expiryTime = Date.now() + (tokens.expiresIn * 1000);
  
  await setItem('nc_access_token', tokens.accessToken);
  await setItem('nc_refresh_token', tokens.refreshToken);
  await setItem('nc_token_expiry', expiryTime);
}

/**
 * Get authentication tokens
 * @returns {object|null} Token object or null if not found
 */
function getTokens() {
  const accessToken = getItem('nc_access_token');
  const refreshToken = getItem('nc_refresh_token');
  const expiry = getItem('nc_token_expiry');
  
  if (!accessToken) {
    return null;
  }
  
  return {
    accessToken,
    refreshToken,
    expiry,
    isExpired: expiry ? Date.now() > expiry : true
  };
}

/**
 * Clear authentication tokens
 */
async function clearTokens() {
  await removeItem('nc_access_token');
  await removeItem('nc_refresh_token');
  await removeItem('nc_token_expiry');
}

/**
 * Save user profile
 * @param {object} profile - User profile data
 */
async function saveUserProfile(profile) {
  await setItem('nc_user_profile', profile);
}

/**
 * Get user profile
 * @returns {object|null} User profile or null
 */
function getUserProfile() {
  return getItem('nc_user_profile');
}

/**
 * Save Nextcloud server URL
 * @param {string} url - Server URL
 */
async function saveServerUrl(url) {
  await setItem('nc_server_url', url);
}

/**
 * Get Nextcloud server URL
 * @returns {string|null} Server URL or null
 */
function getServerUrl() {
  return getItem('nc_server_url');
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initStorage,
    setItem,
    getItem,
    removeItem,
    clear,
    saveTokens,
    getTokens,
    clearTokens,
    saveUserProfile,
    getUserProfile,
    saveServerUrl,
    getServerUrl
  };
}

