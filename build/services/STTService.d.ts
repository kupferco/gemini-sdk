export default STTService;
declare class STTService {
    webSocketManager: {
        connection: WebSocket | null;
        isConnected: boolean | undefined;
        messageQueue: any[] | undefined;
        messageHandlers: any[] | undefined;
        connect(endpoint: any): void;
        disconnect(): void;
        sendMessage(message: any): void;
        addMessageHandler(handler: any): void;
        removeMessageHandler(handler: any): void;
    };
    sessionId: any;
    isRecording: boolean;
    mediaStream: MediaStream | null;
    mediaRecorder: MediaRecorder | null;
    isMuted: boolean;
    _messageHandler: ((data: any) => void) | null;
    endpoint: string;
    startListening(callback: any, mode?: string): Promise<void>;
    stopListening(): void;
    stopSendingAudio(): void;
    startSendingAudio(): void;
    _startStreaming(mode: any): void;
}
