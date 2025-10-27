/**
 * Configuration for Nextcloud Talk Outlook Add-in v3
 * Server: dev2.hubs.se
 * Last Updated: 2025-10-25
 */

const CONFIG = {
  // Nextcloud server configuration
  nextcloud: {
    // Default server URL - should be configured by admin or user
    serverUrl: 'https://dev2.hubs.se',
    
    // API endpoints
    endpoints: {
      talkRoom: '/ocs/v2.php/apps/spreed/api/v4/room',
      calendarBase: '/remote.php/dav/calendars',
      oauth: {
        authorize: '/apps/oauth2/authorize',
        token: '/apps/oauth2/api/v1/token'
      }
    },
    
    // Default calendar name
    defaultCalendar: 'personal'
  },
  
  // OAuth2/OIDC configuration
  oauth: {
    clientId: 'wvFQ1DUrP7WOsEHhAHUHQRcb7hI2ZCP2Nyw6WsIz4NGn5lyvT7XZRQXY79sIypNI',
    clientSecret: '6gywldknzsZ3Vlglvh8i37WiuvN4vW6ReFQcLITThzfpMp3gtGTjrKkxrNZuufgo', // Configured for dev2.hubs.se
    redirectUri: 'https://fredrikjonassonitsb.github.io/outlook-nextcloud-talk-addin/src/taskpane/callback.html',
    scope: 'openid profile email',
    responseType: 'code'
  },
  
  // Application settings
  app: {
    name: 'Nextcloud Talk for Outlook v3',
    version: '3.0.0',
    defaultLocale: 'en-US',
    supportedLocales: ['en-US', 'sv-SE']
  },
  
  // Storage keys
  storage: {
    accessToken: 'nc_access_token',
    refreshToken: 'nc_refresh_token',
    tokenExpiry: 'nc_token_expiry',
    serverUrl: 'nc_server_url',
    userProfile: 'nc_user_profile',
    locale: 'app_locale'
  },
  
  // Meeting settings
  meeting: {
    defaultRoomType: 3, // Public room
    allowGuests: true,
    defaultAuthLevel: 'none', // none, sms, loa3
    defaultNotification: 'email' // email, email+sms
  },
  
  // API timeouts (milliseconds)
  timeouts: {
    api: 10000,
    auth: 30000
  }
};

// Get configuration value by path
function getConfig(path) {
  return path.split('.').reduce((obj, key) => obj?.[key], CONFIG);
}

// Set configuration value by path
function setConfig(path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((obj, key) => obj[key] = obj[key] || {}, CONFIG);
  target[lastKey] = value;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CONFIG, getConfig, setConfig };
}

