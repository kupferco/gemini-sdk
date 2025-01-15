export declare class Config {
    static setApiBaseUrl(baseUrl: string): void;
    static getApiBaseUrl(): string;
}
export declare class SessionManager {
    static initializeSession(): void;
    static getSessionId(): string;
    static renewSession(): void;
}
export declare class GeminiService {
    sendRestMessage(sessionId: string, message: string): Promise<string>;
}
export declare class ConversationService {
    static fetchHistory(): Promise<{
        role: string;
        text: string;
    }[]>;
    static clearHistory(): Promise<void>;
}
