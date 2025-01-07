import WebSocketManager from '../utils/WebSocketManager';
import Config from '../Config';

class GeminiService {
    constructor() {
        this.webSocketManager = WebSocketManager; // Singleton WebSocketManager
        this.endpoint = Config.getEndpoint('voice'); // Shared WebSocket endpoint
        this._messageHandler = null; // Message handler for gemini responses
        this.connected = false; // Track connection state
    }

    connect() {
        if (this.connected) {
            console.log('GeminiService: Already connected.');
            return;
        }

        // Connect WebSocketManager to the shared endpoint
        this.webSocketManager.connect(this.endpoint);
        this.connected = true;

        // Ensure no duplicate handlers
        if (this._messageHandler) {
            this.webSocketManager.removeMessageHandler(this._messageHandler);
        }

        // Define message handler for gemini responses
        this._messageHandler = (data) => {
            if (data.action === 'gemini' && data.payload?.agent) {
                if (this.onGeminiResponse) {
                    this.onGeminiResponse(data.payload.agent); // Trigger the response handler
                }
            }
        };

        // Add the message handler
        this.webSocketManager.addMessageHandler(this._messageHandler);
        console.log('GeminiService: Connected and handler added.');
    }

    disconnect() {
        if (this._messageHandler) {
            this.webSocketManager.removeMessageHandler(this._messageHandler);
            this._messageHandler = null;
        }

        this.webSocketManager.disconnect(this.endpoint);
        this.connected = false; // Update connection state
        console.log('GeminiService: Disconnected from WebSocket.');
    }

    setResponseHandler(handler) {
        this.onGeminiResponse = handler;
    }
}

export default GeminiService;

