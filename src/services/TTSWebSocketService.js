import WebSocketManager from '../utils/WebSocketManager';
import ttsServiceInstance from './TTSService';
import Config from '../Config';

class TTSWebSocketService {
    constructor() {
        this.messageHandler = null;
        this.webSocketManager = new WebSocketManager(Config.getEndpoint('tts'));
    }

    connect() {
        this.webSocketManager.connect();
        console.log('TTSWebSocketService: Connected to WebSocket.');

        this.messageHandler = (data) => {
            if (data.action === 'tts_audio' && data.payload?.audioData) {
                const audioBuffer = Uint8Array.from(
                    atob(data.payload.audioData),
                    (char) => char.charCodeAt(0)
                );
                const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
                ttsServiceInstance.playAudio(audioBlob);
            }
        };

        this.webSocketManager.addMessageHandler(this.messageHandler);
    }

    disconnect() {
        if (this.messageHandler) {
            this.webSocketManager.removeMessageHandler(this.messageHandler);
        }
        this.webSocketManager.disconnect();
        console.log('TTSWebSocketService: Disconnected from WebSocket.');
    }
}

export default TTSWebSocketService;
