/**
 * Commands for ribbon buttons
 */

// Initialize when Office is ready
Office.onReady(() => {
  // Register function commands
});

/**
 * Add Nextcloud Talk meeting command
 * This is called when the ribbon button is clicked
 */
async function addNextcloudMeeting(event) {
  try {
    // Check if authenticated
    if (!isAuthenticated()) {
      showNotification(t('instruction.login'), 'info');
      event.completed();
      return;
    }
    
    // Show progress
    const progressKey = showProgress(t('status.creating'));
    
    try {
      // Validate appointment
      const validation = await validateAppointment();
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }
      
      const meetingData = validation.data;
      
      // Create Talk room
      const room = await createTalkRoom({
        roomName: meetingData.subject,
        roomType: CONFIG.meeting.defaultRoomType
      });
      
      // Create calendar event with default settings
      const attendeesWithSettings = meetingData.attendees.map(att => ({
        ...att,
        authLevel: 'none',
        secureEmail: false,
        notification: 'email'
      }));
      
      await createCalendarEvent({
        summary: meetingData.subject,
        start: meetingData.start,
        end: meetingData.end,
        attendees: attendeesWithSettings,
        talkUrl: room.url,
        description: `${t('meeting.bodyPrefix')}\n${room.url}`
      });
      
      // Add to Outlook appointment
      await addTalkMeetingToAppointment(room.url, room.name);
      
      // Hide progress
      hideProgress(progressKey);
      
      // Show success notification
      showNotification(t('status.success'), 'success');
      
    } catch (error) {
      // Hide progress
      hideProgress(progressKey);
      
      console.error('Add meeting error:', error);
      showNotification(error.message || t('error.createRoom'), 'error');
    }
    
    event.completed();
    
  } catch (error) {
    console.error('Command error:', error);
    showNotification(t('error.unknown'), 'error');
    event.completed();
  }
}

// Register the function
Office.actions = Office.actions || {};
Office.actions.addNextcloudMeeting = addNextcloudMeeting;

