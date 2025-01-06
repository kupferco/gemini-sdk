class Config {
    constructor() {
      this.apiBaseUrl = null;
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
      console.log(baseUrl)
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
  
  export default new Config(); // Singleton instance
  