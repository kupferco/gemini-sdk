import ConversationService from '../src/services/ConversationService';

jest.mock('../src/Config', () => ({
    getApiBaseUrl: jest.fn(() => 'https://mock-test-api-endpoint.com'),
}));

jest.mock('../src/session/SessionManager.js', () => ({
    getSessionId: jest.fn(() => 'test-session-id'),
}));

describe('ConversationService', () => {
    const headers = {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
    };

    afterEach(() => {
        jest.clearAllMocks();
        global.fetch.mockClear();
    });

    describe('fetchHistory', () => {
        it('should fetch conversation history successfully', async () => {
            const mockHistory = [
                { role: 'user', text: 'Hello' },
                { role: 'assistant', text: 'Hi there!' },
            ];

            global.fetch = jest.fn(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockHistory),
                })
            );

            const history = await ConversationService.fetchHistory();

            // Assertions
            expect(fetch).toHaveBeenCalledWith(
                'https://mock-test-api-endpoint.com/api/gemini/history?sessionId=test-session-id',
                {
                    method: 'GET',
                    headers,
                }
            );
            expect(history).toEqual(mockHistory);
        });

        it('should return an empty array if the response is not OK', async () => {
            global.fetch = jest.fn(() =>
                Promise.resolve({
                    ok: false,
                })
            );

            const history = await ConversationService.fetchHistory();

            // Assertions
            expect(fetch).toHaveBeenCalledWith(
                'https://mock-test-api-endpoint.com/api/gemini/history?sessionId=test-session-id',
                {
                    method: 'GET',
                    headers,
                }
            );
            expect(history).toEqual([]);
        });

        it('should return an empty array if an error occurs', async () => {
            global.fetch = jest.fn(() => Promise.reject(new Error('Network Error')));

            const history = await ConversationService.fetchHistory();

            // Assertions
            expect(fetch).toHaveBeenCalledWith(
                'https://mock-test-api-endpoint.com/api/gemini/history?sessionId=test-session-id',
                {
                    method: 'GET',
                    headers,
                }
            );
            expect(history).toEqual([]);
        });
    });

    describe('clearHistory', () => {
        it('should clear conversation history successfully', async () => {
            global.fetch = jest.fn(() =>
                Promise.resolve({
                    ok: true,
                })
            );

            await ConversationService.clearHistory();

            // Assertions
            expect(fetch).toHaveBeenCalledWith(
                'https://mock-test-api-endpoint.com/api/gemini/history?sessionId=test-session-id&clear=true',
                {
                    method: 'GET',
                    headers,
                }
            );
        });

        it('should log an error if clearing conversation history fails', async () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
            global.fetch = jest.fn(() => Promise.reject(new Error('Network Error')));

            await ConversationService.clearHistory();

            // Assertions
            expect(fetch).toHaveBeenCalledWith(
                'https://mock-test-api-endpoint.com/api/gemini/history?sessionId=test-session-id&clear=true',
                {
                    method: 'GET',
                    headers,
                }
            );
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Error clearing conversation history:',
                expect.any(Error)
            );

            consoleErrorSpy.mockRestore();
        });
    });
});