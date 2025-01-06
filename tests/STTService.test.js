import WebSocketManager from '../src/utils/WebSocketManager';
import STTService from '../src/services/STTService';

jest.mock('../src/Config', () => ({
    getApiBaseUrl: jest.fn(() => 'https://mock-test-api-endpoint.com'),
    getEndpoint: jest.fn((serviceName) => {
        const endpoints = {
            'stt': '/api/stt',
            'tts': '/api/tts',
        };
        return `https://mock-test-api-endpoint.com${endpoints[serviceName]}`;
    }),
}));

jest.mock('../src/session/SessionManager', () => ({
    getSessionId: jest.fn(() => 'mock-session-id'),
    initializeSession: jest.fn(),
}));

jest.mock('../src/utils/WebSocketManager', () => ({
    connect: jest.fn(function () {
        this.connection = {
            onerror: jest.fn(), // Mock the onerror handler
            onopen: null,
            onmessage: null,
            close: jest.fn(),
            send: jest.fn(),
        };
    }),
    disconnect: jest.fn(),
    sendMessage: jest.fn(),
    addMessageHandler: jest.fn(),
    removeMessageHandler: jest.fn(),
}));


global.navigator = {
    mediaDevices: {
        getUserMedia: jest.fn(() =>
            Promise.resolve({
                getTracks: jest.fn(() => [{ stop: jest.fn() }]),
            })
        ),
    },
};

global.MediaRecorder = jest.fn(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    ondataavailable: null,
}));

global.FileReader = jest.fn(() => {
    const reader = {
        result: null,
        readAsDataURL: jest.fn(function () {
            this.result = 'data:audio/wav;base64,dGVzdCBhdWRpbyBkYXRh'; // Mocked Base64 string
            if (typeof this.onload === 'function') {
                this.onload({ target: { result: this.result } });
            }
        }),
        onload: null,
    };
    return reader;
});

