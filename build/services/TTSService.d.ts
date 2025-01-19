export default TTSService;
declare class TTSService {
    audio: HTMLAudioElement | null;
    isPlaying: boolean;
    playAudio(blob: any): Promise<void>;
    interruptAudio(): void;
}
