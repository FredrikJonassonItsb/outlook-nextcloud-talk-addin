/**
 * Taskpane main logic
 */

let currentMeetingData = null;
let attendeeSettings = {};

// Initialize when Office is ready
Office.onReady((info) => {
  if (info.host === Office.HostType.Outlook) {
    initializeTaskpane();
  }
});

/**
 * Initialize taskpane
 */
async function initializeTaskpane() {
  try {
    // Initialize i18n
    initI18n();
    
    // Translate UI
    translateUI();
    
    // Check authentication status
    const authenticated = isAuthenticated();
    
    if (authenticated) {
      await showMainView();
    } else {
      showLoginView();
    }
    
    // Setup event listeners
    setupEventListeners();
    
    // Hide loading view
    hideView('loadingView');
    
  } catch (error) {
    console.error('Initialization error:', error);
    showError(t('error.unknown'));
    hideView('loadingView');
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Login button
  document.getElementById('loginButton')?.addEventListener('click', handleLogin);
  
  // Logout button
  document.getElementById('logoutButton')?.addEventListener('click', handleLogout);
  
  // Add meeting button
  document.getElementById('addMeetingButton')?.addEventListener('click', handleAddMeeting);
}

/**
 * Translate UI elements
 */
function translateUI() {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    element.textContent = t(key);
  });
}

/**
 * Show login view
 */
function showLoginView() {
  hideView('loadingView');
  hideView('mainView');
  showView('loginView');
  
  // Load saved server URL
  const savedUrl = getServerUrl();
  if (savedUrl) {
    document.getElementById('serverUrl').value = savedUrl;
  } else {
    document.getElementById('serverUrl').value = CONFIG.nextcloud.serverUrl;
  }
}

/**
 * Show main view
 */
async function showMainView() {
  try {
    hideView('loadingView');
    hideView('loginView');
    
    // Load user profile
    const profile = getUserProfile();
    if (profile) {
      document.getElementById('userName').textContent = profile.displayname || profile.id;
    }
    
    // Load meeting data
    await loadMeetingData();
    
    showView('mainView');
    
  } catch (error) {
    console.error('Show main view error:', error);
    showError(t('error.unknown'));
  }
}

/**
 * Load meeting data from Outlook
 */
async function loadMeetingData() {
  try {
    const validation = await validateAppointment();
    
    if (!validation.valid) {
      showError(validation.errors.join(', '));
      return;
    }
    
    currentMeetingData = validation.data;
    
    // Display meeting info
    document.getElementById('meetingTitle').textContent = currentMeetingData.subject;
    document.getElementById('meetingStart').textContent = formatDateTime(currentMeetingData.start);
    document.getElementById('meetingEnd').textContent = formatDateTime(currentMeetingData.end);
    document.getElementById('meetingAttendees').textContent = currentMeetingData.attendees.length;
    
    // Build attendee list
    buildAttendeeList(currentMeetingData.attendees);
    
  } catch (error) {
    console.error('Load meeting data error:', error);
    showError(t('error.missingData'));
  }
}

/**
 * Build attendee list with security settings
 */
function buildAttendeeList(attendees) {
  const container = document.getElementById('attendeeList');
  container.innerHTML = '';
  
  if (!attendees || attendees.length === 0) {
    container.innerHTML = '<p class="instruction">No attendees</p>';
    return;
  }
  
  attendees.forEach((attendee, index) => {
    const item = createAttendeeItem(attendee, index);
    container.appendChild(item);
    
    // Initialize default settings
    attendeeSettings[attendee.email] = {
      authLevel: 'none',
      secureEmail: false,
      personnummer: '',
      smsNumber: '',
      notification: 'email'
    };
  });
}

/**
 * Create attendee item element
 */
function createAttendeeItem(attendee, index) {
  const div = document.createElement('div');
  div.className = 'attendee-item';
  div.innerHTML = `
    <div class="attendee-header">
      <span>${attendee.name || attendee.email}</span>
      <span class="attendee-email">${attendee.email}</span>
    </div>
    <div class="attendee-fields">
      <div class="form-group">
        <label>${t('label.authLevel')}</label>
        <select class="select auth-level" data-email="${attendee.email}">
          <option value="none">${t('auth.none')}</option>
          <option value="sms">${t('auth.sms')}</option>
          <option value="loa3">${t('auth.loa3')}</option>
        </select>
      </div>
      
      <div class="form-group">
        <label>
          <input type="checkbox" class="checkbox secure-email" data-email="${attendee.email}">
          ${t('label.secureEmail')}
        </label>
      </div>
      
      <div class="form-group">
        <label>${t('label.personnummer')}</label>
        <input type="text" class="input personnummer" data-email="${attendee.email}" 
               placeholder="YYYYMMDD-XXXX" disabled>
      </div>
      
      <div class="form-group">
        <label>${t('label.smsNumber')}</label>
        <input type="tel" class="input sms-number" data-email="${attendee.email}" 
               placeholder="+46701234567" disabled>
      </div>
      
      <div class="form-group">
        <label>${t('label.notification')}</label>
        <select class="select notification" data-email="${attendee.email}">
          <option value="email">${t('notification.email')}</option>
          <option value="email+sms">${t('notification.emailSms')}</option>
        </select>
      </div>
    </div>
  `;
  
  // Add event listeners for dynamic field enabling/disabling
  const authSelect = div.querySelector('.auth-level');
  const secureCheckbox = div.querySelector('.secure-email');
  const personnummerInput = div.querySelector('.personnummer');
  const smsNumberInput = div.querySelector('.sms-number');
  const notificationSelect = div.querySelector('.notification');
  
  authSelect.addEventListener('change', (e) => {
    updateAttendeeSettings(attendee.email);
    updateFieldStates(attendee.email, div);
  });
  
  secureCheckbox.addEventListener('change', (e) => {
    updateAttendeeSettings(attendee.email);
    updateFieldStates(attendee.email, div);
  });
  
  notificationSelect.addEventListener('change', (e) => {
    updateAttendeeSettings(attendee.email);
    updateFieldStates(attendee.email, div);
  });
  
  personnummerInput.addEventListener('input', () => updateAttendeeSettings(attendee.email));
  smsNumberInput.addEventListener('input', () => updateAttendeeSettings(attendee.email));
  
  return div;
}

