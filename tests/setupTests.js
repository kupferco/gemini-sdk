jest.mock('../src/Config', () => ({
    getApiBaseUrl: jest.fn(() => 'https://mock-test-api-endpoint.com'),
    getEndpoint: jest.fn((service) => {
      const endpoints = {
        prompt: '/api/gemini/system-prompt',
        stt: '/api/stt',
        tts: '/api/tts',
        gemini: '/api/gemini',
      };
      return `https://mock-test-api-endpoint.com${endpoints[service]}`;
    }),
  }));
  