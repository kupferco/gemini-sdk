import PromptService from '../src/services/PromptService';

describe('PromptService', () => {
    test('should fetch a prompt for a given session', async () => {
        const mockSessionId = 'test-session';
        const promptService = new PromptService();

        // Mock the fetch response
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ prompt: 'Test Prompt' }),
            })
        );

        const prompt = await promptService.getPrompt(mockSessionId);

        // Assertions
        expect(fetch).toHaveBeenCalledWith(
            'https://mock-test-api-endpoint.com/api/gemini/system-prompt?sessionId=test-session'
        );
        expect(prompt).toBe('Test Prompt');
    });

    test('should throw an error if session ID is missing', async () => {
        const promptService = new PromptService();

        await expect(promptService.getPrompt(null)).rejects.toThrow(
            'Session ID is required to fetch the prompt.'
        );
    });

    test('should throw an error if the server returns an error', async () => {
        const mockSessionId = 'test-session';
        const promptService = new PromptService();

        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                statusText: 'Internal Server Error',
            })
        );

        await expect(promptService.getPrompt(mockSessionId)).rejects.toThrow('Failed to fetch prompt: Internal Server Error');
    });

});
