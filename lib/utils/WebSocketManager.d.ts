declare const _default: WebSocketManager;
export default _default;
declare class WebSocketManager {
    connection: WebSocket | null;
    isConnected: boolean | undefined;
    messageQueue: any[] | undefined;
    messageHandlers: any[] | undefined;
    connect(endpoint: any): void;
    disconnect(): void;
    sendMessage(message: any): void;
    addMessageHandler(handler: any): void;
    removeMessageHandler(handler: any): void;
}