describe('STTService', () => {
    let sttService;

    beforeEach(() => {
        jest.clearAllMocks();

        if (typeof global.Blob === 'undefined') {
            global.Blob = jest.fn((parts, options) => ({
                parts,
                options,
                size: parts.reduce((size, part) => size + part.length, 0),
                type: options?.type || '',
            }));
        }

        jest.spyOn(console, 'error').mockImplementation(() => { });
        sttService = new STTService();

        // Reset the getUserMedia mock to resolve by default
        global.navigator.mediaDevices.getUserMedia.mockImplementation(() =>
            Promise.resolve({
                getTracks: jest.fn(() => [{ stop: jest.fn() }]),
            })
        );
    });

    afterEach(() => {
        jest.restoreAllMocks(); // Restore original implementations after each test
    });

    test('should start listening and open a WebSocket connection', async () => {
        const mockCallback = jest.fn();

        await sttService.startListening(mockCallback);

        expect(WebSocketManager.connect).toHaveBeenCalled();
        expect(WebSocketManager.sendMessage).toHaveBeenNthCalledWith(1, {
            action: 'start_session',
            sessionId: 'mock-session-id',
        });
        expect(WebSocketManager.sendMessage).toHaveBeenNthCalledWith(2, {
            action: 'start_stt',
            sessionId: 'mock-session-id',
            mode: 'default',
        });
    });

    test('should stop listening and close the WebSocket connection', async () => {
        await sttService.startListening();
        sttService.stopListening();

        expect(WebSocketManager.disconnect).toHaveBeenCalled();
    });

    test('should call the callback with transcription updates', async () => {
        const mockCallback = jest.fn();

        await sttService.startListening(mockCallback);

        // Simulate message from WebSocketManager
        const mockMessage = { action: 'stt', payload: { transcript: 'Hello, world!' } };
        WebSocketManager.addMessageHandler.mock.calls[0][0](mockMessage);

        expect(mockCallback).toHaveBeenCalledWith('Hello, world!');
    });

    test('should send start_session and start_stt messages on WebSocket open', async () => {
        const sttService = new STTService();

        // Start listening
        await sttService.startListening();

        // Verify messages sent via WebSocketManager
        expect(WebSocketManager.sendMessage).toHaveBeenNthCalledWith(1, {
            action: 'start_session',
            sessionId: 'mock-session-id',
        });
        expect(WebSocketManager.sendMessage).toHaveBeenNthCalledWith(2, {
            action: 'start_stt',
            sessionId: 'mock-session-id',
            mode: 'default',
        });
    });

    test('should send stt_audio messages with correct format', async () => {
        const sttService = new STTService();
        const mockCallback = jest.fn();

        // Start listening
        await sttService.startListening(mockCallback);

        // Verify MediaRecorder started
        expect(sttService.mediaRecorder.start).toHaveBeenCalledWith(250); // Verify chunk interval

        // Simulate MediaRecorder's dataavailable event
        const mockBlob = new Blob(['test audio data'], { type: 'audio/wav' });
        sttService.mediaRecorder.ondataavailable({ data: mockBlob });

        // Verify previous WebSocket messages
        expect(WebSocketManager.sendMessage).toHaveBeenNthCalledWith(1, {
            action: 'start_session',
            sessionId: 'mock-session-id',
        });
        expect(WebSocketManager.sendMessage).toHaveBeenNthCalledWith(2, {
            action: 'start_stt',
            sessionId: 'mock-session-id',
            mode: 'default',
        });

        // Verify the stt_audio message
        expect(WebSocketManager.sendMessage).toHaveBeenNthCalledWith(3, {
            action: 'stt_audio',
            sessionId: 'mock-session-id',
            audioData: 'dGVzdCBhdWRpbyBkYXRh', // Base64 string from mocked FileReader
        });
    });

    test('should handle microphone access denial', async () => {
        // Mock getUserMedia to simulate microphone access denial
        global.navigator.mediaDevices.getUserMedia.mockImplementation(() =>
            Promise.reject(new Error('Microphone access denied'))
        );

        const sttService = new STTService();

        // Expect startListening to reject with the specific error
        await expect(sttService.startListening()).rejects.toThrow('Microphone access denied');
    });

    test('should handle WebSocket errors', async () => {
        const sttService = new STTService();
        const mockError = new Error('WebSocket connection failed');

        // Start listening
        await sttService.startListening();

        // Simulate WebSocket error
        const mockSocket = sttService.webSocketManager.connection;
        mockSocket.onerror(mockError); // Trigger the error

        // Assert error is logged
        expect(console.error).toHaveBeenCalledWith('WebSocketManager: Connection error:', mockError);
    });

    test('should not send audio blobs when muted', async () => {
        const sttService = new STTService();
    
        // Start listening
        await sttService.startListening();
    
        // Verify initial state
        expect(sttService.isMuted).toBe(false);
    
        // Mute the audio streaming
        sttService.stopSendingAudio();
        expect(sttService.isMuted).toBe(true);
    
        // Simulate MediaRecorder's dataavailable event
        const mockBlob = new Blob(['test audio data'], { type: 'audio/wav' });
        sttService.mediaRecorder.ondataavailable({ data: mockBlob });
    
        // Verify that no stt_audio messages are sent
        expect(WebSocketManager.sendMessage).not.toHaveBeenCalledWith(
            expect.objectContaining({ action: 'stt_audio' })
        );
    
        // Resume audio streaming
        sttService.startSendingAudio();
        expect(sttService.isMuted).toBe(false);
    
        // Simulate another MediaRecorder dataavailable event
        sttService.mediaRecorder.ondataavailable({ data: mockBlob });
    
        // Verify that stt_audio messages are sent after unmuting
        expect(WebSocketManager.sendMessage).toHaveBeenCalledWith(
            expect.objectContaining({ action: 'stt_audio' })
        );
    });
    
});
