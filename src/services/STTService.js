import WebSocketManager from '../utils/WebSocketManager';
import Config from '../Config';
import SessionManager from '../session/SessionManager.js';

class STTService {
    constructor() {
        this.webSocketManager = WebSocketManager;
        this.sessionId = null;
        this.isRecording = false;
        this.mediaStream = null;
        this.mediaRecorder = null;
        this.isMuted = false;
        this._messageHandler = null;
        this.endpoint = Config.getEndpoint('voice'); // Single WebSocket endpoint
    }

    async startListening(callback, mode = 'default') {
        if (this.isRecording) {
            console.warn('STTService: Already recording.');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaStream = stream;
            this.isRecording = true;

            this.sessionId = SessionManager.getSessionId();
            console.log('STTService: Using session ID:', this.sessionId);

            this.webSocketManager.connect(this.endpoint);
            const connection = this.webSocketManager.connection;
            connection.onerror = (error) => {
                console.error('WebSocketManager: Connection error:', error);
            };

            // Ensure no duplicate handlers
            if (this._messageHandler) {
                this.webSocketManager.removeMessageHandler(this._messageHandler);
            }

            this._messageHandler = (data) => {
                if (data.action === 'stt' && data.payload?.transcript) {
                    callback(data.payload.transcript);
                }
            };

            this.webSocketManager.addMessageHandler(this._messageHandler);

            this._startStreaming(mode);
        } catch (error) {
            console.error('STTService: Error starting microphone:', error);
            throw error;
        }
    }

    stopListening() {
        if (!this.isRecording) {
            console.warn('STTService: Not currently recording.');
            return;
        }

        if (this.mediaRecorder?.state !== 'inactive') {
            this.mediaRecorder.stop();
            console.log('STTService: MediaRecorder stopped.');
        }

        this.mediaStream?.getTracks().forEach((track) => track.stop());
        this.mediaStream = null;

        this.webSocketManager.removeMessageHandler(this._messageHandler);
        this._messageHandler = null;

        this.webSocketManager.disconnect();
        this.isRecording = false;
        console.log('STTService: Stopped listening.');
    }

    stopSendingAudio() {
        this.isMuted = true;
        console.log('STTService: Audio streaming is muted.');
    }

    startSendingAudio() {
        this.isMuted = false;
        console.log('STTService: Audio streaming is resumed.');
    }

    _startStreaming(mode) {
        this.webSocketManager.sendMessage({
            action: 'start_session',
            sessionId: this.sessionId,
        });

        this.webSocketManager.sendMessage({
            action: 'start_stt',
            sessionId: this.sessionId,
            mode,
        });

        const mediaRecorder = new MediaRecorder(this.mediaStream);
        mediaRecorder.ondataavailable = (event) => {
            if (this.isMuted) {
                console.log('STTService: Audio muted. Skipping blob.');
                return;
            }
            const reader = new FileReader();
            reader.onload = () => {
                this.webSocketManager.sendMessage({
                    action: 'stt_audio',
                    sessionId: this.sessionId,
                    audioData: reader.result.split(',')[1],
                });
            };
            reader.readAsDataURL(event.data);
        };

        mediaRecorder.start(250);
        this.mediaRecorder = mediaRecorder;
    }
}

export default STTService;
