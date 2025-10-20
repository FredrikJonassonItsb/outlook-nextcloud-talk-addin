/**
 * Outlook service
 * Handles interaction with Outlook appointment items
 */

/**
 * Get current appointment item
 * @returns {Office.AppointmentCompose} Current appointment
 */
function getCurrentAppointment() {
  if (!Office.context || !Office.context.mailbox || !Office.context.mailbox.item) {
    throw new Error('No appointment item available');
  }
  return Office.context.mailbox.item;
}

/**
 * Get meeting data from current appointment
 * @returns {Promise<object>} Meeting data
 */
async function getMeetingData() {
  const item = getCurrentAppointment();
  
  return new Promise((resolve, reject) => {
    // Get all properties in parallel
    Promise.all([
      getProperty(item, 'subject'),
      getProperty(item, 'start'),
      getProperty(item, 'end'),
      getProperty(item, 'location'),
      getProperty(item, 'body'),
      getProperty(item, 'requiredAttendees'),
      getProperty(item, 'optionalAttendees')
    ])
    .then(([subject, start, end, location, body, required, optional]) => {
      const attendees = [
        ...(required || []),
        ...(optional || [])
      ].map(att => ({
        email: att.emailAddress,
        name: att.displayName,
        type: att.recipientType
      }));
      
      resolve({
        subject: subject || 'Meeting',
        start: start,
        end: end,
        location: location || '',
        body: body || '',
        attendees: attendees
      });
    })
    .catch(reject);
  });
}

/**
 * Get property from appointment item
 * @param {Office.AppointmentCompose} item - Appointment item
 * @param {string} property - Property name
 * @returns {Promise<any>} Property value
 */
function getProperty(item, property) {
  return new Promise((resolve, reject) => {
    if (property === 'body') {
      item.body.getAsync(Office.CoercionType.Text, (result) => {
        if (result.status === Office.AsyncResultStatus.Succeeded) {
          resolve(result.value);
        } else {
          reject(result.error);
        }
      });
    } else {
      item[property].getAsync((result) => {
        if (result.status === Office.AsyncResultStatus.Succeeded) {
          resolve(result.value);
        } else {
          reject(result.error);
        }
      });
    }
  });
}

/**
 * Set property on appointment item
 * @param {Office.AppointmentCompose} item - Appointment item
 * @param {string} property - Property name
 * @param {any} value - Property value
 * @returns {Promise<void>}
 */
function setProperty(item, property, value) {
  return new Promise((resolve, reject) => {
    if (property === 'body') {
      item.body.setAsync(value, { coercionType: Office.CoercionType.Text }, (result) => {
        if (result.status === Office.AsyncResultStatus.Succeeded) {
          resolve();
        } else {
          reject(result.error);
        }
      });
    } else {
      item[property].setAsync(value, (result) => {
        if (result.status === Office.AsyncResultStatus.Succeeded) {
          resolve();
        } else {
          reject(result.error);
        }
      });
    }
  });
}

/**
 * Add Nextcloud Talk meeting to appointment
 * @param {string} talkUrl - Nextcloud Talk meeting URL
 * @param {string} roomName - Room name
 * @returns {Promise<void>}
 */
async function addTalkMeetingToAppointment(talkUrl, roomName) {
  try {
    const item = getCurrentAppointment();
    
    // Get current body
    const currentBody = await getProperty(item, 'body');
    
    // Remove Teams meeting information if present
    const cleanedBody = removeTeamsMeetingInfo(currentBody);
    
    // Build new body with Talk meeting info
    const meetingText = buildMeetingText(talkUrl, roomName);
    const newBody = cleanedBody ? `${cleanedBody}\n\n${meetingText}` : meetingText;
    
    // Update body
    await setProperty(item, 'body', newBody);
    
    // Update location
    const locationText = t('meeting.location');
    await setProperty(item, 'location', locationText);
    
  } catch (error) {
    console.error('addTalkMeetingToAppointment error:', error);
    throw error;
  }
}

/**
 * Remove Teams meeting information from body text
 * @param {string} body - Original body text
 * @returns {string} Cleaned body text
 */
