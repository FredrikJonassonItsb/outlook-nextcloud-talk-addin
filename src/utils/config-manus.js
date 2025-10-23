/**
 * Configuration for Manus-hosted version
 * Uses Manus mock Nextcloud server
 */

const CONFIG = {
  // App information
  app: {
    name: 'Nextcloud Talk for Outlook',
    version: '2.0.0',
    author: 'ITSL Solutions'
  },
  
  // Nextcloud server configuration
  nextcloud: {
    // Default server URL (Manus mock server)
    defaultServerUrl: 'https://8080-i19k15v7d0ztobjy150hx-5c517f08.manusvm.computer',
    
    // OAuth2 configuration
    oauth: {
      clientId: 'e9KdrQVdvNLeyDv9TjhfFLZ4sWwe8LzyMXpzbB8PcVIEvjVNvKkAaRaxesXNBOeB',
      clientSecret: 'Y2AkOMa5D9dm4PsFy6GGwe1ejbIukX5K65obDL6c0uq9wuZUHzqctZMGIU5DJ3V8',
      redirectUri: 'https://fredrikjonassonitsb.github.io/outlook-nextcloud-talk-addin/src/taskpane/callback.html',
      scope: 'openid profile email',
      responseType: 'code'
    },
    
    // API endpoints
    api: {
      authorize: '/apps/oauth2/authorize',
      token: '/apps/oauth2/api/v1/token',
      userProfile: '/ocs/v2.php/cloud/user',
      talkRooms: '/ocs/v2.php/apps/spreed/api/v4/room'
    }
  },
  
  // Meeting configuration
  meeting: {
    // Default meeting settings
    defaultRoomType: 3, // 3 = public room
    defaultLobbyState: 0, // 0 = no lobby
    
    // Security settings
    enablePassword: false,
    enableWaitingRoom: false,
    
    // Participant permissions
    defaultPermissions: {
      canStartCall: true,
      canPublishAudio: true,
      canPublishVideo: true,
      canPublishScreen: true
    }
  },
  
  // UI configuration
  ui: {
    defaultLanguage: 'sv',
    supportedLanguages: ['sv', 'en'],
    theme: 'light'
  },
  
  // Feature flags
  features: {
    removeTeamsLinks: true,
    autoAddMeetingLink: true,
    participantSpecificSecurity: true,
    multiLanguageSupport: true
  },
  
  // Debug mode
  debug: true
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}

