import { default as TTSService } from './TTSService';
export default TTSWebSocketService;
declare class TTSWebSocketService extends TTSService {
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
    _messageHandler: ((data: any) => void) | null;
    endpoint: string;
    connect(): void;
    disconnect(): void;
}