function removeTeamsMeetingInfo(body) {
  if (!body) return '';
  
  // Patterns to match Teams meeting information
  const teamsPatterns = [
    /Microsoft Teams Meeting[\s\S]*?________________________________________________________________________________/gi,
    /Join Microsoft Teams Meeting[\s\S]*?Learn more \| Meeting options/gi,
    /Click here to join the meeting[\s\S]*?Learn More \| Meeting options/gi,
    /________________________________________________________________________________/g,
    /<https:\/\/teams\.microsoft\.com\/l\/meetup-join\/[^>]+>/g,
    /https:\/\/teams\.microsoft\.com\/l\/meetup-join\/[^\s]+/g,
    /Conference ID:.*?\n/g,
    /Dial-in Numbers.*?\n/g
  ];
  
  let cleaned = body;
  teamsPatterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });
  
  // Clean up extra whitespace
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();
  
  return cleaned;
}

/**
 * Build meeting text for appointment body
 * @param {string} talkUrl - Nextcloud Talk URL
 * @param {string} roomName - Room name
 * @returns {string} Formatted meeting text
 */
function buildMeetingText(talkUrl, roomName) {
  const prefix = t('meeting.bodyPrefix');
  const instructions = t('meeting.bodyInstructions');
  
  let text = '________________________________________________________________________________\n\n';
  text += `${roomName}\n\n`;
  text += `${prefix}\n`;
  text += `${talkUrl}\n\n`;
  text += `${instructions}\n`;
  text += '________________________________________________________________________________';
  
  return text;
}

/**
 * Check if appointment has Teams meeting
 * @returns {Promise<boolean>} True if Teams meeting exists
 */
async function hasTeamsMeeting() {
  try {
    const item = getCurrentAppointment();
    const body = await getProperty(item, 'body');
    
    return body && (
      body.includes('teams.microsoft.com') ||
      body.includes('Microsoft Teams Meeting') ||
      body.includes('Join Microsoft Teams Meeting')
    );
  } catch (error) {
    console.error('hasTeamsMeeting error:', error);
    return false;
  }
}

/**
 * Validate appointment for Talk meeting creation
 * @returns {Promise<object>} Validation result
 */
async function validateAppointment() {
  try {
    const data = await getMeetingData();
    
    const errors = [];
    
    if (!data.subject || data.subject.trim() === '') {
      errors.push('Meeting subject is required');
    }
    
    if (!data.start) {
      errors.push('Meeting start time is required');
    }
    
    if (!data.end) {
      errors.push('Meeting end time is required');
    }
    
    if (data.start && data.end && data.start >= data.end) {
      errors.push('Meeting end time must be after start time');
    }
    
    return {
      valid: errors.length === 0,
      errors: errors,
      data: data
    };
  } catch (error) {
    console.error('validateAppointment error:', error);
    return {
      valid: false,
      errors: ['Failed to validate appointment'],
      data: null
    };
  }
}

/**
 * Show notification to user
 * @param {string} message - Notification message
 * @param {string} type - Notification type (info, error, success)
 */
function showNotification(message, type = 'info') {
  if (Office.context.mailbox && Office.context.mailbox.item) {
    const notificationMessages = Office.context.mailbox.item.notificationMessages;
    
    const key = `notification_${Date.now()}`;
    const icon = type === 'error' ? 'Icon.80x80' : 'Icon.80x80';
    
    notificationMessages.addAsync(key, {
      type: Office.MailboxEnums.ItemNotificationMessageType.InformationalMessage,
      message: message,
      icon: icon,
      persistent: false
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      notificationMessages.removeAsync(key);
    }, 5000);
  }
}

/**
 * Show progress indicator
 * @param {string} message - Progress message
 * @returns {string} Progress key for removal
 */
function showProgress(message) {
  if (Office.context.mailbox && Office.context.mailbox.item) {
    const notificationMessages = Office.context.mailbox.item.notificationMessages;
    const key = `progress_${Date.now()}`;
    
    notificationMessages.addAsync(key, {
      type: Office.MailboxEnums.ItemNotificationMessageType.ProgressIndicator,
      message: message
    });
    
    return key;
  }
  return null;
}

/**
 * Hide progress indicator
 * @param {string} key - Progress key
 */
function hideProgress(key) {
  if (key && Office.context.mailbox && Office.context.mailbox.item) {
    const notificationMessages = Office.context.mailbox.item.notificationMessages;
    notificationMessages.removeAsync(key);
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getCurrentAppointment,
    getMeetingData,
    addTalkMeetingToAppointment,
    removeTeamsMeetingInfo,
    hasTeamsMeeting,
    validateAppointment,
    showNotification,
    showProgress,
    hideProgress
  };
}

