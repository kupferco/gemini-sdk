import ttsServiceInstance from './TTSService';
import Config from '../Config';

class TTSRestService {
    async fetchAndPlayText(text) {
        try {
            const response = await fetch(`${Config.getEndpoint('tts')}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch TTS audio.');
            }

            const audioBlob = await response.blob();
            await ttsServiceInstance.playAudio(audioBlob);
        } catch (error) {
            console.error('TTSRestService: Error fetching or playing TTS:', error);
        }
    }
}

export default new TTSRestService();
