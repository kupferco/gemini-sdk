class TTSService {
    constructor() {
        this.audio = null; // Current audio object
        this.isPlaying = false; // Playback state
    }

    async playAudio(blob) {
        try {
            this.interruptAudio(); // Stop ongoing playback
            const audioUrl = URL.createObjectURL(blob);
            this.audio = new Audio(audioUrl);

            this.audio.onended = () => {
                this.isPlaying = false;
                console.log('TTSService: Audio playback ended.');
            };

            await this.audio.play();
            this.isPlaying = true;
            console.log('TTSService: Audio playback started.');
        } catch (error) {
            console.error('TTSService: Error during audio playback:', error);
            throw error;
        }
    }

    interruptAudio() {
        if (this.audio && !this.audio.paused) {
            this.audio.pause();
            this.audio.currentTime = 0;
            this.isPlaying = false;
            console.log('TTSService: Audio playback interrupted.');
        }
    }
}

const ttsServiceInstance = new TTSService();
export default ttsServiceInstance;
