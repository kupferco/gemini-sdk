import STTService from '../src/services/STTService';

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

jest.mock('../src/session/SessionManager', () => ({
    getSessionId: jest.fn(() => 'mock-session-id'),
    initializeSession: jest.fn(),
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

        await sttService.startListening(mockCallback);

        // Simulate WebSocket receiving a transcription
        const mockMessage = { transcript: 'Hello, world!' };
        mockWebSocket.onmessage({ data: JSON.stringify(mockMessage) });

        expect(mockCallback).toHaveBeenCalledWith('Hello, world!');
    });

    test('should send start_session and start_stt messages on WebSocket open', async () => {
        const sttService = new STTService();
        const mockCallback = jest.fn();

        await sttService.startListening(mockCallback);

        // Simulate WebSocket opening
        mockWebSocket.onopen();

        // Check that start_session and start_stt messages are sent
        expect(mockWebSocket.send).toHaveBeenCalledWith(
            JSON.stringify({
                action: 'start_session',
                sessionId: expect.any(String),
            })
        );
        expect(mockWebSocket.send).toHaveBeenCalledWith(
            JSON.stringify({
                action: 'start_stt',
                sessionId: expect.any(String),
            })
        );
    });

    test('should send stt_audio messages with correct format', async () => {
        const sttService = new STTService();
        const mockCallback = jest.fn();

        await sttService.startListening(mockCallback);

        // Simulate WebSocket opening
        mockWebSocket.onopen();

        // Simulate audio blob being processed
        const mockBlob = new Blob(['test audio data'], { type: 'audio/wav' });
        const mockReader = {
            result: 'data:audio/wav;base64,dGVzdCBhdWRpbyBkYXRh',
            readAsDataURL: jest.fn(),
            onload: null,
        };
        jest.spyOn(global, 'FileReader').mockImplementation(() => mockReader);

        // Trigger MediaRecorder's dataavailable event
        const mediaRecorder = sttService.mediaRecorder;
        mediaRecorder.ondataavailable({ data: mockBlob });

        // Trigger FileReader's onload event
        mockReader.onload();

        expect(mockWebSocket.send).toHaveBeenCalledWith(
            JSON.stringify({
                action: 'stt_audio',
                sessionId: expect.any(String),
                audioData: 'dGVzdCBhdWRpbyBkYXRh', // Base64 content
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

});
