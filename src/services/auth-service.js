/**
 * Authentication service for Nextcloud OAuth2/OIDC
 */

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated
 */
function isAuthenticated() {
  const tokens = getTokens();
  return tokens && !tokens.isExpired;
}

/**
 * Get current access token
 * @returns {string|null} Access token or null
 */
function getAccessToken() {
  const tokens = getTokens();
  if (!tokens) return null;
  
  if (tokens.isExpired) {
    // Token expired, need to refresh
    return null;
  }
  
  return tokens.accessToken;
}

/**
 * Initiate OAuth2 login flow
 * @param {string} serverUrl - Nextcloud server URL
 * @returns {Promise<void>}
 */
async function login(serverUrl) {
  try {
    // Save server URL
    await saveServerUrl(serverUrl);
    
    // Build authorization URL
    const authUrl = buildAuthUrl(serverUrl);
    
    // Open authentication dialog
    return new Promise((resolve, reject) => {
      Office.context.ui.displayDialogAsync(
        authUrl,
        { height: 60, width: 30 },
        (result) => {
          if (result.status === Office.AsyncResultStatus.Failed) {
            reject(new Error('Failed to open login dialog'));
            return;
          }
          
          const dialog = result.value;
          
          // Listen for messages from dialog
          dialog.addEventHandler(Office.EventType.DialogMessageReceived, async (arg) => {
            try {
              const response = JSON.parse(arg.message);
              
              if (response.error) {
                dialog.close();
                reject(new Error(response.error));
                return;
              }
              
              if (response.code) {
                // Exchange authorization code for tokens
                const tokens = await exchangeCodeForTokens(serverUrl, response.code);
                await saveTokens(tokens);
                
                // Get user profile
                const profile = await getUserProfile(serverUrl, tokens.accessToken);
                await saveUserProfile(profile);
                
                dialog.close();
                resolve();
              }
            } catch (error) {
              dialog.close();
              reject(error);
            }
          });
          
          // Handle dialog closed
          dialog.addEventHandler(Office.EventType.DialogEventReceived, (arg) => {
            if (arg.error === 12006) {
              // User closed dialog
              reject(new Error('Login cancelled'));
            }
          });
        }
      );
    });
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

/**
 * Build OAuth2 authorization URL
 * @param {string} serverUrl - Nextcloud server URL
 * @returns {string} Authorization URL
 */
function buildAuthUrl(serverUrl) {
  const params = new URLSearchParams({
    client_id: CONFIG.oauth.clientId,
    redirect_uri: CONFIG.oauth.redirectUri,
    response_type: CONFIG.oauth.responseType,
    scope: CONFIG.oauth.scope
  });
  
  return `${serverUrl}${CONFIG.nextcloud.endpoints.oauth.authorize}?${params.toString()}`;
}

/**
 * Exchange authorization code for access tokens
 * @param {string} serverUrl - Nextcloud server URL
 * @param {string} code - Authorization code
 * @returns {Promise<object>} Token response
 */
async function exchangeCodeForTokens(serverUrl, code) {
  const tokenUrl = `${serverUrl}${CONFIG.nextcloud.endpoints.oauth.token}`;
  
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    client_id: CONFIG.oauth.clientId,
    client_secret: CONFIG.oauth.clientSecret,
    redirect_uri: CONFIG.oauth.redirectUri
  });
  
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });
  
  if (!response.ok) {
    throw new Error('Failed to exchange code for tokens');
  }
  
  const data = await response.json();
  
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in || 3600
  };
}

/**
 * Refresh access token using refresh token
 * @param {string} serverUrl - Nextcloud server URL
 * @returns {Promise<object>} New token response
 */
async function refreshAccessToken(serverUrl) {
  const tokens = getTokens();
  if (!tokens || !tokens.refreshToken) {
    throw new Error('No refresh token available');
  }
  
  const tokenUrl = `${serverUrl}${CONFIG.nextcloud.endpoints.oauth.token}`;
  
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: tokens.refreshToken,
    client_id: CONFIG.oauth.clientId,
    client_secret: CONFIG.oauth.clientSecret
  });
  
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });
  
  if (!response.ok) {
    // Refresh failed, need to login again
    await clearTokens();
    throw new Error('Token refresh failed');
  }
  
  const data = await response.json();
  
  const newTokens = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || tokens.refreshToken,
    expiresIn: data.expires_in || 3600
  };
  
  await saveTokens(newTokens);
  return newTokens;
}

/**
 * Get user profile from Nextcloud
 * @param {string} serverUrl - Nextcloud server URL
 * @param {string} accessToken - Access token
 * @returns {Promise<object>} User profile
 */
async function getUserProfile(serverUrl, accessToken) {
  const response = await fetch(`${serverUrl}/ocs/v2.php/cloud/user?format=json`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'OCS-APIRequest': 'true'
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to get user profile');
  }
  
  const data = await response.json();
  return data.ocs.data;
}

/**
 * Logout and clear all authentication data
 */
async function logout() {
  await clearTokens();
  await removeItem('nc_user_profile');
}

/**
 * Get authenticated API headers
 * @returns {Promise<object>} Headers object
 */
async function getAuthHeaders() {
  let accessToken = getAccessToken();
  
  if (!accessToken) {
    // Try to refresh token
    const serverUrl = getServerUrl();
    if (serverUrl) {
      try {
        const tokens = await refreshAccessToken(serverUrl);
        accessToken = tokens.accessToken;
      } catch (error) {
        throw new Error('Authentication required');
      }
    } else {
      throw new Error('Authentication required');
    }
  }
  
  return {
    'Authorization': `Bearer ${accessToken}`,
    'OCS-APIRequest': 'true',
    'Content-Type': 'application/json'
  };
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    isAuthenticated,
    getAccessToken,
    login,
    logout,
    refreshAccessToken,
    getAuthHeaders
  };
}

