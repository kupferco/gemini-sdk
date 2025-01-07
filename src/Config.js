// Define environment-specific configurations
const ENV = {
  development: {
      API_BASE_URL: 'http://localhost:8080',
  },
  ngrok: {
      API_BASE_URL: 'https://adcb-2a01-4b00-be13-4400-8c76-4d16-4b6b-14c9.ngrok-free.app',
  },
  production: {
      API_BASE_URL: 'https://proxy-server-14953211771.europe-west2.run.app',
  },
};

// Detect current environment
const currentEnv = process.env.NODE_ENV || 'development';

class Config {
  constructor() {
    console.log(process.env.NODE_ENV)
      this.apiBaseUrl = ENV[currentEnv].API_BASE_URL || null;
      this.endpoints = {
          prompt: '/api/gemini/system-prompt',
          stt: '/api/stt',
          tts: '/api/tts',
          gemini: '/api/gemini',
          geminiHistory: '/api/gemini/history',
          voice: ' ',
      };
  }

  setApiBaseUrl(baseUrl) {
      console.log(`Setting API base URL to: ${baseUrl}`);
      this.apiBaseUrl = baseUrl;
  }

  getApiBaseUrl() {
      if (!this.apiBaseUrl) {
          throw new Error('API base URL is not set. Please configure it before using the SDK.');
      }
      return this.apiBaseUrl;
  }

  getEndpoint(serviceName) {
      const baseUrl = this.getApiBaseUrl();
      const path = this.endpoints[serviceName];
      if (!path) {
          throw new Error(`Endpoint for service "${serviceName}" is not defined.`);
      }
      return `${baseUrl}${path}`;
  }
}

export default new Config();
