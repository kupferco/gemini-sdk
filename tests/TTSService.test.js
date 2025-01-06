import TTSService from '../src/services/TTSService';

global.Audio = jest.fn(() => ({
    play: jest.fn(() => Promise.resolve()),
    pause: jest.fn(),
    currentTime: 0,
    onended: null,
}));

describe('TTSService', () => {
    let ttsService;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => { });
        jest.spyOn(console, 'log').mockImplementation(() => { });

        // Reset the global Audio mock
        global.Audio = jest.fn(() => ({
            play: jest.fn(() => Promise.resolve()), // Default successful playback
            pause: jest.fn(),
            currentTime: 0,
            onended: null,
        }));

        ttsService = new TTSService();
    });


    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('should play audio from a Blob', async () => {
        const mockBlob = new Blob(['test audio data'], { type: 'audio/mpeg' });
        await ttsService.playAudio(mockBlob);

        expect(global.Audio).toHaveBeenCalledWith(expect.any(String)); // Ensure Audio is instantiated
        expect(ttsService.audio.play).toHaveBeenCalled(); // Ensure play is called
        expect(ttsService.isPlaying).toBe(true); // Ensure playback state is updated
    });

    test('should interrupt and stop audio playback', async () => {
        const mockBlob = new Blob(['test audio data'], { type: 'audio/mpeg' });

        await ttsService.playAudio(mockBlob); // Start playing audio
        ttsService.interruptAudio(); // Interrupt playback

        expect(ttsService.audio.pause).toHaveBeenCalled(); // Ensure audio is paused
        expect(ttsService.audio.currentTime).toBe(0); // Ensure playback is reset
        expect(ttsService.isPlaying).toBe(false); // Ensure playback state is updated
    });

    test('should handle playback errors gracefully', async () => {
        const mockBlob = new Blob(['test audio data'], { type: 'audio/mpeg' });

        // Mock play to reject with an error
        global.Audio.mockImplementation(() => ({
            play: jest.fn(() => Promise.reject(new Error('Playback error'))),
            pause: jest.fn(),
            currentTime: 0,
            onended: null,
        }));

        await expect(ttsService.playAudio(mockBlob)).rejects.toThrow('Playback error');

        expect(console.error).toHaveBeenCalledWith(
            'TTSService: Error during audio playback:',
            expect.any(Error)
        );
        expect(ttsService.isPlaying).toBe(false); // Ensure playback state is reset
    });

    test('should handle audio end event', async () => {
        const mockBlob = new Blob(['test audio data'], { type: 'audio/mpeg' });

        await ttsService.playAudio(mockBlob);

        // Simulate the onended event
        ttsService.audio.onended();

        expect(ttsService.isPlaying).toBe(false); // Ensure playback state is updated
        expect(console.log).toHaveBeenCalledWith('TTSService: Audio playback ended.');
    });
});
