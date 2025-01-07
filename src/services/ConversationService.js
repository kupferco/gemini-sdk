import Config from '../Config.js';
import SessionManager from '../session/SessionManager.js';

const headers = {
    'Content-Type': 'application/json',
    ...(process.env.NODE_ENV !== 'production' && { 'ngrok-skip-browser-warning': 'true' }),
};

class ConversationService {
    static async fetchHistory() {
        const sessionId = SessionManager.getSessionId();
        try {
            const response = await fetch(`${Config.getApiBaseUrl()}/api/gemini/history?sessionId=${encodeURIComponent(sessionId)}`, {
                method: 'GET',
                headers,
            });
    
            if (!response.ok) {
                console.error('Failed to fetch conversation history.');
                return [];
            }
    
            return await response.json();
        } catch (error) {
            console.error('Error fetching conversation history:', error);
            return [];
        }
    }

    static async clearHistory() {
        const sessionId = SessionManager.getSessionId();
        try {
            await fetch(`${Config.getApiBaseUrl()}/api/gemini/history?sessionId=${encodeURIComponent(sessionId)}&clear=true`, {
                method: 'GET',
                headers,
            });
            console.log('Conversation history cleared.');
        } catch (error) {
            console.error('Error clearing conversation history:', error);
        }
    }
}

export default ConversationService;
