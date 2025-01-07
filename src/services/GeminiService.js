import WebSocketManager from '../utils/WebSocketManager';
import Config from '../Config';

class GeminiService {
    constructor() {
        this.webSocketManager = WebSocketManager; // Singleton WebSocketManager
        this.endpoint = Config.getEndpoint('voice'); // Shared WebSocket endpoint
        this._messageHandler = null; // Message handler for gemini responses
    }

    connect() {
        // Connect WebSocketManager to the shared endpoint
        this.webSocketManager.connect(this.endpoint);

        // Ensure no duplicate handlers
        if (this._messageHandler) {
            this.webSocketManager.removeMessageHandler(this.endpoint, this._messageHandler);
        }

        // Define message handler for gemini responses
        this._messageHandler = (data) => {
            // console.log('GeminiService message received', data)
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
        // Remove the message handler
        if (this._messageHandler) {
            this.webSocketManager.removeMessageHandler(this.endpoint, this._messageHandler);
            this._messageHandler = null;
        }

        // Disconnect WebSocketManager if no other services are using the endpoint
        this.webSocketManager.disconnect(this.endpoint);
        console.log('GeminiService: Disconnected from WebSocket.');
    }

    // Set the handler for gemini responses
    setResponseHandler(handler) {
        this.onGeminiResponse = handler;
    }
}

export default GeminiService;
