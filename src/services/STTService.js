import WebSocketManager from '../../src/utils/WebSocketManager';
import Config from '../Config';
import SessionManager from '../session/SessionManager.js';

class STTService {
    constructor() {
        this.mediaStream = null;
        this.mediaRecorder = null;
        this.socket = null;
        this.isRecording = false;
        this.isMuted = false;
        this.sessionId = null;
        this.webSocketManager = new WebSocketManager(Config.getEndpoint('stt'));
    }

    async startListening(callback, mode = 'default') {
        this.mode = mode;
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

            this._startStreaming(callback, mode);
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

        // Stop MediaRecorder
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
            console.log('STTService: MediaRecorder stopped.');
        }
        this.mediaRecorder = null;

        // Stop media stream
        this.mediaStream.getTracks().forEach((track) => track.stop());
        this.mediaStream = null;

        // Remove all message handlers
        this.webSocketManager.removeMessageHandler(this._messageHandler);

        // Disconnect WebSocket
        this.webSocketManager.disconnect();

        this.isRecording = false;
        console.log('STTService: Stopped listening.');
    }



    stopSendingAudio() {
        this.isMuted = true;
        console.log('Audio streaming is muted.');
    }

    startSendingAudio() {
        this.isMuted = false;
        console.log('Audio streaming is resumed.');
    }

    _startStreaming(callback, mode) {
        this.webSocketManager.connect();

        this.webSocketManager.socket.onerror = (error) => {
            console.error('WebSocketManager: Connection error:', error);
        };

        this._messageHandler = (data) => {
            console.log('STTService: Received message:', data);
            if (data.action === 'stt' && data.payload?.transcript) {
                callback(data.payload.transcript);
            }
        };
        this.webSocketManager.addMessageHandler(this._messageHandler);

        // console.log(this.sessionId)
        // Use WebSocketManager to send messages once connected
        this.webSocketManager.sendMessage({
            action: 'start_session',
            sessionId: this.sessionId,
        });
        const startSTTMessage = {
            action: 'start_stt',
            sessionId: this.sessionId,
        };

        if (mode) {
            startSTTMessage.mode = mode; // Add the mode flag if provided
        }

        this.webSocketManager.sendMessage(startSTTMessage);

        // MediaRecorder setup remains unchanged
        const mediaRecorder = new MediaRecorder(this.mediaStream);
        mediaRecorder.ondataavailable = (event) => {
            if (this.isMuted) {
                console.log('STTService: Audio muted. Skipping blob.');
                return;
            }
            if (!this.isRecording) {
                console.log('STTService: Not recording. Ignoring blob.');
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
