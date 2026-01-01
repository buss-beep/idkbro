/**
 * Heartbeat script for SuperTrip online status tracking
 * This runs independently of the React app to maintain online status
 */

// Configuration
const API_BASE_URL = "";
const HEARTBEAT_INTERVAL = 30000; // 30 seconds
let heartbeatTimer = null;

// Start the heartbeat polling when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
  startHeartbeat();
  
  // Also restart heartbeat when document becomes visible again
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      console.log('Document became visible, restarting heartbeat');
      startHeartbeat();
    } else {
      console.log('Document hidden, pausing heartbeat');
      stopHeartbeat();
    }
  });
});

/**
 * Start sending heartbeats to the server
 */
function startHeartbeat() {
  // Clear any existing timer
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
  }
  
  // Send initial heartbeat immediately
  sendHeartbeat();
  
  // Set up interval for regular heartbeats
  heartbeatTimer = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);
  console.log('Heartbeat started with interval:', HEARTBEAT_INTERVAL, 'ms');
}

/**
 * Stop sending heartbeats
 */
function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
    console.log('Heartbeat stopped');
  }
}

/**
 * Send a single heartbeat to the server
 */
async function sendHeartbeat() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/heartbeat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Include credentials to send cookies with the request
      credentials: 'include',
      body: JSON.stringify({})
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Heartbeat successful:', new Date(data.timestamp * 1000).toLocaleTimeString());
    } else {
      console.warn('Heartbeat failed:', response.status, response.statusText);
      // If unauthorized, we might want to stop heartbeat
      if (response.status === 401) {
        console.warn('User not authenticated, stopping heartbeat');
        stopHeartbeat();
      }
    }
  } catch (error) {
    console.error('Error sending heartbeat:', error);
  }
}