/**
 * Update field states based on selections
 */
function updateFieldStates(email, container) {
  const authLevel = container.querySelector('.auth-level').value;
  const secureEmail = container.querySelector('.secure-email').checked;
  const notification = container.querySelector('.notification').value;
  
  const personnummerInput = container.querySelector('.personnummer');
  const smsNumberInput = container.querySelector('.sms-number');
  
  // Enable personnummer if LOA-3 or secure email
  personnummerInput.disabled = !(authLevel === 'loa3' || secureEmail);
  
  // Enable SMS number if SMS auth or email+sms notification
  smsNumberInput.disabled = !(authLevel === 'sms' || notification === 'email+sms');
}

/**
 * Update attendee settings from form
 */
function updateAttendeeSettings(email) {
  const container = document.querySelector(`[data-email="${email}"]`)?.closest('.attendee-item');
  if (!container) return;
  
  attendeeSettings[email] = {
    authLevel: container.querySelector('.auth-level').value,
    secureEmail: container.querySelector('.secure-email').checked,
    personnummer: container.querySelector('.personnummer').value,
    smsNumber: container.querySelector('.sms-number').value,
    notification: container.querySelector('.notification').value
  };
}

/**
 * Handle login
 */
async function handleLogin() {
  try {
    const serverUrl = document.getElementById('serverUrl').value.trim();
    
    if (!serverUrl) {
      showError(t('error.invalidServer'), 'loginError');
      return;
    }
    
    // Validate server URL format
    if (!serverUrl.startsWith('http://') && !serverUrl.startsWith('https://')) {
      showError(t('error.invalidServer'), 'loginError');
      return;
    }
    
    // Test connection
    showStatus(t('status.authenticating'), 'loginError');
    const connected = await testConnection(serverUrl);
    
    if (!connected) {
      showError(t('error.connection'), 'loginError');
      return;
    }
    
    // Initiate login
    await login(serverUrl);
    
    // Show main view
    await showMainView();
    
  } catch (error) {
    console.error('Login error:', error);
    showError(error.message || t('error.authentication'), 'loginError');
  }
}

/**
 * Handle logout
 */
async function handleLogout() {
  try {
    await logout();
    showLoginView();
  } catch (error) {
    console.error('Logout error:', error);
    showError(t('error.unknown'));
  }
}

/**
 * Handle add meeting
 */
async function handleAddMeeting() {
  try {
    if (!currentMeetingData) {
      showError(t('error.missingData'));
      return;
    }
    
    // Disable button
    const button = document.getElementById('addMeetingButton');
    button.disabled = true;
    
    // Show progress
    showStatus(t('status.creating'));
    
    // Create Talk room
    const room = await createTalkRoom({
      roomName: currentMeetingData.subject,
      roomType: CONFIG.meeting.defaultRoomType
    });
    
    showStatus(t('status.creatingCalendar'));
    
    // Prepare attendees with settings
    const attendeesWithSettings = currentMeetingData.attendees.map(att => ({
      ...att,
      ...attendeeSettings[att.email]
    }));
    
    // Create calendar event
    await createCalendarEvent({
      summary: currentMeetingData.subject,
      start: currentMeetingData.start,
      end: currentMeetingData.end,
      attendees: attendeesWithSettings,
      talkUrl: room.url,
      description: `${t('meeting.bodyPrefix')}\n${room.url}`
    });
    
    // Add to Outlook appointment
    await addTalkMeetingToAppointment(room.url, room.name);
    
    // Show success
    showStatus(t('status.success'));
    
    // Show notification in Outlook
    showNotification(t('status.success'), 'success');
    
    // Re-enable button after delay
    setTimeout(() => {
      button.disabled = false;
    }, 2000);
    
  } catch (error) {
    console.error('Add meeting error:', error);
    showError(error.message || t('error.createRoom'));
    
    // Re-enable button
    document.getElementById('addMeetingButton').disabled = false;
  }
}

/**
 * Format date time for display
 */
function formatDateTime(date) {
  if (!date) return '-';
  
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return new Date(date).toLocaleString(getLocale(), options);
}

/**
 * Show view
 */
function showView(viewId) {
  document.getElementById(viewId).style.display = 'block';
}

/**
 * Hide view
 */
function hideView(viewId) {
  document.getElementById(viewId).style.display = 'none';
}

/**
 * Show status message
 */
function showStatus(message, containerId = 'statusMessage') {
  const container = document.getElementById(containerId);
  container.textContent = message;
  container.style.display = 'block';
  
  // Hide error
  document.getElementById('errorMessage').style.display = 'none';
}

/**
 * Show error message
 */
function showError(message, containerId = 'errorMessage') {
  const container = document.getElementById(containerId);
  container.textContent = message;
  container.style.display = 'block';
  
  // Hide status
  if (containerId === 'errorMessage') {
    document.getElementById('statusMessage').style.display = 'none';
  }
}

