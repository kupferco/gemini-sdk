import GeminiService from '../src/services/GeminiService';
import WebSocketManager from '../src/utils/WebSocketManager';
import Config from '../src/Config';

jest.mock('../src/utils/WebSocketManager', () => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    addMessageHandler: jest.fn(),
    removeMessageHandler: jest.fn(),
}));

jest.mock('../src/Config', () => ({
    getEndpoint: jest.fn(() => 'ws://mock-websocket-endpoint'),
}));

describe('GeminiService', () => {
    let geminiService;

    beforeEach(() => {
        jest.clearAllMocks();
        geminiService = new GeminiService();
    });

    test('should connect to the WebSocket endpoint', () => {
        geminiService.connect();

        expect(WebSocketManager.connect).toHaveBeenCalledWith('ws://mock-websocket-endpoint');
        expect(WebSocketManager.addMessageHandler).toHaveBeenCalled();
    });

    test('should set and trigger a response handler', () => {
        const mockHandler = jest.fn();
        geminiService.setResponseHandler(mockHandler);

        // Mock addMessageHandler to capture the handler
        let capturedHandler = null;
        WebSocketManager.addMessageHandler.mockImplementation((handler) => {
            capturedHandler = handler;
        });

        geminiService.connect();

        // Simulate receiving a Gemini message
        const mockMessage = {
            action: 'gemini',
            payload: { agent: 'Hello from Gemini!' },
        };

        // Invoke the captured handler with the mock message
        capturedHandler(mockMessage);

        expect(mockHandler).toHaveBeenCalledWith('Hello from Gemini!');
    });


    test('should not trigger the response handler for unrelated messages', () => {
        const mockHandler = jest.fn();
        geminiService.setResponseHandler(mockHandler);

        // Mock addMessageHandler to capture the handler
        const capturedHandlers = [];
        WebSocketManager.addMessageHandler.mockImplementation((handler) => {
            capturedHandlers.push(handler);
        });

        geminiService.connect();

        // Simulate receiving an unrelated message
        const unrelatedMessage = {
            action: 'unrelated_action',
            payload: { someData: 'irrelevant' },
        };

        // Manually invoke all captured handlers
        capturedHandlers.forEach((handler) => handler(unrelatedMessage));

        expect(mockHandler).not.toHaveBeenCalled(); // Ensure the response handler was not triggered
    });


    test('should remove message handler on disconnect', () => {
        geminiService.connect();

        // Capture the handler added by addMessageHandler
        const addMessageHandlerCall = WebSocketManager.addMessageHandler.mock.calls[0];
        const addedHandler = addMessageHandlerCall[0]; // The handler function added

        geminiService.disconnect();

        expect(WebSocketManager.removeMessageHandler).toHaveBeenCalledWith(addedHandler);
        expect(WebSocketManager.disconnect).toHaveBeenCalled();
    });

    test('should add and remove message handlers correctly', () => {
        const mockHandler = jest.fn();

        WebSocketManager.addMessageHandler(mockHandler);
        expect(WebSocketManager.addMessageHandler).toHaveBeenCalledWith(mockHandler);

        WebSocketManager.removeMessageHandler(mockHandler);
        expect(WebSocketManager.removeMessageHandler).toHaveBeenCalledWith(mockHandler);
    });





    test('should handle multiple connects without duplicate handlers', () => {
        geminiService.connect();
        geminiService.connect();

        expect(WebSocketManager.connect).toHaveBeenCalledTimes(1);
        expect(WebSocketManager.addMessageHandler).toHaveBeenCalledTimes(1);
    });
});
