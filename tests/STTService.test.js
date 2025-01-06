import WebSocketManager from '../src/utils/WebSocketManager';
import STTService from '../src/services/STTService';

// global.WebSocket = jest.fn(() => ({
//     send: jest.fn(),
//     close: jest.fn(),
//     onopen: null,
//     onmessage: null,
//     onerror: jest.fn(),
//     onclose: null,
// }));

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
            // Assign the result and trigger the onload event
            this.result = 'data:audio/wav;base64,dGVzdCBhdWRpbyBkYXRh'; // Simulated Base64 string
            if (typeof this.onload === 'function') {
                this.onload({ target: { result: this.result } });
            }
        }),
        onload: null, // Placeholder for the onload callback
    };
    return reader;
});

global.Blob = jest.fn((parts, options) => ({
    parts,
    options,
    size: parts.reduce((size, part) => size + part.length, 0),
    type: options?.type || '',
}));


describe('STTService', () => {
    let mockMediaStream;
    // let mockWebSocket;

    beforeEach(() => {
        // Mock the mediaDevices API
        mockMediaStream = { getTracks: jest.fn(() => [{ stop: jest.fn() }]) };
        global.navigator.mediaDevices = {
            getUserMedia: jest.fn(() => Promise.resolve(mockMediaStream)),
        };

        // Mock console.error
        jest.spyOn(console, 'error').mockImplementation(() => { }); // Captures error logs
        jest.spyOn(WebSocketManager.prototype, 'connect').mockImplementation(function () {
            // this.socket = new WebSocket(this.endpoint);
            this.socket = {
                onerror: jest.fn(),
                onopen: null,
                onmessage: null,
                close: jest.fn(),
                send: jest.fn(),
            };
        });
        jest.spyOn(WebSocketManager.prototype, 'disconnect').mockImplementation(jest.fn());
        jest.spyOn(WebSocketManager.prototype, 'sendMessage').mockImplementation(jest.fn());
        jest.spyOn(WebSocketManager.prototype, 'addMessageHandler').mockImplementation(jest.fn());
        jest.spyOn(WebSocketManager.prototype, 'removeMessageHandler').mockImplementation(jest.fn());
        jest.clearAllMocks();

        jest.clearAllMocks();
        jest.resetModules();
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });


    test('should stop listening and close the WebSocket connection', async () => {
        const sttService = new STTService();

        await sttService.startListening();
        await sttService.stopListening();

        expect(mockMediaStream.getTracks).toHaveBeenCalled();
        expect(WebSocketManager.prototype.disconnect).toHaveBeenCalled();
    });


    test('should start listening and open a WebSocket connection', async () => {
        const sttService = new STTService();

        // Start listening
        await sttService.startListening();

        // Verify `connect` was called
        expect(WebSocketManager.prototype.connect).toHaveBeenCalled();

        // Verify `start_session` and `start_stt` messages were sent
        expect(WebSocketManager.prototype.sendMessage).toHaveBeenNthCalledWith(1, {
            action: 'start_session',
            sessionId: expect.any(String),
        });
        expect(WebSocketManager.prototype.sendMessage).toHaveBeenNthCalledWith(2, {
            action: 'start_stt',
            sessionId: expect.any(String),
            mode: 'default',
        });
    });


    test('should call the callback with transcription updates', async () => {
        const sttService = new STTService();
        const mockCallback = jest.fn();

        // Start listening
        await sttService.startListening(mockCallback);

        // Simulate a message from WebSocketManager
        const mockMessage = { action: "stt", payload: { transcript: 'Hello, world!' } };

        // Retrieve the handler added by addMessageHandler
        const addMessageHandlerSpy = WebSocketManager.prototype.addMessageHandler;
        expect(addMessageHandlerSpy).toHaveBeenCalled(); // Ensure the handler was added

        const messageHandler = addMessageHandlerSpy.mock.calls[0][0];
        messageHandler(mockMessage); // Simulate the message

        // Assert the callback was called with the correct transcript
        expect(mockCallback).toHaveBeenCalledWith('Hello, world!');
    });


    test('should send start_session and start_stt messages on WebSocket open', async () => {
        const sttService = new STTService();

        await sttService.startListening();

        // Verify messages sent via WebSocketManager
        expect(WebSocketManager.prototype.sendMessage).toHaveBeenNthCalledWith(1, {
            action: 'start_session',
            sessionId: expect.any(String),
        });
        expect(WebSocketManager.prototype.sendMessage).toHaveBeenNthCalledWith(2, {
            action: 'start_stt',
            sessionId: expect.any(String),
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
        console.log('Triggering ondataavailable with mock Blob');
        sttService.mediaRecorder.ondataavailable({ data: mockBlob });

        // Verify previous WebSocket messages
        expect(WebSocketManager.prototype.sendMessage).toHaveBeenNthCalledWith(1, {
            action: 'start_session',
            sessionId: 'mock-session-id',
        });
        expect(WebSocketManager.prototype.sendMessage).toHaveBeenNthCalledWith(2, {
            action: 'start_stt',
            sessionId: 'mock-session-id',
            mode: 'default',
        });

        // Verify the stt_audio message
        expect(WebSocketManager.prototype.sendMessage).toHaveBeenNthCalledWith(3, {
            action: 'stt_audio',
            sessionId: 'mock-session-id',
            audioData: 'dGVzdCBhdWRpbyBkYXRh', // Base64 string from mocked FileReader
        });
    });

    test('should handle microphone access denial', async () => {
        navigator.mediaDevices.getUserMedia.mockImplementation(() =>
            Promise.reject(new Error('Microphone access denied'))
        );

        const sttService = new STTService();
        await expect(sttService.startListening()).rejects.toThrow('Microphone access denied');
    });

    test('should handle WebSocket errors', async () => {
        const sttService = new STTService();
        const mockError = new Error('WebSocket connection failed');

        // Start listening
        await sttService.startListening();

        // Simulate WebSocket error
        const mockSocket = sttService.webSocketManager.socket;
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
        expect(WebSocketManager.prototype.sendMessage).not.toHaveBeenCalledWith(
            expect.objectContaining({ action: 'stt_audio' })
        );

        // Resume audio streaming
        sttService.startSendingAudio();
        expect(sttService.isMuted).toBe(false);

        // Simulate another MediaRecorder dataavailable event
        sttService.mediaRecorder.ondataavailable({ data: mockBlob });

        // Verify that stt_audio messages are sent after unmuting
        expect(WebSocketManager.prototype.sendMessage).toHaveBeenCalledWith(
            expect.objectContaining({ action: 'stt_audio' })
        );
    });




});
