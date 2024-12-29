const PromptService = require('../src/services/PromptService');

jest.mock('../src/Config', () => ({
  getApiBaseUrl: jest.fn(() => 'https://mock-api-endpoint.com'),
  getEndpoint: jest.fn((service) => {
    const endpoints = {
      prompt: '/api/gemini/system-prompt',
    };
    return `https://mock-api-endpoint.com${endpoints[service]}`;
  }),
}));

describe('PromptService', () => {
  test('should fetch a prompt for a given session', async () => {
    const mockSessionId = 'test-session';
    const promptService = new PromptService();

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ prompt: 'Test Prompt' }),
      })
    );

    const prompt = await promptService.getPrompt(mockSessionId);
    expect(prompt).toBe('Test Prompt');
  });
});
