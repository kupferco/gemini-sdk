import PromptService from '../src/services/PromptService';

jest.mock('../src/Config', () => ({
    getApiBaseUrl: jest.fn(() => 'https://mock-test-api-endpoint.com'),
    getEndpoint: jest.fn((serviceName) => {
        const endpoints = {
            prompt: '/api/gemini/system-prompt',
        };
        return `https://mock-test-api-endpoint.com${endpoints[serviceName]}`;
    }),
}));

describe('PromptService', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should fetch a prompt for a given session', async () => {
        const mockSessionId = 'test-session';

        // Mock the fetch response
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ prompt: 'Test Prompt' }),
            })
        );

        const prompt = await PromptService.getPrompt(mockSessionId);

        // Assertions
        expect(fetch).toHaveBeenCalledWith(
            'https://mock-test-api-endpoint.com/api/gemini/system-prompt?sessionId=test-session',
            {
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true',
                },
            }
        );

        expect(prompt).toBe('Test Prompt');
    });

    test('should throw an error if session ID is missing', async () => {
        await expect(PromptService.getPrompt(null)).rejects.toThrow(
            'Session ID is required to fetch the prompt.'
        );
    });

    test('should throw an error if the server returns an error', async () => {
        const mockSessionId = 'test-session';

        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                statusText: 'Internal Server Error',
            })
        );

        await expect(PromptService.getPrompt(mockSessionId)).rejects.toThrow(
            'Failed to fetch prompt: Internal Server Error'
        );
    });

    test('should save a new prompt for a given session', async () => {
        const mockSessionId = 'test-session';
        const newPrompt = 'New Test Prompt';

        // Mock the fetch response
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
            })
        );

        await PromptService.setPrompt(mockSessionId, newPrompt);

        // Assertions
        expect(fetch).toHaveBeenCalledWith(
            'https://mock-test-api-endpoint.com/api/gemini/system-prompt',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true',
                },
                body: JSON.stringify({ sessionId: mockSessionId, newPrompt }),
            }
        );
    });

    test('should throw an error if session ID or new prompt is missing', async () => {
        await expect(PromptService.setPrompt(null, 'Test Prompt')).rejects.toThrow(
            'Session ID and new prompt are required.'
        );

        await expect(PromptService.setPrompt('test-session', null)).rejects.toThrow(
            'Session ID and new prompt are required.'
        );
    });

    test('should throw an error if the server fails to save a new prompt', async () => {
        const mockSessionId = 'test-session';
        const newPrompt = 'New Test Prompt';

        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                statusText: 'Internal Server Error',
            })
        );

        await expect(PromptService.setPrompt(mockSessionId, newPrompt)).rejects.toThrow(
            'Failed to update prompt: Internal Server Error'
        );
    });
});
