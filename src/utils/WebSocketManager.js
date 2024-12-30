class WebSocketManager {
  constructor(endpoint) {
    this.endpoint = endpoint;
    this.socket = null;
    this.isConnected = false;
    this.messageQueue = []; // Queue to buffer messages
    this.messageHandlers = [];
  }

  connect() {
    if (this.isConnected || this.socket) {
      console.warn('WebSocketManager: Already connected.');
      return;
    }

    this.socket = new WebSocket(this.endpoint);

    this.socket.onopen = () => {
      console.log('WebSocketManager: Connection opened.');
      this.isConnected = true;

      // Send all queued messages
      while (this.messageQueue.length > 0) {
        const message = this.messageQueue.shift();
        this.sendMessage(message);
      }
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('WebSocketManager: Received message:', data);

      // Notify all registered handlers
      this.messageHandlers.forEach((handler) => handler(data));
    };

    this.socket.onerror = (error) => {
      console.error('WebSocketManager: Connection error:', error);
    };

    this.socket.onclose = () => {
      console.log('WebSocketManager: Connection closed.');
      this.isConnected = false;
      this.socket = null;
    };
  }

  disconnect() {
    if (!this.socket) {
      console.warn('WebSocketManager: No active connection to close.');
      return;
    }

    this.socket.close();
    this.socket = null;
    this.isConnected = false;
  }

  sendMessage(message) {
    if (!this.isConnected || !this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.log('WebSocketManager: Queueing message since connection is not open:', message);
      this.messageQueue.push(message); // Buffer the message
      return;
    }

    // console.log('WebSocketManager: Sending message:', message);
    this.socket.send(JSON.stringify(message));
  }

  addMessageHandler(handler) {
    this.messageHandlers.push(handler);
  }

  removeMessageHandler(handler) {
    this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
    console.log('WebSocketManager: Message handler removed.');
  }
}

export default WebSocketManager;
