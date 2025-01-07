import { v4 as uuidv4 } from 'uuid';

const SESSION_TTL = 30 * 60 * 1000; // 30 minutes in milliseconds

class SessionManager {
  constructor() {
    this.sessionDataKey = 'sessionData'; // Key to store session data in localStorage
  }

  // Retrieve session data from localStorage
  _getSessionData() {
    const sessionData = localStorage.getItem(this.sessionDataKey);
    if (!sessionData) return null;

    try {
      const { sessionId, expiresAt } = JSON.parse(sessionData);
      const now = new Date().getTime();

      // Check if the session has expired
      if (now > expiresAt) {
        localStorage.removeItem(this.sessionDataKey); // Clear expired session
        return null;
      }

      return { sessionId, expiresAt };
    } catch (error) {
      console.error('SessionManager: Failed to parse session data from localStorage:', error);
      localStorage.removeItem(this.sessionDataKey); // Clean invalid session data
      return null;
    }
  }

  // Set session data with expiration
  _setSessionData(sessionId, ttl = SESSION_TTL) {
    const now = new Date().getTime();
    const expiresAt = now + ttl;
    const sessionData = { sessionId, expiresAt };
    localStorage.setItem(this.sessionDataKey, JSON.stringify(sessionData));
  }

  // Initialize or restore a valid session
  initializeSession() {
    const sessionData = this._getSessionData();
    if (!sessionData) {
      const sessionId = uuidv4();
      this._setSessionData(sessionId);
      console.log('New session ID generated:', sessionId);
      return sessionId;
    }

    console.log('Existing session ID restored:', sessionData.sessionId);
    return sessionData.sessionId;
  }

  // Get the current session ID if it exists
  getSessionId() {
    const sessionData = this._getSessionData();
    if (!sessionData) {
      throw new Error('Session has not been initialized or has expired.');
    }
    return sessionData.sessionId;
  }


  // Renew the session ID
  renewSession() {
    const newSessionId = uuidv4();
    this._setSessionData(newSessionId);
    console.log('Session ID renewed:', newSessionId);
    return newSessionId;
  }

  // Clear the session entirely
  clearSession() {
    localStorage.removeItem(this.sessionDataKey);
    console.log('Session cleared.');
  }
}

export default new SessionManager(); // Singleton instance
