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

global.navigator = {
    mediaDevices: {
        getUserMedia: jest.fn(() =>
            Promise.resolve({
                getTracks: jest.fn(() => [{ stop: jest.fn() }]),
            })
        ),
    },
};

global.WebSocket = jest.fn(() => ({
    send: jest.fn(),
    close: jest.fn(),
    readyState: WebSocket.OPEN,
    onopen: null,
    onmessage: null,
    onerror: null,
    onclose: null,
}));

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
    let mockWebSocket;

    beforeEach(() => {
        // Mock the mediaDevices API
        mockMediaStream = { getTracks: jest.fn(() => [{ stop: jest.fn() }]) };
        global.navigator.mediaDevices = {
            getUserMedia: jest.fn(() => Promise.resolve(mockMediaStream)),
        };

        // Mock the WebSocket API
        mockWebSocket = {
            send: jest.fn(),
            close: jest.fn(),
            readyState: WebSocket.OPEN,
            onopen: null,
            onmessage: null,
            onerror: null,
            onclose: null,
        };
        global.WebSocket = jest.fn(() => mockWebSocket);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should start listening and open a WebSocket connection', async () => {
        const sttService = new STTService();
        const mockCallback = jest.fn();

        await sttService.startListening(mockCallback);

        // Check if media stream and WebSocket are initialized
        expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true });
        expect(WebSocket).toHaveBeenCalledWith(expect.stringContaining('/api/stt'));
        expect(mockWebSocket.onopen).not.toBeNull();
    });

    test('should stop listening and close the WebSocket connection', async () => {
        const sttService = new STTService();

        await sttService.startListening();
        sttService.stopListening();

        expect(mockMediaStream.getTracks).toHaveBeenCalled();
        expect(mockWebSocket.close).toHaveBeenCalled();
    });

    test('should call the callback with transcription updates', async () => {
        const sttService = new STTService();
        const mockCallback = jest.fn();

        // Start listening (this sets up the WebSocket and callback)
        await sttService.startListening(mockCallback);

        // Simulate WebSocket receiving a transcription message
        const mockMessage = { action: "stt", payload: { transcript: 'Hello, world!' } };
        if (sttService.socket.onmessage) {
            sttService.socket.onmessage({ data: JSON.stringify(mockMessage) });
        } else {
            console.error('WebSocket onmessage handler is not set');
        }

        // Assert the callback was called with the expected transcript
        expect(mockCallback).toHaveBeenCalledTimes(1);
        expect(mockCallback).toHaveBeenCalledWith('Hello, world!');
    });



    test('should send start_session and start_stt messages on WebSocket open', async () => {
        const sttService = new STTService();
        const mockCallback = jest.fn();

        await sttService.startListening(mockCallback);

        // Simulate WebSocket opening
        sttService.socket.onopen();

        // Assert that start_session and start_stt messages are sent in order
        expect(sttService.socket.send).toHaveBeenNthCalledWith(1, JSON.stringify({
            action: 'start_session',
            sessionId: 'mock-session-id',
        }));

        expect(sttService.socket.send).toHaveBeenNthCalledWith(2, JSON.stringify({
            action: 'start_stt',
            sessionId: 'mock-session-id',
        }));
    });


    test('should send stt_audio messages with correct format', async () => {
        const sttService = new STTService();
        const mockCallback = jest.fn();

        await sttService.startListening(mockCallback);

        // Simulate WebSocket opening
        sttService.socket.onopen();

        // Simulate MediaRecorder's dataavailable event
        const mockBlob = new Blob(['test audio data'], { type: 'audio/wav' });
        console.log('Triggering ondataavailable with mock Blob');
        sttService.mediaRecorder.ondataavailable({ data: mockBlob });

        // Assert WebSocket sends the correct stt_audio message
        expect(sttService.socket.send).toHaveBeenNthCalledWith(
            3, // Third call after start_session and start_stt
            JSON.stringify({
                action: 'stt_audio',
                sessionId: 'mock-session-id',
                audioData: 'dGVzdCBhdWRpbyBkYXRh', // Base64 string from mocked FileReader
            })
        );
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
        const mockCallback = jest.fn();

        await sttService.startListening(mockCallback);

        // Simulate WebSocket error
        const mockError = new Error('WebSocket connection failed');
        mockWebSocket.onerror(mockError);

        expect(console.error).toHaveBeenCalledWith('WebSocket error:', mockError);
    });

    test('should not send audio blobs when muted', async () => {
        const sttService = new STTService();
        const mockCallback = jest.fn();

        await sttService.startListening(mockCallback);

        // Simulate WebSocket opening
        sttService.socket.onopen();

        // Mute the audio streaming
        sttService.stopSendingAudio();
        expect(sttService.isMuted).toBe(true);

        // Simulate MediaRecorder's dataavailable event while muted
        const mockBlob = new Blob(['test audio data'], { type: 'audio/wav' });
        sttService.mediaRecorder.ondataavailable({ data: mockBlob });

        // Assert that WebSocket does not send stt_audio while muted
        expect(sttService.socket.send).not.toHaveBeenCalledWith(
            expect.stringContaining('"action":"stt_audio"')
        );

        // Unmute the audio streaming
        sttService.startSendingAudio();
        expect(sttService.isMuted).toBe(false);

        // Simulate MediaRecorder's dataavailable event after unmuting
        sttService.mediaRecorder.ondataavailable({ data: mockBlob });

        // Assert that WebSocket sends stt_audio after unmuting
        expect(sttService.socket.send).toHaveBeenCalledWith(
            expect.stringContaining('"action":"stt_audio"')
        );
    });


});
