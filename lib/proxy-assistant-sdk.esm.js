import { v4 as d } from "uuid";
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
}, p = process.env.NODE_ENV || "development";
class u {
  constructor() {
    console.log(`NODE_ENV = ${process.env.NODE_ENV}`), this.apiBaseUrl = S[p].API_BASE_URL || null, this.endpoints = {
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
    const s = this.getApiBaseUrl(), t = this.endpoints[e];
    if (!t)
      throw new Error(`Endpoint for service "${e}" is not defined.`);
    return `${s}${t}`;
  }
}
const a = new u(), m = 30 * 60 * 1e3;
class w {
  constructor() {
    this.sessionDataKey = "sessionData";
  }
  // Retrieve session data from localStorage
  _getSessionData() {
    const e = localStorage.getItem(this.sessionDataKey);
    if (!e) return null;
    try {
      const { sessionId: s, expiresAt: t } = JSON.parse(e);
      return (/* @__PURE__ */ new Date()).getTime() > t ? (localStorage.removeItem(this.sessionDataKey), null) : { sessionId: s, expiresAt: t };
    } catch (s) {
      return console.error("SessionManager: Failed to parse session data from localStorage:", s), localStorage.removeItem(this.sessionDataKey), null;
    }
  }
  // Set session data with expiration
  _setSessionData(e, s = m) {
    const o = (/* @__PURE__ */ new Date()).getTime() + s, n = { sessionId: e, expiresAt: o };
    localStorage.setItem(this.sessionDataKey, JSON.stringify(n));
  }
  // Initialize or restore a valid session
  initializeSession() {
    const e = this._getSessionData();
    if (!e) {
      const s = d();
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
    const e = d();
    return this._setSessionData(e), console.log("Session ID renewed:", e), e;
  }
  // Clear the session entirely
  clearSession() {
    localStorage.removeItem(this.sessionDataKey), console.log("Session cleared.");
  }
}
const f = new w();
class h {
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
class b extends h {
  async fetchAndPlayText(e) {
    try {
      const s = await fetch(`${a.getEndpoint("tts")}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: e })
      });
      if (!s.ok)
        throw new Error("Failed to fetch TTS audio.");
      const t = await s.blob();
      this.playAudio(t);
    } catch (s) {
      console.error("TTSRestService: Error fetching or playing TTS:", s);
    }
  }
}
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
      const t = JSON.parse(s.data);
      this.messageHandlers.forEach((o) => o(t));
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
const g = new r();
class v extends h {
  constructor() {
    super(), this.webSocketManager = g, this._messageHandler = null, this.endpoint = a.getEndpoint("voice");
  }
  connect() {
    this.webSocketManager.connect(this.endpoint), this._messageHandler && this.webSocketManager.removeMessageHandler(this._messageHandler), this._messageHandler = (e) => {
      var s;
      if (e.action === "tts_audio" && ((s = e.payload) != null && s.audioData)) {
        const t = Uint8Array.from(
          atob(e.payload.audioData),
          (n) => n.charCodeAt(0)
        ), o = new Blob([t], { type: "audio/mpeg" });
        this.playAudio(o);
      }
    }, this.webSocketManager.addMessageHandler(this._messageHandler), console.log("TTSWebSocketService: Connected and handler added.");
  }
  disconnect() {
    this._messageHandler && (this.webSocketManager.removeMessageHandler(this._messageHandler), this._messageHandler = null), this.webSocketManager.disconnect(), console.log("TTSWebSocketService: Disconnected from WebSocket.");
  }
}
class M {
  constructor() {
    this.webSocketManager = g, this.sessionId = null, this.isRecording = !1, this.mediaStream = null, this.mediaRecorder = null, this.isMuted = !1, this._messageHandler = null, this.endpoint = a.getEndpoint("voice");
  }
  async startListening(e, s = "default") {
    if (this.isRecording) {
      console.warn("STTService: Already recording.");
      return;
    }
    try {
      const t = await navigator.mediaDevices.getUserMedia({ audio: !0 });
      this.mediaStream = t, this.isRecording = !0, console.log(this.isRecording), this.sessionId = f.getSessionId(), console.log("STTService: Using session ID:", this.sessionId), this.webSocketManager.connect(this.endpoint);
      const o = this.webSocketManager.connection;
      o.onerror = (n) => {
        console.error("WebSocketManager: Connection error:", n);
      }, this._messageHandler && this.webSocketManager.removeMessageHandler(this._messageHandler), this._messageHandler = (n) => {
        var c;
        n.action === "stt" && ((c = n.payload) != null && c.transcript) && e(n.payload.transcript);
      }, this.webSocketManager.addMessageHandler(this._messageHandler), this._startStreaming(s);
    } catch (t) {
      throw console.error("STTService: Error starting microphone:", t), t;
    }
  }
  stopListening() {
    var e, s;
    if (!this.isRecording) {
      console.warn("STTService: Not currently recording.");
      return;
    }
    ((e = this.mediaRecorder) == null ? void 0 : e.state) !== "inactive" && (this.mediaRecorder.stop(), console.log("STTService: MediaRecorder stopped.")), (s = this.mediaStream) == null || s.getTracks().forEach((t) => t.stop()), this.mediaStream = null, this.webSocketManager.removeMessageHandler(this._messageHandler), this._messageHandler = null, this.webSocketManager.disconnect(), this.isRecording = !1, console.log("STTService: Stopped listening.");
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
    s.ondataavailable = (t) => {
      if (this.isMuted) {
        console.log("STTService: Audio muted. Skipping blob.");
        return;
      }
      const o = new FileReader();
      o.onload = () => {
        this.webSocketManager.sendMessage({
          action: "stt_audio",
          sessionId: this.sessionId,
          audioData: o.result.split(",")[1]
        });
      }, o.readAsDataURL(t.data);
    }, s.start(250), this.mediaRecorder = s;
  }
}
const l = {
  "Content-Type": "application/json",
  ...process.env.NODE_ENV !== "production" && { "ngrok-skip-browser-warning": "true" }
};
class T {
  async getPrompt(e) {
    const s = a.getEndpoint("prompt");
    if (!e)
      throw new Error("Session ID is required to fetch the prompt.");
    try {
      const t = await fetch(`${s}?sessionId=${e}`, { headers: l });
      if (!t.ok)
        throw new Error(`Failed to fetch prompt: ${t.statusText}`);
      return (await t.json()).prompt;
    } catch (t) {
      throw console.error("Error fetching prompt:", t), t;
    }
  }
  async setPrompt(e, s) {
    const t = a.getEndpoint("prompt");
    if (!e || !s)
      throw new Error("Session ID and new prompt are required.");
    try {
      const o = await fetch(t, {
        method: "POST",
        headers: l,
        body: JSON.stringify({ sessionId: e, newPrompt: s })
      });
      if (!o.ok)
        throw new Error(`Failed to update prompt: ${o.statusText}`);
      console.log("Prompt updated successfully.");
    } catch (o) {
      throw console.error("Error updating prompt:", o), o;
    }
  }
}
const k = new T();
export {
  a as Config,
  k as PromptService,
  M as STTService,
  f as SessionManager,
  b as TTSRestService,
  v as TTSWebSocketService
};
