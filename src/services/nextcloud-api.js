/**
 * Nextcloud API service
 * Handles communication with Nextcloud Talk and Calendar APIs
 */

/**
 * Create a Nextcloud Talk room
 * @param {object} options - Room options
 * @param {string} options.roomName - Name of the room
 * @param {number} options.roomType - Room type (3 = public)
 * @returns {Promise<object>} Room data with token and URL
 */
async function createTalkRoom(options) {
  try {
    const serverUrl = getServerUrl();
    if (!serverUrl) {
      throw new Error('Nextcloud server URL not configured');
    }
    
    const headers = await getAuthHeaders();
    
    const body = {
      roomType: options.roomType || CONFIG.meeting.defaultRoomType,
      roomName: options.roomName || 'Meeting'
    };
    
    const response = await fetch(
      `${serverUrl}${CONFIG.nextcloud.endpoints.talkRoom}`,
      {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body)
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Create room error:', errorText);
      throw new Error('Failed to create Talk room');
    }
    
    const data = await response.json();
    const room = data.ocs.data;
    
    return {
      token: room.token,
      name: room.name || room.displayName,
      url: `${serverUrl}/call/${room.token}`,
      roomId: room.id
    };
  } catch (error) {
    console.error('createTalkRoom error:', error);
    throw error;
  }
}

/**
 * Create a calendar event in Nextcloud
 * @param {object} event - Event data
 * @param {string} event.summary - Event title
 * @param {Date} event.start - Start time
 * @param {Date} event.end - End time
 * @param {Array} event.attendees - Array of attendee objects
 * @param {string} event.talkUrl - Nextcloud Talk URL
 * @param {string} event.description - Event description
 * @returns {Promise<object>} Created event data
 */
async function createCalendarEvent(event) {
  try {
    const serverUrl = getServerUrl();
    if (!serverUrl) {
      throw new Error('Nextcloud server URL not configured');
    }
    
    const headers = await getAuthHeaders();
    headers['Content-Type'] = 'text/calendar';
    
    // Get user profile for calendar path
    const profile = getUserProfile();
    if (!profile || !profile.id) {
      throw new Error('User profile not available');
    }
    
    const username = profile.id;
    const calendar = CONFIG.nextcloud.defaultCalendar;
    const eventUid = generateUid();
    
    // Build iCalendar format
    const icsContent = buildICalendar(event, eventUid);
    
    const calendarUrl = `${serverUrl}${CONFIG.nextcloud.endpoints.calendarBase}/${username}/${calendar}/${eventUid}.ics`;
    
    const response = await fetch(calendarUrl, {
      method: 'PUT',
      headers: headers,
      body: icsContent
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Create calendar event error:', errorText);
      throw new Error('Failed to create calendar event');
    }
    
    return {
      uid: eventUid,
      url: calendarUrl
    };
  } catch (error) {
    console.error('createCalendarEvent error:', error);
    throw error;
  }
}

/**
 * Build iCalendar (ICS) format string
 * @param {object} event - Event data
 * @param {string} uid - Event UID
 * @returns {string} ICS format string
 */
function buildICalendar(event, uid) {
  const now = new Date();
  const dtstamp = formatICalDate(now);
  const dtstart = formatICalDate(event.start);
  const dtend = formatICalDate(event.end);
  
  let ics = 'BEGIN:VCALENDAR\r\n';
  ics += 'VERSION:2.0\r\n';
  ics += 'PRODID:-//Nextcloud Talk Outlook Add-in//EN\r\n';
  ics += 'BEGIN:VEVENT\r\n';
  ics += `UID:${uid}\r\n`;
  ics += `DTSTAMP:${dtstamp}\r\n`;
  ics += `DTSTART:${dtstart}\r\n`;
  ics += `DTEND:${dtend}\r\n`;
  ics += `SUMMARY:${escapeICalText(event.summary)}\r\n`;
  
  if (event.description) {
    ics += `DESCRIPTION:${escapeICalText(event.description)}\r\n`;
  }
  
  if (event.talkUrl) {
    ics += `LOCATION:${escapeICalText(event.talkUrl)}\r\n`;
    ics += `X-NC-TALK-URL:${event.talkUrl}\r\n`;
  }
  
  // Add attendees
  if (event.attendees && event.attendees.length > 0) {
    event.attendees.forEach(attendee => {
      ics += `ATTENDEE;CN=${escapeICalText(attendee.name || attendee.email)}`;
      ics += `;RSVP=TRUE:mailto:${attendee.email}\r\n`;
      
      // Add custom properties for security settings
      if (attendee.authLevel && attendee.authLevel !== 'none') {
        ics += `X-NC-ATTENDEE-AUTH-${attendee.email}:${attendee.authLevel}\r\n`;
      }
      
      if (attendee.secureEmail) {
        ics += `X-NC-ATTENDEE-SECURE-EMAIL-${attendee.email}:true\r\n`;
      }
      
      if (attendee.personnummer) {
        ics += `X-NC-ATTENDEE-PERSONNUMMER-${attendee.email}:${attendee.personnummer}\r\n`;
      }
      
      if (attendee.smsNumber) {
        ics += `X-NC-ATTENDEE-SMS-${attendee.email}:${attendee.smsNumber}\r\n`;
      }
      
      if (attendee.notification) {
        ics += `X-NC-ATTENDEE-NOTIFICATION-${attendee.email}:${attendee.notification}\r\n`;
      }
    });
  }
  
  ics += 'END:VEVENT\r\n';
  ics += 'END:VCALENDAR\r\n';
  
  return ics;
}

/**
 * Format date to iCalendar format (YYYYMMDDTHHMMSSZ)
 * @param {Date} date - Date object
 * @returns {string} Formatted date string
 */
function formatICalDate(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Escape text for iCalendar format
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeICalText(text) {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Generate unique ID for calendar event
 * @returns {string} Unique ID
 */
function generateUid() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}@outlook-nextcloud-addin`;
}

/**
 * Test Nextcloud server connection
 * @param {string} serverUrl - Server URL to test
 * @returns {Promise<boolean>} True if connection successful
 */
async function testConnection(serverUrl) {
  try {
    const response = await fetch(`${serverUrl}/status.php`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    return data.installed === true;
  } catch (error) {
    console.error('Connection test error:', error);
    return false;
  }
}

/**
 * Get Nextcloud server capabilities
 * @returns {Promise<object>} Server capabilities
 */
async function getServerCapabilities() {
  try {
    const serverUrl = getServerUrl();
    if (!serverUrl) {
      throw new Error('Nextcloud server URL not configured');
    }
    
    const headers = await getAuthHeaders();
    
    const response = await fetch(
      `${serverUrl}/ocs/v2.php/cloud/capabilities?format=json`,
      {
        method: 'GET',
        headers: headers
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to get server capabilities');
    }
    
    const data = await response.json();
    return data.ocs.data.capabilities;
  } catch (error) {
    console.error('getServerCapabilities error:', error);
    throw error;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createTalkRoom,
    createCalendarEvent,
    testConnection,
    getServerCapabilities
  };
}

