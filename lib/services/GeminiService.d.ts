export default GeminiService;
declare class GeminiService {
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
    endpoint: string;
    _messageHandler: ((data: any) => void) | null;
    connected: boolean;
    connect(): void;
    disconnect(): void;
    setResponseHandler(handler: any): void;
    onGeminiResponse: any;
    sendRestMessage(sessionId: any, inputText: any): Promise<any>;
}
