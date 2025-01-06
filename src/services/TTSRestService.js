import TTSService from './TTSService';
import Config from '../Config';

class TTSRestService extends TTSService {
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
            this.playAudio(audioBlob); // Use the inherited playAudio method
        } catch (error) {
            console.error('TTSRestService: Error fetching or playing TTS:', error);
        }
    }
}

export default TTSRestService;

