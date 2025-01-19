import { v4 as c } from "uuid";
const h = {
  development: {
    API_BASE_URL: "http://localhost:8080"
  },
  ngrok: {
    API_BASE_URL: "https://2e26-2a00-23c8-16b2-8301-5494-7384-8ee5-ec42.ngrok-free.app"
  },
  production: {
    API_BASE_URL: "https://proxy-server-14953211771.europe-west2.run.app"
  }
}, d = process.env.NODE_ENV || "development";
class p {
  constructor() {
    console.log(55555555), this.apiBaseUrl = h[d].API_BASE_URL || null, this.endpoints = {
      prompt: "/api/gemini/system-prompt",
      stt: "/api/stt",
      tts: "/api/tts",
      gemini: "/api/gemini",
      geminiHistory: "/api/gemini/history",
      voice: " "
    };
  }
  setApiBaseUrl(e) {
    console.log(`Setting API base URL to: ${e}`), this.apiBaseUrl = e;
  }
  getApiBaseUrl() {
    if (!this.apiBaseUrl)
      throw new Error("API base URL is not set. Please configure it before using the SDK.");
    return this.apiBaseUrl;
  }
  getEndpoint(e) {
    const s = this.getApiBaseUrl(), n = this.endpoints[e];
    if (!n)
      throw new Error(`Endpoint for service "${e}" is not defined.`);
    return `${s}${n}`;
  }
}
const i = new p(), m = 30 * 60 * 1e3;
class S {
  constructor() {
    this.sessionDataKey = "sessionData";
  }
  // Retrieve session data from localStorage
  _getSessionData() {
    const e = localStorage.getItem(this.sessionDataKey);
    if (!e) return null;
    try {
      const { sessionId: s, expiresAt: n } = JSON.parse(e);
      return (/* @__PURE__ */ new Date()).getTime() > n ? (localStorage.removeItem(this.sessionDataKey), null) : { sessionId: s, expiresAt: n };
    } catch (s) {
      return console.error("SessionManager: Failed to parse session data from localStorage:", s), localStorage.removeItem(this.sessionDataKey), null;
    }
  }
  // Set session data with expiration
  _setSessionData(e, s = m) {
    const o = (/* @__PURE__ */ new Date()).getTime() + s, g = { sessionId: e, expiresAt: o };
    localStorage.setItem(this.sessionDataKey, JSON.stringify(g));
  }
  // Initialize or restore a valid session
  initializeSession() {
    const e = this._getSessionData();
    if (!e) {
      const s = c();
      return this._setSessionData(s), console.log("New session ID generated:", s), s;
    }
    return console.log("Existing session ID restored:", e.sessionId), e.sessionId;
  }
  // Get the current session ID if it exists
  getSessionId() {
    const e = this._getSessionData();
    if (!e)
      throw new Error("Session has not been initialized or has expired.");
    return e.sessionId;
  }
  // Renew the session ID
  renewSession() {
    const e = c();
    return this._setSessionData(e), console.log("Session ID renewed:", e), e;
  }
  // Clear the session entirely
  clearSession() {
    localStorage.removeItem(this.sessionDataKey), console.log("Session cleared.");
  }
}
const a = new S();
class t {
  constructor() {
    if (t.instance)
      return t.instance;
    this.connection = null, this.isConnected = !1, this.messageQueue = [], this.messageHandlers = [], t.instance = this;
  }
  connect(e) {
    if (this.connection) {
      console.warn(`WebSocketManager: Already connected to ${e}.`);
      return;
    }
    this.connection = new WebSocket(e), this.connection.onopen = () => {
      for (console.log(`WebSocketManager: Connection opened to ${e}.`), this.isConnected = !0; this.messageQueue.length > 0; ) {
        const s = this.messageQueue.shift();
        this.sendMessage(s);
      }
    }, this.connection.onmessage = (s) => {
      const n = JSON.parse(s.data);
      this.messageHandlers.forEach((o) => o(n));
    }, this.connection.onerror = (s) => {
      console.error("WebSocketManager: Connection error:", s);
    }, this.connection.onclose = () => {
      console.log("WebSocketManager: Connection closed."), this.isConnected = !1, this.connection = null;
    };
  }
  disconnect() {
    if (!this.connection) {
      console.warn("WebSocketManager: No active connection to close.");
      return;
    }
    this.connection.close(), this.connection = null, this.isConnected = !1;
  }
  sendMessage(e) {
    if (!this.isConnected || this.connection.readyState !== WebSocket.OPEN) {
      console.log("WebSocketManager: Queueing message:", e), this.messageQueue.push(e);
      return;
    }
    this.connection.send(JSON.stringify(e));
  }
  addMessageHandler(e) {
    this.messageHandlers.push(e);
  }
  removeMessageHandler(e) {
    this.messageHandlers = this.messageHandlers.filter((s) => s !== e), console.log("WebSocketManager: Message handler removed.");
  }
}
const u = new t();
class f {
  constructor() {
    this.webSocketManager = u, this.endpoint = i.getEndpoint("voice"), this._messageHandler = null, this.connected = !1;
  }
  connect() {
    if (this.connected) {
      console.log("GeminiService: Already connected.");
      return;
    }
    this.webSocketManager.connect(this.endpoint), this.connected = !0, this._messageHandler && this.webSocketManager.removeMessageHandler(this._messageHandler), this._messageHandler = (e) => {
      var s;
      e.action === "gemini" && ((s = e.payload) != null && s.agent) && this.onGeminiResponse && this.onGeminiResponse(e.payload.agent);
    }, this.webSocketManager.addMessageHandler(this._messageHandler), console.log("GeminiService: Connected and handler added.");
  }
  disconnect() {
    this._messageHandler && (this.webSocketManager.removeMessageHandler(this._messageHandler), this._messageHandler = null), this.webSocketManager.disconnect(this.endpoint), this.connected = !1, console.log("GeminiService: Disconnected from WebSocket.");
  }
  setResponseHandler(e) {
    this.onGeminiResponse = e;
  }
  async sendRestMessage(e, s) {
    try {
      const n = await fetch(`${i.getApiBaseUrl()}/api/gemini`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sessionId: e,
          inputText: s
        })
      });
      return n.ok ? (await n.json()).response || null : (console.error("Failed to send REST message to Gemini."), null);
    } catch (n) {
      return console.error("Error sending REST message to Gemini:", n), null;
    }
  }
}
const l = {
  "Content-Type": "application/json",
  ...process.env.NODE_ENV !== "production" && { "ngrok-skip-browser-warning": "true" }
};
class w {
  static async fetchHistory() {
    const e = a.getSessionId();
    try {
      const s = await fetch(`${i.getApiBaseUrl()}/api/gemini/history?sessionId=${encodeURIComponent(e)}`, {
        method: "GET",
        headers: l
      });
      return s.ok ? await s.json() : (console.error("Failed to fetch conversation history."), []);
    } catch (s) {
      return console.error("Error fetching conversation history:", s), [];
    }
  }
  static async clearHistory() {
    const e = a.getSessionId();
    try {
      await fetch(`${i.getApiBaseUrl()}/api/gemini/history?sessionId=${encodeURIComponent(e)}&clear=true`, {
        method: "GET",
        headers: l
      }), console.log("Conversation history cleared.");
    } catch (s) {
      console.error("Error clearing conversation history:", s);
    }
  }
}
console.log(i, a, f, w);
const I = "test";
export {
  i as Config,
  w as ConversationService,
  f as GeminiService,
  a as SessionManager,
  I as test
};
