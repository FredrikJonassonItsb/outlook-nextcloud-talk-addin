/**
 * Configuration for localhost development
 * This file is used when running the add-in locally
 */

const CONFIG = {
  // Application metadata
  app: {
    name: 'Nextcloud Talk for Outlook',
    version: '2.0.0-localhost',
    author: 'ITSL Solutions'
  },
  
  // Nextcloud server configuration
  nextcloud: {
    // Default server URL - will be overridden by user input
    serverUrl: 'https://itsl2.hubs.se',
    
    // API endpoints
    apiVersion: 'v2',
    
    // Default calendar name
    defaultCalendar: 'personal'
  },
  
  // OAuth2/OIDC configuration
  oauth: {
    clientId: 'e9KdrQVdvNLeyDv9TjhfFLZ4sWwe8LzyMXpzbB8PcVIEvjVNvKkAaRaxesXNBOeB',
    clientSecret: 'Y2AkOMa5D9dm4PsFy6GGwe1ejbIukX5K65obDL6c0uq9wuZUHzqctZMGIU5DJ3V8',
    redirectUri: 'https://localhost:3000/src/taskpane/callback.html',
    scope: 'openid profile email',
    responseType: 'code'
  },
  
  // Nextcloud Talk settings
  talk: {
    // Room settings
    roomType: 'public', // or 'private'
    
    // Security settings
    enableLobby: true,
    lobbyTimer: 0, // 0 = manual start
    
    // Recording settings
    enableRecording: false
  },
  
  // Locale settings
  locale: {
    default: 'sv',
    supported: ['sv', 'en']
  },
  
  // Feature flags
  features: {
    removeTeamsLinks: true,
    participantSecurity: true,
    multiLanguage: true
  },
  
  // Development settings
  dev: {
    localhost: true,
    port: 3000,
    debugMode: true
  }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}

