import Config from '../Config';

class PromptService {
  async getPrompt(sessionId) {
    const endpoint = Config.getEndpoint('system-prompt');

    if (!sessionId) {
      throw new Error('Session ID is required to fetch the prompt.');
    }

    try {
      const response = await fetch(`${endpoint}?sessionId=${sessionId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch prompt: ${response.statusText}`);
      }
      const data = await response.json();
      return data.prompt;
    } catch (error) {
      console.error('Error fetching prompt:', error);
      throw error;
    }
  }

  async setPrompt(sessionId, newPrompt) {
    const endpoint = Config.getEndpoint('prompt');

    if (!sessionId || !newPrompt) {
      throw new Error('Session ID and new prompt are required.');
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, newPrompt }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update prompt: ${response.statusText}`);
      }

      console.log('Prompt updated successfully.');
    } catch (error) {
      console.error('Error updating prompt:', error);
      throw error;
    }
  }
}

export default PromptService;
