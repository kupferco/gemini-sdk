import { v4 as g } from "uuid";
const S = {
  development: {
    API_BASE_URL: "http://localhost:8080"
  },
  ngrok: {
    API_BASE_URL: "https://2e26-2a00-23c8-16b2-8301-5494-7384-8ee5-ec42.ngrok-free.app"
  },
  production: {
    API_BASE_URL: "https://proxy-server-14953211771.europe-west2.run.app"
  }
}, u = process.env.NODE_ENV || "development";
class p {
  constructor() {
    console.log("v.1.0.3"), console.log(`NODE_ENV = ${process.env.NODE_ENV}`), this.apiBaseUrl = S[u].API_BASE_URL || null, this.endpoints = {
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
const a = new p(), m = 30 * 60 * 1e3;
class f {
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
    const t = (/* @__PURE__ */ new Date()).getTime() + s, o = { sessionId: e, expiresAt: t };
    localStorage.setItem(this.sessionDataKey, JSON.stringify(o));
  }
  // Initialize or restore a valid session
  initializeSession() {
    const e = this._getSessionData();
    if (!e) {
      const s = g();
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
    const e = g();
    return this._setSessionData(e), console.log("Session ID renewed:", e), e;
  }
  // Clear the session entirely
  clearSession() {
    localStorage.removeItem(this.sessionDataKey), console.log("Session cleared.");
  }
}
const c = new f();
class r {
  constructor() {
    if (r.instance)
      return r.instance;
    this.connection = null, this.isConnected = !1, this.messageQueue = [], this.messageHandlers = [], r.instance = this;
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
      this.messageHandlers.forEach((t) => t(n));
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
const l = new r();
class M {
  constructor() {
    this.webSocketManager = l, this.endpoint = a.getEndpoint("voice"), this._messageHandler = null, this.connected = !1;
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
      const n = await fetch(`${a.getApiBaseUrl()}/api/gemini`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sessionId: e,
          inputText: s
        })
      });
      return console.log("Session and inputText", e, s), n.ok ? (await n.json()).response || null : (console.error("Failed to send REST message to Gemini."), null);
    } catch (n) {
      return console.error("Error sending REST message to Gemini:", n), null;
    }
  }
}
const h = {
  "Content-Type": "application/json",
  ...process.env.NODE_ENV !== "production" && { "ngrok-skip-browser-warning": "true" }
};
class v {
  static async fetchHistory() {
    const e = c.getSessionId();
    try {
      const s = await fetch(`${a.getApiBaseUrl()}/api/gemini/history?sessionId=${encodeURIComponent(e)}`, {
        method: "GET",
        headers: h
      });
      return s.ok ? await s.json() : (console.error("Failed to fetch conversation history."), []);
    } catch (s) {
      return console.error("Error fetching conversation history:", s), [];
    }
  }
  static async clearHistory() {
    const e = c.getSessionId();
    try {
      await fetch(`${a.getApiBaseUrl()}/api/gemini/history?sessionId=${encodeURIComponent(e)}&clear=true`, {
        method: "GET",
        headers: h
      }), console.log("Conversation history cleared.");
    } catch (s) {
      console.error("Error clearing conversation history:", s);
    }
  }
}
class b {
  constructor() {
    this.webSocketManager = l, this.sessionId = null, this.isRecording = !1, this.mediaStream = null, this.mediaRecorder = null, this.isMuted = !1, this._messageHandler = null, this.endpoint = a.getEndpoint("voice");
  }
  async startListening(e, s = "default") {
    if (this.isRecording) {
      console.warn("STTService: Already recording.");
      return;
    }
    try {
      const n = await navigator.mediaDevices.getUserMedia({ audio: !0 });
      this.mediaStream = n, this.isRecording = !0, console.log(this.isRecording), this.sessionId = c.getSessionId(), console.log("STTService: Using session ID:", this.sessionId), this.webSocketManager.connect(this.endpoint);
      const t = this.webSocketManager.connection;
      t.onerror = (o) => {
        console.error("WebSocketManager: Connection error:", o);
      }, this._messageHandler && this.webSocketManager.removeMessageHandler(this._messageHandler), this._messageHandler = (o) => {
        var d;
        o.action === "stt" && ((d = o.payload) != null && d.transcript) && e(o.payload.transcript);
      }, this.webSocketManager.addMessageHandler(this._messageHandler), this._startStreaming(s);
    } catch (n) {
      throw console.error("STTService: Error starting microphone:", n), n;
    }
  }
  stopListening() {
    var e, s;
    if (!this.isRecording) {
      console.warn("STTService: Not currently recording.");
      return;
    }
    ((e = this.mediaRecorder) == null ? void 0 : e.state) !== "inactive" && (this.mediaRecorder.stop(), console.log("STTService: MediaRecorder stopped.")), (s = this.mediaStream) == null || s.getTracks().forEach((n) => n.stop()), this.mediaStream = null, this.webSocketManager.removeMessageHandler(this._messageHandler), this._messageHandler = null, this.webSocketManager.disconnect(), this.isRecording = !1, console.log("STTService: Stopped listening.");
  }
  stopSendingAudio() {
    this.isMuted = !0, console.log("STTService: Audio streaming is muted.");
  }
  startSendingAudio() {
    this.isMuted = !1, console.log("STTService: Audio streaming is resumed.");
  }
  _startStreaming(e) {
    this.webSocketManager.sendMessage({
      action: "start_session",
      sessionId: this.sessionId
    }), this.webSocketManager.sendMessage({
      action: "start_stt",
      sessionId: this.sessionId,
      mode: e
    });
    const s = new MediaRecorder(this.mediaStream);
    s.ondataavailable = (n) => {
      if (this.isMuted) {
        console.log("STTService: Audio muted. Skipping blob.");
        return;
      }
      const t = new FileReader();
      t.onload = () => {
        this.webSocketManager.sendMessage({
          action: "stt_audio",
          sessionId: this.sessionId,
          audioData: t.result.split(",")[1]
        });
      }, t.readAsDataURL(n.data);
    }, s.start(250), this.mediaRecorder = s;
  }
}
class w {
  constructor() {
    this.audio = null, this.isPlaying = !1;
  }
  async playAudio(e) {
    try {
      this.interruptAudio();
      const s = URL.createObjectURL(e);
      this.audio = new Audio(s), this.audio.onended = () => {
        this.isPlaying = !1, console.log("TTSService: Audio playback ended.");
      }, await this.audio.play(), this.isPlaying = !0, console.log("TTSService: Audio playback started.");
    } catch (s) {
      throw console.error("TTSService: Error during audio playback:", s), s;
    }
  }
  interruptAudio() {
    this.audio && !this.audio.paused && (this.audio.pause(), this.audio.currentTime = 0, this.isPlaying = !1, console.log("TTSService: Audio playback interrupted."));
  }
}
class T extends w {
  constructor() {
    super(), this.webSocketManager = l, this._messageHandler = null, this.endpoint = a.getEndpoint("voice");
  }
  connect() {
    this.webSocketManager.connect(this.endpoint), this._messageHandler && this.webSocketManager.removeMessageHandler(this._messageHandler), this._messageHandler = (e) => {
      var s;
      if (e.action === "tts_audio" && ((s = e.payload) != null && s.audioData)) {
        const n = Uint8Array.from(
          atob(e.payload.audioData),
          (o) => o.charCodeAt(0)
        ), t = new Blob([n], { type: "audio/mpeg" });
        this.playAudio(t);
      }
    }, this.webSocketManager.addMessageHandler(this._messageHandler), console.log("TTSWebSocketService: Connected and handler added.");
  }
  disconnect() {
    this._messageHandler && (this.webSocketManager.removeMessageHandler(this._messageHandler), this._messageHandler = null), this.webSocketManager.disconnect(), console.log("TTSWebSocketService: Disconnected from WebSocket.");
  }
}
export {
  a as Config,
  v as ConversationService,
  M as GeminiService,
  b as STTService,
  c as SessionManager,
  w as TTSService,
  T as TTSWebSocketService
};
