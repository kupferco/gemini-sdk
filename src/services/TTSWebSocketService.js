import WebSocketManager from '../utils/WebSocketManager';
import TTSService from './TTSService';
import Config from '../Config';

class TTSWebSocketService extends TTSService {
    constructor() {
        super(); // Call TTSService constructor
        this.webSocketManager = WebSocketManager;
        this._messageHandler = null;
        this.endpoint = Config.getEndpoint('voice'); // Single WebSocket endpoint
    }

    connect() {
        this.webSocketManager.connect(this.endpoint);

        // Ensure no duplicate handlers
        if (this._messageHandler) {
            this.webSocketManager.removeMessageHandler(this._messageHandler);
        }

        this._messageHandler = (data) => {
            if (data.action === 'tts_audio' && data.payload?.audioData) {
                const audioBuffer = Uint8Array.from(
                    atob(data.payload.audioData),
                    (char) => char.charCodeAt(0)
                );
                const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
                this.playAudio(audioBlob); // Call playAudio from TTSService
            }
        };

        this.webSocketManager.addMessageHandler(this._messageHandler);
        console.log('TTSWebSocketService: Connected and handler added.');
    }

    disconnect() {
        if (this._messageHandler) {
            this.webSocketManager.removeMessageHandler(this._messageHandler);
            this._messageHandler = null;
        }

        this.webSocketManager.disconnect();
        console.log('TTSWebSocketService: Disconnected from WebSocket.');
    }
}

export default TTSWebSocketService;
