declare const _default: SessionManager;
export default _default;
declare class SessionManager {
    sessionDataKey: string;
    _getSessionData(): {
        sessionId: any;
        expiresAt: any;
    } | null;
    _setSessionData(sessionId: any, ttl?: number): void;
    initializeSession(): any;
    getSessionId(): any;
    renewSession(): string;
    clearSession(): void;
}
