/**
 * Internationalization (i18n) utility
 * Supports Swedish (sv-SE) and English (en-US)
 */

const translations = {
  'en-US': {
    // Buttons
    'button.addMeeting': 'Add Nextcloud Talk Meeting',
    'button.cancel': 'Cancel',
    'button.save': 'Save',
    'button.login': 'Login',
    'button.logout': 'Logout',
    'button.configure': 'Configure',
    'button.close': 'Close',
    
    // Status messages
    'status.creating': 'Creating Talk room...',
    'status.creatingCalendar': 'Creating calendar event...',
    'status.success': 'Nextcloud Talk meeting added successfully',
    'status.authenticating': 'Authenticating...',
    'status.loading': 'Loading...',
    
    // Labels
    'label.serverUrl': 'Nextcloud Server URL',
    'label.meetingTitle': 'Meeting Title',
    'label.startTime': 'Start Time',
    'label.endTime': 'End Time',
    'label.attendees': 'Attendees',
    'label.location': 'Location',
    'label.attendeeSettings': 'Attendee Security Settings',
    'label.authLevel': 'Authentication Level',
    'label.secureEmail': 'Send as Secure Email',
    'label.personnummer': 'Personal Number (Personnummer)',
    'label.smsNumber': 'SMS Number',
    'label.notification': 'Notification Method',
    
    // Authentication levels
    'auth.none': 'None',
    'auth.sms': 'SMS',
    'auth.loa3': 'LOA-3 (BankID)',
    
    // Notification methods
    'notification.email': 'Email',
    'notification.emailSms': 'Email + SMS',
    
    // Errors
    'error.connection': 'Could not connect to Nextcloud server',
    'error.authentication': 'Authentication failed. Please login again.',
    'error.createRoom': 'Failed to create Talk room',
    'error.createCalendar': 'Failed to create calendar event',
    'error.invalidServer': 'Invalid Nextcloud server URL',
    'error.missingData': 'Missing required meeting data',
    'error.network': 'Network error. Please check your connection.',
    'error.timeout': 'Request timed out. Please try again.',
    'error.unknown': 'An unknown error occurred',
    
    // Instructions
    'instruction.login': 'Please login to your Nextcloud account to continue',
    'instruction.configure': 'Configure your Nextcloud server URL in settings',
    'instruction.attendeeSettings': 'Configure security settings for each attendee (optional)',
    'instruction.joinMeeting': 'Join the meeting via Nextcloud Talk',
    
    // Meeting text
    'meeting.location': 'Nextcloud Talk (online)',
    'meeting.bodyPrefix': 'Join the meeting via Nextcloud Talk:',
    'meeting.bodyInstructions': 'Click the link above to join the video meeting.',
    
    // Settings
    'settings.title': 'Nextcloud Talk Settings',
    'settings.serverUrl': 'Server URL',
    'settings.save': 'Save Settings',
    'settings.saved': 'Settings saved successfully'
  },
  
  'sv-SE': {
    // Buttons
    'button.addMeeting': 'Lägg till Nextcloud Talk-möte',
    'button.cancel': 'Avbryt',
    'button.save': 'Spara',
    'button.login': 'Logga in',
    'button.logout': 'Logga ut',
    'button.configure': 'Konfigurera',
    'button.close': 'Stäng',
    
    // Status messages
    'status.creating': 'Skapar Talk-rum...',
    'status.creatingCalendar': 'Skapar kalenderhändelse...',
    'status.success': 'Nextcloud Talk-möte har lagts till',
    'status.authenticating': 'Autentiserar...',
    'status.loading': 'Laddar...',
    
    // Labels
    'label.serverUrl': 'Nextcloud Server-URL',
    'label.meetingTitle': 'Mötestittel',
    'label.startTime': 'Starttid',
    'label.endTime': 'Sluttid',
    'label.attendees': 'Deltagare',
    'label.location': 'Plats',
    'label.attendeeSettings': 'Deltagarens säkerhetsinställningar',
    'label.authLevel': 'Autentiseringsnivå',
    'label.secureEmail': 'Skicka som säker e-post',
    'label.personnummer': 'Personnummer',
    'label.smsNumber': 'SMS-nummer',
    'label.notification': 'Notifieringsmetod',
    
    // Authentication levels
    'auth.none': 'Ingen',
    'auth.sms': 'SMS',
    'auth.loa3': 'LOA-3 (BankID)',
    
    // Notification methods
    'notification.email': 'E-post',
    'notification.emailSms': 'E-post + SMS',
    
    // Errors
    'error.connection': 'Kunde inte ansluta till Nextcloud-servern',
    'error.authentication': 'Autentisering misslyckades. Vänligen logga in igen.',
    'error.createRoom': 'Kunde inte skapa Talk-rum',
    'error.createCalendar': 'Kunde inte skapa kalenderhändelse',
    'error.invalidServer': 'Ogiltig Nextcloud server-URL',
    'error.missingData': 'Saknar nödvändig mötesdata',
    'error.network': 'Nätverksfel. Kontrollera din anslutning.',
    'error.timeout': 'Förfrågan tog för lång tid. Försök igen.',
    'error.unknown': 'Ett okänt fel uppstod',
    
    // Instructions
    'instruction.login': 'Vänligen logga in på ditt Nextcloud-konto för att fortsätta',
    'instruction.configure': 'Konfigurera din Nextcloud server-URL i inställningarna',
    'instruction.attendeeSettings': 'Konfigurera säkerhetsinställningar för varje deltagare (valfritt)',
    'instruction.joinMeeting': 'Delta i mötet via Nextcloud Talk',
    
    // Meeting text
    'meeting.location': 'Nextcloud Talk (online)',
    'meeting.bodyPrefix': 'Delta i mötet via Nextcloud Talk:',
    'meeting.bodyInstructions': 'Klicka på länken ovan för att delta i videomötet.',
    
    // Settings
    'settings.title': 'Nextcloud Talk-inställningar',
    'settings.serverUrl': 'Server-URL',
    'settings.save': 'Spara inställningar',
    'settings.saved': 'Inställningar sparade'
  }
};

