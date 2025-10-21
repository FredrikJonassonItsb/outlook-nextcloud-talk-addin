/**
 * Alternative authentication service for Nextcloud OAuth2
 * Uses external window instead of Office.context.ui.displayDialogAsync
 * This works better in some Outlook environments
 */

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated
 */
function isAuthenticatedAlt() {
  const tokens = getTokens();
  return tokens && !tokens.isExpired;
}

/**
 * Get current access token
 * @returns {string|null} Access token or null
 */
function getAccessTokenAlt() {
  const tokens = getTokens();
  if (!tokens) return null;
  
  if (tokens.isExpired) {
    return null;
  }
  
  return tokens.accessToken;
}

/**
 * Initiate OAuth2 login flow using external window
 * @param {string} serverUrl - Nextcloud server URL
 * @returns {Promise<void>}
 */
async function loginWithExternalWindow(serverUrl) {
  try {
    // Save server URL
    await saveServerUrl(serverUrl);
    
    // Build authorization URL
    const authUrl = buildAuthUrl(serverUrl);
    
    // Generate a unique state parameter for security
    const state = generateRandomString(32);
    await saveItem('oauth_state', state);
    
    const authUrlWithState = `${authUrl}&state=${state}`;
    
    // Show instructions to user
    const instructions = `
      <div style="padding: 20px; text-align: center;">
        <h3>Login to Nextcloud</h3>
        <p>Click the button below to open the login page in a new window.</p>
        <p><strong>After logging in, copy the authorization code and paste it below.</strong></p>
        <br>
        <a href="${authUrlWithState}" target="_blank" class="button button-primary" style="display: inline-block; padding: 10px 20px; background: #0082c9; color: white; text-decoration: none; border-radius: 4px;">
          Open Login Page
        </a>
        <br><br>
        <div class="form-group" style="margin-top: 20px;">
          <label for="authCode">Authorization Code:</label>
          <input type="text" id="authCode" class="input" placeholder="Paste code here" style="width: 100%; padding: 8px; margin-top: 5px;">
        </div>
        <button id="submitAuthCode" class="button button-primary" style="margin-top: 10px; padding: 10px 20px; background: #0082c9; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Submit Code
        </button>
        <div id="authError" class="error" style="display: none; margin-top: 10px; color: red;"></div>
      </div>
    `;
    
    return new Promise((resolve, reject) => {
      // Show instructions in the taskpane
      const loginView = document.getElementById('loginView');
      const originalContent = loginView.innerHTML;
      loginView.innerHTML = instructions;
      
      // Handle submit button
      document.getElementById('submitAuthCode').addEventListener('click', async () => {
        const code = document.getElementById('authCode').value.trim();
        
        if (!code) {
          document.getElementById('authError').textContent = 'Please enter the authorization code';
          document.getElementById('authError').style.display = 'block';
          return;
        }
        
        try {
          // Exchange code for tokens
          const tokens = await exchangeCodeForTokens(serverUrl, code);
          await saveTokens(tokens);
          
          // Get user profile
          const profile = await getUserProfile(serverUrl, tokens.accessToken);
          await saveUserProfile(profile);
          
          // Restore original content
          loginView.innerHTML = originalContent;
          
          resolve();
        } catch (error) {
          console.error('Token exchange error:', error);
          document.getElementById('authError').textContent = 'Invalid authorization code. Please try again.';
          document.getElementById('authError').style.display = 'block';
        }
      });
    });
    
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

/**
 * Initiate OAuth2 login flow using redirect
 * @param {string} serverUrl - Nextcloud server URL
 * @returns {Promise<void>}
 */
async function loginWithRedirect(serverUrl) {
  try {
    // Save server URL
    await saveServerUrl(serverUrl);
    
    // Generate state for security
    const state = generateRandomString(32);
    await saveItem('oauth_state', state);
    
    // Build authorization URL
    const authUrl = buildAuthUrl(serverUrl);
    const authUrlWithState = `${authUrl}&state=${state}`;
    
    // Redirect to authorization URL
    window.location.href = authUrlWithState;
    
  } catch (error) {
    console.error('Login redirect error:', error);
    throw error;
  }
}

/**
 * Handle OAuth callback after redirect
 * @returns {Promise<boolean>} True if callback was handled
 */
async function handleOAuthCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');
  const error = urlParams.get('error');
  
  if (error) {
    console.error('OAuth error:', error);
    return false;
  }
  
  if (!code) {
    return false;
  }
  
  try {
    // Verify state
    const savedState = await getItem('oauth_state');
    if (state !== savedState) {
      throw new Error('Invalid state parameter');
    }
    
    // Get server URL
    const serverUrl = getServerUrl();
    if (!serverUrl) {
      throw new Error('Server URL not found');
    }
    
    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(serverUrl, code);
    await saveTokens(tokens);
    
    // Get user profile
    const profile = await getUserProfile(serverUrl, tokens.accessToken);
    await saveUserProfile(profile);
    
    // Clean up
    await removeItem('oauth_state');
    
    // Redirect back to clean URL
    window.location.href = window.location.pathname;
    
    return true;
    
  } catch (error) {
    console.error('OAuth callback error:', error);
    return false;
  }
}

/**
 * Generate random string for state parameter
 * @param {number} length - Length of string
 * @returns {string} Random string
 */
function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    isAuthenticatedAlt,
    getAccessTokenAlt,
    loginWithExternalWindow,
    loginWithRedirect,
    handleOAuthCallback
  };
}

