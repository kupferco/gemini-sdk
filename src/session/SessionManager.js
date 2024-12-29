import { v4 as uuidv4 } from 'uuid';

class SessionManager {
  constructor() {
    this.sessionId = null;
  }

  initializeSession() {
    if (!this.sessionId) {
      this.sessionId = uuidv4();
      console.log('Initialized new session ID:', this.sessionId);
    }
    return this.sessionId;
  }

  getSessionId() {
    if (!this.sessionId) {
      throw new Error('Session has not been initialized.');
    }
    return this.sessionId;
  }

  renewSession() {
    this.sessionId = uuidv4();
    console.log('Renewed session ID:', this.sessionId);
    return this.sessionId;
  }
}

export default new SessionManager(); // Singleton instance