// Current locale
let currentLocale = 'en-US';

/**
 * Initialize i18n with user's locale
 */
function initI18n() {
  // Try to get locale from Office context
  if (typeof Office !== 'undefined' && Office.context && Office.context.displayLanguage) {
    const officeLocale = Office.context.displayLanguage;
    if (translations[officeLocale]) {
      currentLocale = officeLocale;
    } else if (officeLocale.startsWith('sv')) {
      currentLocale = 'sv-SE';
    }
  }
  
  // Check for saved locale preference
  const savedLocale = localStorage.getItem('app_locale');
  if (savedLocale && translations[savedLocale]) {
    currentLocale = savedLocale;
  }
}

/**
 * Get translated string
 * @param {string} key - Translation key
 * @param {object} params - Optional parameters for string interpolation
 * @returns {string} Translated string
 */
function t(key, params = {}) {
  let text = translations[currentLocale]?.[key] || translations['en-US'][key] || key;
  
  // Simple parameter substitution
  Object.keys(params).forEach(param => {
    text = text.replace(`{${param}}`, params[param]);
  });
  
  return text;
}

/**
 * Get current locale
 * @returns {string} Current locale code
 */
function getLocale() {
  return currentLocale;
}

/**
 * Set locale
 * @param {string} locale - Locale code (e.g., 'en-US', 'sv-SE')
 */
function setLocale(locale) {
  if (translations[locale]) {
    currentLocale = locale;
    localStorage.setItem('app_locale', locale);
  }
}

// Initialize on load
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initI18n);
  } else {
    initI18n();
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { t, getLocale, setLocale, initI18n };
}

