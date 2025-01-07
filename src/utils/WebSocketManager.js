class WebSocketManager {
  constructor() {
      if (WebSocketManager.instance) {
          return WebSocketManager.instance;
      }

      this.connection = null; // Single WebSocket connection
      this.isConnected = false;
      this.messageQueue = [];
      this.messageHandlers = []; // Shared handler list for all services
      WebSocketManager.instance = this;
  }

  connect(endpoint) {
      if (this.connection) {
          console.warn(`WebSocketManager: Already connected to ${endpoint}.`);
          return;
      }

      this.connection = new WebSocket(endpoint);

      this.connection.onopen = () => {
          console.log(`WebSocketManager: Connection opened to ${endpoint}.`);
          this.isConnected = true;

          // Send all queued messages
          while (this.messageQueue.length > 0) {
              const message = this.messageQueue.shift();
              this.sendMessage(message);
          }
      };

      this.connection.onmessage = (event) => {
          const data = JSON.parse(event.data);
        //   console.log('WebSocketManager: Message received:', data);

          // Notify all registered handlers
          this.messageHandlers.forEach((handler) => handler(data));
      };

      this.connection.onerror = (error) => {
          console.error('WebSocketManager: Connection error:', error);
      };

      this.connection.onclose = () => {
          console.log('WebSocketManager: Connection closed.');
          this.isConnected = false;
          this.connection = null;
      };
  }

  disconnect() {
      if (!this.connection) {
          console.warn('WebSocketManager: No active connection to close.');
          return;
      }

      this.connection.close();
      this.connection = null;
      this.isConnected = false;
  }

  sendMessage(message) {
      if (!this.isConnected || this.connection.readyState !== WebSocket.OPEN) {
          console.log('WebSocketManager: Queueing message:', message);
          this.messageQueue.push(message);
          return;
      }

      this.connection.send(JSON.stringify(message));
  }

  addMessageHandler(handler) {
      this.messageHandlers.push(handler);
  }

  removeMessageHandler(handler) {
      this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
      console.log('WebSocketManager: Message handler removed.');
  }
}

export default new WebSocketManager();
