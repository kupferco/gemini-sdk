import Config from '../Config';
import SessionManager from '../session/SessionManager.js';

class STTService {
    constructor() {
        this.mediaStream = null;
        this.mediaRecorder = null;
        this.socket = null;
        this.isRecording = false;
        this.isMuted = false; // Flag to track mute state
        this.sessionId = null; // Store session ID
    }

    async startListening(callback) {
        if (this.isRecording) {
            console.warn('STTService is already recording.');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaStream = stream;
            this.isRecording = true;

            // Generate a unique session ID
            this.sessionId = SessionManager.getSessionId();
            console.log('Using session ID:', this.sessionId);

            this._startStreaming(callback);
        } catch (error) {
            console.error('Error starting microphone:', error);
            throw error;
        }
    }

    stopListening() {
        if (!this.isRecording) {
            console.warn('STTService is not recording.');
            return;
        }

        // Stop media stream
        this.mediaStream.getTracks().forEach(track => track.stop());
        this.mediaStream = null;

        // Close WebSocket
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }

        this.isRecording = false;
        console.log('STTService has stopped listening.');
    }

    stopSendingAudio() {
        this.isMuted = true;
        console.log('Audio streaming is muted.');
    }

    startSendingAudio() {
        this.isMuted = false;
        console.log('Audio streaming is resumed.');
    }

    _startStreaming(callback) {
        const endpoint = Config.getEndpoint('stt');
        this.socket = new WebSocket(endpoint);

        this.socket.onopen = () => {
            console.log('WebSocket connection opened for STT.');

            // Send "start_session" action
            const startSessionMessage = {
                action: 'start_session',
                sessionId: this.sessionId,
            };
            console.log('Sending start_session:', startSessionMessage);
            this.socket.send(JSON.stringify(startSessionMessage));

            // Send "start_stt" action
            const startSTTMessage = {
                action: 'start_stt',
                sessionId: this.sessionId,
            };
            console.log('Sending start_stt:', startSTTMessage);
            this.socket.send(JSON.stringify(startSTTMessage));

            // Start sending audio data
            const mediaRecorder = new MediaRecorder(this.mediaStream);
            mediaRecorder.ondataavailable = async event => {
                if (this.isMuted) {
                    console.log('Muted: Audio blob not sent.');
                    return; // Skip sending audio if muted
                }

                if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const base64Audio = reader.result.split(',')[1];
                        const audioMessage = {
                            action: 'stt_audio',
                            sessionId: this.sessionId,
                            audioData: base64Audio,
                        };
                        // console.log('Sending stt_audio:', audioMessage);
                        this.socket.send(JSON.stringify(audioMessage));
                    };
                    reader.readAsDataURL(event.data);
                }
            };

            mediaRecorder.start(250); // Send data chunks every 250ms
            this.mediaRecorder = mediaRecorder;
        };

        this.socket.onmessage = event => {
            const data = JSON.parse(event.data);
            console.log('Received message from server:', data);

            if (data.action === 'stt' && data.payload?.transcript) {
                console.log('Invoking callback with transcript:', data.payload.transcript);
                callback(data.payload.transcript);
            }
        };

        this.socket.onerror = error => {
            console.error('WebSocket error:', error);
        };

        this.socket.onclose = () => {
            console.log('WebSocket connection closed.');
        };
    }
}

export default STTService;
