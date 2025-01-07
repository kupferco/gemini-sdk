// tests/SessionManager.test.js
import SessionManager from '../src/session/SessionManager';
import { v4 as uuidv4 } from 'uuid';

jest.mock('uuid', () => ({
    v4: jest.fn(() => 'mock-uuid'),
}));

// Mock localStorage for the Node.js environment
beforeAll(() => {
    global.localStorage = {
        store: {},
        getItem: jest.fn((key) => global.localStorage.store[key] || null),
        setItem: jest.fn((key, value) => {
            global.localStorage.store[key] = value.toString();
        }),
        removeItem: jest.fn((key) => {
            delete global.localStorage.store[key];
        }),
        clear: jest.fn(() => {
            global.localStorage.store = {};
        }),
    };
});

describe('SessionManager', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    test('should initialize a new session if none exists', () => {
        const sessionId = SessionManager.initializeSession();
        expect(sessionId).toBe('mock-uuid');

        const storedData = JSON.parse(localStorage.getItem('sessionData'));
        expect(storedData.sessionId).toBe('mock-uuid');
        expect(storedData.expiresAt).toBeGreaterThan(Date.now());
    });

    test('should restore an existing valid session', () => {
        const now = Date.now();
        const validSessionData = {
            sessionId: 'existing-session-id',
            expiresAt: now + 1000 * 60 * 30, // 30 minutes from now
        };
        localStorage.setItem('sessionData', JSON.stringify(validSessionData));

        const sessionId = SessionManager.initializeSession();
        expect(sessionId).toBe('existing-session-id');
    });

    test('should generate a new session if the existing one has expired', () => {
        const now = Date.now();
        const expiredSessionData = {
            sessionId: 'expired-session-id',
            expiresAt: now - 1000, // Already expired
        };
        localStorage.setItem('sessionData', JSON.stringify(expiredSessionData));

        const sessionId = SessionManager.initializeSession();
        expect(sessionId).toBe('mock-uuid');

        const storedData = JSON.parse(localStorage.getItem('sessionData'));
        expect(storedData.sessionId).toBe('mock-uuid');
    });

    test('should throw an error if trying to get a session ID without initialization', () => {
        expect(() => SessionManager.getSessionId()).toThrow(
            'Session has not been initialized or has expired.'
        );
    });

    test('should return the current session ID if valid', () => {
        const now = Date.now();
        const validSessionData = {
            sessionId: 'valid-session-id',
            expiresAt: now + 1000 * 60 * 30, // 30 minutes from now
        };
        localStorage.setItem('sessionData', JSON.stringify(validSessionData));

        const sessionId = SessionManager.getSessionId();
        expect(sessionId).toBe('valid-session-id');
    });

    test('should renew the session ID', () => {
        const sessionId = SessionManager.renewSession();
        expect(sessionId).toBe('mock-uuid');

        const storedData = JSON.parse(localStorage.getItem('sessionData'));
        expect(storedData.sessionId).toBe('mock-uuid');
    });

    test('should clear the session', () => {
        const now = Date.now();
        const validSessionData = {
            sessionId: 'valid-session-id',
            expiresAt: now + 1000 * 60 * 30, // 30 minutes from now
        };
        localStorage.setItem('sessionData', JSON.stringify(validSessionData));

        SessionManager.clearSession();
        expect(localStorage.getItem('sessionData')).toBeNull();
    });

    test('should handle missing or invalid session data gracefully', () => {
        // Set invalid session data in localStorage
        localStorage.setItem('sessionData', 'invalid-json');
    
        // Initialize session
        const sessionId = SessionManager.initializeSession();
    
        // Expect a new session to be created
        expect(sessionId).toBeDefined();
    
        // Verify localStorage was cleaned and updated with new session data
        const storedData = JSON.parse(localStorage.getItem('sessionData'));
        expect(storedData.sessionId).toBe(sessionId);
        expect(storedData.expiresAt).toBeGreaterThan(Date.now());
    });    

});
